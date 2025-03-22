import React from "react";
import { FileText, X, User, CreditCard, DollarSign } from "lucide-react";

const InvoiceDetail = ({ invoiceId, onClose }) => {
  // ในระบบจริง ข้อมูลนี้ควรถูกดึงมาจาก API ตามรหัส invoiceId
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
    // รายการขายที่นำมารวมในใบแจ้งหนี้นี้
    saleItems: [
      {
        id: "FT-25-1-0005",
        type: "flight",
        typeName: "ตั๋วเครื่องบิน",
        date: "10/02/2025",
        description: "ตั๋วเครื่องบิน TG203 BKK-HKT",
        details: "10 MAR 2025 | 07:45-09:10",
        passengers: 3,
        passengerNames: [
          "Mr. John Smith",
          "Mrs. Jane Smith",
          "Ms. Sarah Smith",
        ],
        amount: 75000,
      },
      {
        id: "FT-25-1-0007",
        type: "flight",
        typeName: "ตั๋วเครื่องบิน",
        date: "15/02/2025",
        description: "ตั๋วเครื่องบิน FD3450 DMK-CNX",
        details: "12 MAR 2025 | 10:30-12:00",
        passengers: 1,
        passengerNames: ["Mr. James Brown"],
        amount: 3500,
      },
    ],
    summary: {
      subtotal: 78500,
      discount: 0,
      vat: 5495,
      vatPercent: 7,
      total: 83995,
    },
    // ข้อมูลเพิ่มเติม
    notes: "กรุณาชำระเงินภายในวันที่กำหนด หากมีข้อสงสัยกรุณาติดต่อฝ่ายบัญชี",
  };

  // คำนวณยอดที่ต้องชำระ
  const calculateBalance = () => {
    const totalPayments = 0; // ในกรณีนี้ยังไม่มีการชำระเงิน
    return invoiceData.summary.total - totalPayments;
  };

  // แสดงสถานะใบแจ้งหนี้
  const getStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            ชำระแล้ว
          </span>
        );
      case "unpaid":
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            รอชำระ
          </span>
        );
      case "partially":
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            ชำระบางส่วน
          </span>
        );
      case "overdue":
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            เกินกำหนด
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 modal-backdrop bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
          <h1 className="text-xl font-bold">
            รายละเอียดใบแจ้งหนี้ #{invoiceData.id}
          </h1>
          <button
            className="p-2 hover:bg-blue-700 rounded-full"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* ข้อมูลใบแจ้งหนี้ */}
            <div>
              <div className="flex items-center mb-3">
                <FileText size={20} className="text-blue-600 mr-2" />
                <h2 className="text-lg font-bold text-gray-800">
                  ข้อมูลใบแจ้งหนี้
                </h2>
              </div>
              <div className="space-y-2 bg-gray-50 p-4 rounded-md">
                <div className="flex">
                  <span className="w-28 text-gray-500">เลขที่:</span>
                  <span className="font-medium">{invoiceData.id}</span>
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

            {/* ข้อมูลลูกค้า */}
            <div>
              <div className="flex items-center mb-3">
                <User size={20} className="text-blue-600 mr-2" />
                <h2 className="text-lg font-bold text-gray-800">
                  ข้อมูลลูกค้า
                </h2>
              </div>
              <div className="space-y-2 bg-gray-50 p-4 rounded-md">
                <div className="font-medium text-gray-800">
                  {invoiceData.customer.name}
                </div>
                <div className="text-gray-600">
                  {invoiceData.customer.address}
                </div>
                <div className="text-gray-600">
                  โทร: {invoiceData.customer.phone}
                </div>
                {invoiceData.customer.contactPerson && (
                  <div className="text-gray-600">
                    ผู้ติดต่อ: {invoiceData.customer.contactPerson}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* รายการที่รวมในใบแจ้งหนี้ */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-800">
                รายการที่รวมในใบแจ้งหนี้
              </h2>
              <div className="text-sm text-gray-500">
                จำนวน {invoiceData.saleItems.length} รายการ
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      รหัสรายการ
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      ประเภท
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      วันที่
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      รายละเอียด
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      จำนวนเงิน
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoiceData.saleItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                        {item.id}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {item.typeName}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {item.date}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-gray-900">
                          {item.description}
                        </div>
                        <div className="text-gray-500 text-xs mt-1">
                          {item.details}
                        </div>
                        <div className="text-gray-500 text-xs mt-1">
                          ผู้โดยสาร: {item.passengers} คน
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        ฿{item.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* สรุปยอดเงิน */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <div className="flex items-center mb-3">
                <CreditCard size={20} className="text-blue-600 mr-2" />
                <h2 className="text-lg font-bold text-gray-800">
                  ช่องทางการชำระเงิน
                </h2>
              </div>
              {/* <div className="bg-gray-50 p-4 rounded-md">
                <div className="font-medium text-gray-800 mb-2">
                  โอนเงินผ่านธนาคาร
                </div>
                <div className="grid grid-cols-2 gap-1 text-sm">
                  <div className="text-gray-500">ธนาคาร:</div>
                  <div>ธนาคารกสิกรไทย</div>
                  <div className="text-gray-500">สาขา:</div>
                  <div>เซ็นทรัลเฟสติวัล ภูเก็ต</div>
                  <div className="text-gray-500">เลขที่บัญชี:</div>
                  <div className="font-medium">123-4-56789-0</div>
                  <div className="text-gray-500">ชื่อบัญชี:</div>
                  <div>บริษัท สมุยลุคบุ๊คกิ้ง จำกัด</div>
                </div>
              </div> */}
              {invoiceData.notes && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="font-medium text-gray-800 mb-2">หมายเหตุ</div>
                  <p className="text-sm text-gray-600">{invoiceData.notes}</p>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center mb-3">
                <DollarSign size={20} className="text-blue-600 mr-2" />
                <h2 className="text-lg font-bold text-gray-800">สรุปยอดเงิน</h2>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="space-y-2 border-b border-gray-200 pb-3 mb-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ยอดรวม:</span>
                    <span className="font-medium">
                      ฿{invoiceData.summary.subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ส่วนลด:</span>
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
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;
