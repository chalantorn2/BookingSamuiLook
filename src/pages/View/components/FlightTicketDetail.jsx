// FlightTicketDetail.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../../../services/supabase";
import {
  User,
  Plane,
  Calendar,
  MapPin,
  Clock,
  Tag,
  CreditCard,
  FileText,
  CheckCircle,
  XCircle,
  DollarSign,
  ChevronLeft,
  Printer,
  Download,
  Mail,
  Edit2,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency, formatDate } from "../../../utils/helpers";

const FlightTicketDetail = ({ ticketId, onClose, onEdit }) => {
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // จุดที่ต้องปรับปรุงใน FlightTicketDetail.jsx
    const fetchTicketDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch the main ticket data
        const { data, error } = await supabase
          .from("bookings_ticket")
          .select(
            `
        id, reference_number, status, payment_status, created_at, updated_at,
        customer:customer_id(*),
        tickets_detail(*),
        supplier:information_id(*)
      `
          )
          .eq("id", ticketId)
          .single();

        if (error) throw error;

        // Fetch additional info
        const { data: additionalInfoData, error: additionalInfoError } =
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

        // Fetch pricing info
        const { data: pricingData, error: pricingError } = await supabase
          .from("tickets_pricing")
          .select("*")
          .eq("bookings_ticket_id", ticketId)
          .single();

        if (pricingError && !pricingError.message.includes("No rows found")) {
          throw pricingError;
        }

        // Fetch passengers
        const { data: passengersData, error: passengersError } = await supabase
          .from("tickets_passengers")
          .select("*")
          .eq("bookings_ticket_id", ticketId);

        if (passengersError) throw passengersError;

        // Fetch routes
        const { data: routesData, error: routesError } = await supabase
          .from("tickets_routes")
          .select("*")
          .eq("bookings_ticket_id", ticketId);

        if (routesError) throw routesError;

        // Fetch extras
        const { data: extrasData, error: extrasError } = await supabase
          .from("tickets_extras")
          .select("*")
          .eq("bookings_ticket_id", ticketId);

        if (extrasError) throw extrasError;

        // Combine all data
        const fullTicketData = {
          ...data,
          additionalInfo: additionalInfoData || {},
          pricing: pricingData || {},
          passengers: passengersData || [],
          routes: routesData || [],
          extras: extrasData || [],
        };

        setTicketData(fullTicketData);
      } catch (err) {
        console.error("Error fetching ticket details:", err);
        setError(err.message || "ไม่สามารถโหลดข้อมูลตั๋วได้");
      } finally {
        setLoading(false);
      }
    };

    if (ticketId) fetchTicketDetails();
  }, [ticketId]);

  // Helper function for displaying status badges
  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return (
          <div className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full">
            <CheckCircle className="mr-1 h-4 w-4" />
            <span>ยืนยันแล้ว</span>
          </div>
        );
      case "pending":
        return (
          <div className="flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
            <Clock className="mr-1 h-4 w-4" />
            <span>รอดำเนินการ</span>
          </div>
        );
      case "cancelled":
        return (
          <div className="flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full">
            <XCircle className="mr-1 h-4 w-4" />
            <span>ยกเลิก</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full">
            <span>{status}</span>
          </div>
        );
    }
  };

  // Helper function for displaying payment status badges
  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return (
          <div className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
            <CheckCircle className="mr-1 h-4 w-4" />
            <span>ชำระแล้ว</span>
          </div>
        );
      case "unpaid":
        return (
          <div className="flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full">
            <DollarSign className="mr-1 h-4 w-4" />
            <span>ยังไม่ชำระ</span>
          </div>
        );
      case "partially":
        return (
          <div className="flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
            <DollarSign className="mr-1 h-4 w-4" />
            <span>ชำระบางส่วน</span>
          </div>
        );
      case "refunded":
        return (
          <div className="flex items-center px-3 py-1 bg-pink-100 text-pink-800 rounded-full">
            <DollarSign className="mr-1 h-4 w-4" />
            <span>คืนเงินแล้ว</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full">
            <span>{status}</span>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 modal-backdrop bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
      <div className="fixed inset-0 modal-backdrop bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
    <div className="fixed inset-0 modal-backdrop bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
          <h1 className="text-xl font-bold">
            รายละเอียดตั๋วเครื่องบิน:{" "}
            {ticketData.reference_number || `#${ticketData.id}`}
          </h1>
          <div className="flex space-x-2">
            <button
              className="p-2 hover:bg-blue-700 rounded-full"
              title="พิมพ์"
            >
              <Printer size={18} />
            </button>
            <button
              className="p-2 hover:bg-blue-700 rounded-full"
              title="ดาวน์โหลด PDF"
            >
              <Download size={18} />
            </button>
            <button
              className="p-2 hover:bg-blue-700 rounded-full"
              title="ส่งอีเมล"
            >
              <Mail size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Customer Info & Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Info */}
              <div>
                <h2 className="text-lg font-semibold border-b pb-2 mb-4">
                  ข้อมูลลูกค้า
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <User className="text-blue-500 mt-1 mr-2" size={18} />
                    <div>
                      <div className="font-medium">
                        {ticketData.customer?.name || "-"}
                      </div>
                      <div className="text-sm text-gray-600">ชื่อลูกค้า</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="text-blue-500 mt-1 mr-2" size={18} />
                    <div>
                      <div className="font-medium">
                        {ticketData.customer?.address || "-"}
                      </div>
                      <div className="text-sm text-gray-600">ที่อยู่</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FileText className="text-blue-500 mt-1 mr-2" size={18} />
                    <div>
                      <div className="font-medium">
                        {ticketData.customer?.id_number || "-"}
                      </div>
                      <div className="text-sm text-gray-600">
                        เลขประจำตัว/พาสปอร์ต
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing & Dates */}
              <div>
                <h2 className="text-lg font-semibold border-b pb-2 mb-4">
                  ราคาและวันที่
                </h2>
                <div className="bg-blue-50 p-4 rounded-md mb-4">
                  <div className="text-sm text-gray-600 mb-1">
                    ราคารวมทั้งสิ้น
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(ticketData.detail?.total_price || 0)}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start">
                    <Calendar className="text-blue-500 mt-1 mr-2" size={18} />
                    <div>
                      <div className="font-medium">
                        {ticketData.detail?.issue_date
                          ? formatDate(
                              new Date(
                                new Date(
                                  ticketData.detail.issue_date
                                ).getTime() +
                                  7 * 60 * 60 * 1000
                              )
                            )
                          : "-"}
                      </div>

                      <div className="text-sm text-gray-600">วันที่บันทึก</div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Calendar className="text-blue-500 mt-1 mr-2" size={18} />
                    <div>
                      <div className="font-medium">
                        {ticketData.detail?.due_date
                          ? formatDate(ticketData.detail.due_date)
                          : "-"}
                      </div>
                      <div className="text-sm text-gray-600">
                        วันครบกำหนด ({ticketData.detail?.credit_days || "0"}{" "}
                        วัน)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Passengers & Supplier */}
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="bg-blue-600 p-1 text-white">
                <h2 className="font-bold px-3 py-2 flex items-center">
                  <User className="text-white mr-2" size={20} />
                  ข้อมูลผู้โดยสารและซัพพลายเออร์
                </h2>
              </div>

              <div className="p-4 border-b">
                <h3 className="font-medium mb-2">ข้อมูลซัพพลายเออร์</h3>
                <div className="flex items-start mb-4">
                  <Plane className="text-blue-500 mt-1 mr-2" size={18} />
                  <div>
                    <div className="font-medium">
                      {ticketData.supplier?.name || "-"}
                    </div>
                    <div className="text-sm text-gray-600">
                      รหัส: {ticketData.supplier?.code || "-"}
                    </div>
                  </div>
                </div>

                <h3 className="font-medium mb-2">ข้อมูลผู้โดยสาร</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ชื่อผู้โดยสาร
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          อายุ
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          เลขที่ตั๋ว
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {ticketData.passengers &&
                      ticketData.passengers.length > 0 ? (
                        ticketData.passengers.map((passenger, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 whitespace-nowrap">
                              {passenger.passenger_name || "-"}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              {passenger.age || "-"}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              {passenger.ticket_number || "-"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="3"
                            className="px-4 py-2 text-center text-gray-500"
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

            {/* Routes */}
            <div>
              <h3 className="font-medium mb-2">เส้นทางการเดินทาง</h3>
              <div className="overflow-x-auto mb-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        วันที่
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        สายการบิน
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        เที่ยวบิน
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ต้นทาง
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ปลายทาง
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        เวลาออก
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        เวลาถึง
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ticketData.routes && ticketData.routes.length > 0 ? (
                      ticketData.routes.map((route, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {route.date ? formatDate(route.date) : "-"}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {route.airline || "-"}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {route.flight_number || "-"}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {route.origin || "-"}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {route.destination || "-"}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {route.departure_time || "-"}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {route.arrival_time || "-"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="7"
                          className="px-4 py-2 text-center text-gray-500"
                        >
                          ไม่พบข้อมูลเส้นทางการเดินทาง
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pricing */}
            <div>
              <h3 className="font-medium mb-2">ข้อมูลราคา</h3>
              <div className="grid grid-cols-12 gap-2 pt-2 p-1 pl-3 items-center bg-gray-50 font-medium text-sm mb-2">
                <div className="col-span-1"></div>
                <div className="col-span-3">Net</div>
                <div className="col-span-3">Sale</div>
                <div className="col-span-1">Pax</div>
                <div className="col-span-4">Total</div>
              </div>

              {/* Adult Row */}
              <div className="grid grid-cols-12 gap-2 pt-2 p-1 pl-3 items-center bg-white">
                <div className="col-span-1">
                  <span className="text-right font-medium">Adult</span>
                </div>
                <div className="col-span-3">
                  <div className="w-full border text-right border-gray-300 rounded-md p-2 bg-gray-100">
                    {formatCurrency(ticketData.pricing?.adult_net_price || 0)}
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="w-full border text-right border-gray-300 rounded-md p-2 bg-gray-100">
                    {formatCurrency(ticketData.pricing?.adult_sale_price || 0)}
                  </div>
                </div>
                <div className="col-span-1">
                  <div className="w-full border text-center border-gray-300 rounded-md p-2 bg-gray-100">
                    {ticketData.pricing?.adult_pax || 0}
                  </div>
                </div>
                <div className="col-span-4">
                  <div className="w-full border text-right border-gray-300 rounded-md p-2 bg-gray-100">
                    {formatCurrency(ticketData.pricing?.adult_total || 0)}
                  </div>
                </div>
              </div>

              {/* Child Row */}
              <div className="grid grid-cols-12 gap-2 pt-2 p-1 pl-3 items-center bg-white">
                <div className="col-span-1">
                  <span className="text-right font-medium">Child</span>
                </div>
                <div className="col-span-3">
                  <div className="w-full border text-right border-gray-300 rounded-md p-2 bg-gray-100">
                    {formatCurrency(ticketData.pricing?.child_net_price || 0)}
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="w-full border text-right border-gray-300 rounded-md p-2 bg-gray-100">
                    {formatCurrency(ticketData.pricing?.child_sale_price || 0)}
                  </div>
                </div>
                <div className="col-span-1">
                  <div className="w-full border text-center border-gray-300 rounded-md p-2 bg-gray-100">
                    {ticketData.pricing?.child_pax || 0}
                  </div>
                </div>
                <div className="col-span-4">
                  <div className="w-full border text-right border-gray-300 rounded-md p-2 bg-gray-100">
                    {formatCurrency(ticketData.pricing?.child_total || 0)}
                  </div>
                </div>
              </div>

              {/* Infant Row */}
              <div className="grid grid-cols-12 gap-2 pt-2 p-1 pl-3 items-center bg-white mb-4">
                <div className="col-span-1">
                  <span className="text-right font-medium">Infant</span>
                </div>
                <div className="col-span-3">
                  <div className="w-full border text-right border-gray-300 rounded-md p-2 bg-gray-100">
                    {formatCurrency(ticketData.pricing?.infant_net_price || 0)}
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="w-full border text-right border-gray-300 rounded-md p-2 bg-gray-100">
                    {formatCurrency(ticketData.pricing?.infant_sale_price || 0)}
                  </div>
                </div>
                <div className="col-span-1">
                  <div className="w-full border text-center border-gray-300 rounded-md p-2 bg-gray-100">
                    {ticketData.pricing?.infant_pax || 0}
                  </div>
                </div>
                <div className="col-span-4">
                  <div className="w-full border text-right border-gray-300 rounded-md p-2 bg-gray-100">
                    {formatCurrency(ticketData.pricing?.infant_total || 0)}
                  </div>
                </div>
              </div>

              {/* Total Summary */}
              <div className="bg-blue-50 p-4 rounded-md shadow-sm mb-4">
                <div className="flex justify-between mb-3 items-center">
                  <div className="font-medium">ยอดรวมเป็นเงิน</div>
                  <div className="font-bold text-gray-700">
                    {formatCurrency(ticketData.pricing?.subtotal_amount || 0)}
                  </div>
                </div>
                <div className="flex justify-between mb-3 items-center">
                  <div className="font-medium">
                    ภาษีมูลค่าเพิ่ม {ticketData.pricing?.vat_percent || 0}%
                  </div>
                  <div className="text-gray-700">
                    {formatCurrency(ticketData.pricing?.vat_amount || 0)}
                  </div>
                </div>
                <div className="flex justify-between border-t border-blue-200 pt-2 mt-2">
                  <div className="font-semibold">ยอดรวมทั้งสิ้น</div>
                  <div className="font-bold text-blue-600 text-xl">
                    {formatCurrency(ticketData.pricing?.total_amount || 0)}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="bg-blue-600 p-1 text-white">
                <h2 className="font-bold px-3 py-2 flex items-center">
                  <CreditCard className="text-white mr-2" size={20} />
                  การชำระเงิน
                </h2>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-3">การชำระเงินของบริษัท</h3>
                  <div>
                    <p className="font-medium">
                      วิธีการชำระเงิน:{" "}
                      {ticketData.additionalInfo?.company_payment_method || "-"}
                    </p>
                    {ticketData.additionalInfo?.company_payment_details && (
                      <p className="text-gray-600 mt-1">
                        {ticketData.additionalInfo.company_payment_details}
                      </p>
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-3">การชำระเงินของลูกค้า</h3>
                  <div>
                    <p className="font-medium">
                      วิธีการชำระเงิน:{" "}
                      {ticketData.additionalInfo?.customer_payment_method ||
                        "-"}
                    </p>
                    {ticketData.additionalInfo?.customer_payment_details && (
                      <p className="text-gray-600 mt-1">
                        {ticketData.additionalInfo.customer_payment_details}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Status Information */}
            <div className="p-6 bg-gray-50 rounded-md">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="mr-4">
                    <div className="text-sm text-gray-500 mb-1">
                      สถานะรายการ
                    </div>
                    {getStatusBadge(ticketData.status || "pending")}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">
                    สถานะการชำระเงิน
                  </div>
                  {getPaymentStatusBadge(ticketData.payment_status || "unpaid")}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t flex justify-between">
          <div>
            {onEdit && (
              <button
                onClick={() => onEdit(ticketData.id)}
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors flex items-center text-sm mr-2"
              >
                <Edit2 size={16} className="mr-2" />
                แก้ไขรายการ
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors flex items-center text-sm"
          >
            <ChevronLeft size={16} className="mr-2" />
            กลับ
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlightTicketDetail;
