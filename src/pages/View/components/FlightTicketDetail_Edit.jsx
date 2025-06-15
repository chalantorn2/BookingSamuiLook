import React, { useState, useEffect } from "react";
import { supabase } from "../../../services/supabase";
import {
  User,
  Calendar,
  Save,
  ChevronLeft,
  Trash2,
  X,
  Phone,
  FileText,
  Tag,
  MapPin,
} from "lucide-react";
import { useAlertDialogContext } from "../../../contexts/AlertDialogContext";
import usePricing from "../../../hooks/usePricing";
import SaleStyles, { combineClasses } from "../../Sales/common/SaleStyles";
import PaymentMethodSection from "../../Sales/common/PaymentMethodSection";
import PassengerSection from "../../Sales/ticket/PassengerSection";
import SupplierSection from "../../Sales/ticket/SupplierSection";
import RouteSection from "../../Sales/ticket/RouteSection";
import TicketTypeSection from "../../Sales/ticket/TicketTypeSection";
import ExtrasSection from "../../Sales/ticket/ExtrasSection";
import PricingSummarySection from "../../Sales/ticket/PricingSummarySection";
import SaleHeader from "../../Sales/common/SaleHeader";
import { formatCustomerAddress } from "../../../utils/helpers";

const FlightTicketDetail_Edit = ({ ticketId, onClose, onSave }) => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [globalEditMode, setGlobalEditMode] = useState(false);
  const showAlert = useAlertDialogContext();
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [suppliers, setSuppliers] = useState([]);

  // Use same pricing hook as SaleTicket
  const { pricing, updatePricing, calculateSubtotal, calculateTotal } =
    usePricing();

  // Form state matching SaleTicket structure
  const [formData, setFormData] = useState({
    customer: "",
    customerCode: "",
    contactDetails: "",
    phone: "",
    id: "",
    date: "",
    creditDays: "0",
    dueDate: "",
    salesName: "",
    supplier: "",
    supplierName: "",
    supplierId: null,
    supplierNumericCode: "",
    ticketType: "bsp",
    paymentMethod: "",
    companyPaymentDetails: "",
    customerPayment: "",
    customerPaymentDetails: "",
    vatPercent: "0",
    code: "",
    b2bDetails: "",
    otherDetails: "",
    tgDetails: "",
  });

  // Components state matching SaleTicket
  const [passengers, setPassengers] = useState([
    { id: 1, name: "", type: "ADT", ticketNumber: "", ticketCode: "" },
  ]);

  const [routes, setRoutes] = useState([
    {
      id: 1,
      date: "",
      flight: "",
      rbd: "",
      origin: "",
      destination: "",
      departure: "",
      arrival: "",
    },
  ]);

  const [extras, setExtras] = useState([
    { id: 1, description: "", net: "", sale: "", pax: 1, total: "" },
  ]);

  // Fetch and map ticket data
  useEffect(() => {
    const fetchTicketData = async () => {
      if (!ticketId) return;

      setLoading(true);
      try {
        // Fetch all ticket data in one query
        const { data: ticket, error } = await supabase
          .from("bookings_ticket")
          .select(
            `
            *,
            customer:customer_id(*),
            supplier:information_id(*),
            tickets_detail(*),
            ticket_additional_info(*),
            tickets_pricing(*),
            tickets_passengers(*),
            tickets_routes(*),
            tickets_extras(*)
          `
          )
          .eq("id", ticketId)
          .single();

        if (error) throw error;

        setTicketData(ticket);
        mapDataToFormState(ticket);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTicketData();
  }, [ticketId]);

  useEffect(() => {
    const fetchSuppliers = async () => {
      const data = await getSuppliers("Airline");
      setSuppliers(data);
    };
    fetchSuppliers();
  }, []);

  // Map database data to component state
  const mapDataToFormState = (ticket) => {
    const detail = ticket.tickets_detail?.[0] || {};
    const additional = ticket.ticket_additional_info?.[0] || {};
    const pricingData = ticket.tickets_pricing?.[0] || {};

    // Map formData
    setFormData({
      customer: ticket.customer?.name || "",
      customerCode: ticket.customer?.code || "",
      contactDetails: formatCustomerAddress(ticket.customer),
      phone: ticket.customer?.phone || "",
      id: ticket.customer?.id_number || "",
      date: detail.issue_date?.split("T")[0] || "",
      creditDays: String(detail.credit_days || 0),
      dueDate: detail.due_date?.split("T")[0] || "",
      salesName: "",
      supplier: ticket.supplier?.code || "",
      supplierName: ticket.supplier?.name || "",
      supplierId: ticket.supplier?.id || null,
      supplierNumericCode: ticket.supplier?.numeric_code || "",
      ticketType: additional.ticket_type || "bsp",
      paymentMethod:
        mapPaymentMethodFromDB(additional.company_payment_method) || "",
      companyPaymentDetails: additional.company_payment_details || "",
      customerPayment:
        mapPaymentMethodFromDB(additional.customer_payment_method) || "",
      customerPaymentDetails: additional.customer_payment_details || "",
      vatPercent: String(detail.vat_percent || 0),
      code: additional.code || "",
      b2bDetails:
        additional.ticket_type?.toLowerCase() === "b2b"
          ? additional.ticket_type_details || ""
          : "",
      otherDetails:
        additional.ticket_type?.toLowerCase() === "other"
          ? additional.ticket_type_details || ""
          : "",
      tgDetails:
        additional.ticket_type?.toLowerCase() === "tg"
          ? additional.ticket_type_details || ""
          : "",
    });

    // Map pricing - แก้ไขการคำนวณ total ให้ถูกต้อง
    const adultTotal =
      (pricingData.adult_sale_price || 0) * (pricingData.adult_pax || 0);
    const childTotal =
      (pricingData.child_sale_price || 0) * (pricingData.child_pax || 0);
    const infantTotal =
      (pricingData.infant_sale_price || 0) * (pricingData.infant_pax || 0);

    updatePricing("adult", "net", pricingData.adult_net_price || 0, 0);
    updatePricing("adult", "sale", pricingData.adult_sale_price || 0, 0);
    updatePricing("adult", "pax", pricingData.adult_pax || 0, adultTotal);
    updatePricing("child", "net", pricingData.child_net_price || 0, 0);
    updatePricing("child", "sale", pricingData.child_sale_price || 0, 0);
    updatePricing("child", "pax", pricingData.child_pax || 0, childTotal);
    updatePricing("infant", "net", pricingData.infant_net_price || 0, 0);
    updatePricing("infant", "sale", pricingData.infant_sale_price || 0, 0);
    updatePricing("infant", "pax", pricingData.infant_pax || 0, infantTotal);

    // Map passengers
    const mappedPassengers = ticket.tickets_passengers?.length
      ? ticket.tickets_passengers.map((p, index) => ({
          id: index + 1,
          name: p.passenger_name || "",
          type: p.age || "ADT",
          ticketNumber: p.ticket_number || "",
          ticketCode: p.ticket_code || "",
        }))
      : [{ id: 1, name: "", type: "ADT", ticketNumber: "", ticketCode: "" }];
    setPassengers(mappedPassengers);

    // Map routes
    const mappedRoutes = ticket.tickets_routes?.length
      ? ticket.tickets_routes.map((r, index) => ({
          id: index + 1,
          date: r.date || "",
          flight: r.flight_number || "",
          rbd: r.rbd || "",
          origin: r.origin || "",
          destination: r.destination || "",
          departure: r.departure_time || "",
          arrival: r.arrival_time || "",
        }))
      : [
          {
            id: 1,
            date: "",
            flight: "",
            rbd: "",
            origin: "",
            destination: "",
            departure: "",
            arrival: "",
          },
        ];
    setRoutes(mappedRoutes);

    // Map extras - แก้ไขการใช้ชื่อฟิลด์ให้ถูกต้อง
    const mappedExtras = ticket.tickets_extras?.length
      ? ticket.tickets_extras.map((e, index) => ({
          id: index + 1,
          description: e.description || "",
          net_price: e.net_price || 0,
          sale_price: e.sale_price || 0,
          quantity: e.quantity || 1,
          total_amount: e.total_amount || 0,
        }))
      : [
          {
            id: 1,
            description: "",
            net_price: 0,
            sale_price: 0,
            quantity: 1,
            total_amount: 0,
          },
        ];
    setExtras(mappedExtras);
  };

  const searchSupplierByNumericCode = async (numericCode) => {
    try {
      const { data, error } = await supabase
        .from("information")
        .select("*")
        .eq("category", "airline")
        .eq("active", true)
        .eq("numeric_code", numericCode)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error searching supplier:", error);
        return null;
      }

      return data;
    } catch (err) {
      console.error("Error in searchSupplierByNumericCode:", err);
      return null;
    }
  };

  const searchSupplierByCode = async (code) => {
    console.log("searchSupplierByCode called with:", code);

    try {
      const { data, error } = await supabase
        .from("information")
        .select("*")
        .eq("category", "airline")
        .eq("active", true)
        .eq("code", code.toUpperCase())
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error searching supplier by code:", error);
        return null;
      }

      console.log("Database search result:", data);
      return data;
    } catch (err) {
      console.error("Error in searchSupplierByCode:", err);
      return null;
    }
  };

  // 5. เพิ่ม useEffect สำหรับค้นหาด้วย numeric code (ใส่หลังฟังก์ชันค้นหา)
  useEffect(() => {
    const searchSupplier = async () => {
      if (
        formData.searchTicketNumber &&
        formData.searchTicketNumber.length === 3
      ) {
        const supplier = await searchSupplierByNumericCode(
          formData.searchTicketNumber
        );

        if (supplier) {
          setFormData((prev) => ({
            ...prev,
            supplier: supplier.code,
            supplierName: supplier.name,
            supplierId: supplier.id,
            supplierNumericCode: supplier.numeric_code,
            searchTicketNumber: "",
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            supplier: "",
            supplierName: "",
            supplierId: null,
            supplierNumericCode: prev.searchTicketNumber,
            searchTicketNumber: "",
          }));
        }
      }
    };

    searchSupplier();
  }, [formData.searchTicketNumber]);

  // 6. เพิ่ม useEffect สำหรับค้นหาด้วย supplier code
  useEffect(() => {
    const searchSupplierByCodeFunc = async () => {
      if (
        formData.searchSupplierCode &&
        formData.searchSupplierCode.length >= 2
      ) {
        console.log(
          "Searching for supplier code:",
          formData.searchSupplierCode
        );

        try {
          const supplier = await searchSupplierByCode(
            formData.searchSupplierCode
          );
          console.log("Search result:", supplier);

          if (supplier) {
            console.log("Found supplier:", supplier.code, supplier.name);
            console.log("Numeric code:", supplier.numeric_code);

            setFormData((prev) => ({
              ...prev,
              supplier: supplier.code,
              supplierName: supplier.name,
              supplierId: supplier.id,
              supplierNumericCode: supplier.numeric_code || "",
              searchSupplierCode: "",
            }));

            const ticketNumber = supplier.numeric_code || "";
            console.log("Setting ticket number to:", ticketNumber);

            const updatedPassengers = passengers.map((passenger) => ({
              ...passenger,
              ticketNumber: ticketNumber,
            }));
            setPassengers(updatedPassengers);
          } else {
            console.log(
              "Supplier not found for code:",
              formData.searchSupplierCode
            );

            setFormData((prev) => ({
              ...prev,
              supplierName: "",
              supplierId: null,
              supplierNumericCode: "",
              searchSupplierCode: "",
            }));

            const updatedPassengers = passengers.map((passenger) => ({
              ...passenger,
              ticketNumber: "",
            }));
            setPassengers(updatedPassengers);
          }
        } catch (error) {
          console.error("Error in searchSupplierByCodeFunc:", error);

          setFormData((prev) => ({
            ...prev,
            searchSupplierCode: "",
          }));
        }
      }
    };

    searchSupplierByCodeFunc();
  }, [formData.searchSupplierCode]);

  // 7. เพิ่ม useEffect สำหรับซิงค์ ticket numbers กับ supplier
  useEffect(() => {
    if (formData.supplierNumericCode) {
      const updatedPassengers = passengers.map((passenger) => ({
        ...passenger,
        ticketNumber: formData.supplierNumericCode,
      }));
      setPassengers(updatedPassengers);
    } else {
      const updatedPassengers = passengers.map((passenger) => ({
        ...passenger,
        ticketNumber: "",
      }));
      setPassengers(updatedPassengers);

      setFormData((prev) => ({
        ...prev,
        supplier: "",
        supplierName: "",
        supplierId: null,
      }));
    }
  }, [formData.supplierNumericCode]);

  // Calculate totals
  const calculatedSubtotal =
    calculateSubtotal() +
    extras.reduce((sum, item) => sum + parseFloat(item.total_amount || 0), 0);
  const calculatedVatAmount =
    (calculatedSubtotal * parseFloat(formData.vatPercent || 0)) / 100;
  const calculatedTotal = calculatedSubtotal + calculatedVatAmount;

  // Save changes with confirmation
  const handleSubmit = async (e) => {
    e.preventDefault();

    // แสดง confirmation dialog ก่อนบันทึก
    const confirmed = await showAlert({
      title: "ยืนยันการแก้ไข",
      description: `คุณต้องการบันทึกการแก้ไขตั๋วเครื่องบินรหัส ${ticketData.reference_number} ใช่หรือไม่?`,
      confirmText: "ยืนยัน",
      cancelText: "ยกเลิก",
    });

    if (!confirmed) return; // ถ้าผู้ใช้เลือก "ยกเลิก" ให้หยุดการทำงาน

    setSaving(true);

    try {
      // Update tickets_detail
      await supabase
        .from("tickets_detail")
        .update({
          issue_date: formData.date || null,
          due_date: formData.dueDate || null,
          credit_days: parseInt(formData.creditDays) || 0,
          subtotal_before_vat: calculatedSubtotal,
          vat_percent: parseFloat(formData.vatPercent) || 0,
          vat_amount: calculatedVatAmount,
          grand_total: calculatedTotal,
        })
        .eq("bookings_ticket_id", ticketId);

      // Update additional info
      await supabase
        .from("ticket_additional_info")
        .update({
          code: formData.code || "",
          ticket_type: formData.ticketType || "bsp",
          ticket_type_details:
            formData.ticketType === "b2b"
              ? formData.b2bDetails
              : formData.ticketType === "other"
              ? formData.otherDetails
              : formData.ticketType === "tg"
              ? formData.tgDetails
              : "",
          company_payment_method: formData.paymentMethod || "",
          company_payment_details: formData.companyPaymentDetails || "",
          customer_payment_method: formData.customerPayment || "",
          customer_payment_details: formData.customerPaymentDetails || "",
        })
        .eq("bookings_ticket_id", ticketId);

      // Update pricing
      await supabase
        .from("tickets_pricing")
        .update({
          adult_net_price: parseFloat(pricing.adult?.net || 0),
          adult_sale_price: parseFloat(pricing.adult?.sale || 0),
          adult_pax: parseInt(pricing.adult?.pax || 0),
          adult_total: parseFloat(pricing.adult?.total || 0),
          child_net_price: parseFloat(pricing.child?.net || 0),
          child_sale_price: parseFloat(pricing.child?.sale || 0),
          child_pax: parseInt(pricing.child?.pax || 0),
          child_total: parseFloat(pricing.child?.total || 0),
          infant_net_price: parseFloat(pricing.infant?.net || 0),
          infant_sale_price: parseFloat(pricing.infant?.sale || 0),
          infant_pax: parseInt(pricing.infant?.pax || 0),
          infant_total: parseFloat(pricing.infant?.total || 0),
          vat_percent: parseFloat(formData.vatPercent) || 0,
          vat_amount: calculatedVatAmount,
          total_amount: calculatedTotal,
        })
        .eq("bookings_ticket_id", ticketId);

      // Update passengers, routes, extras
      await Promise.all([
        // อัปเดต bookings_ticket รวมทั้ง information_id
        supabase
          .from("bookings_ticket")
          .update({
            information_id: formData.supplierId,
          })
          .eq("id", ticketId),

        updatePassengers(),
        updateRoutes(),
        updateExtras(),
      ]);

      // แสดง success message
      onSave?.();
      onClose();
    } catch (err) {
      setError(err.message);
      await showAlert({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อมูลได้: " + err.message,
        confirmText: "ตกลง",
      });
    } finally {
      setSaving(false);
    }
  };

  // Update related tables
  const updatePassengers = async () => {
    await supabase
      .from("tickets_passengers")
      .delete()
      .eq("bookings_ticket_id", ticketId);
    const cleanPassengers = passengers
      .filter((p) => p.name?.trim())
      .map((p) => ({
        bookings_ticket_id: ticketId,
        passenger_name: p.name,
        age: p.type,
        ticket_number: p.ticketNumber || "",
        ticket_code: p.ticketCode || "",
      }));
    if (cleanPassengers.length > 0) {
      await supabase.from("tickets_passengers").insert(cleanPassengers);
    }
  };

  const updateRoutes = async () => {
    await supabase
      .from("tickets_routes")
      .delete()
      .eq("bookings_ticket_id", ticketId);
    const cleanRoutes = routes
      .filter((r) => r.origin || r.destination)
      .map((r) => ({
        bookings_ticket_id: ticketId,
        flight_number: r.flight || "",
        rbd: r.rbd || "",
        date: r.date || "",
        origin: r.origin || "",
        destination: r.destination || "",
        departure_time: r.departure || "",
        arrival_time: r.arrival || "",
      }));
    if (cleanRoutes.length > 0) {
      await supabase.from("tickets_routes").insert(cleanRoutes);
    }
  };

  const updateExtras = async () => {
    await supabase
      .from("tickets_extras")
      .delete()
      .eq("bookings_ticket_id", ticketId);
    const cleanExtras = extras
      .filter((e) => e.description?.trim())
      .map((e) => ({
        bookings_ticket_id: ticketId,
        description: e.description,
        net_price: parseFloat(e.net_price || 0),
        sale_price: parseFloat(e.sale_price || 0),
        quantity: parseInt(e.quantity || 1),
        total_amount: parseFloat(e.total_amount || 0),
      }));
    if (cleanExtras.length > 0) {
      await supabase.from("tickets_extras").insert(cleanExtras);
    }
  };

  // Delete ticket
  const handleDelete = async () => {
    const confirmed = await showAlert({
      title: "ยืนยันการลบตั๋ว",
      description: `คุณต้องการลบตั๋วเครื่องบินรหัส ${ticketData.reference_number} ใช่หรือไม่?`,
      confirmText: "ลบถาวร",
      cancelText: "ยกเลิก",
      actionVariant: "destructive",
    });

    if (!confirmed) return;

    setDeleting(true);
    try {
      // Delete all related records
      await Promise.all([
        supabase
          .from("tickets_passengers")
          .delete()
          .eq("bookings_ticket_id", ticketId),
        supabase
          .from("tickets_routes")
          .delete()
          .eq("bookings_ticket_id", ticketId),
        supabase
          .from("tickets_extras")
          .delete()
          .eq("bookings_ticket_id", ticketId),
        supabase
          .from("tickets_pricing")
          .delete()
          .eq("bookings_ticket_id", ticketId),
        supabase
          .from("tickets_detail")
          .delete()
          .eq("bookings_ticket_id", ticketId),
        supabase
          .from("ticket_additional_info")
          .delete()
          .eq("bookings_ticket_id", ticketId),
      ]);

      await supabase.from("bookings_ticket").delete().eq("id", ticketId);

      await showAlert({
        title: "ลบข้อมูลสำเร็จ",
        description: `ตั๋วเครื่องบินรหัส ${ticketData.reference_number} ถูกลบออกจากระบบแล้ว`,
        confirmText: "ตกลง",
      });

      onSave?.();
      onClose();
    } catch (err) {
      setError(err.message);
      await showAlert({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบข้อมูลได้: " + err.message,
        confirmText: "ตกลง",
      });
    } finally {
      setDeleting(false);
    }
  };

  const formatCurrency = (amount) => {
    return parseFloat(amount || 0).toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (dateTime) => {
    if (!dateTime) return "-";
    return new Date(dateTime).toLocaleDateString("th-TH");
  };

  // Helper function to map database payment method to form values
  const mapPaymentMethodFromDB = (dbValue) => {
    if (!dbValue) return "";

    const mapping = {
      // Database values -> Form values
      เครดิตการ์ด: "creditCard",
      โอนเงินผ่านธนาคาร: "bankTransfer",
      เงินสด: "cash",
      เครดิต: "credit",
      "อื่น ๆ": "other",
      อื่นๆ: "other",
      // English values - เพิ่มตัวใหญ่
      CREDITCARD: "creditCard",
      BANKTRANSFER: "bankTransfer",
      CASH: "cash",
      CREDIT: "credit",
      OTHER: "other",
      // camelCase values
      creditCard: "creditCard",
      bankTransfer: "bankTransfer",
      cash: "cash",
      credit: "credit",
      other: "other",
    };

    return mapping[dbValue] || "";
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-center mt-4">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error && !ticketData) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <X className="h-12 w-12 mx-auto text-red-500" />
          <p className="text-center text-red-600 mt-4">{error}</p>
          <button
            onClick={onClose}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-md mx-auto block"
          >
            ปิด
          </button>
        </div>
      </div>
    );
  }

  if (!ticketData) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 text-white flex justify-between items-center shrink-0">
          <h1 className="text-xl font-bold">
            แก้ไขตั๋วเครื่องบิน: {ticketData.reference_number}
          </h1>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-700 rounded-md"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form
          onSubmit={handleSubmit}
          className={`${SaleStyles.contentWrapper} flex-1 overflow-y-auto`}
        >
          <div className="p-6 space-y-6">
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                {error}
              </div>
            )}

            {/* Customer & Dates - ใช้ SaleHeader */}
            <div className={SaleStyles.grid.twoColumns}>
              <div>
                <h2
                  className={combineClasses(
                    "text-lg font-semibold border-b pb-2",
                    SaleStyles.spacing.mb4
                  )}
                >
                  ข้อมูลลูกค้า
                </h2>
                <SaleHeader
                  formData={formData}
                  setFormData={setFormData}
                  section="customer"
                  selectedCustomer={selectedCustomer}
                  setSelectedCustomer={setSelectedCustomer}
                  globalEditMode={globalEditMode}
                  setGlobalEditMode={setGlobalEditMode}
                  readOnly={true} // true เพื่อให้เป็น readonly
                />
              </div>
              <div>
                <h2
                  className={combineClasses(
                    "text-lg font-semibold border-b pb-2",
                    SaleStyles.spacing.mb4
                  )}
                >
                  ราคาและวันที่
                </h2>
                <SaleHeader
                  formData={formData}
                  setFormData={setFormData}
                  section="price"
                  totalAmount={calculatedTotal}
                  subtotalAmount={calculatedSubtotal}
                  vatAmount={calculatedVatAmount}
                  globalEditMode={globalEditMode}
                  setGlobalEditMode={setGlobalEditMode}
                  readOnly={true} // true เพื่อให้เป็น readonly
                />
              </div>
            </div>

            {/* Passengers & Supplier */}
            <div className={SaleStyles.section.container}>
              <div className={SaleStyles.section.headerWrapper}>
                <h2 className={SaleStyles.section.headerTitle}>
                  ข้อมูลผู้โดยสารและซัพพลายเออร์
                </h2>
              </div>
              <div className={SaleStyles.grid.fifteenColumns}>
                <PassengerSection
                  passengers={passengers}
                  setPassengers={setPassengers}
                  updatePricing={updatePricing}
                  pricing={pricing}
                  formData={formData} // เพิ่ม props นี้
                  setFormData={setFormData} // เพิ่ม props นี้
                  readOnly={false} // เปลี่ยนจาก true เป็น false เพื่อให้สามารถแก้ไขได้
                />
                <SupplierSection
                  formData={formData}
                  setFormData={setFormData}
                  readOnly={false} // เปลี่ยนจาก true เป็น false เพื่อให้สามารถแก้ไขได้
                />
              </div>
            </div>

            {/* Routes & Ticket Type */}
            <div className={SaleStyles.section.container}>
              <div className={SaleStyles.section.headerWrapper}>
                <h2 className={SaleStyles.section.headerTitle}>
                  ประเภทตั๋วและเส้นทางการเดินทาง
                </h2>
              </div>
              <div className="grid grid-cols-10 gap-2">
                <RouteSection
                  routes={routes}
                  setRoutes={setRoutes}
                  readOnly={false} // เปลี่ยนเป็น false
                />
                <TicketTypeSection
                  formData={formData}
                  setFormData={setFormData}
                  readOnly={false} // เปลี่ยนเป็น false
                />
              </div>
            </div>

            {/* Extras */}
            <ExtrasSection
              extras={extras}
              setExtras={setExtras}
              readOnly={false} // เปลี่ยนเป็น false
            />

            {/* Pricing Summary */}
            <PricingSummarySection
              pricing={pricing}
              updatePricing={updatePricing}
              setFormData={setFormData}
              extras={extras}
              readOnly={false} // เปลี่ยนเป็น false
            />

            {/* Payment Methods */}
            <div className={SaleStyles.section.container}>
              <div className={SaleStyles.section.headerWrapper2}>
                <h2 className={SaleStyles.section.headerTitle}>การชำระเงิน</h2>
              </div>
              <div className={SaleStyles.subsection.content}>
                <div className={SaleStyles.grid.twoColumns}>
                  <PaymentMethodSection
                    title="การชำระเงินของบริษัท"
                    sectionType="company"
                    fieldName="paymentMethod"
                    detailsFieldName="companyPaymentDetails"
                    options={[
                      {
                        id: "creditCardCompany",
                        value: "creditCard",
                        label: "เครดิตการ์ด",
                      },
                      {
                        id: "bankTransferCompany",
                        value: "bankTransfer",
                        label: "โอนเงินผ่านธนาคาร",
                      },
                      { id: "cashCompany", value: "cash", label: "เงินสด" },
                      { id: "otherCompany", value: "other", label: "อื่น ๆ" },
                    ]}
                    formData={formData}
                    setFormData={setFormData}
                    detailPlaceholder="รายละเอียดการชำระเงิน"
                    readOnly={false} // เพิ่ม readOnly={false}
                  />

                  <PaymentMethodSection
                    title="การชำระเงินของลูกค้า"
                    sectionType="customer"
                    fieldName="customerPayment"
                    detailsFieldName="customerPaymentDetails"
                    options={[
                      {
                        id: "creditCardCustomer",
                        value: "creditCard",
                        label: "เครดิตการ์ด VISA / MSTR / AMEX / JCB",
                      },
                      {
                        id: "bankTransferCustomer",
                        value: "bankTransfer",
                        label: "โอนเงินผ่านธนาคาร",
                      },
                      { id: "cashCustomer", value: "cash", label: "เงินสด" },
                      {
                        id: "creditCustomer",
                        value: "credit",
                        label: "เครดิต",
                      },
                    ]}
                    formData={formData}
                    setFormData={setFormData}
                    detailPlaceholder="รายละเอียดการชำระเงิน"
                    readOnly={false} // เพิ่ม readOnly={false}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center shrink-0">
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
              disabled={saving || deleting}
            >
              <Trash2 size={16} className="mr-2" />
              {deleting ? "กำลังลบ..." : "ลบรายการ"}
            </button>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 flex items-center"
                disabled={saving || deleting}
              >
                <ChevronLeft size={16} className="mr-2" />
                ยกเลิก
              </button>

              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                disabled={saving || deleting}
              >
                <Save size={16} className="mr-2" />
                {saving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FlightTicketDetail_Edit;
