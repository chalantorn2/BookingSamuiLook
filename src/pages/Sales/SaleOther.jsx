import React, { useState, useEffect } from "react";
import { FiEdit, FiPlus, FiTrash2, FiSave, FiX } from "react-icons/fi";
import SaleHeader from "./common/SaleHeader";
import PaymentMethodSection from "./common/PaymentMethodSection";
import PricingTable from "./common/PricingTable";
// นำเข้าคอมโพเนนต์ฟอร์มแต่ละประเภท
import InsuranceForm from "./other/forms/InsuranceForm";
import HotelForm from "./other/forms/HotelForm";
import TrainForm from "./other/forms/TrainForm";
import VisaForm from "./other/forms/VisaForm";
import OtherServiceForm from "./other/forms/OtherServiceForm";

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
  const updatePricing = (category, field, value, newTotal) => {
    setPricing({
      ...pricing,
      [category]: {
        ...pricing[category],
        [field]: value,
        total: newTotal || pricing[category].total,
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
      pricing: pricing,
      updatePricing: updatePricing,
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
              {/* ส่วนซัพพลายเออร์และผู้โดยสาร */}
              <div className="space-y-2 mt-6">
                <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-1 rounded-lg shadow-md">
                  <h2 className="text-white font-bold px-3 py-2 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    ข้อมูลผู้โดยสารและซัพพลายเออร์
                  </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-15 gap-2">
                  {/* ข้อมูลผู้โดยสาร */}
                  <div className="col-span-10">
                    <section className="border border-gray-400 rounded-lg overflow-hidden h-full">
                      <div className="bg-blue-100 text-blue-600 p-3 flex justify-between items-center">
                        <h2 className="font-semibold">
                          ข้อมูลผู้โดยสาร (ทั้งหมด {passengers.length} คน)
                        </h2>
                      </div>
                      <div className="p-4">
                        {passengers.map((passenger, index) => (
                          <div
                            key={passenger.id}
                            className="flex items-center mb-2"
                          >
                            <div className="w-[16px] flex items-center justify-center mr-2">
                              <span className="font-medium">{index + 1}</span>
                            </div>
                            <input
                              type="text"
                              className="flex-1 w-full border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                              value={passenger.name}
                              onChange={(e) => {
                                const updatedPassengers = [...passengers];
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
                          className="mt-2 ml-6 flex items-center text-white bg-green-500 hover:bg-green-600 px-3 py-2 rounded-md text-sm"
                        >
                          <FiPlus className="mr-1" /> เพิ่มผู้โดยสาร
                        </button>
                      </div>
                    </section>
                  </div>

                  {/* ข้อมูลซัพพลายเออร์ */}
                  <div className="col-span-5 self-start ">
                    <section className="border border-gray-400 rounded-lg overflow-hidden">
                      <div className="bg-blue-100 text-blue-600 p-3">
                        <h2 className="font-semibold">ข้อมูลซัพพลายเออร์</h2>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              ผู้ให้บริการ
                            </label>
                            <select
                              className="w-full border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                              value={formData.supplier}
                              onChange={(e) => {
                                const selectedCode = e.target.value;
                                let fullName = "";
                                // สร้างการ mapping ชื่อย่อกับชื่อเต็ม
                                const providerMapping = {
                                  SM: "Smile Marine",
                                  OC: "Oceanic Cruise",
                                  TW: "Tropical Wave Travel",
                                  "": "",
                                };

                                fullName = providerMapping[selectedCode] || "";
                                setFormData({
                                  ...formData,
                                  supplier: selectedCode,
                                  supplierName: fullName,
                                });
                              }}
                            >
                              <option value="">เลือก</option>
                              <option value="SM">SM</option>
                              <option value="OC">OC</option>
                              <option value="TW">TW</option>
                            </select>
                          </div>
                          <div className="col-span-3">
                            <label className="block text-sm font-medium mb-1">
                              ชื่อเต็มผู้ให้บริการ
                            </label>
                            <input
                              type="text"
                              className="w-full border border-gray-400 rounded-md p-2 bg-gray-100"
                              placeholder="ชื่อผู้ให้บริการ"
                              disabled
                              value={formData.supplierName}
                            />
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </div>

              <section className="border border-gray-400 rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-1 shadow-md">
                  <h2 className="text-white font-bold px-3 py-2 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                    </svg>
                    ประเภทบริการ
                  </h2>
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
                  <div className="bg-blue-500 text-white p-2 mb-2 rounded-md">
                    <div className="text-center font-medium text-xl">
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

              {/* ส่วนยอดรวม */}
              <section className="w-full h-full pt-2 col-span-1">
                <div className="bg-blue-50 p-4 rounded-md shadow-sm h-full flex flex-col justify-center">
                  <div className="flex justify-between mb-3 items-center">
                    <div className="font-medium">รวมเป็นเงิน</div>
                    <div className="font-bold text-blue-600 text-xl">0</div>
                  </div>
                  <div className="flex justify-between mb-3 items-center">
                    <div className="font-medium">ภาษีมูลค่าเพิ่ม 0%</div>
                    <div className="text-gray-700">0</div>
                  </div>
                  <div className="flex justify-between items-center border-t border-blue-200 pt-3 mt-2">
                    <div className="font-semibold">ยอดรวมทั้งสิ้น</div>
                    <div className="font-bold text-blue-600 text-2xl">0</div>
                  </div>
                </div>
              </section>

              {/* ส่วนการชำระเงิน */}
              <div className="space-y-2 mt-6">
                <section className="border border-gray-400 rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-1 shadow-md">
                    <h2 className="text-white font-bold px-3 py-2 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                        <path
                          fillRule="evenodd"
                          d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      การชำระเงิน
                    </h2>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <PaymentMethodSection
                        title="การชำระเงินของบริษัท"
                        sectionType="company"
                        fieldName="paymentMethod"
                        detailsFieldName="paymentDetails"
                        options={[
                          {
                            id: "creditCardCompany",
                            value: "creditCard",
                            label: "เครดิตการ์ด",
                          },
                          {
                            id: "bankTransferCompany",
                            value: "bankTransfer",
                            label: "โอนเงินผ่านธนาคาร",
                          },
                          {
                            id: "cashCompany",
                            value: "cash",
                            label: "เงินสด",
                          },
                          {
                            id: "otherCompany",
                            value: "other",
                            label: "อื่น ๆ",
                          },
                        ]}
                        formData={formData}
                        setFormData={setFormData}
                        detailPlaceholder="รายละเอียดการชำระเงิน"
                      />

                      <PaymentMethodSection
                        title="การชำระเงินของลูกค้า"
                        sectionType="customer"
                        fieldName="customerPayment"
                        detailsFieldName="customerPaymentDetails"
                        options={[
                          {
                            id: "creditCardCustomer",
                            value: "creditCard",
                            label: "เครดิตการ์ด VISA / MSTR / AMEX / JCB",
                          },
                          {
                            id: "bankTransferCustomer",
                            value: "bankTransfer",
                            label: "โอนเงินผ่านธนาคาร",
                          },
                          {
                            id: "cashCustomer",
                            value: "cash",
                            label: "เงินสด",
                          },
                          {
                            id: "creditCustomer",
                            value: "credit",
                            label: "เครดิต",
                          },
                        ]}
                        formData={formData}
                        setFormData={setFormData}
                        detailPlaceholder="รายละเอียดการชำระเงิน"
                      />
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SaleOther;
