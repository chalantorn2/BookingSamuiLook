import React, { useState, useEffect } from "react";
import { supabase } from "../../../services/supabase";
import { generatePOForTicket } from "../../../services/ticketService";
import EmailInvoice from "../common/EmailInvoice";
import {
  Printer,
  Mail,
  X,
  CheckCircle,
  AlertTriangle,
  ChevronLeft,
  Edit2,
} from "lucide-react";
import PrintDocument from "../common/PrintDocument";
import PrintConfirmModal from "./PrintConfirmModal";
import SaleHeader from "../../Sales/common/SaleHeader";
import PaymentMethodSection from "../../Sales/common/PaymentMethodSection";
import PassengerSection from "../../Sales/ticket/PassengerSection";
import SupplierSection from "../../Sales/ticket/SupplierSection";
import RouteSection from "../../Sales/ticket/RouteSection";
import TicketTypeSection from "../../Sales/ticket/TicketTypeSection";
import ExtrasSection from "../../Sales/ticket/ExtrasSection";
import PricingSummarySection from "../../Sales/ticket/PricingSummarySection";
import usePricing from "../../../hooks/usePricing";
import SaleStyles, { combineClasses } from "../../Sales/common/SaleStyles";
import {
  formatCustomerAddress,
  displayThaiDateTime,
} from "../../../utils/helpers";

