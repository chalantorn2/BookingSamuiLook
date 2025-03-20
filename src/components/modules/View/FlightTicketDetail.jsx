import React from "react";
import {
  X,
  Printer,
  Mail,
  Download,
  Calendar,
  Clock,
  User,
  Plane,
  MapPin,
  Phone,
  Edit2,
  CreditCard,
  MessageSquare,
  Users,
  Tag,
  CheckCircle,
  XCircle,
  DollarSign,
  FileText,
  Eye,
} from "lucide-react";

const FlightTicketDetail = ({ ticketId, onClose, ticketData }) => {
  if (!ticketData) return null;

  // Helper function สำหรับแสดงสถานะด้วยสี
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

  // Helper function สำหรับแสดงสถานะการชำระเงินด้วยสี
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
          <h1 className="text-xl font-bold">
            รายละเอียดตั๋วเครื่องบิน #{ticketData.id}
          </h1>
          <div className="flex space-x-2">
            <button
              className="p-2 hover:bg-blue-700 rounded-full"
              title="พิมพ์"
            >
              <Printer size={20} />
            </button>
            <button
              className="p-2 hover:bg-blue-700 rounded-full"
              title="ส่งอีเมล"
            >
              <Mail size={20} />
            </button>
            <button
              className="p-2 hover:bg-blue-700 rounded-full"
              title="ดาวน์โหลด PDF"
            >
              <Download size={20} />
            </button>
            <button
              className="p-2 hover:bg-blue-700 rounded-full"
              title="ปิด"
              onClick={onClose}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* ส่วนหัวข้อมูลตั๋ว */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <Plane size={24} className="text-blue-600 mr-2" />
                <h2 className="text-2xl font-bold text-gray-800">
                  ตั๋วเครื่องบิน
                </h2>
              </div>
              <div className="space-y-2">
                <div className="flex">
                  <span className="w-32 text-gray-500">เลขที่ตั๋ว:</span>
                  <span className="font-semibold">{ticketData.id}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-gray-500">วันที่บันทึก:</span>
                  <span>
                    {new Date(ticketData.date).toLocaleDateString("th-TH")}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-32 text-gray-500">วันที่จอง:</span>
                  <span>
                    {new Date(ticketData.bookingDate).toLocaleDateString(
                      "th-TH"
                    )}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-32 text-gray-500">สถานะ:</span>
                  {getStatusBadge(ticketData.status)}
                </div>
                <div className="flex">
                  <span className="w-32 text-gray-500">การชำระเงิน:</span>
                  {getPaymentStatusBadge(ticketData.paymentStatus)}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                <User size={20} className="text-blue-600 mr-2" />
                ข้อมูลลูกค้า
              </h3>
              <div className="space-y-2">
                <div className="font-semibold text-gray-800">
                  {ticketData.customer}
                </div>
                <div className="flex items-center">
                  <Phone
                    size={18}
                    className="text-gray-400 mr-2 flex-shrink-0"
                  />
                  <span className="text-gray-600">
                    {ticketData.contactNumber}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ข้อมูลเที่ยวบิน */}
          <div className="mb-8">
            <div className="flex items-center mb-3">
              <Plane size={20} className="text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-700">
                ข้อมูลเที่ยวบิน
              </h3>
            </div>
            <div className="bg-blue-50 p-4 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center mb-2">
                    <span className="w-32 text-gray-500">สายการบิน:</span>
                    <span className="font-semibold px-2 py-1 bg-blue-100 text-blue-700 rounded-md">
                      {ticketData.airline} ({ticketData.flightNumber})
                    </span>
                  </div>
                  <div className="flex items-center mb-2">
                    <span className="w-32 text-gray-500">เส้นทาง:</span>
                    <span className="font-medium">{ticketData.route}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <span className="w-32 text-gray-500">วันที่เดินทาง:</span>
                    <span className="font-medium">
                      {new Date(ticketData.departureDate).toLocaleDateString(
                        "th-TH"
                      )}
                    </span>
                  </div>
                  <div className="flex items-center mb-2">
                    <span className="w-32 text-gray-500">เวลา:</span>
                    <span className="font-medium">
                      {ticketData.departureTime} - {ticketData.arrivalTime}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* รายชื่อผู้โดยสาร */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
              <Users size={20} className="text-blue-600 mr-2" />
              รายชื่อผู้โดยสาร
            </h3>
            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      ลำดับ
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      ชื่อผู้โดยสาร
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      เลขที่ตั๋ว
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ticketData.passengerNames.map((name, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                        {Array.isArray(ticketData.ticketNumbers)
                          ? ticketData.ticketNumbers[index] || "-"
                          : ticketData.ticketNumbers.includes("through")
                          ? ticketData.ticketNumbers
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ข้อมูลการชำระเงิน */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
              <CreditCard size={20} className="text-blue-600 mr-2" />
              ข้อมูลการชำระเงิน
            </h3>
            <div className="bg-white border rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="mb-2 text-sm text-gray-600">ยอดรวม</div>
                  <div className="text-2xl font-bold text-blue-600">
                    ฿{ticketData.amount.toLocaleString("th-TH")}
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    สถานะ: {getPaymentStatusBadge(ticketData.paymentStatus)}
                  </div>
                </div>
                <div className="border-l pl-4">
                  <div className="mb-2 text-sm text-gray-600">
                    วิธีการชำระเงิน
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-sm">โอนเงินผ่านธนาคาร</div>
                    <div className="text-sm text-gray-500">
                      บัญชีธนาคารกสิกรไทย เลขที่ 123-4-56789-0
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* หมายเหตุ */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
              <MessageSquare size={20} className="text-blue-600 mr-2" />
              หมายเหตุ
            </h3>
            <div className="bg-white border rounded-lg p-4">
              {ticketData.remarks ? (
                <p className="text-gray-700">{ticketData.remarks}</p>
              ) : (
                <p className="text-gray-500 italic">ไม่มีหมายเหตุ</p>
              )}
            </div>
          </div>

          {/* เอกสารที่เกี่ยวข้อง */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
              <FileText size={20} className="text-blue-600 mr-2" />
              เอกสารที่เกี่ยวข้อง
            </h3>
            <div className="bg-white border rounded-lg p-4">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <FileText size={18} className="text-gray-400 mr-2" />
                    <span className="text-blue-600">
                      ใบแจ้งหนี้ - IN-25-0015
                    </span>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800">
                    <Eye size={18} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <FileText size={18} className="text-gray-400 mr-2" />
                    <span className="text-blue-600">
                      ใบเสร็จรับเงิน - RC-25-0022
                    </span>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800">
                    <Eye size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ประวัติการแก้ไข */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
              <Edit2 size={20} className="text-blue-600 mr-2" />
              ประวัติการแก้ไข
            </h3>
            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      วันที่
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      แก้ไขโดย
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      รายละเอียดการแก้ไข
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(ticketData.date).toLocaleDateString("th-TH")}{" "}
                      {new Date(ticketData.date).toLocaleTimeString("th-TH")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      นายชลันธร มานพ
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      สร้างรายการใหม่
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors flex items-center text-sm"
          >
            <X size={16} className="mr-2" />
            ปิด
          </button>

          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors flex items-center text-sm">
              <Printer size={16} className="mr-2" />
              พิมพ์
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center text-sm">
              <Edit2 size={16} className="mr-2" />
              แก้ไข
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightTicketDetail;
