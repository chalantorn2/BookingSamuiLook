import React, { useState } from "react";
import { FiEdit, FiPlus, FiTrash2, FiSave, FiX } from "react-icons/fi";
import SaleHeader from "./common/SaleHeader";
import FormattedNumberInput from "../../common/FormattedNumberInput";
import PaymentMethodSection from "./common/PaymentMethodSection";
import PricingTable from "./common/PricingTable";
import TotalSummary from "./common/TotalSummary";
import usePricing from "../../../hooks/usePricing";

const SaleTicket = () => {
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
    ticketType: "bsp",
    paymentMethod: "",
    companyPaymentDetails: "",
    customerPayment: "",
    customerPaymentDetails: "",
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

  const [passengers, setPassengers] = useState([
    { id: 1, name: "", age: "", ticketNo: "" },
  ]);

  const [routes, setRoutes] = useState([
    {
      id: 1,
      date: "",
      airline: "",
      flight: "",
      origin: "",
      destination: "",
      departure: "",
      arrival: "",
    },
  ]);

  const [extras, setExtras] = useState([
    { id: 1, description: "", net: "", sale: "", pax: 1, total: "" },
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
        pax: 1,
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

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto">
        {/* Card หลัก */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
            <h1 className="text-xl font-bold">
              Sale Ticket / ขายตั๋วเครื่องบิน
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
            {/* วาง SaleHeader Component ตรงนี้ */}
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
                      <h2 className="font-semibold ">
                        ข้อมูลผู้โดยสาร (ทั้งหมด {passengers.length} คน)
                      </h2>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-26 gap-2 font-medium text-sm mb-2 px-2">
                        {/* <div className="col-span-1"></div> */}
                        <div className="ml-4 col-span-14">ชื่อผู้โดยสาร</div>
                        <div className="col-span-2 text-center">อายุ</div>
                        <div className="col-span-3 text-center">เลขที่ตั๋ว</div>
                      </div>
                      {passengers.map((passenger, index) => (
                        <div
                          key={passenger.id}
                          className="grid grid-cols-26 gap-2 mb-2"
                        >
                          <div className="flex col-span-14">
                            <div className="w-[16px] flex items-center justify-center mr-2">
                              <span className="font-medium">{index + 1}</span>
                            </div>
                            <input
                              type="text"
                              className="w-full border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div className="col-span-2">
                            <input
                              type="text"
                              className="w-full border border-gray-400 text-center rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div className="col-span-3">
                            <input
                              type="text"
                              className="w-full border border-gray-400 text-center rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div className="col-span-6">
                            <input
                              type="text"
                              className="w-full border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div className="col-span-1 flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => removePassenger(passenger.id)}
                              className="text-red-500 hover:text-red-700"
                              disabled={passengers.length === 1}
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </div>
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
                            className="w-full border border-gray-400  rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                            value={formData.supplier}
                            onChange={(e) => {
                              const selectedCode = e.target.value;
                              let fullName = "";
                              // สร้างการ mapping ชื่อย่อกับชื่อเต็ม
                              const airlineMapping = {
                                TG: "THAI AIRWAYS ",
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
                            className="w-full border border-gray-400  rounded-md p-2 bg-gray-100"
                            placeholder="ชื่อสายการบิน"
                            disabled
                            value={formData.supplierName}
                          />
                        </div>
                        <div className="col-span-4">
                          <label className="block text-sm font-medium mb-1">
                            Code
                          </label>
                          <input
                            type="text"
                            className="w-full border border-gray-400  rounded-md p-2"
                            placeholder=""
                          />
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>

            {/* ส่วนประเภทตั๋วและเส้นทาง */}
            <div className="space-y-2 mt-6">
              <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-1 rounded-lg shadow-md">
                <h2 className="text-white font-bold px-3 py-2 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                  </svg>
                  ประเภทตั๋วและเส้นทางการเดินทาง
                </h2>
              </div>
              <div className="grid grid-cols-10 gap-2">
                {/* เส้นทาง */}
                <section className="border border-gray-400 col-span-8 rounded-lg overflow-hidden">
                  <div className="bg-blue-100 text-blue-600 p-3 flex justify-between items-center">
                    <h2 className="font-semibold ">
                      เส้นทางการเดินทาง (ทั้งหมด {routes.length} เส้นทาง)
                    </h2>
                  </div>
                  <div className="p-4">
                    {routes.map((route, index) => (
                      <div
                        key={route.id}
                        className="mb-2 border border-gray-400 rounded-md p-3 bg-gray-50"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium text-sm">
                            เส้นทางที่ {index + 1}
                          </h3>
                          <button
                            type="button"
                            onClick={() => removeRoute(route.id)}
                            className="text-red-500 hover:text-red-700"
                            disabled={routes.length === 1}
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 text-center md:grid-cols-8 gap-3">
                          <div className="col-span-1">
                            <label className="block text-xs font-medium mb-1">
                              สายการบิน
                            </label>
                            <input
                              type="text"
                              className="w-full border border-gray-300  rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                              // placeholder="สายการบิน"
                            />
                          </div>
                          <div className="col-span-1">
                            <label className="block text-xs font-medium mb-1">
                              เที่ยวบิน
                            </label>
                            <input
                              type="text"
                              className="w-full border border-gray-300  rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                              // placeholder="เที่ยวบิน"
                            />
                          </div>
                          <div className="col-span-1">
                            <label className="block text-xs font-medium mb-1">
                              RBD
                            </label>
                            <input
                              type="text"
                              className="w-full border border-gray-300  rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                              // placeholder="คลาส"
                            />
                          </div>
                          <div className="col-span-1">
                            <label className="block text-xs font-medium mb-1">
                              วันที่
                            </label>
                            <input
                              type="text"
                              className="w-full border border-gray-300  rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                              // placeholder="DDMMM"
                            />
                          </div>
                          <div className="col-span-1">
                            <label className="block text-xs font-medium mb-1">
                              ต้นทาง
                            </label>
                            <input
                              type="text"
                              className="w-full border border-gray-300  rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                              // placeholder="ต้นทาง"
                            />
                          </div>
                          <div className="col-span-1">
                            <label className="block text-xs font-medium mb-1">
                              ปลายทาง
                            </label>
                            <input
                              type="text"
                              className="w-full border border-gray-300  rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                              // placeholder="ปลายทาง"
                            />
                          </div>
                          <div className="col-span-1">
                            <label className="block text-xs font-medium mb-1">
                              เวลาออก
                            </label>
                            <input
                              type="text"
                              className="w-full border border-gray-300  rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                              // placeholder="HH:MM"
                            />
                          </div>
                          <div className="col-span-1">
                            <label className="block text-xs font-medium mb-1">
                              เวลาถึง
                            </label>
                            <input
                              type="text"
                              className="w-full border border-gray-300  rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                              // placeholder="HH:MM"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addRoute}
                      className="mt-1 flex items-center text-white bg-green-500 hover:bg-green-600 px-3 py-2 rounded-md text-sm"
                    >
                      <FiPlus className="mr-1" /> เพิ่มเส้นทาง
                    </button>
                  </div>
                </section>
                {/* ประเภทตั๋ว */}
                <section className="border border-gray-400 col-span-2 self-start rounded-lg overflow-hidden">
                  <div className="bg-blue-100 text-blue-600 p-3">
                    <h2 className="font-semibold">ประเภทตั๋ว</h2>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-2">
                      {["BSP", "AIRLINE", "DOM", "WEB"].map((type) => (
                        <div key={type} className="flex items-center">
                          <input
                            type="radio"
                            id={type.toLowerCase()}
                            name="ticketType"
                            value={type.toLowerCase()}
                            checked={formData.ticketType === type.toLowerCase()}
                            onChange={() =>
                              setFormData({
                                ...formData,
                                ticketType: type.toLowerCase(),
                              })
                            }
                            className="mr-2 focus:ring-blue-500"
                          />
                          <label htmlFor={type.toLowerCase()}>{type}</label>
                        </div>
                      ))}
                      {/* B2B with input field */}
                      <div className="flex items-center col-span-2">
                        <input
                          type="radio"
                          id="b2b"
                          name="ticketType"
                          value="b2b"
                          checked={formData.ticketType === "b2b"}
                          onChange={() =>
                            setFormData({
                              ...formData,
                              ticketType: "b2b",
                            })
                          }
                          className="mr-2 focus:ring-blue-500"
                        />
                        <label htmlFor="b2b" className="mr-2">
                          B2B
                        </label>
                        <input
                          type="text"
                          className="flex-1 border w-full border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={formData.ticketType !== "b2b"}
                          value={formData.b2bDetails || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              b2bDetails: e.target.value,
                            })
                          }
                        />
                      </div>

                      {/* OTHER with input field */}
                      <div className="flex items-center col-span-2">
                        <input
                          type="radio"
                          id="other"
                          name="ticketType"
                          value="other"
                          checked={formData.ticketType === "other"}
                          onChange={() =>
                            setFormData({
                              ...formData,
                              ticketType: "other",
                            })
                          }
                          className="mr-2 focus:ring-blue-500"
                        />
                        <label htmlFor="other" className="mr-2">
                          OTHER
                        </label>
                        <input
                          type="text"
                          className="flex-1 border w-full border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={formData.ticketType !== "other"}
                          value={formData.otherDetails || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              otherDetails: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* ส่วนของรายการเพิ่มเติม */}
            <div className="space-y-6 mt-6">
              <section className="border border-gray-400 rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-1  shadow-md">
                  <h2 className="text-white font-bold px-3 py-2 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                    </svg>
                    รายการเพิ่มเติม (ทั้งหมด {extras.length} รายการ)
                  </h2>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-20 gap-3  text-center font-medium text-sm mb-2 px-2">
                    <div className="col-span-8 ml-4">รายละเอียด</div>
                    <div className="col-span-3">ราคาต้นทุน</div>
                    <div className="col-span-3">ราคาขาย</div>
                    <div className="col-span-1">จำนวน</div>
                    <div className="col-span-4">รวม</div>
                  </div>
                  {extras.map((item, index) => (
                    <div key={index} className="grid grid-cols-20 gap-3 mb-2">
                      <div className="flex col-span-8">
                        <div className="w-[16px] flex items-center justify-center mr-2">
                          <span className="font-medium">{index + 1}</span>
                        </div>
                        <input
                          type="text"
                          className="w-full border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                          // placeholder="รายละเอียด"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          className="w-full border text-end border-gray-400 appearance-none rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          className="w-full border text-end border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                        />
                      </div>
                      <div className="col-span-1">
                        <input
                          type="number"
                          min="1"
                          className="w-full  border text-center border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="1"
                        />
                      </div>
                      <div className="col-span-4 flex items-center">
                        <input
                          type="number"
                          className="w-full border text-end border-gray-400 rounded-md p-2 bg-gray-100 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                          disabled
                        />
                      </div>
                      <div className="col-span-1 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            const updatedExtras = [...extras];
                            updatedExtras.splice(index, 1);
                            setExtras(updatedExtras);
                          }}
                          className="text-red-500 hover:text-red-700"
                          disabled={extras.length === 1}
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setExtras([
                        ...extras,
                        { description: "", net: "", sale: "", quantity: 1 },
                      ]);
                    }}
                    className="mt-1 ml-6 flex items-center text-white bg-green-500 hover:bg-green-600 px-3 py-2 rounded-md text-sm"
                  >
                    <FiPlus className="mr-1" /> เพิ่มรายการ
                  </button>
                </div>
              </section>
            </div>

            {/* ส่วนตารางราคายอดรวม */}
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
                  ตารางราคาและยอดรวม
                </h2>
              </div>
              <div className="grid grid-cols-15 gap-2">
                {/* ส่วนตารางราคา */}
                <section className="col-span-10 rounded-lg self-start overflow-hidden">
                  <PricingTable
                    pricing={pricing}
                    updatePricing={updatePricing}
                    // title="ตารางราคา"
                  />
                </section>

                {/* ส่วนยอดรวม */}
                <section className="w-full h-full col-span-5">
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
                        { id: "otherCompany", value: "other", label: "อื่น ๆ" },
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
      </form>
    </div>
  );
};

export default SaleTicket;
