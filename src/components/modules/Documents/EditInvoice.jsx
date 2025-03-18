import React, { useState, useEffect } from "react";
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
  Save,
  Plus,
  Trash2,
} from "lucide-react";

const EditInvoice = ({ invoiceId, onClose, onSave }) => {
  // ในระบบจริง ข้อมูลนี้ควรถูกดึงมาจาก API ตามรหัส invoiceId
  // สำหรับตัวอย่างนี้ จะใช้ข้อมูลจำลองสำหรับ IN-25-0002

  const [invoiceData, setInvoiceData] = useState({
    id: "IN-25-0002",
    date: "2025-02-05", // ใช้รูปแบบ YYYY-MM-DD สำหรับ input type="date"
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
    supplier: {
      code: "TG",
      name: "THAI AIRWAYS INTERNATIONAL",
    },
    summary: {
      subtotal: 75000,
      discount: 0,
      discountPercent: 0,
      vat: 5250,
      vatPercent: 7,
      total: 80250,
    },
    payments: [],
    notes: "กรุณาชำระเงินภายในวันที่กำหนด หากมีข้อสงสัยกรุณาติดต่อฝ่ายบัญชี",
    reference: "PO-XYZ-T25002",
  });

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

  // อัพเดทข้อมูลเมื่อมีการเปลี่ยนแปลง
  const handleChange = (field, value) => {
    setInvoiceData({
      ...invoiceData,
      [field]: value,
    });
  };

  const handleCustomerChange = (field, value) => {
    setInvoiceData({
      ...invoiceData,
      customer: {
        ...invoiceData.customer,
        [field]: value,
      },
    });
  };

  const handleSupplierChange = (field, value) => {
    setInvoiceData({
      ...invoiceData,
      supplier: {
        ...invoiceData.supplier,
        [field]: value,
      },
    });
  };

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

    setInvoiceData({
      ...invoiceData,
      summary: updatedSummary,
    });
  };

  // อัพเดทข้อมูลรายการ
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...invoiceData.items];

    if (field === "quantity" || field === "unitPrice") {
      const numValue = parseFloat(value);
      updatedItems[index][field] = isNaN(numValue) ? 0 : numValue;

      // คำนวณยอดรวมต่อรายการใหม่
      const quantity = updatedItems[index].quantity;
      const unitPrice = updatedItems[index].unitPrice;
      updatedItems[index].amount = quantity * unitPrice;
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
      items: updatedItems,
      summary: {
        ...invoiceData.summary,
        subtotal,
        discount: discountAmount,
        vat: vatAmount,
        total,
      },
    });
  };

  // เพิ่มรายการใหม่
  const addItem = () => {
    const newItem = {
      id: `ITEM-${invoiceData.items.length + 1}`,
      type: "other",
      description: "",
      details: "",
      passengers: [],
      quantity: 1,
      unitPrice: 0,
      amount: 0,
    };

    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, newItem],
    });
  };

  // ลบรายการ
  const removeItem = (index) => {
    if (invoiceData.items.length <= 1) {
      alert("ต้องมีอย่างน้อย 1 รายการ");
      return;
    }

    const updatedItems = [...invoiceData.items];
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
      items: updatedItems,
      summary: {
        ...invoiceData.summary,
        subtotal,
        discount: discountAmount,
        vat: vatAmount,
        total,
      },
    });
  };

  // บันทึกข้อมูล
  const handleSave = () => {
    // ในระบบจริงควรตรวจสอบความถูกต้องของข้อมูลก่อนบันทึก
    if (onSave) {
      onSave(invoiceData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black modal-backdrop bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
          <h1 className="text-xl font-bold">
            แก้ไขใบแจ้งหนี้ #{invoiceData.id}
          </h1>
          <div className="flex space-x-2">
            <button
              className="px-4 py-2 bg-green-500 text-white rounded-md flex items-center hover:bg-green-600 transition-colors"
              onClick={handleSave}
            >
              <Save size={16} className="mr-2" />
              บันทึก
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
          {/* ส่วนหัวใบแจ้งหนี้ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <FileText size={24} className="text-blue-600 mr-2" />
                <h2 className="text-2xl font-bold text-gray-800">ใบแจ้งหนี้</h2>
              </div>
              <div className="space-y-4">
                <div className="flex">
                  <span className="w-28 text-gray-500">เลขที่:</span>
                  <span className="font-semibold">{invoiceData.id}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-28 text-gray-500">วันที่:</span>
                  <input
                    type="date"
                    className="border border-gray-300 rounded-md px-3 py-1 flex-1"
                    value={invoiceData.date}
                    onChange={(e) => handleChange("date", e.target.value)}
                  />
                </div>
                <div className="flex items-center">
                  <span className="w-28 text-gray-500">วันครบกำหนด:</span>
                  <input
                    type="date"
                    className="border border-gray-300 rounded-md px-3 py-1 flex-1"
                    value={invoiceData.dueDate}
                    onChange={(e) => handleChange("dueDate", e.target.value)}
                  />
                </div>
                <div className="flex items-center">
                  <span className="w-28 text-gray-500">เงื่อนไข:</span>
                  <select
                    className="border border-gray-300 rounded-md px-3 py-1 flex-1"
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
                <div className="flex items-center">
                  <span className="w-28 text-gray-500">ผู้บันทึก:</span>
                  <input
                    type="text"
                    className="border border-gray-300 rounded-md px-3 py-1 flex-1"
                    value={invoiceData.salesPerson}
                    onChange={(e) =>
                      handleChange("salesPerson", e.target.value)
                    }
                  />
                </div>
                <div className="flex">
                  <span className="w-28 text-gray-500">สถานะ:</span>
                  <select
                    className="border border-gray-300 rounded-md px-3 py-1"
                    value={invoiceData.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                  >
                    <option value="unpaid">รอชำระ</option>
                    <option value="partially">ชำระบางส่วน</option>
                    <option value="paid">ชำระแล้ว</option>
                    <option value="overdue">เกินกำหนด</option>
                    <option value="cancelled">ยกเลิก</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                <User size={20} className="text-blue-600 mr-2" />
                ข้อมูลลูกค้า
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    ชื่อลูกค้า
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={invoiceData.customer.name}
                    onChange={(e) =>
                      handleCustomerChange("name", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    ที่อยู่
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md px-3 py-2 min-h-[80px]"
                    value={invoiceData.customer.address}
                    onChange={(e) =>
                      handleCustomerChange("address", e.target.value)
                    }
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    เบอร์โทรศัพท์
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={invoiceData.customer.phone}
                    onChange={(e) =>
                      handleCustomerChange("phone", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    ผู้ติดต่อ
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={invoiceData.customer.contactPerson}
                    onChange={(e) =>
                      handleCustomerChange("contactPerson", e.target.value)
                    }
                  />
                </div>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    รหัสซัพพลายเออร์
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white"
                    value={invoiceData.supplier.code}
                    onChange={(e) => {
                      // ถ้าเลือกรหัสใหม่ จะต้องอัพเดทชื่อซัพพลายเออร์ด้วย
                      const supplierMapping = {
                        TG: "THAI AIRWAYS INTERNATIONAL",
                        FD: "THAI AIR ASIA",
                        PG: "BANGKOK AIRWAYS",
                        "": "",
                      };

                      handleSupplierChange("code", e.target.value);
                      handleSupplierChange(
                        "name",
                        supplierMapping[e.target.value] || ""
                      );
                    }}
                  >
                    <option value="">เลือกซัพพลายเออร์</option>
                    <option value="TG">TG</option>
                    <option value="FD">FD</option>
                    <option value="PG">PG</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">
                    ชื่อซัพพลายเออร์
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
                    value={invoiceData.supplier.name}
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>

          {/* รายการสินค้า/บริการ */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-700">
                รายการสินค้า/บริการ
              </h3>
              <button
                type="button"
                className="flex items-center text-blue-600 hover:text-blue-800 px-3 py-1 bg-blue-50 rounded-md text-sm font-medium"
                onClick={addItem}
              >
                <Plus size={16} className="mr-1" />
                เพิ่มรายการ
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      รายละเอียด
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24"
                    >
                      จำนวน
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-40"
                    >
                      ราคาต่อหน่วย
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-40"
                    >
                      จำนวนเงิน
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16"
                    >
                      ลบ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoiceData.items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-2"
                          placeholder="รายละเอียดสินค้า/บริการ"
                          value={item.description}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                        />
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-500"
                          placeholder="รายละเอียดเพิ่มเติม (วันที่, เวลา, ฯลฯ)"
                          value={item.details}
                          onChange={(e) =>
                            handleItemChange(index, "details", e.target.value)
                          }
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          min="1"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-right"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, "quantity", e.target.value)
                          }
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500">฿</span>
                          </div>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-full border border-gray-300 rounded-md pl-7 pr-3 py-2 text-right"
                            value={item.unitPrice}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "unitPrice",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500">฿</span>
                          </div>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md pl-7 pr-3 py-2 text-right bg-gray-100"
                            value={item.amount.toLocaleString()}
                            readOnly
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => removeItem(index)}
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

          {/* หมายเหตุ */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              หมายเหตุ
            </h3>
            <textarea
              className="w-full border border-gray-300 rounded-md px-4 py-3 min-h-[100px]"
              placeholder="หมายเหตุหรือเงื่อนไขการชำระเงิน"
              value={invoiceData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
            ></textarea>
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
                  <label className="font-medium text-gray-700 mb-2 block">
                    อ้างอิง
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="เลขที่อ้างอิง PO, ใบสั่งซื้อ, ฯลฯ"
                    value={invoiceData.reference}
                    onChange={(e) => handleChange("reference", e.target.value)}
                  />
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
                <div className="space-y-3 border-b border-gray-200 pb-3 mb-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ยอดรวม:</span>
                    <span className="font-medium">
                      ฿{invoiceData.summary.subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">ส่วนลด (%):</span>
                    <div className="w-24">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        className="w-full border border-gray-300 rounded-md px-3 py-1 text-right"
                        value={invoiceData.summary.discountPercent}
                        onChange={(e) =>
                          handleSummaryChange("discountPercent", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ส่วนลด:</span>
                    <span className="font-medium">
                      ฿
                      {parseFloat(
                        invoiceData.summary.discount
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">ภาษีมูลค่าเพิ่ม (%):</span>
                    <div className="w-24">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        className="w-full border border-gray-300 rounded-md px-3 py-1 text-right"
                        value={invoiceData.summary.vatPercent}
                        onChange={(e) =>
                          handleSummaryChange("vatPercent", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className="flex justify-between">
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
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      ลบ
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
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => {
                            const updatedPayments = [...invoiceData.payments];
                            updatedPayments.splice(index, 1);
                            setInvoiceData({
                              ...invoiceData,
                              payments: updatedPayments,
                            });
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
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
              </div>
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
            ยกเลิก
          </button>

          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center text-sm"
            >
              <Save size={16} className="mr-2" />
              บันทึก
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditInvoice;
