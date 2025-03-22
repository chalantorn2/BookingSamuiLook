import React, { useState } from "react";
import { FiEdit, FiPlus, FiTrash2, FiSave, FiX } from "react-icons/fi";
import SaleHeader from "./common/SaleHeader";

const SaleDeposit = () => {
  // สร้าง state สำหรับจัดการข้อมูล
  const [formData, setFormData] = useState({
    customer: "",
    contactDetails: "",
    phone: "",
    id: "",
    date: new Date().toISOString().split("T")[0],
    creditDays: "0",
    dueDate: "",
    salesName: "",
    depositNo: "DP-" + new Date().getFullYear() + "001",
    reference: "",
    supplier: "",
    supplierName: "",
    bookingType: "flight",
    paymentMethod: "",
    customerPayment: "",
    refundable: false,
    refundTerms: "",
  });

  const [depositItems, setDepositItems] = useState([
    { id: 1, description: "", amount: "", dueDate: "" },
  ]);

  // ฟังก์ชันสำหรับจัดการการเพิ่ม/ลบรายการ
  const addDepositItem = () => {
    setDepositItems([
      ...depositItems,
      { id: depositItems.length + 1, description: "", amount: "", dueDate: "" },
    ]);
  };

  const removeDepositItem = (id) => {
    if (depositItems.length > 1) {
      setDepositItems(depositItems.filter((item) => item.id !== id));
    }
  };

  // ฟังก์ชันคำนวณราคารวม
  const calculateTotal = () => {
    // ตัวอย่างการคำนวณอย่างง่าย
    return "0.00";
  };

  // ฟังก์ชันจัดการการส่งฟอร์ม
  const handleSubmit = (e) => {
    e.preventDefault();
    // โค้ดสำหรับการบันทึกข้อมูล
    console.log("Form submitted", {
      formData,
      depositItems,
    });
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto">
        {/* Card หลัก */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
            <h1 className="text-xl font-bold">Sale Deposit / วางมัดจำ</h1>
            <div className="flex space-x-2">
              {/* <button
                type="button"
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md flex items-center"
              >
                <FiX className="mr-1" /> ยกเลิก
              </button> */}
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded-md flex items-center"
              >
                <FiSave className="mr-1" /> บันทึก
              </button>
            </div>
          </div>

          {/* เนื้อหาหลัก */}
          <div className="p-6">
            {/* ข้อมูลลูกค้าและราคา */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <h2 className="text-lg font-semibold border-b pb-2 mb-4">
                  ข้อมูลลูกค้า
                </h2>
                <SaleHeader
                  formData={formData}
                  setFormData={setFormData}
                  section="customer"
                />
              </div>
              <div>
                <h2 className="text-lg font-semibold border-b pb-2 mb-4">
                  ราคาและวันที่
                </h2>
                <SaleHeader
                  formData={formData}
                  setFormData={setFormData}
                  section="price"
                />
              </div>
            </div>

            {/* Collapsible Sections */}
            <div className="space-y-6">
              {/* ข้อมูลซัพพลายเออร์ */}
              <section className="border border-gray-400 rounded-lg overflow-hidden">
                <div className="bg-blue-500 text-white p-3">
                  <h2 className="font-semibold">ข้อมูลซัพพลายเออร์</h2>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        ชื่อย่อซัพพลายเออร์
                      </label>
                      <select
                        className="w-full border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.supplier}
                        onChange={(e) => {
                          const selectedCode = e.target.value;
                          let fullName = "";
                          // สร้างการ mapping ชื่อย่อกับชื่อเต็ม
                          const supplierMapping = {
                            TG: "THAI AIRWAYS INTERNATIONAL",
                            FD: "THAI AIR ASIA",
                            PG: "BANGKOK AIRWAYS",
                            "": "",
                          };
                          fullName = supplierMapping[selectedCode] || "";
                          setFormData({
                            ...formData,
                            supplier: selectedCode,
                            supplierName: fullName,
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
                        className="w-full border border-gray-400 rounded-md p-2 bg-gray-100"
                        placeholder="ชื่อซัพพลายเออร์"
                        disabled
                        value={formData.supplierName}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* รายละเอียดการจอง */}
              <section className="border border-gray-400 rounded-lg overflow-hidden">
                <div className="bg-blue-500 text-white p-3">
                  <h2 className="font-semibold">รายละเอียดการจอง</h2>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        ประเภทการจอง
                      </label>
                      <select
                        className="w-full border border-gray-400 rounded-md p-2"
                        value={formData.bookingType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bookingType: e.target.value,
                          })
                        }
                      >
                        <option value="flight">Flight</option>
                        <option value="hotel">Hotel</option>
                        <option value="tour">Tour Package</option>
                        <option value="cruise">Cruise</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        วันที่เดินทาง/เช็คอิน
                      </label>
                      <input
                        type="date"
                        className="w-full border border-gray-400 rounded-md p-2"
                        value={formData.travelDateStart || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            travelDateStart: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        วันที่กลับ/เช็คเอาท์
                      </label>
                      <input
                        type="date"
                        className="w-full border border-gray-400 rounded-md p-2"
                        value={formData.travelDateEnd || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            travelDateEnd: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* รายละเอียดมัดจำ */}
              <section className="border border-gray-400 rounded-lg overflow-hidden">
                <div className="bg-blue-500 text-white p-3">
                  <h2 className="font-semibold">รายละเอียดมัดจำ</h2>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-12 gap-2 font-medium text-sm mb-2 px-2">
                    <div className="col-span-6">รายละเอียด</div>
                    <div className="col-span-3">จำนวนเงิน</div>
                    <div className="col-span-2">วันครบกำหนด</div>
                    <div className="col-span-1">ลบ</div>
                  </div>

                  {depositItems.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 mb-2">
                      <div className="col-span-6">
                        <input
                          type="text"
                          className="w-full border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="รายละเอียดมัดจำ"
                          value={item.description}
                          onChange={(e) => {
                            const updatedItems = [...depositItems];
                            const index = updatedItems.findIndex(
                              (i) => i.id === item.id
                            );
                            updatedItems[index].description = e.target.value;
                            setDepositItems(updatedItems);
                          }}
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          className="w-full border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                          value={item.amount}
                          onChange={(e) => {
                            const updatedItems = [...depositItems];
                            const index = updatedItems.findIndex(
                              (i) => i.id === item.id
                            );
                            updatedItems[index].amount = e.target.value;
                            setDepositItems(updatedItems);
                          }}
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="date"
                          className="w-full border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                          value={item.dueDate}
                          onChange={(e) => {
                            const updatedItems = [...depositItems];
                            const index = updatedItems.findIndex(
                              (i) => i.id === item.id
                            );
                            updatedItems[index].dueDate = e.target.value;
                            setDepositItems(updatedItems);
                          }}
                        />
                      </div>
                      <div className="col-span-1 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removeDepositItem(item.id)}
                          className="text-red-500 hover:text-red-700"
                          disabled={depositItems.length === 1}
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addDepositItem}
                    className="mt-2 flex items-center text-white bg-green-500 hover:bg-green-600 px-3 py-2 rounded-md text-sm"
                  >
                    <FiPlus className="mr-1" /> เพิ่มรายการ
                  </button>
                </div>
              </section>

              {/* ข้อมูลเพิ่มเติม */}
              <section className="border border-gray-400 rounded-lg overflow-hidden">
                <div className="bg-blue-500 text-white p-3">
                  <h2 className="font-semibold">ข้อมูลเพิ่มเติม</h2>
                </div>
                <div className="p-4">
                  <textarea
                    className="w-full border border-gray-400 rounded-md p-2 h-24 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ข้อมูลเพิ่มเติมหรือหมายเหตุ"
                    value={formData.additionalInfo || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        additionalInfo: e.target.value,
                      })
                    }
                  ></textarea>
                </div>
              </section>

              {/* การชำระเงินและนโยบายขอคืนเงิน */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* การชำระเงิน */}
                <section className="border border-gray-400 rounded-lg overflow-hidden">
                  <div className="bg-blue-500 text-white p-3">
                    <h2 className="font-semibold">การชำระเงิน</h2>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="cash"
                        name="paymentMethod"
                        value="cash"
                        checked={formData.paymentMethod === "cash"}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            paymentMethod: "cash",
                          })
                        }
                        className="mr-2 focus:ring-blue-500"
                      />
                      <label htmlFor="cash">เงินสด</label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="creditCard"
                        name="paymentMethod"
                        value="creditCard"
                        checked={formData.paymentMethod === "creditCard"}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            paymentMethod: "creditCard",
                          })
                        }
                        className="mr-2 focus:ring-blue-500"
                      />
                      <label htmlFor="creditCard" className="mr-2">
                        บัตรเครดิต
                      </label>
                      <input
                        type="text"
                        className="flex-1 border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="รายละเอียดบัตร"
                        disabled={formData.paymentMethod !== "creditCard"}
                        value={formData.cardDetails || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            cardDetails: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="bankTransfer"
                        name="paymentMethod"
                        value="bankTransfer"
                        checked={formData.paymentMethod === "bankTransfer"}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            paymentMethod: "bankTransfer",
                          })
                        }
                        className="mr-2 focus:ring-blue-500"
                      />
                      <label htmlFor="bankTransfer" className="mr-2">
                        โอนเงินผ่านธนาคาร
                      </label>
                      <input
                        type="text"
                        className="flex-1 border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="รายละเอียดการโอน"
                        disabled={formData.paymentMethod !== "bankTransfer"}
                        value={formData.bankDetails || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bankDetails: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </section>

                {/* นโยบายขอคืนเงิน */}
                <section className="border border-gray-400 rounded-lg overflow-hidden">
                  <div className="bg-blue-500 text-white p-3">
                    <h2 className="font-semibold">นโยบายการขอคืนเงินมัดจำ</h2>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="refundable"
                        className="mt-1 mr-2"
                        checked={formData.refundable}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            refundable: e.target.checked,
                          })
                        }
                      />
                      <label htmlFor="refundable" className="text-sm">
                        เงินมัดจำสามารถขอคืนได้ (มีเงื่อนไข)
                      </label>
                    </div>
                    <textarea
                      className="w-full border border-gray-400 rounded-md p-2 h-20 text-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="กรุณาระบุเงื่อนไขการขอคืนเงินมัดจำ"
                      disabled={!formData.refundable}
                      value={formData.refundTerms || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          refundTerms: e.target.value,
                        })
                      }
                    ></textarea>
                  </div>
                </section>
              </div>

              {/* ยอดรวม */}
              <div className="flex justify-end">
                <div className="w-1/3 bg-blue-50 p-4 rounded-md">
                  <div className="flex justify-between mb-2">
                    <div>ยอดมัดจำทั้งหมด</div>
                    <div className="font-bold text-blue-600">0.00</div>
                  </div>
                  <div className="flex justify-between mb-2">
                    <div>ภาษีมูลค่าเพิ่ม 7%</div>
                    <div>0.00</div>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <div>ยอดรวมทั้งสิ้น</div>
                    <div className="font-bold text-blue-600 text-xl">0.00</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ปุ่มบันทึกและยกเลิก */}
            <div className="mt-6 flex justify-center space-x-4">
              {/* <button
                type="submit"
                className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-200"
              >
                บันทึก
              </button> */}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SaleDeposit;
