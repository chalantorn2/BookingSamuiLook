import React, { useState, useEffect } from "react";
import { FiEdit, FiPlus, FiTrash2, FiSave, FiX } from "react-icons/fi";
import SaleHeader from "./common/SaleHeader";

// นำเข้าคอมโพเนนต์ฟอร์มแต่ละประเภท
import InsuranceForm from "./forms/InsuranceForm";
import HotelForm from "./forms/HotelForm";
import TrainForm from "./forms/TrainForm";
import VisaForm from "./forms/VisaForm";
import OtherServiceForm from "./forms/OtherServiceForm";

const SaleOther = ({ initialServiceType = "hotel" }) => {
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
    supplier: "",
    supplierName: "",
    serviceType: initialServiceType,
    paymentMethod: "",
    customerPayment: "",
  });

  // สร้าง state สำหรับข้อมูลฟอร์มแต่ละประเภท
  const [serviceFormData, setServiceFormData] = useState({});

  // State สำหรับการแสดงผู้โดยสาร
  const [passengers, setPassengers] = useState([{ id: 1, name: "" }]);

  // State สำหรับคำนวณราคา
  const [pricing, setPricing] = useState({
    adult: { net: "", sale: "", pax: 1, total: 0 },
    child: { net: "", sale: "", pax: 0, total: 0 },
    infant: { net: "", sale: "", pax: 0, total: 0 },
  });

  // อัปเดตประเภทบริการเมื่อ prop เปลี่ยน
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      serviceType: initialServiceType,
    }));
  }, [initialServiceType]);

  // ฟังก์ชันสำหรับจัดการการเพิ่ม/ลบรายการผู้โดยสาร
  const addPassenger = () => {
    setPassengers([...passengers, { id: passengers.length + 1, name: "" }]);
  };

  const removePassenger = (id) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter((p) => p.id !== id));
    }
  };

  // ฟังก์ชันอัพเดท pricing
  const updatePricing = (category, field, value) => {
    setPricing({
      ...pricing,
      [category]: {
        ...pricing[category],
        [field]: value,
        total:
          field === "pax" || field === "sale"
            ? calculateItemTotal(
                pricing[category].sale,
                value === "" ? pricing[category].pax : value
              )
            : calculateItemTotal(value, pricing[category].pax),
      },
    });
  };

  // ฟังก์ชันคำนวณราคารวมต่อรายการ
  const calculateItemTotal = (price, quantity) => {
    return (parseFloat(price || 0) * parseFloat(quantity || 0)).toFixed(2);
  };

  // ฟังก์ชันคำนวณราคารวมทั้งหมด
  const calculateTotal = () => {
    const adultTotal = parseFloat(pricing.adult.total || 0);
    const childTotal = parseFloat(pricing.child.total || 0);
    const infantTotal = parseFloat(pricing.infant.total || 0);

    return (adultTotal + childTotal + infantTotal).toFixed(2);
  };

  // ฟังก์ชันสำหรับเปลี่ยนประเภทบริการ
  const handleServiceTypeChange = (serviceType) => {
    setFormData({
      ...formData,
      serviceType,
    });
  };

  // ฟังก์ชันจัดการการส่งฟอร์ม
  const handleSubmit = (e) => {
    e.preventDefault();
    // โค้ดสำหรับการบันทึกข้อมูล
    console.log("Form submitted", {
      formData,
      serviceFormData,
      passengers,
      pricing,
    });
  };

  // ฟังก์ชันเลือกแสดงฟอร์มตามประเภทบริการ
  const renderServiceForm = () => {
    const commonProps = {
      formData: serviceFormData,
      setFormData: setServiceFormData,
    };

    switch (formData.serviceType) {
      case "insurance":
        return <InsuranceForm {...commonProps} />;
      case "hotel":
        return <HotelForm {...commonProps} />;
      case "train":
        return <TrainForm {...commonProps} />;
      case "visa":
        return <VisaForm {...commonProps} />;
      case "other":
        return <OtherServiceForm {...commonProps} />;
      default:
        return <HotelForm {...commonProps} />;
    }
  };

  // สร้างแท็บเลือกประเภทบริการ
  const ServiceTypeSelector = () => {
    const serviceTypes = [
      { id: "insurance", label: "ประกันการเดินทาง" },
      { id: "hotel", label: "โรงแรม" },
      { id: "train", label: "รถไฟ" },
      { id: "visa", label: "วีซ่า" },
      { id: "other", label: "บริการอื่นๆ" },
    ];

    return (
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {serviceTypes.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => handleServiceTypeChange(type.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                formData.serviceType === type.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto">
        {/* Card หลัก */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
            <h1 className="text-xl font-bold">
              Sale Other / ประกัน/โรงแรม/รถไฟ/วีซ่า/อื่นๆ
            </h1>
            <div className="flex space-x-2">
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md flex items-center"
              >
                <FiX className="mr-1" /> ยกเลิก
              </button>
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
                <div className="bg-blue-50 p-4 rounded-md mb-4">
                  <div className="text-sm text-gray-600 mb-1">
                    ยอดรวมทั้งสิ้น
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {calculateTotal()}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      วันที่:
                    </label>
                    <input
                      type="date"
                      className="w-full border rounded-md p-2"
                      value={formData.date || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      เครดิต (วัน):
                    </label>
                    <select
                      className="w-full border rounded-md p-2"
                      value={formData.creditDays || "0"}
                      onChange={(e) =>
                        setFormData({ ...formData, creditDays: e.target.value })
                      }
                    >
                      <option value="0">0</option>
                      <option value="7">7</option>
                      <option value="15">15</option>
                      <option value="30">30</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      วันครบกำหนด:
                    </label>
                    <input
                      type="date"
                      className="w-full border rounded-md p-2 bg-gray-100"
                      disabled
                      value={formData.dueDate || ""}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      ชื่อผู้บันทึก:
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded-md p-2"
                      placeholder="ชื่อผู้บันทึก"
                      value={formData.salesName || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, salesName: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Collapsible Sections */}
            <div className="space-y-6">
              {/* ข้อมูลผู้โดยสาร */}
              <section className="border rounded-lg overflow-hidden">
                <div className="bg-blue-500 text-white p-3 flex justify-between items-center">
                  <h2 className="font-semibold">ข้อมูลผู้โดยสาร</h2>
                </div>
                <div className="p-4">
                  <div className="bg-blue-500 text-white p-2 rounded-t-md">
                    <div className="text-center">ชื่อผู้โดยสาร</div>
                  </div>

                  {passengers.map((passenger) => (
                    <div
                      key={passenger.id}
                      className="p-2 border-b flex items-center"
                    >
                      <input
                        type="text"
                        className="flex-1 border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="ชื่อตามหนังสือเดินทาง"
                        value={passenger.name}
                        onChange={(e) => {
                          const updatedPassengers = [...passengers];
                          const index = updatedPassengers.findIndex(
                            (p) => p.id === passenger.id
                          );
                          updatedPassengers[index].name = e.target.value;
                          setPassengers(updatedPassengers);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removePassenger(passenger.id)}
                        className="ml-2 text-red-500 hover:text-red-700"
                        disabled={passengers.length === 1}
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addPassenger}
                    className="mt-2 flex items-center text-white bg-green-500 hover:bg-green-600 px-3 py-2 rounded-md text-sm"
                  >
                    <FiPlus className="mr-1" /> เพิ่มผู้โดยสาร
                  </button>
                </div>
              </section>

              {/* ข้อมูลซัพพลายเออร์ */}
              <section className="border rounded-lg overflow-hidden">
                <div className="bg-blue-500 text-white p-3">
                  <h2 className="font-semibold">ข้อมูลซัพพลายเออร์</h2>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        รหัสซัพพลายเออร์
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="รหัส"
                        value={formData.supplier}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            supplier: e.target.value,
                          });
                        }}
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-sm font-medium mb-1">
                        ชื่อซัพพลายเออร์
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="ชื่อซัพพลายเออร์"
                        value={formData.supplierName}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            supplierName: e.target.value,
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* ประเภทบริการ */}
              <section className="border rounded-lg overflow-hidden">
                <div className="bg-blue-500 text-white p-3">
                  <h2 className="font-semibold">ประเภทบริการ</h2>
                </div>
                <div className="p-4">
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: "insurance", label: "ประกันการเดินทาง" },
                        { id: "hotel", label: "โรงแรม" },
                        { id: "train", label: "รถไฟ" },
                        { id: "visa", label: "วีซ่า" },
                        { id: "other", label: "บริการอื่นๆ" },
                      ].map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => handleServiceTypeChange(type.id)}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            formData.serviceType === type.id
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* แสดงฟอร์มตามประเภทบริการที่เลือก */}
                  <div className="bg-blue-500 text-white p-2">
                    <div className="text-center font-medium">
                      {formData.serviceType === "insurance" &&
                        "ประกันการเดินทาง"}
                      {formData.serviceType === "hotel" && "โรงแรม"}
                      {formData.serviceType === "train" && "รถไฟ"}
                      {formData.serviceType === "visa" && "วีซ่า"}
                      {formData.serviceType === "other" && "บริการอื่นๆ"}
                    </div>
                  </div>

                  {renderServiceForm()}
                </div>
              </section>

              {/* ตารางราคา */}
              <section className="border rounded-lg overflow-hidden">
                <div className="bg-blue-500 text-white p-3">
                  <h2 className="font-semibold">ราคา</h2>
                </div>
                <div className="p-4">
                  <div className="mt-4">
                    {/* หัวข้อตาราง */}
                    <div className="bg-blue-500 text-white grid grid-cols-4 text-center p-2 rounded-t-md">
                      <div>Net</div>
                      <div>Sale</div>
                      <div>Pax</div>
                      <div>Total</div>
                    </div>

                    {/* แถวข้อมูล */}
                    <div>
                      {/* Adult */}
                      <div className="flex items-center border-b">
                        <span className="w-16 text-sm font-medium">Adult</span>
                        <div className="flex-1 grid grid-cols-4 gap-2 p-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-full border rounded-md p-2"
                            placeholder="0.00"
                            value={pricing.adult.net || ""}
                            onChange={(e) =>
                              updatePricing("adult", "net", e.target.value)
                            }
                          />
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-full border rounded-md p-2"
                            placeholder="0.00"
                            value={pricing.adult.sale || ""}
                            onChange={(e) =>
                              updatePricing("adult", "sale", e.target.value)
                            }
                          />
                          <input
                            type="number"
                            min="0"
                            className="w-full border rounded-md p-2"
                            placeholder="0"
                            value={pricing.adult.pax || ""}
                            onChange={(e) =>
                              updatePricing("adult", "pax", e.target.value)
                            }
                          />
                          <input
                            type="text"
                            className="w-full border rounded-md p-2 bg-gray-100"
                            placeholder="0.00"
                            value={pricing.adult.total || "0.00"}
                            disabled
                          />
                        </div>
                      </div>

                      {/* Child */}
                      <div className="flex items-center border-b">
                        <span className="w-16 text-sm font-medium">Child</span>
                        <div className="flex-1 grid grid-cols-4 gap-2 p-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-full border rounded-md p-2"
                            placeholder="0.00"
                            value={pricing.child.net || ""}
                            onChange={(e) =>
                              updatePricing("child", "net", e.target.value)
                            }
                          />
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-full border rounded-md p-2"
                            placeholder="0.00"
                            value={pricing.child.sale || ""}
                            onChange={(e) =>
                              updatePricing("child", "sale", e.target.value)
                            }
                          />
                          <input
                            type="number"
                            min="0"
                            className="w-full border rounded-md p-2"
                            placeholder="0"
                            value={pricing.child.pax || ""}
                            onChange={(e) =>
                              updatePricing("child", "pax", e.target.value)
                            }
                          />
                          <input
                            type="text"
                            className="w-full border rounded-md p-2 bg-gray-100"
                            placeholder="0.00"
                            value={pricing.child.total || "0.00"}
                            disabled
                          />
                        </div>
                      </div>

                      {/* Infant */}
                      <div className="flex items-center border-b">
                        <span className="w-16 text-sm font-medium">Infant</span>
                        <div className="flex-1 grid grid-cols-4 gap-2 p-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-full border rounded-md p-2"
                            placeholder="0.00"
                            value={pricing.infant.net || ""}
                            onChange={(e) =>
                              updatePricing("infant", "net", e.target.value)
                            }
                          />
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-full border rounded-md p-2"
                            placeholder="0.00"
                            value={pricing.infant.sale || ""}
                            onChange={(e) =>
                              updatePricing("infant", "sale", e.target.value)
                            }
                          />
                          <input
                            type="number"
                            min="0"
                            className="w-full border rounded-md p-2"
                            placeholder="0"
                            value={pricing.infant.pax || ""}
                            onChange={(e) =>
                              updatePricing("infant", "pax", e.target.value)
                            }
                          />
                          <input
                            type="text"
                            className="w-full border rounded-md p-2 bg-gray-100"
                            placeholder="0.00"
                            value={pricing.infant.total || "0.00"}
                            disabled
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* ยอดรวม */}
              <div className="flex justify-end mt-6">
                <div className="w-1/3">
                  <div className="flex justify-between mb-2">
                    <div>รวมเป็นเงิน</div>
                    <div className="font-bold text-blue-600">
                      {calculateTotal()}
                    </div>
                  </div>
                  <div className="flex justify-between mb-2">
                    <div>ภาษีมูลค่าเพิ่ม 0%</div>
                    <div>0.00</div>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <div>ยอดรวมทั้งสิ้น</div>
                    <div className="font-bold text-blue-600 text-xl">
                      {calculateTotal()}
                    </div>
                  </div>
                </div>
              </div>

              {/* การชำระเงินและนโยบายขอคืนเงิน */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* การชำระเงินของบริษัท */}
                <section className="border rounded-lg overflow-hidden">
                  <div className="bg-blue-500 text-white p-3">
                    <h2 className="font-semibold">การชำระเงินของบริษัท</h2>
                  </div>
                  <div className="p-4 space-y-3">
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
                        เครดิตการ์ด
                      </label>
                      <input
                        type="text"
                        className="flex-1 border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
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
                        className="flex-1 border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
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

                {/* การชำระเงินของลูกค้า */}
                <section className="border rounded-lg overflow-hidden">
                  <div className="bg-blue-500 text-white p-3">
                    <h2 className="font-semibold">การชำระเงินของลูกค้า</h2>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="cashCustomer"
                        name="customerPayment"
                        value="cash"
                        checked={formData.customerPayment === "cash"}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            customerPayment: "cash",
                          })
                        }
                        className="mr-2 focus:ring-blue-500"
                      />
                      <label htmlFor="cashCustomer">เงินสด</label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="creditCustomer"
                        name="customerPayment"
                        value="credit"
                        checked={formData.customerPayment === "credit"}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            customerPayment: "credit",
                          })
                        }
                        className="mr-2 focus:ring-blue-500"
                      />
                      <label htmlFor="creditCustomer">เครดิต</label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="creditCardCustomer"
                        name="customerPayment"
                        value="creditCard"
                        checked={formData.customerPayment === "creditCard"}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            customerPayment: "creditCard",
                          })
                        }
                        className="mr-2 focus:ring-blue-500"
                      />
                      <label htmlFor="creditCardCustomer">
                        เครดิตการ์ด VISA / MSTR / AMEX / JCB
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="bankTransferCustomer"
                        name="customerPayment"
                        value="bankTransfer"
                        checked={formData.customerPayment === "bankTransfer"}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            customerPayment: "bankTransfer",
                          })
                        }
                        className="mr-2 focus:ring-blue-500"
                      />
                      <label htmlFor="bankTransferCustomer" className="mr-2">
                        โอนเงินผ่านธนาคาร
                      </label>
                      <input
                        type="text"
                        className="flex-1 border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="รายละเอียดการโอน"
                        disabled={formData.customerPayment !== "bankTransfer"}
                        value={formData.customerBankDetails || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customerBankDetails: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </section>
              </div>

              {/* ปุ่มบันทึกและยกเลิก */}
              <div className="mt-6 flex justify-center space-x-4">
                <button
                  type="button"
                  className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-200"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-200"
                >
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SaleOther;
