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
} from "lucide-react";
import { formatCurrency } from "../../../utils/helpers";
import PrintConfirmModal from "./PrintConfirmModal";

const FlightTicketDetail = ({ ticketId, onClose, onEdit, onPOGenerated }) => {
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);

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
          customer:customer_id(name, address, id_number, phone, credit_days, branch_type, branch_number),
          supplier:information_id(name, code)
        `
          )
          .eq("id", ticketId)
          .single();

        if (ticketError) throw ticketError;

        // ปรับ timezone สำหรับ created_at, updated_at, cancelled_at และ po_generated_at
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

        // ปรับ timezone สำหรับ issue_date และ due_date
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
    setShowPrintModal(true);
  };

  const handlePrintConfirm = async () => {
    setPrintLoading(true);
    try {
      const result = await generatePOForTicket(ticketId);

      if (result.success) {
        // อัปเดต ticketData ด้วย PO Number ใหม่
        setTicketData((prev) => ({
          ...prev,
          po_number: result.poNumber,
          po_generated_at: new Date().toISOString(),
        }));

        // เรียก callback เพื่อรีเฟรชข้อมูลในหน้าหลัก
        if (onPOGenerated) {
          onPOGenerated();
        }

        // แสดงข้อความสำเร็จ
        if (result.isNew) {
          alert(`สร้าง PO Number สำเร็จ: ${result.poNumber}`);
        } else {
          alert(`PO Number: ${result.poNumber} (มีอยู่แล้ว)`);
        }

        // จำลองการพิมพ์ (ในอนาคตจะเป็นการเปิด PDF หรือหน้าต่างพิมพ์จริง)
        console.log(`Printing document with PO: ${result.poNumber}`);
      } else {
        alert(`เกิดข้อผิดพลาด: ${result.error}`);
      }
    } catch (error) {
      console.error("Error generating PO:", error);
      alert("เกิดข้อผิดพลาดในการสร้าง PO Number");
    } finally {
      setPrintLoading(false);
      setShowPrintModal(false);
    }
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

  const getStatusBadge = (status, poNumber) => {
    if (poNumber) {
      return (
        <div className="flex items-center">
          <CheckCircle className="text-green-500 mr-1" size={16} />
          <span className="text-sm font-medium text-gray-900">{poNumber}</span>
        </div>
      );
    } else {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Not Invoiced
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 modal-backdrop bg-black  flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
          <p className="text-center mt-4">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 modal-backdrop bg-black flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
          <div className="text-center text-red-500 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-center text-red-600">{error}</p>
          <div className="flex justify-center mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
        <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 p-3 text-white flex justify-between items-center">
            <h1 className="text-lg font-bold">
              รายละเอียดตั๋วเครื่องบิน:{" "}
              {ticketData.reference_number || `#${ticketData.id}`}
            </h1>
            <div className="flex space-x-1">
              <button
                className="p-1 hover:bg-blue-700 rounded-full"
                title="พิมพ์"
                onClick={handlePrintClick}
              >
                <Printer size={16} />
              </button>
              <button
                className="p-1 hover:bg-blue-700 rounded-full"
                title="ดาวน์โหลด PDF"
              >
                <Download size={16} />
              </button>
              <button
                className="p-1 hover:bg-blue-700 rounded-full"
                title="ส่งอีเมล"
              >
                <Mail size={16} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Section: Customer & Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-md">
                <h2 className="text-base font-semibold mb-2 flex items-center">
                  <User className="text-blue-500 mr-1" size={18} />
                  ข้อมูลลูกค้า
                </h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-start">
                    <User className="text-gray-500 mr-1" size={14} />
                    <div>
                      <div className="font-medium">
                        {ticketData.customer?.name || "-"}
                      </div>
                      <div className="text-gray-600">ชื่อลูกค้า</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="text-gray-500 mr-1" size={14} />
                    <div>
                      <div className="font-medium">
                        {ticketData.customer?.address || "-"}
                      </div>
                      <div className="text-gray-600">ที่อยู่</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FileText className="text-gray-500 mr-1" size={14} />
                    <div>
                      <div className="font-medium">
                        {ticketData.customer?.id_number || "-"}
                      </div>
                      <div className="text-gray-600">เลขผู้เสียภาษี</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Tag className="text-gray-500 mr-1" size={14} />
                    <div>
                      <div className="font-medium">
                        {ticketData.customer?.branch_type || "-"}
                      </div>
                      <div className="text-gray-600">ประเภทสาขา</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Tag className="text-gray-500 mr-1" size={14} />
                    <div>
                      <div className="font-medium">
                        {ticketData.customer?.branch_number || "-"}
                      </div>
                      <div className="text-gray-600">หมายเลขสาขา</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone className="text-gray-500 mr-1" size={14} />
                    <div>
                      <div className="font-medium">
                        {ticketData.customer?.phone || "-"}
                      </div>
                      <div className="text-gray-600">เบอร์โทร</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-md">
                <h2 className="text-base font-semibold mb-2 flex items-center">
                  <Calendar className="text-blue-500 mr-1" size={18} />
                  ราคาและวันที่
                </h2>
                <div className="bg-blue-50 p-3 rounded-md mb-2">
                  <div className="text-sm text-gray-600">ราคารวมทั้งสิ้น</div>
                  <div className="text-lg font-bold text-blue-600">
                    {formatCurrency(ticketData.pricing?.total_amount || 0)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-start">
                    <Calendar className="text-gray-500 mr-1" size={14} />
                    <div>
                      <div className="font-medium">
                        {formatDateTime(ticketData.detail?.issue_date)}
                      </div>
                      <div className="text-gray-600">วันที่บันทึก</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Calendar className="text-gray-500 mr-1" size={14} />
                    <div>
                      <div className="font-medium">
                        {formatDateTime(ticketData.detail?.due_date)}
                      </div>
                      <div className="text-gray-600">
                        วันครบกำหนด ({ticketData.detail?.credit_days || "0"}{" "}
                        วัน)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: PO Number */}
            {ticketData.po_number && (
              <div className="bg-green-50 p-3 rounded-md border border-green-200">
                <h2 className="text-base font-semibold mb-2 flex items-center">
                  <CheckCircle className="text-green-500 mr-1" size={18} />
                  ข้อมูล PO Number
                </h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-start">
                    <FileText className="text-gray-500 mr-1" size={14} />
                    <div>
                      <div className="font-medium text-green-700">
                        {ticketData.po_number}
                      </div>
                      <div className="text-gray-600">PO Number</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Clock className="text-gray-500 mr-1" size={14} />
                    <div>
                      <div className="font-medium">
                        {formatDateTime(ticketData.po_generated_at)}
                      </div>
                      <div className="text-gray-600">วันที่สร้าง PO</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ส่วนอื่นๆ ของ Modal ยังคงเหมือนเดิม... */}
            {/* (คัดลอกจาก FlightTicketDetail.jsx เดิม) */}

            {/* Section: Supplier & Passengers */}
            <div className="bg-gray-50 p-3 rounded-md">
              <h2 className="text-base font-semibold mb-2 flex items-center">
                <Users className="text-blue-500 mr-1" size={18} />
                ข้อมูลซัพพลายเออร์และผู้โดยสาร
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <h3 className="font-medium text-sm mb-1 flex items-center">
                    <Plane className="text-gray-500 mr-1" size={14} />
                    ข้อมูลซัพพลายเออร์
                  </h3>
                  <div className="text-sm">
                    <div className="font-medium">
                      {ticketData.supplier?.name || "-"}
                    </div>
                    <div className="text-gray-600">
                      รหัส: {ticketData.supplier?.code || "-"}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-sm mb-1 flex items-center">
                    <Users className="text-gray-500 mr-1" size={14} />
                    ข้อมูลผู้โดยสาร
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ชื่อ
                          </th>
                          <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            อายุ
                          </th>
                          <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            เลขตั๋ว
                          </th>
                          <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            รหัส
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {ticketData.passengers.length > 0 ? (
                          ticketData.passengers.map((passenger, index) => (
                            <tr key={index}>
                              <td className="px-2 py-1 whitespace-nowrap">
                                {passenger.passenger_name || "-"}
                              </td>
                              <td className="px-2 py-1 whitespace-nowrap">
                                {passenger.age || "-"}
                              </td>
                              <td className="px-2 py-1 whitespace-nowrap">
                                {passenger.ticket_number || "-"}
                              </td>
                              <td className="px-2 py-1 whitespace-nowrap">
                                {passenger.ticket_code || "-"}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="4"
                              className="px-2 py-1 text-center text-gray-500"
                            >
                              ไม่พบข้อมูลผู้โดยสาร
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Routes */}
            <div className="bg-gray-50 p-3 rounded-md">
              <h2 className="text-base font-semibold mb-2 flex items-center">
                <MapPin className="text-blue-500 mr-1" size={18} />
                เส้นทางการเดินทาง
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        เที่ยวบิน
                      </th>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        RBD
                      </th>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        วันที่
                      </th>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ต้นทาง
                      </th>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ปลายทาง
                      </th>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        เวลาออก
                      </th>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        เวลาถึง
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ticketData.routes.length > 0 ? (
                      ticketData.routes.map((route, index) => (
                        <tr key={index}>
                          <td className="px-2 py-1 whitespace-nowrap">
                            {route.flight_number || "-"}
                          </td>
                          <td className="px-2 py-1 whitespace-nowrap">
                            {route.rbd || "-"}
                          </td>
                          <td className="px-2 py-1 whitespace-nowrap">
                            {formatRouteDate(route.date)}
                          </td>
                          <td className="px-2 py-1 whitespace-nowrap">
                            {route.origin || "-"}
                          </td>
                          <td className="px-2 py-1 whitespace-nowrap">
                            {route.destination || "-"}
                          </td>
                          <td className="px-2 py-1 whitespace-nowrap">
                            {route.departure_time || "-"}
                          </td>
                          <td className="px-2 py-1 whitespace-nowrap">
                            {route.arrival_time || "-"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="7"
                          className="px-2 py-1 text-center text-gray-500"
                        >
                          ไม่พบข้อมูลเส้นทางการเดินทาง
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section: Status & Management */}
            <div className="bg-gray-50 p-3 rounded-md">
              <h2 className="text-base font-semibold mb-2 flex items-center">
                <Info className="text-blue-500 mr-1" size={18} />
                สถานะและการจัดการ
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <div className="text-gray-600 mb-1">สถานะรายการ</div>
                  {getStatusBadge(ticketData.status, ticketData.po_number)}
                </div>
                <div>
                  <div className="text-gray-600">สร้างโดย</div>
                  <div className="font-medium">{ticketData.createdByName}</div>
                  <div className="text-gray-600">
                    {formatDateTime(ticketData.created_at)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">อัปเดตโดย</div>
                  <div className="font-medium">{ticketData.updatedByName}</div>
                  <div className="text-gray-600">
                    {formatDateTime(ticketData.updated_at)}
                  </div>
                </div>
                {ticketData.cancelled_at && (
                  <div>
                    <div className="text-gray-600">ยกเลิกโดย</div>
                    <div className="font-medium">
                      {ticketData.cancelledByName}
                    </div>
                    <div className="text-gray-600">
                      {formatDateTime(ticketData.cancelled_at)}
                    </div>
                    <div className="text-gray-600">
                      เหตุผล: {ticketData.cancel_reason || "-"}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-3 border-t flex justify-between">
            <div>
              {onEdit && (
                <button
                  onClick={() => onEdit(ticketData.id)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors flex items-center text-sm mr-1"
                >
                  <Edit2 size={14} className="mr-1" />
                  แก้ไข
                </button>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors flex items-center text-sm"
            >
              <ChevronLeft size={14} className="mr-1" />
              กลับ
            </button>
          </div>
        </div>
      </div>

      {/* Print Confirmation Modal */}
      <PrintConfirmModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        onConfirm={handlePrintConfirm}
        loading={printLoading}
      />
    </>
  );
};

export default FlightTicketDetail;
