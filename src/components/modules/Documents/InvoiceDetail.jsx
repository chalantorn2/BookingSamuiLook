import React, { useState } from "react";
import {
  FileText,
  Printer,
  Mail,
  Download,
  X,
  CreditCard,
  DollarSign,
  Calendar,
  User,
  MapPin,
  Phone,
  Briefcase,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";

const InvoiceDetail = ({ invoiceId, onClose }) => {
  // ในระบบจริง ข้อมูลนี้ควรถูกดึงมาจาก API ตามรหัส invoiceId
  // สำหรับตัวอย่างนี้ ผมจะใช้ข้อมูลจำลองสำหรับ IN-25-0002

  const invoiceData = {
    id: "IN-25-0002",
    date: "05/02/2025",
    dueDate: "05/03/2025",
    customer: {
      name: "XYZ TOURS",
      address: "456 ถ.พระบารมี ต.ป่าตอง อ.กะทู้ จ.ภูเก็ต 83150",
      phone: "081-9876543",
      contactPerson: "คุณสมหญิง รักเที่ยว",
    },
    salesPerson: "นายชลันธร มานพ",
    status: "unpaid",
    paymentTerms: "30 วัน",
    items: [
      {
        id: "FT-25-1-0005",
        type: "flight",
        description: "ตั๋วเครื่องบิน TG203 BKK-HKT",
        details: "10 MAR 2025 | 07:45-09:10",
        passengers: ["Mr. John Smith", "Mrs. Jane Smith", "Ms. Sarah Smith"],
        quantity: 3,
        unitPrice: 25000,
        amount: 75000,
      },
    ],
    // ข้อมูลเกี่ยวกับซัพพลายเออร์
    supplier: {
      code: "TG",
      name: "THAI AIRWAYS INTERNATIONAL",
    },
    // ข้อมูลรวมของใบแจ้งหนี้
    summary: {
      subtotal: 75000,
      discount: 0,
      discountPercent: 0,
      vat: 5250,
      vatPercent: 7,
      total: 80250,
    },
    // ข้อมูลการชำระเงิน (ถ้ามี)
    payments: [
      // สำหรับตัวอย่างนี้ยังไม่มีการชำระเงิน
    ],
    // ข้อมูลเพิ่มเติม
    notes: "กรุณาชำระเงินภายในวันที่กำหนด หากมีข้อสงสัยกรุณาติดต่อฝ่ายบัญชี",
    dateCreate: "2025-03-10",
  };

  // คำนวณยอดค้างชำระ
  const calculateBalance = () => {
    const totalPayments = invoiceData.payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );
    return invoiceData.summary.total - totalPayments;
  };

  // แสดงสถานะด้วยสี
  const getStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return (
          <span className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <CheckCircle className="mr-1 h-4 w-4" />
            ชำระแล้ว
          </span>
        );
      case "unpaid":
        return (
          <span className="flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            <Calendar className="mr-1 h-4 w-4" />
            รอชำระ
          </span>
        );
      case "partially":
        return (
          <span className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            <DollarSign className="mr-1 h-4 w-4" />
            ชำระบางส่วน
          </span>
        );
      case "overdue":
        return (
          <span className="flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            <XCircle className="mr-1 h-4 w-4" />
            เกินกำหนด
          </span>
        );
      default:
        return (
          <span className="flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black modal-backdrop bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
          <h1 className="text-xl font-bold">
            รายละเอียดใบแจ้งหนี้ #{invoiceData.id}
          </h1>
          {/* <div className="flex space-x-2">
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
          </div> */}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* ส่วนหัวใบแจ้งหนี้ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <FileText size={24} className="text-blue-600 mr-2" />
                <h2 className="text-2xl font-bold text-gray-800">ใบแจ้งหนี้</h2>
              </div>
              <div className="space-y-2">
                <div className="flex">
                  <span className="w-28 text-gray-500">เลขที่:</span>
                  <span className="font-semibold">{invoiceData.id}</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-gray-500">วันที่:</span>
                  <span>{invoiceData.date}</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-gray-500">วันครบกำหนด:</span>
                  <span>{invoiceData.dueDate}</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-gray-500">เงื่อนไข:</span>
                  <span>{invoiceData.paymentTerms}</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-gray-500">ผู้บันทึก:</span>
                  <span>{invoiceData.salesPerson}</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-gray-500">สถานะ:</span>
                  {getStatusBadge(invoiceData.status)}
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
                  {invoiceData.customer.name}
                </div>
                <div className="flex items-start">
                  <MapPin
                    size={18}
                    className="text-gray-400 mr-2 mt-1 flex-shrink-0"
                  />
                  <span className="text-gray-600">
                    {invoiceData.customer.address}
                  </span>
                </div>
                <div className="flex items-center">
                  <Phone
                    size={18}
                    className="text-gray-400 mr-2 flex-shrink-0"
                  />
                  <span className="text-gray-600">
                    {invoiceData.customer.phone}
                  </span>
                </div>
                {invoiceData.customer.contactPerson && (
                  <div className="flex items-center">
                    <User
                      size={18}
                      className="text-gray-400 mr-2 flex-shrink-0"
                    />
                    <span className="text-gray-600">
                      {invoiceData.customer.contactPerson}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ข้อมูลซัพพลายเออร์ */}
          <div className="mb-8">
            <div className="flex items-center mb-3">
              <Briefcase size={20} className="text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-700">
                ข้อมูลซัพพลายเออร์
              </h3>
            </div>
            <div className="bg-blue-50 p-4 rounded-md">
              <div className="flex items-center ">
                <span className="w-28 text-gray-500">รหัส:</span>
                <span className="font-semibold px-2 py-1 bg-blue-100 text-blue-700 rounded-md">
                  {invoiceData.supplier.code}
                </span>
              </div>
              <div className="flex mt-2">
                <span className="w-28 text-gray-500  text-nowrap  mr-2">
                  ชื่อซัพพลายเออร์:
                </span>
                <span className="font-medium">{invoiceData.supplier.name}</span>
              </div>
            </div>
          </div>

          {/* รายการสินค้า/บริการ */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              รายการสินค้า/บริการ
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      รหัสรายการ
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      รายละเอียด
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      จำนวน
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      ราคาต่อหน่วย
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      จำนวนเงิน
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoiceData.items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {item.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="font-medium">{item.description}</div>
                        <div className="text-gray-500 text-xs mt-1">
                          {item.details}
                        </div>
                        <div className="mt-2">
                          <span className="font-medium text-xs text-gray-600">
                            ผู้โดยสาร:
                          </span>
                          <ul className="mt-1 text-xs text-gray-500 pl-3">
                            {item.passengers.map((passenger, index) => (
                              <li key={index} className="list-disc list-inside">
                                {passenger}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        ฿{item.unitPrice.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        ฿{item.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* สรุปยอดเงิน */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* ช่องทางการชำระเงิน */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                <CreditCard size={20} className="text-blue-600 mr-2" />
                วิธีการชำระเงิน
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">
                    โอนเงินผ่านธนาคาร
                  </h4>
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-500">ธนาคาร:</div>
                      <div>ธนาคารกสิกรไทย</div>
                      <div className="text-gray-500">สาขา:</div>
                      <div>เซ็นทรัลเฟสติวัล ภูเก็ต</div>
                      <div className="text-gray-500">เลขที่บัญชี:</div>
                      <div className="font-medium">123-4-56789-0</div>
                      <div className="text-gray-500">ชื่อบัญชี:</div>
                      <div>บริษัท สมุยลุคบุ๊คกิ้ง จำกัด</div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-700 mb-2">หมายเหตุ</div>
                  <p className="text-gray-600 text-sm">{invoiceData.notes}</p>
                </div>
              </div>
            </div>

            {/* ยอดรวม */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                <DollarSign size={20} className="text-blue-600 mr-2" />
                สรุปยอดเงิน
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2 border-b border-gray-200 pb-3 mb-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ยอดรวม:</span>
                    <span className="font-medium">
                      ฿{invoiceData.summary.subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      ส่วนลด {invoiceData.summary.discountPercent}%:
                    </span>
                    <span className="font-medium">
                      ฿{invoiceData.summary.discount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      ภาษีมูลค่าเพิ่ม {invoiceData.summary.vatPercent}%:
                    </span>
                    <span className="font-medium">
                      ฿{invoiceData.summary.vat.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-700">ยอดรวมทั้งสิ้น:</span>
                  <span className="text-blue-600">
                    ฿{invoiceData.summary.total.toLocaleString()}
                  </span>
                </div>
                <div className="mt-4 bg-blue-100 p-3 rounded-md flex justify-between">
                  <span className="font-medium text-blue-800">
                    ยอดค้างชำระ:
                  </span>
                  <span className="font-bold text-blue-800">
                    ฿{calculateBalance().toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ประวัติการชำระเงิน */}
          {invoiceData.payments.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                ประวัติการชำระเงิน
              </h3>
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
                      วิธีการชำระเงิน
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      เลขที่อ้างอิง
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      จำนวนเงิน
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoiceData.payments.map((payment, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.method}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.reference}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        ฿{payment.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* เอกสารที่เกี่ยวข้อง */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              เอกสารที่เกี่ยวข้อง
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <FileText size={18} className="text-gray-400 mr-2" />
                  <span className="text-blue-600 font-medium">
                    รายการขายตั๋วเครื่องบิน - FT-25-1-0005
                  </span>
                </div>
                <button className="text-gray-500 hover:text-blue-600">
                  {/* <Eye size={18} /> */}
                </button>
              </div>
              {invoiceData.dateCreate && (
                <div className="flex items-center mt-2 text-sm text-gray-600">
                  <span className="mr-2">วันทื่:</span>
                  <span className="font-medium">{invoiceData.dateCreate}</span>
                </div>
              )}
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <FileText size={18} className="text-gray-400 mr-2" />
                  <span className="text-blue-600 font-medium">
                    รายการขายตั๋วเครื่องบิน - FT-25-1-0007
                  </span>
                </div>
                <button className="text-gray-500 hover:text-blue-600">
                  {/* <Eye size={18} /> */}
                </button>
              </div>
              {invoiceData.dateCreate && (
                <div className="flex items-center mt-2 text-sm text-gray-600">
                  <span className="mr-2">วันทื่:</span>
                  <span className="font-medium">{invoiceData.dateCreate}</span>
                </div>
              )}
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
          {/* 
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors flex items-center text-sm">
              <Printer size={16} className="mr-2" />
              พิมพ์
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center text-sm">
              <Mail size={16} className="mr-2" />
              ส่งอีเมล
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;
