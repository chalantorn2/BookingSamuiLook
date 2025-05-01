import React, { useState } from "react";
import { FiEdit, FiPlus, FiTrash2, FiSave, FiX } from "react-icons/fi";
import SaleHeader from "./components/SaleHeader";
import PaymentMethodSection from "./components/PaymentMethodSection";
import PricingTable from "./components/PricingTable";
import TotalSummary from "./components/TotalSummary";
import usePricing from "../../hooks/usePricing";

const SaleDeposit = () => {
  // สร้าง state สำหรับจัดการข้อมูล
  const [formData, setFormData] = useState({
    customer: "WYNDHAM/ANDREW JOHN MR",
    contactDetails: "88 หมู่ 7 ต.ไสไทย อ.เมือง จ.กระบี่ 89111",
    phone: "",
    id: "",
    date: new Date().toISOString().split("T")[0],
    creditDays: "0",
    dueDate: "",
    salesName: "นายชลันธร มานพ",
    depositNo: "DP-" + new Date().getFullYear() + "001",
    reference: "",
    supplier: "PG",
    supplierName: "BANGKOK AIRWAYS",
    bookingType: "flight",
    paymentMethod: "",
    customerPayment: "",
    refundable: false,
    refundTerms: "",
  });

  const {
    pricing,
    vatPercent,
    setVatPercent,
    updatePricing,
    calculateSubtotal,
    calculateVat,
    calculateTotal,
  } = usePricing();

  // State สำหรับข้อมูลผู้โดยสาร
  const [passengers, setPassengers] = useState([
    { id: 1, name: "WYNDHAM/ANDREW JOHN MR", age: "", ticketNo: "2401225695" },
    { id: 2, name: "WYNDHAM/ANDREW JOHN MR", age: "", ticketNo: "2401225696" },
    { id: 3, name: "WYNDHAM/ANDREW JOHN MR", age: "9", ticketNo: "2401225697" },
  ]);

  // State สำหรับข้อมูลเส้นทาง
  const [routes, setRoutes] = useState([
    {
      id: 1,
      date: "05APR",
      airline: "PG",
      flight: "4521",
      origin: "BKK",
      destination: "CNX",
      departure: "0700",
      arrival: "0800",
    },
    {
      id: 2,
      date: "05APR",
      airline: "PG",
      flight: "4521",
      origin: "BKK",
      destination: "CNX",
      departure: "0700",
      arrival: "0800",
    },
    {
      id: 3,
      date: "05APR",
      airline: "PG",
      flight: "4521",
      origin: "BKK",
      destination: "CNX",
      departure: "0700",
      arrival: "0800",
    },
    {
      id: 4,
      date: "05APR",
      airline: "PG",
      flight: "4521",
      origin: "BKK",
      destination: "CNX",
      departure: "0700",
      arrival: "0800",
    },
  ]);

  // State สำหรับรายการเพิ่มเติม
  const [extras, setExtras] = useState([
    {
      id: 1,
      description: "Book Seat",
      net: "500",
      sale: "600",
      pax: "1",
      total: "600",
    },
    {
      id: 2,
      description: "Baggage 10 กิโลกรัม",
      net: "1500",
      sale: "1600",
      pax: "1",
      total: "1600",
    },
  ]);

  const [depositItems, setDepositItems] = useState([
    { id: 1, description: "", amount: "", dueDate: "" },
  ]);

  // ฟังก์ชันสำหรับจัดการการเพิ่ม/ลบรายการ
  const addPassenger = () => {
    setPassengers([
      ...passengers,
      { id: passengers.length + 1, name: "", age: "", ticketNo: "" },
    ]);
  };

  const removePassenger = (id) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter((p) => p.id !== id));
    }
  };

  const addRoute = () => {
    setRoutes([
      ...routes,
      {
        id: routes.length + 1,
        date: "",
        airline: "",
        flight: "",
        origin: "",
        destination: "",
        departure: "",
        arrival: "",
      },
    ]);
  };

  const removeRoute = (id) => {
    if (routes.length > 1) {
      setRoutes(routes.filter((r) => r.id !== id));
    }
  };

  const addExtra = () => {
    setExtras([
      ...extras,
      {
        id: extras.length + 1,
        description: "",
        net: "",
        sale: "",
        pax: "1",
        total: "",
      },
    ]);
  };

  const removeExtra = (id) => {
    if (extras.length > 1) {
      setExtras(extras.filter((e) => e.id !== id));
    }
  };

  // ฟังก์ชันจัดการการส่งฟอร์ม
  const handleSubmit = (e) => {
    e.preventDefault();
    // โค้ดสำหรับการบันทึกข้อมูล
    console.log("Form submitted", {
      formData,
      passengers,
      routes,
      extras,
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

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto">
        {/* Card หลัก */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
            <h1 className="text-xl font-bold">Sale Deposit / วางมัดจำ</h1>
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
                    ข้อมูลกรุ๊ปและซัพพลายเออร์
                  </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-15 gap-2">
                  {/* ข้อมูลผู้โดยสาร */}
                  <div className="col-span-10">
                    <section className="border border-gray-400 rounded-lg overflow-hidden h-full">
                      <div className="bg-blue-100 text-blue-600 p-3 flex justify-between items-center">
                        <h2 className="font-semibold">ชื่อกรุ๊ป</h2>
                      </div>
                      <div className="p-2">
                        <input
                          type="text"
                          className="w-full border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      {/* ส่วนย่อยของประเภท */}
                      <div className="flex justify-center space-x-8 mt-2 relative">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="airTicket"
                            name="bookingType"
                            value="airTicket"
                            checked={formData.bookingType === "airTicket"}
                            onChange={handleRadioChange}
                            className="mr-2"
                          />
                          <label htmlFor="airTicket">AIR TICKET</label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="package"
                            name="bookingType"
                            value="package"
                            checked={formData.bookingType === "package"}
                            onChange={handleRadioChange}
                            className="mr-2"
                          />
                          <label htmlFor="package">PACKAGE</label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="land"
                            name="bookingType"
                            value="land"
                            checked={formData.bookingType === "land"}
                            onChange={handleRadioChange}
                            className="mr-2"
                          />
                          <label htmlFor="land">LAND</label>
                        </div>
                        <div className="flex items-center relative">
                          <input
                            type="radio"
                            id="other"
                            name="bookingType"
                            value="other"
                            checked={formData.bookingType === "other"}
                            onChange={handleRadioChange}
                            className="mr-2"
                          />
                          <label htmlFor="other">OTHER</label>
                          {isOtherSelected && (
                            <input
                              type="text"
                              placeholder=""
                              className="absolute left-full ml-2 border border-gray-400 rounded px-2 py-1 w-40"
                              value={formData.otherBookingType || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  otherBookingType: e.target.value,
                                })
                              }
                            />
                          )}
                        </div>
                      </div>
                    </section>
                  </div>

                  {/* ข้อมูลซัพพลายเออร์ */}
                  <div className="col-span-5 self-start">
                    <section className="border border-gray-400 rounded-lg overflow-hidden">
                      <div className="bg-blue-100 text-blue-600 p-3">
                        <h2 className="font-semibold">ข้อมูลซัพพลายเออร์</h2>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              สายการบิน
                            </label>
                            <select
                              className="w-full border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                              value={formData.supplier}
                              onChange={(e) => {
                                const selectedCode = e.target.value;
                                let fullName = "";
                                // สร้างการ mapping ชื่อย่อกับชื่อเต็ม
                                const airlineMapping = {
                                  TG: "THAI AIRWAYS",
                                  FD: "AIR ASIA",
                                  PG: "BANGKOK AIRWAYS",
                                  "": "",
                                };
                                fullName = airlineMapping[selectedCode] || "";
                                setFormData({
                                  ...formData,
                                  supplier: selectedCode,
                                  supplierName: fullName,
                                });
                              }}
                            >
                              <option value="">เลือก</option>
                              <option value="TG">TG</option>
                              <option value="FD">FD</option>
                              <option value="PG">PG</option>
                            </select>
                          </div>
                          <div className="col-span-3">
                            <label className="block text-sm font-medium mb-1">
                              ชื่อเต็มสายการบิน
                            </label>
                            <input
                              type="text"
                              className="w-full border border-gray-400 rounded-md p-2 bg-gray-100"
                              placeholder="ชื่อสายการบิน"
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

              {/* ส่วนรายการและราคา */}
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
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                        clipRule="evenodd"
                      />
                      <path d="M9 12a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" />
                    </svg>
                    รายการและราคา
                  </h2>
                </div>
                <div className="grid grid-cols-15 gap-2">
                  {/* ส่วนรายการ */}
                  <section className="col-span-6 border border-gray-400 h-full rounded-lg self-start overflow-hidden">
                    <div className="bg-blue-100 text-blue-600 p-3">
                      <h2 className="font-semibold">รายละเอียดรายการ</h2>
                    </div>
                    <div className="p-4">
                      <textarea
                        className="w-full border border-gray-400 rounded-md p-2 h-full focus:ring-blue-500 focus:border-blue-500"
                        // placeholder="รายละเอียดการจองและการเดินทาง..."
                      ></textarea>
                    </div>
                  </section>

                  {/* ส่วนตารางราคา */}
                  <section className="col-span-9 rounded-lg self-start overflow-hidden">
                    <PricingTable
                      pricing={pricing}
                      updatePricing={updatePricing}
                      // title="ตารางราคา"
                    />
                  </section>
                </div>
                <div className="grid grid-cols-15 gap-2">
                  {/* ส่วนซ้าย - ตารางข้อมูล Deposit */}
                  <section className="col-span-6 h-full border border-gray-400 rounded-lg self-start overflow-hidden">
                    <div className="p-4">
                      <div className="space-y-2 ">
                        <div className="flex items-center pb-2 ">
                          <input
                            type="radio"
                            id="deposit"
                            // checked
                            className="mr-2"
                          />
                          <label
                            htmlFor="deposit"
                            className="font-medium text-lg"
                          >
                            Deposit
                          </label>
                        </div>
                        <div className="items-center grid grid-cols-5">
                          <div className="col-span-2  text-red-500">
                            ชำระเงินมัดจำภายในวันที่
                          </div>
                          <div className="col-span-3">
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded-md p-2 "
                            />
                          </div>
                        </div>

                        <div className="items-center grid grid-cols-5">
                          <div className="col-span-2  text-red-500">
                            แจ้งชื่อผู้โดยสารก่อนวันที่
                          </div>
                          <div className="col-span-3">
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded-md p-2"
                            />
                          </div>
                        </div>

                        <div className="items-center grid grid-cols-5">
                          <div className="col-span-2  text-red-500">
                            ชำระทั้งหมดภายในวันที่
                          </div>
                          <div className="col-span-3">
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded-md p-2"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* ส่วนขวา - รายละเอียด Deposit และยอดรวม */}
                  <section className="col-span-9 border border-gray-400 rounded-lg self-start overflow-hidden">
                    <div className="pt-2">
                      <div className="grid grid-cols-12 gap-2 p-1 pl-3 items-center  bg-white">
                        <div className="col-span-1 gap-2">
                          <span className="col-span-1 font-medium  ">
                            Deposit
                          </span>
                        </div>
                        <div className="col-span-3"></div>
                        <div className="col-span-3">
                          <input
                            type="number"
                            min="0"
                            step="1"
                            className="w-full border border-gray-400 text-right rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0"
                          />
                        </div>
                        <div className="col-span-1">
                          <input
                            type="number"
                            min="0"
                            className="w-full border border-gray-400 text-center rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0"
                          />
                        </div>
                        <div className="col-span-4">
                          <input
                            type="text"
                            className="w-full border border-gray-400 text-right rounded-md p-2 bg-gray-100"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div className="grid p-1 gap-6 ">
                        <div className="col-span-1"></div>
                        <div className="col-span-1 bg-blue-50 p-4 rounded-md">
                          <div className="grid grid-cols-2 gap-4 mb-2">
                            <div>รวมเป็นเงิน</div>
                            <div className="text-right font-medium">0</div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mb-2">
                            <div>ภาษีมูลค่าเพิ่ม 0%</div>
                            <div className="text-right"></div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 border-t pt-2">
                            <div className="font-medium">ยอดรวมทั้งสิ้น</div>
                            <div className="text-right font-bold text-blue-600 text-xl">
                              0
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
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

export default SaleDeposit;