const FlightTicketDetail = ({ ticketId, onClose, onEdit, onPOGenerated }) => {
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showPrintConfirm, setShowPrintConfirm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailNotification, setEmailNotification] = useState(null);

  // Use same pricing hook as SaleTicket
  const { pricing, updatePricing, calculateSubtotal } = usePricing();

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
    branchType: "Head Office",
    branchNumber: "",
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
    {
      id: 1,
      description: "",
      net_price: "",
      sale_price: "",
      quantity: 1,
      total_amount: "",
    },
  ]);

  // Dummy states for SaleHeader compatibility
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [globalEditMode, setGlobalEditMode] = useState(false);

  useEffect(() => {
    const fetchTicketDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch all ticket data in one query (same as Edit)
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

        // Fetch user information
        const userIds = [
          ticket.created_by,
          ticket.updated_by,
          ticket.cancelled_by,
        ].filter(Boolean);
        const { data: users, error: usersError } = await supabase
          .from("users")
          .select("id, fullname")
          .in("id", userIds);

        if (usersError) throw usersError;

        const userMap = new Map(
          users?.map((user) => [user.id, user.fullname]) || []
        );

        setTicketData({
          ...ticket,
          createdByName: userMap.get(ticket.created_by) || "-",
          updatedByName: userMap.get(ticket.updated_by) || "-",
          cancelledByName: userMap.get(ticket.cancelled_by) || "-",
        });

        mapDataToFormState(ticket);
      } catch (err) {
        console.error("Error fetching ticket details:", err);
        setError(err.message || "ไม่สามารถโหลดข้อมูลตั๋วได้");
      } finally {
        setLoading(false);
      }
    };

    if (ticketId) fetchTicketDetails();
  }, [ticketId]);

  // Map database data to component state (same as Edit)
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
      paymentMethod: additional.company_payment_method || "",
      companyPaymentDetails: additional.company_payment_details || "",
      customerPayment: additional.customer_payment_method || "",
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
      branchType: ticket.customer?.branch_type || "Head Office",
      branchNumber: ticket.customer?.branch_number || "",
    });

    // Map pricing
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

    // Map extras
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

  // Calculate totals
  const calculatedSubtotal =
    calculateSubtotal() +
    extras.reduce((sum, item) => sum + parseFloat(item.total_amount || 0), 0);
  const calculatedVatAmount =
    (calculatedSubtotal * parseFloat(formData.vatPercent || 0)) / 100;
  const calculatedTotal = calculatedSubtotal + calculatedVatAmount;

  // Print/Email handlers (same as original)
  const handlePrintClick = () => {
    if (ticketData.po_number) {
      setShowPrintModal(true);
    } else {
      setShowPrintConfirm(true);
    }
  };

  const handleClosePrintModal = () => {
    setShowPrintModal(false);
  };

  const handlePOGenerated = () => {
    if (onPOGenerated) {
      onPOGenerated();
    }

    if (ticketId) {
      const fetchUpdatedData = async () => {
        try {
          const { data: updatedTicket, error } = await supabase
            .from("bookings_ticket")
            .select("po_number, po_generated_at, status")
            .eq("id", ticketId)
            .single();

          if (!error && updatedTicket) {
            setTicketData((prev) => ({
              ...prev,
              po_number: updatedTicket.po_number,
              po_generated_at: updatedTicket.po_generated_at,
              status: updatedTicket.status,
            }));
          }
        } catch (err) {
          console.error("Error refreshing ticket data:", err);
        }
      };
      fetchUpdatedData();
    }
  };

  const handleConfirmPrint = async () => {
    setGenerating(true);

    try {
      const poResult = await generatePOForTicket(ticketId);

      if (poResult.success) {
        setTicketData((prev) => ({
          ...prev,
          po_number: poResult.poNumber,
          po_generated_at: new Date().toISOString(),
          status: "invoiced",
        }));

        if (onPOGenerated) {
          onPOGenerated();
        }

        setShowPrintConfirm(false);
        setShowPrintModal(true); // ใช้แค่วิธีเดิม
      } else {
        alert("ไม่สามารถสร้าง PO Number ได้: " + poResult.error);
      }
    } catch (error) {
      console.error("Error generating PO:", error);
      alert("เกิดข้อผิดพลาด: " + error.message);
    } finally {
      setGenerating(false);
    }
  };
  const handleCancelPrint = () => {
    setShowPrintConfirm(false);
  };

  const handleEmailClick = () => {
    if (!ticketData.po_number || ticketData.po_number.trim() === "") {
      alert("ไม่สามารถส่งอีเมลได้ กรุณาออกเลข PO ก่อน");
      return;
    }
    setShowEmailModal(true);
  };

  const handleCloseEmailModal = () => {
    setShowEmailModal(false);
    setEmailNotification(null);
  };

  const handleEmailSent = (message) => {
    setEmailNotification(message);
    setTimeout(() => {
      setEmailNotification(null);
    }, 5000);
  };

  // ฟังก์ชันสำหรับแสดงวันที่เวลาแบบไทย (ไม่มีวินาที)
  const formatThaiDateTime = (dateTime) => {
    if (!dateTime) return "-";
    const date = new Date(dateTime);
    // ปรับเป็น UTC+7 (เวลาไทย)
    const thaiTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);

    const day = thaiTime.getDate().toString().padStart(2, "0");
    const month = (thaiTime.getMonth() + 1).toString().padStart(2, "0");
    const year = thaiTime.getFullYear(); // ค.ศ. (ไม่บวก 543)
    const hours = thaiTime.getHours().toString().padStart(2, "0");
    const minutes = thaiTime.getMinutes().toString().padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const getBranchDisplay = (branchType, branchNumber) => {
    if (branchType === "Branch" && branchNumber) {
      return `${branchType} ${branchNumber}`;
    }
    return branchType || "Head Office";
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
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const getStatusBadge = (status, poNumber, poGeneratedAt) => {
    if (poNumber) {
      return (
        <div className="flex items-center">
          <CheckCircle className="text-green-500 mr-2" size={18} />
          <div>
            <div className="text-base font-medium text-gray-900">
              {poNumber}
            </div>
            <div className="text-sm text-gray-600">
              {formatDateTime(poGeneratedAt)}
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
          Not Invoiced
        </span>
      );
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

  if (error) {
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

  return (
    <>
      <div className="fixed inset-0 modal-backdrop bg-black flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header - same as original */}
          <div className="bg-blue-600 px-6 py-4 text-white flex justify-between items-center">
            <h1 className="text-xl font-bold">
              รายละเอียดตั๋วเครื่องบิน:{" "}
              {ticketData.reference_number || `#${ticketData.id}`}
            </h1>
            <div className="flex items-center space-x-2">
              {/* ปุ่มพิมพ์เดิม */}
              <button
                className="p-2 hover:bg-blue-700 rounded-md transition-colors"
                title="พิมพ์ (แบบเดิม)"
                onClick={handlePrintClick}
              >
                <Printer size={20} />
              </button>

              <button
                className={`p-2 rounded-md transition-colors ${
                  ticketData.po_number && ticketData.po_number.trim() !== ""
                    ? "hover:bg-blue-700"
                    : "opacity-50 cursor-not-allowed"
                }`}
                title={
                  ticketData.po_number && ticketData.po_number.trim() !== ""
                    ? "ส่งอีเมล"
                    : "ต้องออกเลข PO ก่อนส่งอีเมล"
                }
                onClick={handleEmailClick}
                disabled={
                  !ticketData.po_number || ticketData.po_number.trim() === ""
                }
              >
                <Mail size={20} />
              </button>

              <button
                onClick={onClose}
                className="p-2 hover:bg-blue-700 rounded-md transition-colors"
                title="ปิด"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content - Using SaleTicket components */}
          <div className="flex-1 overflow-y-auto">
            <div className={SaleStyles.mainContent}>
              {/* 1. Customer & Dates */}
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
                    readOnly={true}
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
                    readOnly={true}
                  />
                </div>
              </div>

              {/* 2. Passengers & Supplier */}
              <div className={SaleStyles.section.container}>
                <div className={SaleStyles.section.headerWrapper}>
                  <h2 className={SaleStyles.section.headerTitle}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    ข้อมูลผู้โดยสารและซัพพลายเออร์
                  </h2>
                </div>
                <div className={SaleStyles.grid.fifteenColumns}>
                  <PassengerSection
                    passengers={passengers}
                    setPassengers={setPassengers}
                    updatePricing={updatePricing}
                    pricing={pricing}
                    formData={formData}
                    setFormData={setFormData}
                    readOnly={true}
                  />
                  <SupplierSection
                    formData={formData}
                    setFormData={setFormData}
                    readOnly={true}
                  />
                </div>
              </div>

              {/* 3. Routes & Ticket Type */}
              <div className={SaleStyles.section.container}>
                <div className={SaleStyles.section.headerWrapper}>
                  <h2 className={SaleStyles.section.headerTitle}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                    </svg>
                    ประเภทตั๋วและเส้นทางการเดินทาง
                  </h2>
                </div>
                <div className="grid grid-cols-10 gap-2">
                  <RouteSection
                    routes={routes}
                    setRoutes={setRoutes}
                    readOnly={true}
                  />
                  <TicketTypeSection
                    formData={formData}
                    setFormData={setFormData}
                    readOnly={true}
                  />
                </div>
              </div>

              {/* 4. Extras */}
              <ExtrasSection
                extras={extras}
                setExtras={setExtras}
                readOnly={true}
              />

              {/* 5. Pricing Summary */}
              <PricingSummarySection
                pricing={pricing}
                updatePricing={updatePricing}
                setFormData={setFormData}
                extras={extras}
                readOnly={true}
              />

              {/* 6. Payment Methods - Simple Display */}
              <div className={SaleStyles.section.container}>
                <section className={SaleStyles.subsection.container}>
                  <div className={SaleStyles.section.headerWrapper2}>
                    <h2 className={SaleStyles.section.headerTitle}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                        <path
                          fillRule="evenodd"
                          d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      การชำระเงิน
                    </h2>
                  </div>
                  <div className={SaleStyles.subsection.content}>
                    <div className={SaleStyles.grid.twoColumns}>
                      {/* การชำระเงินของบริษัท */}
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 className="font-semibold mb-3 text-blue-600 text-lg flex items-center">
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                            <path
                              fillRule="evenodd"
                              d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                          การชำระเงินของบริษัท
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm text-gray-600">
                              วิธีการชำระเงิน:
                            </span>
                            <div className="font-medium text-base mt-1">
                              {(() => {
                                const method =
                                  formData.paymentMethod?.toLowerCase();
                                switch (method) {
                                  case "creditcard":
                                    return "เครดิตการ์ด";
                                  case "banktransfer":
                                    return "โอนเงินผ่านธนาคาร";
                                  case "cash":
                                    return "เงินสด";
                                  case "other":
                                    return "อื่น ๆ";
                                  default:
                                    return formData.paymentMethod || "-";
                                }
                              })()}
                            </div>
                          </div>
                          {formData.companyPaymentDetails && (
                            <div>
                              <span className="text-sm text-gray-600">
                                รายละเอียด:
                              </span>
                              <div className="font-medium text-base mt-1 p-2 bg-gray-50 rounded border border-gray-200">
                                {formData.companyPaymentDetails}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* การชำระเงินของลูกค้า */}
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 className="font-semibold mb-3 text-blue-600 text-lg flex items-center">
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                            <path
                              fillRule="evenodd"
                              d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                          การชำระเงินของลูกค้า
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm text-gray-600">
                              วิธีการชำระเงิน:
                            </span>
                            <div className="font-medium text-base mt-1">
                              {(() => {
                                const method =
                                  formData.customerPayment?.toLowerCase();
                                switch (method) {
                                  case "creditcard":
                                    return "เครดิตการ์ด VISA / MSTR / AMEX / JCB";
                                  case "banktransfer":
                                    return "โอนเงินผ่านธนาคาร";
                                  case "cash":
                                    return "เงินสด";
                                  case "credit":
                                    return "เครดิต";
                                  case "other":
                                    return "อื่น ๆ";
                                  default:
                                    return formData.customerPayment || "-";
                                }
                              })()}
                            </div>
                          </div>
                          {formData.customerPaymentDetails && (
                            <div>
                              <span className="text-sm text-gray-600">
                                รายละเอียด:
                              </span>
                              <div className="font-medium text-base mt-1 p-2 bg-gray-50 rounded border border-gray-200">
                                {formData.customerPaymentDetails}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
            <div className="flex items-center space-x-6">
              {/* Status info */}
              <div className="flex items-center space-x-4">
                <div>
                  <div className="text-gray-600 mb-1 text-sm">สถานะรายการ</div>
                  {getStatusBadge(
                    ticketData.status,
                    ticketData.po_number,
                    ticketData.po_generated_at
                  )}
                </div>
                <div>
                  <div className="text-gray-600 mb-1 text-sm">สร้างโดย</div>
                  <div className="font-medium text-sm">
                    {ticketData.createdByName}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {formatThaiDateTime(ticketData.created_at)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1 text-sm">อัปเดตโดย</div>
                  <div className="font-medium text-sm">
                    {ticketData.updatedByName}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {formatThaiDateTime(ticketData.updated_at)}
                  </div>
                </div>
                {ticketData.cancelled_at && (
                  <div>
                    <div className="text-gray-600 mb-1 text-sm">ยกเลิกโดย</div>
                    <div className="font-medium text-sm">
                      {ticketData.cancelledByName}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {formatThaiDateTime(ticketData.cancelled_at)}
                    </div>
                    <div className="text-gray-600 text-sm">
                      เหตุผล: {ticketData.cancel_reason || "-"}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-3">
              {onEdit && (
                <button
                  onClick={() => onEdit(ticketData.id)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors flex items-center text-sm font-medium"
                >
                  <Edit2 size={16} className="mr-2" />
                  แก้ไข
                </button>
              )}
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors flex items-center text-sm font-medium"
              >
                <ChevronLeft size={16} className="mr-2" />
                กลับ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals - same as original */}
      <PrintDocument
        isOpen={showPrintModal}
        onClose={handleClosePrintModal}
        documentType="invoice"
        ticketId={ticketId}
        onPOGenerated={handlePOGenerated}
      />
      <PrintConfirmModal
        isOpen={showPrintConfirm}
        onClose={handleCancelPrint}
        onConfirm={handleConfirmPrint}
        loading={generating}
      />
      <EmailInvoice
        isOpen={showEmailModal}
        onClose={handleCloseEmailModal}
        invoiceData={
          ticketData
            ? {
                customer: {
                  name: ticketData.customer?.name || "",
                  address: ticketData.customer?.address || "",
                  phone: ticketData.customer?.phone || "",
                  taxId: ticketData.customer?.id_number || "",
                  branch: getBranchDisplay(
                    ticketData.customer?.branch_type,
                    ticketData.customer?.branch_number
                  ),
                  email: ticketData.customer?.email || "",
                },
                invoice: {
                  poNumber: ticketData.po_number || "",
                  date: formData.date,
                  dueDate: formData.dueDate,
                  salesPerson: ticketData.createdByName || "System",
                },
                passengers:
                  passengers?.map((p, index) => ({
                    index: index + 1,
                    name: p.name || "",
                    age: p.type || "",
                    ticketNumber: p.ticketNumber || "",
                    ticketCode: p.ticketCode || "",
                    display: `${index + 1}. ${p.name || ""} ${p.type || ""} ${
                      p.ticketNumber || ""
                    } ${p.ticketCode || ""}`
                      .trim()
                      .replace(/\s+/g, " "),
                  })) || [],
                flights:
                  routes?.map((route) => ({
                    flightNumber: route.flight || "",
                    rbd: route.rbd || "",
                    date: route.date || "",
                    route: `${route.origin || ""}-${route.destination || ""}`,
                    display: `${route.flight || ""} ${route.date || ""} ${
                      route.origin || ""
                    }${route.destination || ""}`
                      .trim()
                      .replace(/\s+/g, " "),
                  })) || [],
                passengerTypes: [
                  {
                    type: "Adult",
                    quantity: pricing.adult?.pax || 0,
                    unitPrice: pricing.adult?.sale || 0,
                    amount: pricing.adult?.total || 0,
                  },
                  {
                    type: "Child",
                    quantity: pricing.child?.pax || 0,
                    unitPrice: pricing.child?.sale || 0,
                    amount: pricing.child?.total || 0,
                  },
                  {
                    type: "Infant",
                    quantity: pricing.infant?.pax || 0,
                    unitPrice: pricing.infant?.sale || 0,
                    amount: pricing.infant?.total || 0,
                  },
                ].filter((item) => item.quantity > 0),
                extras:
                  extras?.map((extra) => ({
                    description: extra.description || "",
                    quantity: extra.quantity || 1,
                    unitPrice: extra.sale_price || 0,
                    amount: extra.total_amount || 0,
                  })) || [],
                summary: {
                  subtotal: calculatedSubtotal,
                  vatPercent: parseFloat(formData.vatPercent || 0),
                  vat: calculatedVatAmount,
                  total: calculatedTotal,
                },
              }
            : null
        }
        ticketId={ticketId}
        onEmailSent={handleEmailSent}
      />
    </>
  );
};

export default FlightTicketDetail;
