import React, { useState, useEffect } from "react";
import { FiSave, FiX, FiPlus, FiTrash2 } from "react-icons/fi";

const CreateInvoice = ({ onClose, onSave }) => {
  // สร้าง state สำหรับจัดการข้อมูล
  const [formData, setFormData] = useState({
    invoiceNo: `IN-${new Date().getFullYear().toString().slice(2)}-${String(
      Math.floor(Math.random() * 1000)
    ).padStart(4, "0")}`,
    date: new Date().toISOString().split("T")[0],
    dueDate: "",
    customer: "",
    customerPhone: "",
    customerAddress: "",
    salesName: "นายชลันธร มานพ",
    supplier: "",
    supplierName: "",
    reference: "",
    note: "",
    discount: "0",
    vat: "7",
  });

  // State สำหรับรายการสินค้า/บริการในใบแจ้งหนี้
  const [invoiceItems, setInvoiceItems] = useState([
    { id: 1, description: "", unit: "1", unitPrice: "", amount: "" },
  ]);

  // คำนวณวันครบกำหนดชำระเงิน (30 วันหลังจากวันที่ออกใบแจ้งหนี้)
  useEffect(() => {
    if (formData.date) {
      const date = new Date(formData.date);
      date.setDate(date.getDate() + 30);
      setFormData({
        ...formData,
        dueDate: date.toISOString().split("T")[0],
      });
    }
  }, [formData.date]);

  // ฟังก์ชันสำหรับการเพิ่มรายการ
  const addItem = () => {
    setInvoiceItems([
      ...invoiceItems,
      {
        id: invoiceItems.length + 1,
        description: "",
        unit: "1",
        unitPrice: "",
        amount: "",
      },
    ]);
  };

  // ฟังก์ชันสำหรับการลบรายการ
  const removeItem = (id) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter((item) => item.id !== id));
    }
  };

  // ฟังก์ชันสำหรับการอัพเดทรายการ
  const updateItem = (id, field, value) => {
    const updatedItems = invoiceItems.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };

        // คำนวณยอดรวมต่อรายการอัตโนมัติ
        if (field === "unit" || field === "unitPrice") {
          updatedItem.amount = calculateItemAmount(
            field === "unit" ? value : item.unit,
            field === "unitPrice" ? value : item.unitPrice
          );
        }

        return updatedItem;
      }
      return item;
    });

    setInvoiceItems(updatedItems);
  };

  // คำนวณยอดรวมต่อรายการ
  const calculateItemAmount = (unit, unitPrice) => {
    const quantity = parseFloat(unit) || 0;
    const price = parseFloat(unitPrice) || 0;
    return (quantity * price).toFixed(2);
  };

  // คำนวณยอดรวมทั้งหมด
  const calculateSubtotal = () => {
    return invoiceItems
      .reduce((sum, item) => {
        return sum + (parseFloat(item.amount) || 0);
      }, 0)
      .toFixed(2);
  };

  // คำนวณส่วนลด
  const calculateDiscount = () => {
    const subtotal = parseFloat(calculateSubtotal());
    const discountRate = parseFloat(formData.discount) || 0;
    return ((subtotal * discountRate) / 100).toFixed(2);
  };

  // คำนวณยอดก่อนภาษี
  const calculateBeforeVat = () => {
    const subtotal = parseFloat(calculateSubtotal());
    const discount = parseFloat(calculateDiscount());
    return (subtotal - discount).toFixed(2);
  };

  // คำนวณภาษีมูลค่าเพิ่ม
  const calculateVat = () => {
    const beforeVat = parseFloat(calculateBeforeVat());
    const vatRate = parseFloat(formData.vat) || 0;
    return ((beforeVat * vatRate) / 100).toFixed(2);
  };

  // คำนวณยอดรวมสุทธิ
  const calculateTotal = () => {
    const beforeVat = parseFloat(calculateBeforeVat());
    const vat = parseFloat(calculateVat());
    return (beforeVat + vat).toFixed(2);
  };

  // ฟังก์ชันสำหรับการบันทึกข้อมูล
  const handleSubmit = (e) => {
    e.preventDefault();

    // รวมข้อมูลสำหรับการบันทึก
    const invoiceData = {
      ...formData,
      items: invoiceItems,
      subtotal: calculateSubtotal(),
      discount: calculateDiscount(),
      beforeVat: calculateBeforeVat(),
      vat: calculateVat(),
      total: calculateTotal(),
      status: "unpaid",
    };

    // ส่งข้อมูลไปยังฟังก์ชันที่รับมาจาก props
    if (onSave) {
      onSave(invoiceData);
    }

    // ปิดฟอร์ม
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
          <h1 className="text-xl font-bold">สร้างใบแจ้งหนี้ใหม่</h1>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md flex items-center hover:bg-gray-300 transition-colors"
            >
              <FiX className="mr-1" /> ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-500 text-white rounded-md flex items-center hover:bg-green-600 transition-colors"
            >
              <FiSave className="mr-1" /> บันทึก
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit}>
            {/* ข้อมูลทั่วไป */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* ข้อมูลใบแจ้งหนี้ */}
              <div>
                <h2 className="text-lg font-semibold border-b pb-2 mb-4">
                  ข้อมูลใบแจ้งหนี้
                </h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      เลขที่ใบแจ้งหนี้
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md p-2"
                      value={formData.invoiceNo}
                      onChange={(e) =>
                        setFormData({ ...formData, invoiceNo: e.target.value })
                      }
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      อ้างอิง
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md p-2"
                      placeholder="เลขอ้างอิง"
                      value={formData.reference}
                      onChange={(e) =>
                        setFormData({ ...formData, reference: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      วันที่
                    </label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-md p-2"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      วันครบกำหนด
                    </label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-md p-2"
                      value={formData.dueDate}
                      onChange={(e) =>
                        setFormData({ ...formData, dueDate: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    ชื่อผู้บันทึก
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md p-2"
                    value={formData.salesName}
                    onChange={(e) =>
                      setFormData({ ...formData, salesName: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* ข้อมูลลูกค้า */}
              <div>
                <h2 className="text-lg font-semibold border-b pb-2 mb-4">
                  ข้อมูลลูกค้า
                </h2>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    ลูกค้า
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-md p-2"
                    value={formData.customer}
                    onChange={(e) => {
                      // ในระบบจริงควรดึงข้อมูลลูกค้าจาก API
                      const customerData = {
                        customer1: {
                          name: "ABC TRAVEL",
                          phone: "077-123456",
                          address:
                            "123 ถ.ราษฎร์อุทิศ 200 ปี ต.ป่าตอง อ.กะทู้ จ.ภูเก็ต 83150",
                        },
                        customer2: {
                          name: "XYZ TOURS",
                          phone: "081-9876543",
                          address:
                            "456 ถ.พระบารมี ต.ป่าตอง อ.กะทู้ จ.ภูเก็ต 83150",
                        },
                      };

                      const selected = e.target.value;
                      if (customerData[selected]) {
                        setFormData({
                          ...formData,
                          customer: selected,
                          customerPhone: customerData[selected].phone,
                          customerAddress: customerData[selected].address,
                        });
                      } else {
                        setFormData({
                          ...formData,
                          customer: selected,
                          customerPhone: "",
                          customerAddress: "",
                        });
                      }
                    }}
                  >
                    <option value="">เลือกลูกค้า</option>
                    <option value="customer1">ABC TRAVEL</option>
                    <option value="customer2">XYZ TOURS</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    เบอร์โทรศัพท์
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md p-2"
                    placeholder="เบอร์โทรศัพท์"
                    value={formData.customerPhone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customerPhone: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    ที่อยู่
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md p-2 h-20"
                    placeholder="ที่อยู่ลูกค้า"
                    value={formData.customerAddress}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customerAddress: e.target.value,
                      })
                    }
                  ></textarea>
                </div>
              </div>
            </div>

            {/* ข้อมูลซัพพลายเออร์ */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold border-b pb-2 mb-4">
                ข้อมูลซัพพลายเออร์
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    รหัสซัพพลายเออร์
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-md p-2"
                    value={formData.supplier}
                    onChange={(e) => {
                      const selectedCode = e.target.value;
                      // Mapping ชื่อย่อกับชื่อเต็ม
                      const supplierMapping = {
                        TG: "THAI AIRWAYS INTERNATIONAL",
                        FD: "THAI AIR ASIA",
                        PG: "BANGKOK AIRWAYS",
                        "": "",
                      };

                      setFormData({
                        ...formData,
                        supplier: selectedCode,
                        supplierName: supplierMapping[selectedCode] || "",
                      });
                    }}
                  >
                    <option value="">เลือกซัพพลายเออร์</option>
                    <option value="TG">TG</option>
                    <option value="FD">FD</option>
                    <option value="PG">PG</option>
                  </select>
                </div>
                <div className="col-span-3">
                  <label className="block text-sm font-medium mb-1">
                    ชื่อซัพพลายเออร์
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md p-2 bg-gray-100"
                    value={formData.supplierName}
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* รายการสินค้า/บริการ */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold border-b pb-2 mb-4">
                รายการสินค้า/บริการ
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left">รายละเอียด</th>
                      <th className="px-4 py-2 text-right" width="100">
                        จำนวน
                      </th>
                      <th className="px-4 py-2 text-right" width="150">
                        ราคาต่อหน่วย
                      </th>
                      <th className="px-4 py-2 text-right" width="150">
                        จำนวนเงิน
                      </th>
                      <th className="px-4 py-2 text-center" width="50">
                        ลบ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceItems.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md p-2"
                            placeholder="รายละเอียดสินค้า/บริการ"
                            value={item.description}
                            onChange={(e) =>
                              updateItem(item.id, "description", e.target.value)
                            }
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="1"
                            className="w-full border border-gray-300 rounded-md p-2 text-right"
                            value={item.unit}
                            onChange={(e) =>
                              updateItem(item.id, "unit", e.target.value)
                            }
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-full border border-gray-300 rounded-md p-2 text-right"
                            placeholder="0.00"
                            value={item.unitPrice}
                            onChange={(e) =>
                              updateItem(item.id, "unitPrice", e.target.value)
                            }
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md p-2 text-right bg-gray-100"
                            placeholder="0.00"
                            value={item.amount}
                            readOnly
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-700"
                            disabled={invoiceItems.length === 1}
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                onClick={addItem}
                className="mt-4 flex items-center text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md text-sm transition-colors"
              >
                <FiPlus className="mr-2" /> เพิ่มรายการ
              </button>
            </div>

            {/* หมายเหตุ */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold border-b pb-2 mb-4">
                หมายเหตุ
              </h2>
              <textarea
                className="w-full border border-gray-300 rounded-md p-2 h-24"
                placeholder="หมายเหตุหรือเงื่อนไขการชำระเงิน"
                value={formData.note}
                onChange={(e) =>
                  setFormData({ ...formData, note: e.target.value })
                }
              ></textarea>
            </div>

            {/* สรุปยอดเงิน */}
            <div className="mb-6">
              <div className="flex justify-end">
                <div className="w-full md:w-1/2 lg:w-1/3 bg-gray-50 p-4 rounded-md">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-right font-medium">ยอดรวม:</div>
                    <div className="text-right">
                      {parseFloat(calculateSubtotal()).toLocaleString("th-TH")}{" "}
                      บาท
                    </div>

                    <div className="col-span-2 grid grid-cols-2 gap-4 items-center">
                      <div className="text-right font-medium">ส่วนลด (%):</div>
                      <div className="text-right">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          className="w-full border border-gray-300 rounded-md p-2 text-right"
                          value={formData.discount}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              discount: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="text-right font-medium">ส่วนลด:</div>
                    <div className="text-right">
                      {parseFloat(calculateDiscount()).toLocaleString("th-TH")}{" "}
                      บาท
                    </div>

                    <div className="text-right font-medium">ยอดก่อนภาษี:</div>
                    <div className="text-right">
                      {parseFloat(calculateBeforeVat()).toLocaleString("th-TH")}{" "}
                      บาท
                    </div>

                    <div className="col-span-2 grid grid-cols-2 gap-4 items-center">
                      <div className="text-right font-medium">
                        ภาษีมูลค่าเพิ่ม (%):
                      </div>
                      <div className="text-right">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          className="w-full border border-gray-300 rounded-md p-2 text-right"
                          value={formData.vat}
                          onChange={(e) =>
                            setFormData({ ...formData, vat: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="text-right font-medium">
                      ภาษีมูลค่าเพิ่ม:
                    </div>
                    <div className="text-right">
                      {parseFloat(calculateVat()).toLocaleString("th-TH")} บาท
                    </div>

                    <div className="text-right font-medium text-lg pt-2 border-t">
                      ยอดรวมทั้งสิ้น:
                    </div>
                    <div className="text-right text-blue-600 font-bold text-lg pt-2 border-t">
                      {parseFloat(calculateTotal()).toLocaleString("th-TH")} บาท
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t flex justify-center space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoice;
