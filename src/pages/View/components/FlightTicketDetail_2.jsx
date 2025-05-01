import React from "react";
import {
  X,
  Printer,
  Mail,
  Download,
  User,
  Plane,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Tag,
  FileText,
  CreditCard,
  CheckCircle,
  XCircle,
  DollarSign,
  Edit2,
} from "lucide-react";

const FlightTicketDetail_2 = ({ ticketId, onClose, ticketData }) => {
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
    <div className="fixed inset-0 modal-backdrop bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
          <h1 className="text-xl font-bold">
            รายละเอียดตั๋วเครื่องบิน #{ticketData.id}
          </h1>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Card หลัก */}
          <div className="bg-white shadow-md rounded-md">
            {/* ข้อมูลลูกค้าและราคา */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 border-b">
              <div>
                <h2 className="text-lg font-semibold border-b pb-2 mb-4">
                  ข้อมูลลูกค้า
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <User className="text-blue-500 mt-1 mr-2" size={18} />
                    <div>
                      <div className="font-medium">{ticketData.customer}</div>
                      <div className="text-sm text-gray-600">ชื่อลูกค้า</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="text-blue-500 mt-1 mr-2" size={18} />
                    <div>
                      <div className="font-medium">
                        88 หมู่ 7 ต.ไสไทย อ.เมือง จ.กระบี่ 89111
                      </div>
                      <div className="text-sm text-gray-600">ที่อยู่</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone className="text-blue-500 mt-1 mr-2" size={18} />
                    <div>
                      <div className="font-medium">
                        {ticketData.contactNumber}
                      </div>
                      <div className="text-sm text-gray-600">เบอร์โทรศัพท์</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FileText className="text-blue-500 mt-1 mr-2" size={18} />
                    <div>
                      <div className="font-medium">PASSPORT123456</div>
                      <div className="text-sm text-gray-600">
                        เลขประจำตัว/พาสปอร์ต
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold border-b pb-2 mb-4">
                  ราคาและวันที่
                </h2>
                <div className="bg-blue-50 p-4 rounded-md mb-4">
                  <div className="text-sm text-gray-600 mb-1">
                    ราคารวมทั้งสิ้น
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    ฿{ticketData.amount.toLocaleString("th-TH")}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start">
                    <Calendar className="text-blue-500 mt-1 mr-2" size={18} />
                    <div>
                      <div className="font-medium">
                        {new Date(ticketData.date).toLocaleDateString("th-TH")}
                      </div>
                      <div className="text-sm text-gray-600">วันที่บันทึก</div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Calendar className="text-blue-500 mt-1 mr-2" size={18} />
                    <div>
                      <div className="font-medium">
                        {new Date(ticketData.departureDate).toLocaleDateString(
                          "th-TH"
                        )}
                      </div>
                      <div className="text-sm text-gray-600">วันที่เดินทาง</div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <User className="text-blue-500 mt-1 mr-2" size={18} />
                    <div>
                      <div className="font-medium">นายชลันธร มานพ</div>
                      <div className="text-sm text-gray-600">ชื่อผู้บันทึก</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ข้อมูลผู้โดยสาร */}
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold border-b pb-2 mb-4 flex items-center">
                <User className="text-blue-500 mr-2" size={20} />
                ข้อมูลผู้โดยสาร
              </h2>

              <div className="overflow-x-auto">
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
                        อายุ
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
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {/* ในข้อมูลจำลองไม่มีข้อมูลอายุแยกเฉพาะ จึงใส่เป็นตัวอย่าง */}
                          {index === 0 ? "35" : index === 1 ? "32" : "28"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                          {Array.isArray(ticketData.ticketNumbers)
                            ? ticketData.ticketNumbers[index] || "-"
                            : ticketData.ticketNumbers.includes("through")
                            ? ticketData.ticketNumbers
                                .split("through")[0]
                                .trim() +
                              (index + 1)
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ข้อมูลซัพพลายเออร์ */}
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold border-b pb-2 mb-4 flex items-center">
                <Tag className="text-blue-500 mr-2" size={20} />
                ข้อมูลซัพพลายเออร์
              </h2>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ชื่อย่อสายการบิน
                  </label>
                  <div className="h-10 px-3 py-2 border border-gray-300 bg-gray-100 rounded-md text-gray-700 flex items-center">
                    {ticketData.airline.substring(0, 2)}
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ชื่อสายการบิน
                  </label>
                  <div className="h-10 px-3 py-2 border border-gray-300 bg-gray-100 rounded-md text-gray-700 flex items-center">
                    {ticketData.airline}
                  </div>
                </div>
              </div>
            </div>

            {/* เส้นทาง */}
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold border-b pb-2 mb-4 flex items-center">
                <Plane className="text-blue-500 mr-2" size={20} />
                เส้นทางการเดินทาง
              </h2>

              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      วันที่
                    </label>
                    <div className="h-10 px-3 py-2 border border-gray-300 bg-gray-100 rounded-md text-gray-700 flex items-center">
                      {new Date(ticketData.departureDate).toLocaleDateString(
                        "th-TH"
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      สายการบิน
                    </label>
                    <div className="h-10 px-3 py-2 border border-gray-300 bg-gray-100 rounded-md text-gray-700 flex items-center">
                      {ticketData.airline}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      เที่ยวบิน
                    </label>
                    <div className="h-10 px-3 py-2 border border-gray-300 bg-gray-100 rounded-md text-gray-700 flex items-center">
                      {ticketData.flightNumber}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        เวลาออก
                      </label>
                      <div className="h-10 px-3 py-2 border border-gray-300 bg-gray-100 rounded-md text-gray-700 flex items-center">
                        {ticketData.departureTime}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        เวลาถึง
                      </label>
                      <div className="h-10 px-3 py-2 border border-gray-300 bg-gray-100 rounded-md text-gray-700 flex items-center">
                        {ticketData.arrivalTime}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ต้นทาง
                    </label>
                    <div className="h-10 px-3 py-2 border border-gray-300 bg-gray-100 rounded-md text-gray-700 flex items-center">
                      {ticketData.route.split("-")[0]}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ปลายทาง
                    </label>
                    <div className="h-10 px-3 py-2 border border-gray-300 bg-gray-100 rounded-md text-gray-700 flex items-center">
                      {ticketData.route.split("-")[1]}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ประเภทตั๋ว */}
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold border-b pb-2 mb-4 flex items-center">
                <Tag className="text-blue-500 mr-2" size={20} />
                ประเภทตั๋ว
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  "BSP",
                  "AIRLINE",
                  "DOM",
                  "WEB",
                  "B2B",
                  "GOV",
                  "GMT",
                  "OTHER",
                ].map((type) => (
                  <div key={type} className="flex items-center">
                    <div
                      className={`w-5 h-5 rounded-full border ${
                        ticketData.id.startsWith("FT") && type === "BSP"
                          ? "bg-blue-500 border-blue-600"
                          : "border-gray-300"
                      } mr-2 flex items-center justify-center`}
                    >
                      {ticketData.id.startsWith("FT") && type === "BSP" && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <label className="text-gray-700">{type}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* ส่วนของราคา */}
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold border-b pb-2 mb-4 flex items-center">
                <DollarSign className="text-blue-500 mr-2" size={20} />
                ราคา
              </h2>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        ประเภท
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        ราคาต้นทุน
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        ราคาขาย
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        จำนวน
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        รวม
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Adult Row */}
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                        Adult
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {/* ราคาต้นทุน - ตัวอย่าง */}฿
                        {(
                          (ticketData.amount * 0.85) /
                          ticketData.passengers
                        ).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {/* ราคาขาย - ตัวอย่าง */}฿
                        {(ticketData.amount / ticketData.passengers).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {ticketData.passengers}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center font-medium">
                        ฿{ticketData.amount.toLocaleString("th-TH")}
                      </td>
                    </tr>

                    {/* รวมทั้งหมด */}
                    <tr className="bg-blue-50">
                      <td
                        colSpan="4"
                        className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right"
                      >
                        ยอดรวมทั้งสิ้น:
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600 text-center">
                        ฿{ticketData.amount.toLocaleString("th-TH")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* การชำระเงิน */}
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold border-b pb-2 mb-4 flex items-center">
                <CreditCard className="text-blue-500 mr-2" size={20} />
                การชำระเงิน
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* การชำระเงินของบริษัท */}
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-3">การชำระเงินของบริษัท</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 rounded-full border ${
                          true
                            ? "bg-blue-500 border-blue-600"
                            : "border-gray-300"
                        } mr-2 flex items-center justify-center`}
                      >
                        {true && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <label className="mr-2">เครดิตการ์ด</label>
                      <div className="h-10 px-3 py-2 border border-gray-300 bg-gray-100 rounded-md text-gray-500 flex-grow">
                        VISA **** 4589 Exp: 05/26
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 rounded-full border border-gray-300 mr-2 flex items-center justify-center`}
                      ></div>
                      <label className="mr-2">โอนเงินผ่านธนาคาร</label>
                      <div className="h-10 px-3 py-2 border border-gray-300 rounded-md text-gray-500 flex-grow">
                        รายละเอียดการโอน
                      </div>
                    </div>
                  </div>
                </div>

                {/* การชำระเงินของลูกค้า */}
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-3">การชำระเงินของลูกค้า</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 rounded-full border ${
                          ticketData.paymentStatus === "paid"
                            ? "bg-blue-500 border-blue-600"
                            : "border-gray-300"
                        } mr-2 flex items-center justify-center`}
                      >
                        {ticketData.paymentStatus === "paid" && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <label>เงินสด</label>
                    </div>

                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 rounded-full border ${
                          ticketData.paymentStatus === "partially"
                            ? "bg-blue-500 border-blue-600"
                            : "border-gray-300"
                        } mr-2 flex items-center justify-center`}
                      >
                        {ticketData.paymentStatus === "partially" && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <label>เครดิต</label>
                    </div>

                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 rounded-full border border-gray-300 mr-2 flex items-center justify-center`}
                      ></div>
                      <label>เครดิตการ์ด VISA / MSTR / AMEX / JCB</label>
                    </div>

                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 rounded-full border border-gray-300 mr-2 flex items-center justify-center`}
                      ></div>
                      <label className="mr-2">โอนเงินผ่านธนาคาร</label>
                      <div className="h-10 px-3 py-2 border border-gray-300 rounded-md text-gray-500 flex-grow">
                        รายละเอียดการโอน
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* สถานะรายการ */}
            <div className="p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="mr-4">
                    <div className="text-sm text-gray-500 mb-1">
                      สถานะรายการ
                    </div>
                    {getStatusBadge(ticketData.status)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">
                    สถานะการชำระเงิน
                  </div>
                  {getPaymentStatusBadge(ticketData.paymentStatus)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors flex items-center text-sm"
          >
            <X size={16} className="mr-2" />
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlightTicketDetail_2;
