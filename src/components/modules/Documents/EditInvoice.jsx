import React, { useState } from "react";
import {
  FileText,
  X,
  User,
  CreditCard,
  DollarSign,
  Plus,
  Trash2,
  Save,
} from "lucide-react";

const EditInvoice = ({ invoiceId, onClose, onSave }) => {
  // ในระบบจริง ข้อมูลนี้ควรถูกดึงมาจาก API ตามรหัส invoiceId
  const [invoiceData, setInvoiceData] = useState({
    id: "IN-25-0002",
    date: "2025-02-05",
    dueDate: "2025-03-05",
    customer: {
      name: "XYZ TOURS",
      address: "456 ถ.พระบารมี ต.ป่าตอง อ.กะทู้ จ.ภูเก็ต 83150",
      phone: "081-9876543",
      contactPerson: "คุณสมหญิง รักเที่ยว",
    },
    salesPerson: "นายชลันธร มานพ",
    status: "unpaid",
    paymentTerms: "30",
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
    notes: "จ่ายแล้ว 50%",
  });

  // ฟังก์ชันการแก้ไขข้อมูลทั่วไป
  const handleChange = (field, value) => {
    setInvoiceData({ ...invoiceData, [field]: value });
  };

  // ฟังก์ชันแก้ไขข้อมูลลูกค้า
  const handleCustomerChange = (field, value) => {
    setInvoiceData({
      ...invoiceData,
      customer: { ...invoiceData.customer, [field]: value },
    });
  };

  // ฟังก์ชันแก้ไขข้อมูล summary
  const handleSummaryChange = (field, value) => {
    let numValue = parseFloat(value);
    if (isNaN(numValue)) numValue = 0;

    const updatedSummary = { ...invoiceData.summary };

    if (field === "discountPercent") {
      updatedSummary.discountPercent = numValue;
      updatedSummary.discount = (
        (updatedSummary.subtotal * numValue) /
        100
      ).toFixed(2);
    } else if (field === "vatPercent") {
      updatedSummary.vatPercent = numValue;
      const subtotalAfterDiscount =
        updatedSummary.subtotal - updatedSummary.discount;
      updatedSummary.vat = ((subtotalAfterDiscount * numValue) / 100).toFixed(
        2
      );
    }

    // คำนวณยอดรวมใหม่
    updatedSummary.total = (
      parseFloat(updatedSummary.subtotal) -
      parseFloat(updatedSummary.discount) +
      parseFloat(updatedSummary.vat)
    ).toFixed(2);

    setInvoiceData({ ...invoiceData, summary: updatedSummary });
  };

  // ฟังก์ชันแก้ไขรายการสินค้า
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...invoiceData.saleItems];

    if (field === "amount") {
      const numValue = parseFloat(value);
      updatedItems[index][field] = isNaN(numValue) ? 0 : numValue;
    } else {
      updatedItems[index][field] = value;
    }

    // คำนวณ subtotal ใหม่
    const subtotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);

    // คำนวณค่าอื่นๆ ใหม่
    const discountAmount =
      (subtotal * invoiceData.summary.discountPercent) / 100;
    const subtotalAfterDiscount = subtotal - discountAmount;
    const vatAmount =
      (subtotalAfterDiscount * invoiceData.summary.vatPercent) / 100;
    const total = subtotalAfterDiscount + vatAmount;

    setInvoiceData({
      ...invoiceData,
      saleItems: updatedItems,
      summary: {
        ...invoiceData.summary,
        subtotal,
        discount: discountAmount,
        vat: vatAmount,
        total,
      },
    });
  };

  // ฟังก์ชันลบรายการ
  const removeItem = (index) => {
    if (invoiceData.saleItems.length <= 1) {
      alert("ต้องมีอย่างน้อย 1 รายการ");
      return;
    }

    const updatedItems = [...invoiceData.saleItems];
    updatedItems.splice(index, 1);

    // คำนวณ subtotal ใหม่
    const subtotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);

    // คำนวณค่าอื่นๆ ใหม่
    const discountAmount =
      (subtotal * invoiceData.summary.discountPercent) / 100;
    const subtotalAfterDiscount = subtotal - discountAmount;
    const vatAmount =
      (subtotalAfterDiscount * invoiceData.summary.vatPercent) / 100;
    const total = subtotalAfterDiscount + vatAmount;

    setInvoiceData({
      ...invoiceData,
      saleItems: updatedItems,
      summary: {
        ...invoiceData.summary,
        subtotal,
        discount: discountAmount,
        vat: vatAmount,
        total,
      },
    });
  };

  // ฟังก์ชันเพิ่มรายการใหม่
  const addNewItem = () => {
    const newItem = {
      id: `ITEM-${Date.now()}`,
      type: "other",
      typeName: "บริการอื่นๆ",
      date: new Date().toLocaleDateString("th-TH"),
      description: "",
      details: "",
      passengers: 1,
      passengerNames: [],
      amount: 0,
    };

    setInvoiceData({
      ...invoiceData,
      saleItems: [...invoiceData.saleItems, newItem],
    });
  };

  // ฟังก์ชันบันทึกการเปลี่ยนแปลง
  const handleSave = () => {
    if (onSave) {
      onSave(invoiceData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 modal-backdrop bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
          <h1 className="text-xl font-bold">
            แก้ไขใบแจ้งหนี้ #{invoiceData.id}
          </h1>
          <div className="flex space-x-2">
            <button
              className="px-4 py-2 bg-green-500 text-white rounded-md flex items-center hover:bg-green-600"
              onClick={handleSave}
            >
              <Save size={16} className="mr-2" />
              บันทึก
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* ข้อมูลใบแจ้งหนี้และลูกค้า */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* ข้อมูลใบแจ้งหนี้ */}
            <div>
              <div className="flex items-center mb-3">
                <FileText size={20} className="text-blue-600 mr-2" />
                <h2 className="text-lg font-bold text-gray-800">
                  ข้อมูลใบแจ้งหนี้
                </h2>
              </div>
              <div className="space-y-3 bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
                  <span className="text-gray-500">เลขที่:</span>
                  <span className="font-medium">{invoiceData.id}</span>
                </div>

                <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
                  <span className="text-gray-500">วันที่:</span>
                  <input
                    type="date"
                    className="border border-gray-300 rounded-md p-2 w-full"
                    value={invoiceData.date}
                    onChange={(e) => handleChange("date", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
                  <span className="text-gray-500">วันครบกำหนด:</span>
                  <input
                    type="date"
                    className="border border-gray-300 rounded-md p-2 w-full"
                    value={invoiceData.dueDate}
                    onChange={(e) => handleChange("dueDate", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
                  <span className="text-gray-500">เงื่อนไข:</span>
                  <select
                    className="border border-gray-300 rounded-md p-2 w-full"
                    value={invoiceData.paymentTerms}
                    onChange={(e) =>
                      handleChange("paymentTerms", e.target.value)
                    }
                  >
                    <option value="0">ชำระทันที</option>
                    <option value="7">7 วัน</option>
                    <option value="15">15 วัน</option>
                    <option value="30">30 วัน</option>
                    <option value="45">45 วัน</option>
                    <option value="60">60 วัน</option>
                  </select>
                </div>

                <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
                  <span className="text-gray-500">ผู้บันทึก:</span>
                  <input
                    type="text"
                    className="border border-gray-300 rounded-md p-2 w-full"
                    value={invoiceData.salesPerson}
                    onChange={(e) =>
                      handleChange("salesPerson", e.target.value)
                    }
                  />
                </div>

                <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
                  <span className="text-gray-500">สถานะ:</span>
                  <select
                    className="border border-gray-300 rounded-md p-2 w-full"
                    value={invoiceData.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                  >
                    <option value="unpaid">รอชำระ</option>
                    <option value="partially">ชำระบางส่วน</option>
                    <option value="paid">ชำระแล้ว</option>
                    <option value="overdue">เกินกำหนด</option>
                  </select>
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
              <div className="space-y-3 bg-gray-50 p-4 rounded-md">
                <div>
                  <label className="text-gray-500 block mb-1">
                    ชื่อลูกค้า:
                  </label>
                  <input
                    type="text"
                    className="border border-gray-300 rounded-md p-2 w-full"
                    value={invoiceData.customer.name}
                    onChange={(e) =>
                      handleCustomerChange("name", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className="text-gray-500 block mb-1">ที่อยู่:</label>
                  <textarea
                    className="border border-gray-300 rounded-md p-2 w-full"
                    rows="3"
                    value={invoiceData.customer.address}
                    onChange={(e) =>
                      handleCustomerChange("address", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className="text-gray-500 block mb-1">
                    เบอร์โทรศัพท์:
                  </label>
                  <input
                    type="text"
                    className="border border-gray-300 rounded-md p-2 w-full"
                    value={invoiceData.customer.phone}
                    onChange={(e) =>
                      handleCustomerChange("phone", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className="text-gray-500 block mb-1">ผู้ติดต่อ:</label>
                  <input
                    type="text"
                    className="border border-gray-300 rounded-md p-2 w-full"
                    value={invoiceData.customer.contactPerson}
                    onChange={(e) =>
                      handleCustomerChange("contactPerson", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* รายการที่รวมในใบแจ้งหนี้ */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-800">
                รายการที่รวมในใบแจ้งหนี้
              </h2>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center text-sm"
                onClick={() => console.log("เปิดหน้า SelectForInvoice")}
              >
                <Plus size={16} className="mr-1" /> เพิ่มรายการ
              </button>
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
                      รายละเอียด
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      จำนวนเงิน
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16"
                    >
                      ลบ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoiceData.saleItems.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                        {item.id}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {item.typeName}
                        </span>
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
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => console.log("ลบรายการ", item.id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* สรุปยอดเงินและหมายเหตุ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* หมายเหตุ */}
            <div>
              <div className="flex items-center mb-3">
                <CreditCard size={20} className="text-blue-600 mr-2" />
                <h2 className="text-lg font-bold text-gray-800">
                  ข้อมูลเพิ่มเติม
                </h2>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <label className="text-gray-500 block mb-1">หมายเหตุ:</label>
                <textarea
                  className="border border-gray-300 rounded-md p-2 w-full"
                  rows="5"
                  value={invoiceData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder="หมายเหตุหรือข้อมูลเพิ่มเติม"
                />
              </div>
            </div>

            {/* สรุปยอดเงิน */}
            <div>
              <div className="flex items-center mb-3">
                <DollarSign size={20} className="text-blue-600 mr-2" />
                <h2 className="text-lg font-bold text-gray-800">สรุปยอดเงิน</h2>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="space-y-3 border-b border-gray-200 pb-3 mb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">ยอดรวม:</span>
                    <span className="font-medium">
                      ฿{invoiceData.summary.subtotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">ส่วนลด (%):</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      className="border border-gray-300 rounded-md p-2 w-24 text-right"
                      value={invoiceData.summary.discountPercent}
                      onChange={(e) =>
                        handleSummaryChange("discountPercent", e.target.value)
                      }
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">ส่วนลด:</span>
                    <span className="font-medium">
                      ฿
                      {parseFloat(
                        invoiceData.summary.discount
                      ).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">ภาษีมูลค่าเพิ่ม (%):</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      className="border border-gray-300 rounded-md p-2 w-24 text-right"
                      value={invoiceData.summary.vatPercent}
                      onChange={(e) =>
                        handleSummaryChange("vatPercent", e.target.value)
                      }
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">ภาษีมูลค่าเพิ่ม:</span>
                    <span className="font-medium">
                      ฿{parseFloat(invoiceData.summary.vat).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-700">ยอดรวมทั้งสิ้น:</span>
                  <span className="text-blue-600">
                    ฿{parseFloat(invoiceData.summary.total).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
          >
            ยกเลิก
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <Save size={16} className="mr-2" />
            บันทึกการเปลี่ยนแปลง
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditInvoice;
