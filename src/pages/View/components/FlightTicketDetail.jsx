import React, { useState, useEffect } from "react";
import { supabase } from "../../../services/supabase";
import { generatePOForTicket } from "../../../services/ticketService";
import {
  User,
  Plane,
  Calendar,
  MapPin,
  Clock,
  Tag,
  CreditCard,
  FileText,
  ChevronLeft,
  Printer,
  Download,
  Mail,
  Edit2,
  AlertTriangle,
  Info,
  Users,
  FilePlus,
  Phone,
  DollarSign,
  CheckCircle,
  X,
  Package,
} from "lucide-react";
import PrintDocument from "../common/PrintDocument";
import PrintConfirmModal from "./PrintConfirmModal";

const FlightTicketDetail = ({ ticketId, onClose, onEdit, onPOGenerated }) => {
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showPrintConfirm, setShowPrintConfirm] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchTicketDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: ticket, error: ticketError } = await supabase
          .from("bookings_ticket")
          .select(
            `
          id,
          reference_number,
          status,
          created_at,
          updated_at,
          created_by,
          updated_by,
          cancelled_at,
          cancelled_by,
          cancel_reason,
          po_number,
          po_generated_at,
          customer:customer_id(name, address, id_number, phone, credit_days, branch_type, branch_number, code),
          supplier:information_id(name, code, type)
        `
          )
          .eq("id", ticketId)
          .single();

        if (ticketError) throw ticketError;

        const adjustedTicket = {
          ...ticket,
          created_at: ticket.created_at
            ? new Date(
                new Date(ticket.created_at).getTime() + 7 * 60 * 60 * 1000
              ).toISOString()
            : null,
          updated_at: ticket.updated_at
            ? new Date(
                new Date(ticket.updated_at).getTime() + 7 * 60 * 60 * 1000
              ).toISOString()
            : null,
          cancelled_at: ticket.cancelled_at
            ? new Date(
                new Date(ticket.cancelled_at).getTime() + 7 * 60 * 60 * 1000
              ).toISOString()
            : null,
          po_generated_at: ticket.po_generated_at
            ? new Date(
                new Date(ticket.po_generated_at).getTime() + 7 * 60 * 60 * 1000
              ).toISOString()
            : null,
        };

        const { data: additionalInfo, error: additionalInfoError } =
          await supabase
            .from("ticket_additional_info")
            .select("*")
            .eq("bookings_ticket_id", ticketId)
            .single();

        if (
          additionalInfoError &&
          !additionalInfoError.message.includes("No rows found")
        ) {
          throw additionalInfoError;
        }

        const { data: detail, error: detailError } = await supabase
          .from("tickets_detail")
          .select("*")
          .eq("bookings_ticket_id", ticketId)
          .single();

        if (detailError && !detailError.message.includes("No rows found")) {
          throw detailError;
        }

        const adjustedDetail = {
          ...detail,
          issue_date: detail?.issue_date
            ? new Date(
                new Date(detail.issue_date).getTime() + 7 * 60 * 60 * 1000
              ).toISOString()
            : null,
          due_date: detail?.due_date
            ? new Date(
                new Date(detail.due_date).getTime() + 7 * 60 * 60 * 1000
              ).toISOString()
            : null,
        };

        const { data: pricing, error: pricingError } = await supabase
          .from("tickets_pricing")
          .select("*")
          .eq("bookings_ticket_id", ticketId)
          .single();

        if (pricingError && !pricingError.message.includes("No rows found")) {
          throw pricingError;
        }

        const { data: passengers, error: passengersError } = await supabase
          .from("tickets_passengers")
          .select("*")
          .eq("bookings_ticket_id", ticketId);

        if (passengersError) throw passengersError;

        const { data: routes, error: routesError } = await supabase
          .from("tickets_routes")
          .select("*")
          .eq("bookings_ticket_id", ticketId);

        if (routesError) throw routesError;

        const { data: extras, error: extrasError } = await supabase
          .from("tickets_extras")
          .select("*")
          .eq("bookings_ticket_id", ticketId);

        if (extrasError) throw extrasError;

        const userIds = [
          adjustedTicket.created_by,
          adjustedTicket.updated_by,
          adjustedTicket.cancelled_by,
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
          ...adjustedTicket,
          additionalInfo: additionalInfo || {},
          detail: adjustedDetail || {},
          pricing: pricing || {},
          passengers: passengers || [],
          routes: routes || [],
          extras: extras || [],
          createdByName: userMap.get(adjustedTicket.created_by) || "-",
          updatedByName: userMap.get(adjustedTicket.updated_by) || "-",
          cancelledByName: userMap.get(adjustedTicket.cancelled_by) || "-",
        });
      } catch (err) {
        console.error("Error fetching ticket details:", err);
        setError(err.message || "ไม่สามารถโหลดข้อมูลตั๋วได้");
      } finally {
        setLoading(false);
      }
    };

    if (ticketId) fetchTicketDetails();
  }, [ticketId]);

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
        setShowPrintModal(true);
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

  const formatDate = (dateTime) => {
    if (!dateTime || isNaN(new Date(dateTime).getTime())) return "-";
    const dateObj = new Date(dateTime);
    const day = dateObj.getDate().toString().padStart(2, "0");
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatRouteDate = (dateTime) => {
    if (!dateTime || isNaN(new Date(dateTime).getTime())) return "-";
    const dateObj = new Date(dateTime);
    const day = dateObj.getDate().toString().padStart(2, "0");
    const monthNames = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ];
    const month = monthNames[dateObj.getMonth()];
    return `${day}${month}`;
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return "0";
    return Math.floor(parseFloat(amount)).toLocaleString("th-TH");
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

  const getTicketTypeDisplay = (ticketType, ticketTypeDetails) => {
    const typeMap = {
      bsp: "BSP",
      airline: "Airline Direct",
      web: "Web Booking",
      tg: "Thai Airways",
      b2b: "B2B",
      other: "Other",
    };

    const displayType = typeMap[ticketType] || ticketType || "-";

    if (ticketTypeDetails && ticketTypeDetails.trim()) {
      return `${displayType} (${ticketTypeDetails})`;
    }

    return displayType;
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
          <div className="bg-blue-600 px-6 py-4 text-white flex justify-between items-center">
            <h1 className="text-xl font-bold">
              รายละเอียดตั๋วเครื่องบิน:{" "}
              {ticketData.reference_number || `#${ticketData.id}`}
            </h1>
            <div className="flex items-center space-x-2">
              <button
                className="p-2 hover:bg-blue-700 rounded-md transition-colors"
                title="พิมพ์"
                onClick={handlePrintClick}
              >
                <Printer size={20} />
              </button>
              <button
                className="p-2 hover:bg-blue-700 rounded-md transition-colors"
                title="ส่งอีเมล"
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
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold mb-3 flex items-center">
                  <User className="text-blue-500 mr-2" size={20} />
                  ข้อมูลลูกค้า
                </h2>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex items-start">
                      <User className="text-gray-500 mr-2 mt-1" size={16} />
                      <div>
                        <div className="font-medium text-base">
                          {ticketData.customer?.name || "-"}
                        </div>
                        <div className="text-gray-600 text-sm">ชื่อลูกค้า</div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Tag className="text-gray-500 mr-2 mt-1" size={16} />
                      <div>
                        <div className="font-medium text-base">
                          {ticketData.customer?.code || "-"}
                        </div>
                        <div className="text-gray-600 text-sm">รหัสลูกค้า</div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="text-gray-500 mr-2 mt-1" size={16} />
                      <div>
                        <div className="font-medium text-base">
                          {ticketData.customer?.address || "-"}
                        </div>
                        <div className="text-gray-600 text-sm">ที่อยู่</div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex items-start">
                      <Phone className="text-gray-500 mr-2 mt-1" size={16} />
                      <div>
                        <div className="font-medium text-base">
                          {ticketData.customer?.phone || "-"}
                        </div>
                        <div className="text-gray-600 text-sm">เบอร์โทร</div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <FileText className="text-gray-500 mr-2 mt-1" size={16} />
                      <div>
                        <div className="font-medium text-base">
                          {ticketData.customer?.id_number || "-"}
                        </div>
                        <div className="text-gray-600 text-sm">
                          เลขผู้เสียภาษี
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Tag className="text-gray-500 mr-2 mt-1" size={16} />
                      <div>
                        <div className="font-medium text-base">
                          {ticketData.customer?.branch_type || "-"}
                          {ticketData.customer?.branch_number &&
                            ` ${ticketData.customer.branch_number}`}
                        </div>
                        <div className="text-gray-600 text-sm">ประเภทสาขา</div>
                      </div>
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
                    ฿{formatCurrency(ticketData.detail?.grand_total || 0)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start">
                    <Calendar className="text-gray-500 mr-2 mt-1" size={16} />
                    <div>
                      <div className="font-medium text-base">
                        {formatDate(ticketData.detail?.issue_date)}
                      </div>
                      <div className="text-gray-600 text-sm">วันที่บันทึก</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Calendar className="text-gray-500 mr-2 mt-1" size={16} />
                    <div>
                      <div className="font-medium text-base">
                        {formatDate(ticketData.detail?.due_date)}
                      </div>
                      <div className="text-gray-600 text-sm">
                        วันครบกำหนด ({ticketData.detail?.credit_days || "0"}{" "}
                        วัน)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Users className="text-blue-500 mr-2" size={20} />
                ข้อมูลผู้โดยสารและซัพพลายเออร์
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8">
                  <h3 className="font-medium text-base mb-3 flex items-center">
                    <Users className="text-gray-500 mr-2" size={18} />
                    ข้อมูลผู้โดยสาร
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm border border-gray-200 rounded-md">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                            ชื่อ
                          </th>
                          <th className="px-3 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                            ประเภท
                          </th>
                          <th className="px-3 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                            เลขตั๋ว
                          </th>
                          <th className="px-3 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                            รหัส
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {ticketData.passengers.length > 0 ? (
                          ticketData.passengers.map((passenger, index) => (
                            <tr key={index}>
                              <td className="px-3 py-2 whitespace-nowrap text-sm">
                                {passenger.passenger_name || "-"}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm">
                                {passenger.age || "-"}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm">
                                {passenger.ticket_number || "-"}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm">
                                {passenger.ticket_code || "-"}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="4"
                              className="px-3 py-2 text-center text-gray-500 text-sm"
                            >
                              ไม่พบข้อมูลผู้โดยสาร
                            </td>
                          </tr>
                        )}
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
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-start">
                        <Tag className="text-gray-500 mr-2 mt-1" size={16} />
                        <div>
                          <div className="font-medium text-base">
                            {ticketData.supplier?.numeric_code || "-"}
                          </div>
                          <div className="text-gray-600 text-sm">
                            รหัสตัวเลข
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Plane className="text-gray-500 mr-2 mt-1" size={16} />
                        <div>
                          <div className="font-medium text-base">
                            {ticketData.supplier?.code || "-"}
                            {ticketData.supplier?.name || ""}
                          </div>
                          <div className="text-gray-600 text-sm">สายการบิน</div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-start">
                        <Tag className="text-gray-500 mr-2 mt-1" size={16} />
                        <div>
                          <div className="font-medium text-base">
                            {ticketData.additionalInfo?.code || "-"}
                          </div>
                          <div className="text-gray-600 text-sm">Code</div>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <FileText
                          className="text-gray-500 mr-2 mt-1"
                          size={16}
                        />
                        <div>
                          <div className="font-medium text-base">
                            {getTicketTypeDisplay(
                              ticketData.additionalInfo?.ticket_type,
                              ticketData.additionalInfo?.ticket_type_details
                            )}
                          </div>
                          <div className="text-gray-600 text-sm">
                            ประเภทตั๋ว
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <MapPin className="text-blue-500 mr-2" size={20} />
                เส้นทางการเดินทาง
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm border border-gray-200 rounded-md">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        เที่ยวบิน
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        RBD
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        วันที่
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ต้นทาง
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ปลายทาง
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        เวลาออก
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        เวลาถึง
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ticketData.routes.length > 0 ? (
                      ticketData.routes.map((route, index) => (
                        <tr key={index}>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">
                            {route.flight_number || "-"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">
                            {route.rbd || "-"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">
                            {formatRouteDate(route.date)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">
                            {route.origin || "-"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">
                            {route.destination || "-"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">
                            {route.departure_time || "-"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">
                            {route.arrival_time || "-"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="7"
                          className="px-3 py-2 text-center text-gray-500 text-sm"
                        >
                          ไม่พบข้อมูลเส้นทางการเดินทาง
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Package className="text-blue-500 mr-2" size={20} />
                รายการเพิ่มเติม และ ตารางราคาและยอดรวม
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                <div className="lg:col-span-4">
                  <h3 className="font-medium text-base mb-3">
                    รายการเพิ่มเติม
                  </h3>
                  {ticketData.extras && ticketData.extras.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 text-sm border border-gray-200 rounded-md">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-3 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                              รายละเอียด
                            </th>
                            <th className="px-3 py-2 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">
                              ราคาขาย
                            </th>
                            <th className="px-3 py-2 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                              จำนวน
                            </th>
                            <th className="px-3 py-2 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">
                              รวม
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {ticketData.extras.map((extra, index) => (
                            <tr key={index}>
                              <td className="px-3 py-2 text-sm">
                                {extra.description || "-"}
                              </td>
                              <td className="px-3 py-2 text-right text-sm">
                                ฿{formatCurrency(extra.sale_price)}
                              </td>
                              <td className="px-3 py-2 text-center text-sm">
                                {extra.quantity || 0}
                              </td>
                              <td className="px-3 py-2 text-right text-sm font-medium">
                                ฿{formatCurrency(extra.total_amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 text-sm py-8 border border-gray-200 rounded-md">
                      ไม่มีรายการเพิ่มเติม
                    </div>
                  )}
                </div>
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
                        <tr>
                          <td className="px-3 py-2 text-sm font-medium">
                            Adult
                          </td>
                          <td className="px-3 py-2 text-right text-sm">
                            ฿
                            {formatCurrency(
                              ticketData.pricing?.adult_sale_price
                            )}
                          </td>
                          <td className="px-3 py-2 text-center text-sm">
                            {ticketData.pricing?.adult_pax || 0}
                          </td>
                          <td className="px-3 py-2 text-right text-sm font-medium">
                            ฿{formatCurrency(ticketData.pricing?.adult_total)}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 text-sm font-medium">
                            Child
                          </td>
                          <td className="px-3 py-2 text-right text-sm">
                            ฿
                            {formatCurrency(
                              ticketData.pricing?.child_sale_price
                            )}
                          </td>
                          <td className="px-3 py-2 text-center text-sm">
                            {ticketData.pricing?.child_pax || 0}
                          </td>
                          <td className="px-3 py-2 text-right text-sm font-medium">
                            ฿{formatCurrency(ticketData.pricing?.child_total)}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 text-sm font-medium">
                            Infant
                          </td>
                          <td className="px-3 py-2 text-right text-sm">
                            ฿
                            {formatCurrency(
                              ticketData.pricing?.infant_sale_price
                            )}
                          </td>
                          <td className="px-3 py-2 text-center text-sm">
                            {ticketData.pricing?.infant_pax || 0}
                          </td>
                          <td className="px-3 py-2 text-right text-sm font-medium">
                            ฿{formatCurrency(ticketData.pricing?.infant_total)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <h3 className="font-medium text-base mb-3">ยอดรวม</h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          ยอดรวมเป็นเงิน
                        </span>
                        <span className="font-bold text-gray-700">
                          ฿
                          {formatCurrency(
                            ticketData.detail?.subtotal_before_vat
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          ภาษีมูลค่าเพิ่ม {ticketData.detail?.vat_percent || 0}%
                        </span>
                        <span className="text-gray-700">
                          ฿{formatCurrency(ticketData.detail?.vat_amount)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-t border-blue-200 pt-2">
                        <span className="text-base font-semibold">
                          ยอดรวมทั้งสิ้น
                        </span>
                        <span className="font-bold text-blue-600 text-lg">
                          ฿{formatCurrency(ticketData.detail?.grand_total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <CreditCard className="text-blue-500 mr-2" size={20} />
                การชำระเงิน และ สถานะและการจัดการ
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-base mb-3">การชำระเงิน</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-sm mb-2 flex items-center">
                        <CreditCard className="text-gray-500 mr-2" size={16} />
                        การชำระเงินของบริษัท
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div>
                          <span className="text-gray-600">วิธีการ:</span>
                          <div className="font-medium">
                            {ticketData.additionalInfo
                              ?.company_payment_method || "-"}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">รายละเอียด:</span>
                          <div className="font-medium">
                            {ticketData.additionalInfo
                              ?.company_payment_details || "-"}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-sm mb-2 flex items-center">
                        <CreditCard className="text-gray-500 mr-2" size={16} />
                        การชำระเงินของลูกค้า
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div>
                          <span className="text-gray-600">วิธีการ:</span>
                          <div className="font-medium">
                            {ticketData.additionalInfo
                              ?.customer_payment_method || "-"}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">รายละเอียด:</span>
                          <div className="font-medium">
                            {ticketData.additionalInfo
                              ?.customer_payment_details || "-"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-base mb-3">
                    สถานะและการจัดการ
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-gray-600 mb-1 text-sm">
                        สถานะรายการ
                      </div>
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
                        {formatDateTime(ticketData.created_at)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-1 text-sm">
                        อัปเดตโดย
                      </div>
                      <div className="font-medium text-sm">
                        {ticketData.updatedByName}
                      </div>
                      <div className="text-gray-600 text-sm">
                        {formatDateTime(ticketData.updated_at)}
                      </div>
                    </div>
                    {ticketData.cancelled_at && (
                      <div className="md:col-span-3">
                        <div className="text-gray-600 mb-1 text-sm">
                          ยกเลิกโดย
                        </div>
                        <div className="font-medium text-sm">
                          {ticketData.cancelledByName}
                        </div>
                        <div className="text-gray-600 text-sm">
                          {formatDateTime(ticketData.cancelled_at)}
                        </div>
                        <div className="text-gray-600 text-sm">
                          เหตุผล: {ticketData.cancel_reason || "-"}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
            <div>
              {onEdit && (
                <button
                  onClick={() => onEdit(ticketData.id)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors flex items-center text-sm font-medium"
                >
                  <Edit2 size={16} className="mr-2" />
                  แก้ไข
                </button>
              )}
            </div>
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
    </>
  );
};

export default FlightTicketDetail;
