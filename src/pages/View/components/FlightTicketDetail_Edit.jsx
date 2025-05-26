import React, { useState, useEffect } from "react";
import { supabase } from "../../../services/supabase";
import {
  User,
  Plane,
  Calendar,
  MapPin,
  CreditCard,
  DollarSign,
  Save,
  ChevronLeft,
  Trash2,
  AlertTriangle,
  X,
  Package,
  Users,
  Phone,
  FileText,
  Tag,
  Plus,
} from "lucide-react";
import { formatCurrency } from "../../../utils/helpers";
import { useAlertDialogContext } from "../../../contexts/AlertDialogContext";

const FlightTicketDetail_Edit = ({ ticketId, onClose, onSave }) => {
  const showAlert = useAlertDialogContext();
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    // Customer info
    customerName: "",
    customerAddress: "",
    customerIdNumber: "",
    customerPhone: "",
    customerCode: "",
    customerBranchType: "Head Office",
    customerBranchNumber: "",
    customerCreditDays: 0,

    // Supplier info
    supplierCode: "",
    supplierName: "",
    code: "",

    // Dates and pricing
    issueDate: "",
    dueDate: "",
    creditDays: 0,
    vatPercent: 0,

    // Payment info
    companyPaymentMethod: "",
    companyPaymentDetails: "",
    customerPaymentMethod: "",
    customerPaymentDetails: "",

    // Ticket info
    ticketType: "bsp",
    ticketTypeDetails: "",
    status: "pending",
    paymentStatus: "unpaid",
  });

  const [passengers, setPassengers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [pricing, setPricing] = useState({
    adult: { net: 0, sale: 0, pax: 0, total: 0 },
    child: { net: 0, sale: 0, pax: 0, total: 0 },
    infant: { net: 0, sale: 0, pax: 0, total: 0 },
  });
  const [extras, setExtras] = useState([]);

  // Fetch ticket data when component mounts
  useEffect(() => {
    const fetchTicketDetails = async () => {
      setLoading(true);
      try {
        // Main ticket data
        const { data: ticket, error: ticketError } = await supabase
          .from("bookings_ticket")
          .select(
            `
            id,
            reference_number,
            status,
            payment_status,
            created_at,
            updated_at,
            created_by,
            updated_by,
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

        if (ticketError) throw ticketError;

        setTicketData(ticket);

        // Initialize form data
        setFormData({
          customerName: ticket.customer?.name || "",
          customerAddress: ticket.customer?.address || "",
          customerIdNumber: ticket.customer?.id_number || "",
          customerPhone: ticket.customer?.phone || "",
          customerCode: ticket.customer?.code || "",
          customerBranchType: ticket.customer?.branch_type || "Head Office",
          customerBranchNumber: ticket.customer?.branch_number || "",
          customerCreditDays: ticket.customer?.credit_days || 0,

          supplierCode: ticket.supplier?.code || "",
          supplierName: ticket.supplier?.name || "",
          code: ticket.ticket_additional_info?.[0]?.code || "",

          issueDate:
            ticket.tickets_detail?.[0]?.issue_date?.split("T")[0] || "",
          dueDate: ticket.tickets_detail?.[0]?.due_date?.split("T")[0] || "",
          creditDays: ticket.tickets_detail?.[0]?.credit_days || 0,
          vatPercent: ticket.tickets_pricing?.[0]?.vat_percent || 0,

          companyPaymentMethod:
            ticket.ticket_additional_info?.[0]?.company_payment_method || "",
          companyPaymentDetails:
            ticket.ticket_additional_info?.[0]?.company_payment_details || "",
          customerPaymentMethod:
            ticket.ticket_additional_info?.[0]?.customer_payment_method || "",
          customerPaymentDetails:
            ticket.ticket_additional_info?.[0]?.customer_payment_details || "",

          ticketType: ticket.ticket_additional_info?.[0]?.ticket_type || "bsp",
          ticketTypeDetails:
            ticket.ticket_additional_info?.[0]?.ticket_type_details || "",
          status: ticket.status || "pending",
          paymentStatus: ticket.payment_status || "unpaid",
        });

        // Initialize pricing
        if (ticket.tickets_pricing?.[0]) {
          const pricingData = ticket.tickets_pricing[0];
          setPricing({
            adult: {
              net: pricingData.adult_net_price || 0,
              sale: pricingData.adult_sale_price || 0,
              pax: pricingData.adult_pax || 0,
              total: pricingData.adult_total || 0,
            },
            child: {
              net: pricingData.child_net_price || 0,
              sale: pricingData.child_sale_price || 0,
              pax: pricingData.child_pax || 0,
              total: pricingData.child_total || 0,
            },
            infant: {
              net: pricingData.infant_net_price || 0,
              sale: pricingData.infant_sale_price || 0,
              pax: pricingData.infant_pax || 0,
              total: pricingData.infant_total || 0,
            },
          });
        }

        // Initialize passengers
        setPassengers(ticket.tickets_passengers || []);

        // Initialize routes
        setRoutes(ticket.tickets_routes || []);

        // Initialize extras
        setExtras(ticket.tickets_extras || []);
      } catch (err) {
        console.error("Error fetching ticket details:", err);
        setError(err.message || "ไม่สามารถโหลดข้อมูลตั๋วได้");
      } finally {
        setLoading(false);
      }
    };

    if (ticketId) fetchTicketDetails();
  }, [ticketId]);

  // Calculate totals
  const calculateTotals = () => {
    const pricingSubtotal =
      pricing.adult.total + pricing.child.total + pricing.infant.total;
    const extrasSubtotal = extras.reduce(
      (sum, extra) => sum + (parseFloat(extra.total_amount) || 0),
      0
    );
    const subtotal = pricingSubtotal + extrasSubtotal;
    const vatAmount = (subtotal * formData.vatPercent) / 100;
    const total = subtotal + vatAmount;

    return { subtotal, vatAmount, total };
  };

  // Update pricing
  const updatePricing = (category, field, value) => {
    setPricing((prev) => {
      const newPricing = { ...prev };
      newPricing[category] = {
        ...prev[category],
        [field]: parseFloat(value) || 0,
      };

      // Recalculate total for this category
      if (field === "sale" || field === "pax") {
        newPricing[category].total =
          newPricing[category].sale * newPricing[category].pax;
      }

      return newPricing;
    });
  };

  // Add/Remove passengers
  const addPassenger = () => {
    setPassengers([
      ...passengers,
      {
        passenger_name: "",
        age: "",
        ticket_number: "",
        ticket_code: "",
      },
    ]);
  };

  const removePassenger = (index) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter((_, i) => i !== index));
    }
  };

  const updatePassenger = (index, field, value) => {
    const newPassengers = [...passengers];
    newPassengers[index] = { ...newPassengers[index], [field]: value };
    setPassengers(newPassengers);
  };

  // Add/Remove routes
  const addRoute = () => {
    setRoutes([
      ...routes,
      {
        flight_number: "",
        rbd: "",
        date: "",
        origin: "",
        destination: "",
        departure_time: "",
        arrival_time: "",
      },
    ]);
  };

  const removeRoute = (index) => {
    if (routes.length > 1) {
      setRoutes(routes.filter((_, i) => i !== index));
    }
  };

  const updateRoute = (index, field, value) => {
    const newRoutes = [...routes];
    newRoutes[index] = { ...newRoutes[index], [field]: value };
    setRoutes(newRoutes);
  };

  // Add/Remove extras
  const addExtra = () => {
    setExtras([
      ...extras,
      {
        description: "",
        net_price: 0,
        sale_price: 0,
        quantity: 1,
        total_amount: 0,
      },
    ]);
  };

  const removeExtra = (index) => {
    setExtras(extras.filter((_, i) => i !== index));
  };

  const updateExtra = (index, field, value) => {
    const newExtras = [...extras];
    newExtras[index] = { ...newExtras[index], [field]: value };

    // Recalculate total if price or quantity changed
    if (field === "sale_price" || field === "quantity") {
      newExtras[index].total_amount =
        newExtras[index].sale_price * newExtras[index].quantity;
    }

    setExtras(newExtras);
  };

  // Format date for display
  const formatDate = (dateTime) => {
    if (!dateTime || isNaN(new Date(dateTime).getTime())) return "-";
    const dateObj = new Date(dateTime);
    const day = dateObj.getDate().toString().padStart(2, "0");
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime || isNaN(new Date(dateTime).getTime())) return "-";
    const dateObj = new Date(dateTime);
    const day = dateObj.getDate().toString().padStart(2, "0");
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const year = dateObj.getFullYear();
    const hours = dateObj.getHours().toString().padStart(2, "0");
    const minutes = dateObj.getMinutes().toString().padStart(2, "0");
    const seconds = dateObj.getSeconds().toString().padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  const formatCurrencyLocal = (amount) => {
    return parseFloat(amount || 0).toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { subtotal, vatAmount, total } = calculateTotals();

      // Update main booking
      const { error: bookingError } = await supabase
        .from("bookings_ticket")
        .update({
          status: formData.status || "pending",
          payment_status: formData.paymentStatus || "unpaid",
          updated_at: new Date().toISOString(),
        })
        .eq("id", ticketId);

      if (bookingError) throw bookingError;

      // Update customer (only if customer exists)
      if (ticketData.customer_id) {
        const { error: customerError } = await supabase
          .from("customers")
          .update({
            name: formData.customerName || "",
            address: formData.customerAddress || "",
            id_number: formData.customerIdNumber || "",
            phone: formData.customerPhone || "",
            code: formData.customerCode || "",
            branch_type: formData.customerBranchType || "Head Office",
            branch_number: formData.customerBranchNumber || "",
            credit_days: parseInt(formData.customerCreditDays) || 0,
          })
          .eq("id", ticketData.customer_id);

        if (customerError) throw customerError;
      }

      // Update ticket details
      const { error: detailError } = await supabase
        .from("tickets_detail")
        .update({
          issue_date: formData.issueDate || null,
          due_date: formData.dueDate || null,
          credit_days: parseInt(formData.creditDays) || 0,
          subtotal_before_vat: parseFloat(subtotal) || 0,
          vat_percent: parseFloat(formData.vatPercent) || 0,
          vat_amount: parseFloat(vatAmount) || 0,
          grand_total: parseFloat(total) || 0,
        })
        .eq("bookings_ticket_id", ticketId);

      if (detailError) throw detailError;

      // Update additional info
      const { error: additionalError } = await supabase
        .from("ticket_additional_info")
        .update({
          code: formData.code || "",
          ticket_type: formData.ticketType || "bsp",
          ticket_type_details: formData.ticketTypeDetails || "",
          company_payment_method: formData.companyPaymentMethod || "",
          company_payment_details: formData.companyPaymentDetails || "",
          customer_payment_method: formData.customerPaymentMethod || "",
          customer_payment_details: formData.customerPaymentDetails || "",
        })
        .eq("bookings_ticket_id", ticketId);

      if (additionalError) throw additionalError;

      // Update pricing
      const { error: pricingError } = await supabase
        .from("tickets_pricing")
        .update({
          adult_net_price: parseFloat(pricing.adult.net) || 0,
          adult_sale_price: parseFloat(pricing.adult.sale) || 0,
          adult_pax: parseInt(pricing.adult.pax) || 0,
          adult_total: parseFloat(pricing.adult.total) || 0,
          child_net_price: parseFloat(pricing.child.net) || 0,
          child_sale_price: parseFloat(pricing.child.sale) || 0,
          child_pax: parseInt(pricing.child.pax) || 0,
          child_total: parseFloat(pricing.child.total) || 0,
          infant_net_price: parseFloat(pricing.infant.net) || 0,
          infant_sale_price: parseFloat(pricing.infant.sale) || 0,
          infant_pax: parseInt(pricing.infant.pax) || 0,
          infant_total: parseFloat(pricing.infant.total) || 0,
          vat_percent: parseFloat(formData.vatPercent) || 0,
          vat_amount: parseFloat(vatAmount) || 0,
          total_amount: parseFloat(total) || 0,
        })
        .eq("bookings_ticket_id", ticketId);

      if (pricingError) throw pricingError;

      // Delete and recreate passengers
      await supabase
        .from("tickets_passengers")
        .delete()
        .eq("bookings_ticket_id", ticketId);
      if (passengers.length > 0) {
        const cleanPassengers = passengers
          .filter((p) => p.passenger_name && p.passenger_name.trim())
          .map((p) => ({
            bookings_ticket_id: ticketId,
            passenger_name: p.passenger_name || "",
            age: p.age || "",
            ticket_number: p.ticket_number || "",
            ticket_code: p.ticket_code || "",
          }));

        if (cleanPassengers.length > 0) {
          const { error: passengersError } = await supabase
            .from("tickets_passengers")
            .insert(cleanPassengers);
          if (passengersError) throw passengersError;
        }
      }

      // Delete and recreate routes
      await supabase
        .from("tickets_routes")
        .delete()
        .eq("bookings_ticket_id", ticketId);
      if (routes.length > 0) {
        const cleanRoutes = routes
          .filter((r) => r.origin || r.destination)
          .map((r) => ({
            bookings_ticket_id: ticketId,
            flight_number: r.flight_number || "",
            rbd: r.rbd || "",
            date: r.date || null,
            origin: r.origin || "",
            destination: r.destination || "",
            departure_time: r.departure_time || "",
            arrival_time: r.arrival_time || "",
          }));

        if (cleanRoutes.length > 0) {
          const { error: routesError } = await supabase
            .from("tickets_routes")
            .insert(cleanRoutes);
          if (routesError) throw routesError;
        }
      }

      // Delete and recreate extras
      await supabase
        .from("tickets_extras")
        .delete()
        .eq("bookings_ticket_id", ticketId);
      if (extras.length > 0) {
        const cleanExtras = extras
          .filter((e) => e.description && e.description.trim())
          .map((e) => ({
            bookings_ticket_id: ticketId,
            description: e.description || "",
            net_price: parseFloat(e.net_price) || 0,
            sale_price: parseFloat(e.sale_price) || 0,
            quantity: parseInt(e.quantity) || 1,
            total_amount: parseFloat(e.total_amount) || 0,
          }));

        if (cleanExtras.length > 0) {
          const { error: extrasError } = await supabase
            .from("tickets_extras")
            .insert(cleanExtras);
          if (extrasError) throw extrasError;
        }
      }

      await showAlert({
        title: "บันทึกข้อมูลสำเร็จ",
        description: `ตั๋วเครื่องบินรหัส ${ticketData.reference_number} ถูกอัปเดตเรียบร้อยแล้ว`,
        confirmText: "ตกลง",
      });

      if (onSave) onSave();
      onClose();
    } catch (err) {
      console.error("Error updating ticket:", err);
      setError("ไม่สามารถบันทึกข้อมูลตั๋วได้: " + err.message);
      await showAlert({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อมูลตั๋วได้: " + err.message,
        confirmText: "ตกลง",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle deletion
  const handleDelete = async () => {
    const confirmed = await showAlert({
      title: "ยืนยันการลบตั๋ว",
      description: `คุณต้องการลบตั๋วเครื่องบินรหัส ${ticketData.reference_number} ออกจากระบบใช่หรือไม่?\n\nการดำเนินการนี้ไม่สามารถย้อนกลับได้`,
      confirmText: "ลบถาวร",
      cancelText: "ยกเลิก",
      actionVariant: "destructive",
    });

    if (!confirmed) return;

    setDeleting(true);
    try {
      // Delete related records first (due to foreign key constraints)
      await supabase
        .from("tickets_passengers")
        .delete()
        .eq("bookings_ticket_id", ticketId);
      await supabase
        .from("tickets_routes")
        .delete()
        .eq("bookings_ticket_id", ticketId);
      await supabase
        .from("tickets_extras")
        .delete()
        .eq("bookings_ticket_id", ticketId);
      await supabase
        .from("tickets_pricing")
        .delete()
        .eq("bookings_ticket_id", ticketId);
      await supabase
        .from("tickets_detail")
        .delete()
        .eq("bookings_ticket_id", ticketId);
      await supabase
        .from("ticket_additional_info")
        .delete()
        .eq("bookings_ticket_id", ticketId);

      // Finally delete the main booking record
      const { error: deleteError } = await supabase
        .from("bookings_ticket")
        .delete()
        .eq("id", ticketId);

      if (deleteError) throw deleteError;

      await showAlert({
        title: "ลบข้อมูลสำเร็จ",
        description: `ตั๋วเครื่องบินรหัส ${ticketData.reference_number} ถูกลบออกจากระบบเรียบร้อยแล้ว`,
        confirmText: "ตกลง",
      });

      if (onSave) onSave();
      onClose();
    } catch (err) {
      console.error("Error deleting ticket:", err);
      setError("ไม่สามารถลบข้อมูลตั๋วได้: " + err.message);
      await showAlert({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบข้อมูลตั๋วได้: " + err.message,
        confirmText: "ตกลง",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 modal-backdrop bg-black flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
          <p className="text-center mt-4 text-base">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error && !ticketData) {
    return (
      <div className="fixed inset-0 modal-backdrop bg-black flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl">
          <div className="text-center text-red-500 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-center text-red-600 text-base">{error}</p>
          <div className="flex justify-center mt-6">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-base"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!ticketData) return null;

  const { subtotal, vatAmount, total } = calculateTotals();

  return (
    <div className="fixed inset-0 modal-backdrop bg-black flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 text-white flex justify-between items-center">
          <h1 className="text-xl font-bold">
            แก้ไขตั๋วเครื่องบิน:{" "}
            {ticketData.reference_number || `#${ticketData.id}`}
          </h1>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-700 rounded-md transition-colors"
            title="ปิด"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
              <p>{error}</p>
            </div>
          )}

          {/* Read-only Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-3 flex items-center">
              <FileText className="text-blue-500 mr-2" size={20} />
              ข้อมูลที่ไม่สามารถแก้ไขได้
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600">เลขที่อ้างอิง</div>
                <div className="font-medium text-base">
                  {ticketData.reference_number}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">วันที่สร้าง</div>
                <div className="font-medium text-base">
                  {formatDateTime(ticketData.created_at)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">อัปเดตล่าสุด</div>
                <div className="font-medium text-base">
                  {formatDateTime(ticketData.updated_at)}
                </div>
              </div>
            </div>
          </div>

          {/* Customer & Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-3 flex items-center">
                <User className="text-blue-500 mr-2" size={20} />
                ข้อมูลลูกค้า
              </h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      ชื่อลูกค้า
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.customerName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customerName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      รหัสลูกค้า
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.customerCode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customerCode: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    ที่อยู่
                  </label>
                  <textarea
                    className="w-full border border-gray-400 rounded-md p-2 h-20 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.customerAddress}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customerAddress: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      เบอร์โทร
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.customerPhone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customerPhone: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      เลขผู้เสียภาษี
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.customerIdNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customerIdNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-3 flex items-center">
                <Calendar className="text-blue-500 mr-2" size={20} />
                ราคาและวันที่
              </h2>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <div className="text-sm text-gray-600">ราคารวมทั้งสิ้น</div>
                <div className="text-2xl font-bold text-blue-600">
                  ฿{formatCurrencyLocal(total)}
                </div>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      วันที่บันทึก
                    </label>
                    <input
                      type="date"
                      className="w-full border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.issueDate}
                      onChange={(e) =>
                        setFormData({ ...formData, issueDate: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      วันครบกำหนด
                    </label>
                    <input
                      type="date"
                      className="w-full border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.dueDate}
                      onChange={(e) =>
                        setFormData({ ...formData, dueDate: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      เครดิต (วัน)
                    </label>
                    <input
                      type="number"
                      className="w-full border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.creditDays}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          creditDays: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      ภาษี (%)
                    </label>
                    <input
                      type="number"
                      className="w-full border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.vatPercent}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vatPercent: parseFloat(e.target.value) || 0,
                        })
                      }
                      step="0.01"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      สถานะรายการ
                    </label>
                    <select
                      className="w-full border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                    >
                      <option value="pending">รอดำเนินการ</option>
                      <option value="confirmed">ยืนยันแล้ว</option>
                      <option value="cancelled">ยกเลิก</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      สถานะการชำระเงิน
                    </label>
                    <select
                      className="w-full border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.paymentStatus}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paymentStatus: e.target.value,
                        })
                      }
                    >
                      <option value="unpaid">ยังไม่ชำระ</option>
                      <option value="partially">ชำระบางส่วน</option>
                      <option value="paid">ชำระแล้ว</option>
                      <option value="refunded">คืนเงินแล้ว</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Passengers & Supplier */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Users className="text-blue-500 mr-2" size={20} />
              ข้อมูลผู้โดยสารและซัพพลายเออร์
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <h3 className="font-medium text-base mb-3 flex items-center justify-between">
                  <span className="flex items-center">
                    <Users className="text-gray-500 mr-2" size={18} />
                    ข้อมูลผู้โดยสาร
                  </span>
                  <button
                    type="button"
                    onClick={addPassenger}
                    className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-md text-sm hover:bg-blue-100 flex items-center"
                  >
                    <Plus size={16} className="mr-1" />
                    เพิ่มผู้โดยสาร
                  </button>
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm border border-gray-200 rounded-md">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                          ชื่อ
                        </th>
                        <th className="px-3 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                          อายุ
                        </th>
                        <th className="px-3 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                          เลขตั๋ว
                        </th>
                        <th className="px-3 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                          รหัส
                        </th>
                        <th className="px-3 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                          จัดการ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {passengers.map((passenger, index) => (
                        <tr key={index}>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded p-1 text-sm"
                              value={passenger.passenger_name || ""}
                              onChange={(e) =>
                                updatePassenger(
                                  index,
                                  "passenger_name",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded p-1 text-sm"
                              value={passenger.age || ""}
                              onChange={(e) =>
                                updatePassenger(index, "age", e.target.value)
                              }
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded p-1 text-sm"
                              value={passenger.ticket_number || ""}
                              onChange={(e) =>
                                updatePassenger(
                                  index,
                                  "ticket_number",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded p-1 text-sm"
                              value={passenger.ticket_code || ""}
                              onChange={(e) =>
                                updatePassenger(
                                  index,
                                  "ticket_code",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td className="px-3 py-2">
                            <button
                              type="button"
                              onClick={() => removePassenger(index)}
                              className="text-red-500 hover:text-red-700"
                              disabled={passengers.length === 1}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="lg:col-span-4">
                <h3 className="font-medium text-base mb-3 flex items-center">
                  <Plane className="text-gray-500 mr-2" size={18} />
                  ข้อมูลซัพพลายเออร์
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      รหัสสายการบิน
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.supplierCode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          supplierCode: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      ชื่อสายการบิน
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.supplierName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          supplierName: e.target.value,
                        })
                      }
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Code
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      ประเภทตั๋ว
                    </label>
                    <select
                      className="w-full border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.ticketType}
                      onChange={(e) =>
                        setFormData({ ...formData, ticketType: e.target.value })
                      }
                    >
                      <option value="bsp">BSP</option>
                      <option value="airline">Airline Direct</option>
                      <option value="web">Web Booking</option>
                      <option value="tg">Thai Airways</option>
                      <option value="b2b">B2B</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  {(formData.ticketType === "b2b" ||
                    formData.ticketType === "other") && (
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        รายละเอียด
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.ticketTypeDetails}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            ticketTypeDetails: e.target.value,
                          })
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Routes */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4 flex items-center justify-between">
              <span className="flex items-center">
                <MapPin className="text-blue-500 mr-2" size={20} />
                เส้นทางการเดินทาง
              </span>
              <button
                type="button"
                onClick={addRoute}
                className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-md text-sm hover:bg-blue-100 flex items-center"
              >
                <Plus size={16} className="mr-1" />
                เพิ่มเส้นทาง
              </button>
            </h2>
            <div className="space-y-4">
              {routes.map((route, index) => (
                <div
                  key={index}
                  className="border border-gray-300 rounded-md p-3 bg-white"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-sm">
                      เส้นทางที่ {index + 1}
                    </h3>
                    <button
                      type="button"
                      onClick={() => removeRoute(index)}
                      className="text-red-500 hover:text-red-700"
                      disabled={routes.length === 1}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        เที่ยวบิน
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded p-1 text-sm"
                        value={route.flight_number || ""}
                        onChange={(e) =>
                          updateRoute(index, "flight_number", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        RBD
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded p-1 text-sm"
                        value={route.rbd || ""}
                        onChange={(e) =>
                          updateRoute(index, "rbd", e.target.value)
                        }
                        maxLength={1}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        วันที่
                      </label>
                      <input
                        type="date"
                        className="w-full border border-gray-300 rounded p-1 text-sm"
                        value={route.date || ""}
                        onChange={(e) =>
                          updateRoute(index, "date", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        ต้นทาง
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded p-1 text-sm"
                        value={route.origin || ""}
                        onChange={(e) =>
                          updateRoute(index, "origin", e.target.value)
                        }
                        maxLength={3}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        ปลายทาง
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded p-1 text-sm"
                        value={route.destination || ""}
                        onChange={(e) =>
                          updateRoute(index, "destination", e.target.value)
                        }
                        maxLength={3}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        เวลาออก
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded p-1 text-sm"
                        value={route.departure_time || ""}
                        onChange={(e) =>
                          updateRoute(index, "departure_time", e.target.value)
                        }
                        placeholder="HH:MM"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        เวลาถึง
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded p-1 text-sm"
                        value={route.arrival_time || ""}
                        onChange={(e) =>
                          updateRoute(index, "arrival_time", e.target.value)
                        }
                        placeholder="HH:MM"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Extras & Pricing */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Package className="text-blue-500 mr-2" size={20} />
              รายการเพิ่มเติมและตารางราคา
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
              {/* Extras */}
              <div className="lg:col-span-4">
                <h3 className="font-medium text-base mb-3 flex items-center justify-between">
                  <span>รายการเพิ่มเติม</span>
                  <button
                    type="button"
                    onClick={addExtra}
                    className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-md text-sm hover:bg-blue-100 flex items-center"
                  >
                    <Plus size={16} className="mr-1" />
                    เพิ่มรายการ
                  </button>
                </h3>
                <div className="space-y-3">
                  {extras.map((extra, index) => (
                    <div
                      key={index}
                      className="border border-gray-300 rounded-md p-3 bg-white"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">
                          รายการที่ {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeExtra(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="space-y-2">
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded p-1 text-sm"
                          placeholder="รายละเอียด"
                          value={extra.description || ""}
                          onChange={(e) =>
                            updateExtra(index, "description", e.target.value)
                          }
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="number"
                            className="w-full border border-gray-300 rounded p-1 text-sm"
                            placeholder="ราคาขาย"
                            value={extra.sale_price || ""}
                            onChange={(e) =>
                              updateExtra(
                                index,
                                "sale_price",
                                parseFloat(e.target.value) || 0
                              )
                            }
                          />
                          <input
                            type="number"
                            className="w-full border border-gray-300 rounded p-1 text-sm"
                            placeholder="จำนวน"
                            value={extra.quantity || ""}
                            onChange={(e) =>
                              updateExtra(
                                index,
                                "quantity",
                                parseInt(e.target.value) || 1
                              )
                            }
                          />
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded p-1 text-sm bg-gray-50"
                            placeholder="รวม"
                            value={formatCurrencyLocal(extra.total_amount || 0)}
                            disabled
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Table */}
              <div className="lg:col-span-4">
                <h3 className="font-medium text-base mb-3">ตารางราคา</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm border border-gray-200 rounded-md">
                    <thead className="bg-blue-100">
                      <tr>
                        <th className="px-3 py-2 text-left text-sm font-medium text-blue-700 uppercase tracking-wider">
                          ประเภท
                        </th>
                        <th className="px-3 py-2 text-right text-sm font-medium text-blue-700 uppercase tracking-wider">
                          Sale
                        </th>
                        <th className="px-3 py-2 text-center text-sm font-medium text-blue-700 uppercase tracking-wider">
                          Pax
                        </th>
                        <th className="px-3 py-2 text-right text-sm font-medium text-blue-700 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {["adult", "child", "infant"].map((category) => (
                        <tr key={category}>
                          <td className="px-3 py-2 text-sm font-medium">
                            {category === "adult"
                              ? "Adult"
                              : category === "child"
                              ? "Child"
                              : "Infant"}
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              className="w-full border border-gray-300 rounded p-1 text-sm text-right"
                              value={pricing[category].sale || ""}
                              onChange={(e) =>
                                updatePricing(category, "sale", e.target.value)
                              }
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              className="w-full border border-gray-300 rounded p-1 text-sm text-center"
                              value={pricing[category].pax || ""}
                              onChange={(e) =>
                                updatePricing(category, "pax", e.target.value)
                              }
                            />
                          </td>
                          <td className="px-3 py-2 text-right text-sm font-medium">
                            ฿{formatCurrencyLocal(pricing[category].total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary */}
              <div className="lg:col-span-2">
                <h3 className="font-medium text-base mb-3">ยอดรวม</h3>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        ยอดรวมเป็นเงิน
                      </span>
                      <span className="font-bold text-gray-700">
                        ฿{formatCurrencyLocal(subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        ภาษีมูลค่าเพิ่ม {formData.vatPercent}%
                      </span>
                      <span className="text-gray-700">
                        ฿{formatCurrencyLocal(vatAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t border-blue-200 pt-2">
                      <span className="text-base font-semibold">
                        ยอดรวมทั้งสิ้น
                      </span>
                      <span className="font-bold text-blue-600 text-lg">
                        ฿{formatCurrencyLocal(total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <CreditCard className="text-blue-500 mr-2" size={20} />
              การชำระเงิน
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-medium text-base mb-3">
                  การชำระเงินของบริษัท
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      วิธีการชำระเงิน
                    </label>
                    <select
                      className="w-full border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.companyPaymentMethod}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          companyPaymentMethod: e.target.value,
                        })
                      }
                    >
                      <option value="">เลือกวิธีการชำระเงิน</option>
                      <option value="creditCard">เครดิตการ์ด</option>
                      <option value="bankTransfer">โอนเงินผ่านธนาคาร</option>
                      <option value="cash">เงินสด</option>
                      <option value="other">อื่นๆ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      รายละเอียด
                    </label>
                    <textarea
                      className="w-full border border-gray-400 rounded-md p-2 h-20 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.companyPaymentDetails}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          companyPaymentDetails: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-medium text-base mb-3">
                  การชำระเงินของลูกค้า
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      วิธีการชำระเงิน
                    </label>
                    <select
                      className="w-full border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.customerPaymentMethod}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customerPaymentMethod: e.target.value,
                        })
                      }
                    >
                      <option value="">เลือกวิธีการชำระเงิน</option>
                      <option value="creditCard">
                        เครดิตการ์ด VISA / MSTR / AMEX / JCB
                      </option>
                      <option value="bankTransfer">โอนเงินผ่านธนาคาร</option>
                      <option value="cash">เงินสด</option>
                      <option value="credit">เครดิต</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      รายละเอียด
                    </label>
                    <textarea
                      className="w-full border border-gray-400 rounded-md p-2 h-20 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.customerPaymentDetails}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customerPaymentDetails: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
            disabled={saving || deleting}
          >
            <Trash2 size={16} className="mr-2" />
            {deleting ? "กำลังลบ..." : "ลบรายการ"}
          </button>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
              disabled={saving || deleting}
            >
              <ChevronLeft size={16} className="mr-2" />
              ยกเลิก
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
              disabled={saving || deleting}
            >
              <Save size={16} className="mr-2" />
              {saving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightTicketDetail_Edit;
