import React, { useState } from "react";
import { FiEdit, FiPlus, FiTrash2, FiSave, FiX } from "react-icons/fi";
import SaleHeader from "./common/SaleHeader";
import PaymentMethodSection from "./common/PaymentMethodSection";
import PricingTable from "./common/PricingTable";
import TotalSummary from "./common/TotalSummary";
import usePricing from "../../hooks/usePricing";

const SaleVoucher = () => {
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
    voucherNo: "VC-" + new Date().getFullYear() + "001",
    reference: "",
    supplier: "",
    supplierName: "",
    serviceType: "bus",
    description: "",
    tripDate: "",
    hotel: "",
    roomNo: "",
    pickupTime: "",
    remark: "",
    paymentMethod: "",
    customerPayment: "",
  });

  const [pricing, setPricing] = useState({
    adult: { net: "", sale: "", pax: 0, total: 0 },
    child: { net: "", sale: "", pax: 0, total: 0 },
    infant: { net: "", sale: "", pax: 0, total: 0 },
  });

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

  // ฟังก์ชันจัดการการส่งฟอร์ม
  const handleSubmit = (e) => {
    e.preventDefault();
    // โค้ดสำหรับการบันทึกข้อมูล
    console.log("Form submitted", {
      formData,
      passengers,
      pricing,
    });
  };

  const [isOtherSelected, setIsOtherSelected] = useState(
    formData.bookingType === "other"
  );
  const handleRadioChange = (e) => {
    const value = e.target.value;
    setIsOtherSelected(value === "other");
    setFormData({
      ...formData,
      bookingType: value,
      // รีเซ็ต otherBookingType เฉพาะเมื่อเปลี่ยนจาก other ไปตัวอื่น
      otherBookingType: value !== "other" ? "" : formData.otherBookingType,
    });
  };

  const [passengers, setPassengers] = useState([{ id: 1, name: "" }]);

  const addPassenger = () => {
    setPassengers([...passengers, { id: passengers.length + 1, name: "" }]);
  };

  const removePassenger = (id) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter((p) => p.id !== id));
    }
  };
  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto">
        {/* Card หลัก */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
            <h1 className="text-xl font-bold">Sale Voucher</h1>
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
                                  ST: "Sun Travel",
                                  BB: "Blue Boat Co.",
                                  GT: "Green Tours",
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
                              <option value="ST">ST</option>
                              <option value="BB">BB</option>
                              <option value="GT">GT</option>
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
                      {/* ส่วนย่อยของประเภท */}
                      <div className="flex justify-center space-x-8 pb-2 relative">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="bus"
                            name="bookingType"
                            value="bus"
                            className="mr-2"
                          />
                          <label htmlFor="bus">BUS</label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="boat"
                            name="bookingType"
                            value="boat"
                            className="mr-2"
                          />
                          <label htmlFor="boat">BOAT</label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="tour"
                            name="bookingType"
                            value="tour"
                            className="mr-2"
                          />
                          <label htmlFor="tour">TOUR</label>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </div>

              {/* ่ส่วนรายละเอียดบริการ */}
              <div className="space-y-2 mt-6 ">
                <section className="border border-gray-400 rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-1  shadow-md">
                    <h2 className="text-white font-bold px-3 py-2 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 100-12 6 6 0 000 12z"
                          clipRule="evenodd"
                        />
                        <path d="M10 4a1 1 0 011 1v5a1 1 0 01-1 1H7a1 1 0 110-2h2V5a1 1 0 011-1z" />
                      </svg>
                      รายละเอียดบริการ
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                    <div className="px-4 pb-2 pt-4">
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                          รายละเอียด
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                          //placeholder="รายละเอียดทริป"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="mb-4 col-span-1">
                          <label className="block text-sm font-medium mb-1">
                            วันที่เดินทาง
                          </label>
                          <input
                            type="text"
                            className="w-full border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                            //placeholder="DDMMMYY"
                          />
                        </div>
                        <div className="mb-4 col-span-1">
                          <label className="block text-sm font-medium mb-1">
                            เวลารับ
                          </label>
                          <input
                            type="text"
                            className="w-full border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                            //placeholder="HH:MM - HH:MM"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="mb-4 col-span-1">
                          <label className="block text-sm font-medium mb-1">
                            โรงแรม
                          </label>
                          <input
                            type="text"
                            className="w-full border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                            //placeholder="ชื่อโรงแรม"
                          />
                        </div>
                        <div className="mb-4 col-span-1">
                          <label className="block text-sm font-medium mb-1">
                            เลขห้องพัก
                          </label>
                          <input
                            type="text"
                            className="w-full border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                            //placeholder="เลขห้องพัก"
                          />
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                          เลขอ้างอิง
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                          //placeholder="เลขอ้างอิงการจอง"
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                          หมายเหตุ
                        </label>
                        <textarea
                          className="w-full border border-gray-400 rounded-md p-2 h-24 focus:ring-blue-500 focus:border-blue-500"
                          //placeholder="หมายเหตุเพิ่มเติม"
                        ></textarea>
                      </div>
                    </div>
                    {/* ส่วนตารางราคายอดรวม */}
                    <div className="space-y-2 mt-6 pr-4">
                      <div className="grid grid-cols-1 gap-2 ">
                        {/* ส่วนตารางราคา */}
                        <section className="col-span-1 rounded-lg self-start overflow-hidden">
                          <PricingTable
                            pricing={pricing}
                            updatePricing={updatePricing}
                            // title="ตารางราคา"
                          />
                        </section>

                        {/* ส่วนยอดรวม */}
                        <section className="w-full h-full pt-2 col-span-1">
                          <div className="bg-blue-50 p-4 rounded-md shadow-sm h-full flex flex-col justify-center">
                            <div className="flex justify-between mb-3 items-center">
                              <div className="font-medium">รวมเป็นเงิน</div>
                              <div className="font-bold text-blue-600 text-xl">
                                0
                              </div>
                            </div>
                            <div className="flex justify-between mb-3 items-center">
                              <div className="font-medium">
                                ภาษีมูลค่าเพิ่ม 0%
                              </div>
                              <div className="text-gray-700">0</div>
                            </div>
                            <div className="flex justify-between items-center border-t border-blue-200 pt-3 mt-2">
                              <div className="font-semibold">
                                ยอดรวมทั้งสิ้น
                              </div>
                              <div className="font-bold text-blue-600 text-2xl">
                                0
                              </div>
                            </div>
                          </div>
                        </section>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
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

export default SaleVoucher;
