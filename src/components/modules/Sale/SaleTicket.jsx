import React, { useState } from "react";
import { FiEdit, FiPlus, FiTrash2, FiSave, FiX } from "react-icons/fi";
import SaleHeader from "./common/SaleHeader";
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
    customerPayment: "",
  });

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

  const [pricing, setPricing] = useState({
    adult: { net: "", sale: "", pax: 1 },
    child: { net: "", sale: "", pax: 0 },
    infant: { net: "", sale: "", pax: 0 },
  });

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

            {/* Collapsible Sections */}
            <div className="space-y-6">
              {/* ข้อมูลผู้โดยสาร */}
              <section className="border rounded-lg overflow-hidden">
                <div className="bg-blue-500 text-white p-3 flex justify-between items-center">
                  <h2 className="font-semibold">ข้อมูลผู้โดยสาร</h2>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-15 gap-2 font-medium text-sm mb-2 px-2">
                    <div className="col-span-5">ชื่อผู้โดยสาร</div>
                    <div className="col-span-2">อายุ</div>
                    <div className="col-span-2">รหัส</div>
                    <div className="col-span-5">เลขที่ตั๋ว</div>
                    <div className="col-span-1">ลบ</div>
                  </div>

                  {passengers.map((passenger, index) => (
                    <div
                      key={passenger.id}
                      className="grid grid-cols-15 gap-2 mb-2"
                    >
                      <div className="col-span-5">
                        <input
                          type="text"
                          className="w-full border border-gray-400  rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="ชื่อตามหนังสือเดินทาง"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          className="w-full border border-gray-400  rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="อายุ"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          className="w-full border border-gray-400  rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="รหัส"
                        />
                      </div>
                      <div className="col-span-5">
                        <input
                          type="text"
                          className="w-full border border-gray-400  rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="เลขที่ตั๋ว"
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
                        ชื่อย่อสายการบิน
                      </label>
                      <select
                        className="w-full border border-gray-400  rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.supplier}
                        onChange={(e) => {
                          const selectedCode = e.target.value;
                          let fullName = "";
                          // สร้างการ mapping ชื่อย่อกับชื่อเต็ม
                          const airlineMapping = {
                            TG: "THAI AIRWAYS INTERNATIONAL",
                            FD: "THAI AIR ASIA",
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
                        <option value="">เลือกชื่อย่อสายการบิน</option>
                        <option value="TG">TG</option>
                        <option value="FD">FD</option>
                        <option value="PG">PG</option>
                      </select>
                    </div>
                    <div className="col-span-3">
                      <label className="block text-sm font-medium mb-1">
                        ชื่อสายการบิน
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-400  rounded-md p-2 bg-gray-100"
                        placeholder="ชื่อสายการบิน"
                        disabled
                        value={formData.supplierName}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* เส้นทาง */}
              <section className="border rounded-lg overflow-hidden">
                <div className="bg-blue-500 text-white p-3 flex justify-between items-center">
                  <h2 className="font-semibold">เส้นทางการเดินทาง</h2>
                </div>
                <div className="p-4">
                  {routes.map((route, index) => (
                    <div
                      key={route.id}
                      className="mb-4 border rounded-md p-3 bg-gray-50"
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

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs font-medium mb-1">
                            วันที่
                          </label>
                          <input
                            type="text"
                            className="w-full border border-gray-400  rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="DDMMM"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">
                            สายการบิน
                          </label>
                          <input
                            type="text"
                            className="w-full border border-gray-400  rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="สายการบิน"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">
                            เที่ยวบิน
                          </label>
                          <input
                            type="text"
                            className="w-full border border-gray-400  rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="เที่ยวบิน"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-medium mb-1">
                              เวลาออก
                            </label>
                            <input
                              type="text"
                              className="w-full border border-gray-400  rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="HH:MM"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1">
                              เวลาถึง
                            </label>
                            <input
                              type="text"
                              className="w-full border border-gray-400  rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="HH:MM"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                        <div>
                          <label className="block text-xs font-medium mb-1">
                            ต้นทาง
                          </label>
                          <input
                            type="text"
                            className="w-full border border-gray-400  rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="สนามบินต้นทาง"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">
                            ปลายทาง
                          </label>
                          <input
                            type="text"
                            className="w-full border border-gray-400  rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="สนามบินปลายทาง"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addRoute}
                    className="mt-2 flex items-center text-white bg-green-500 hover:bg-green-600 px-3 py-2 rounded-md text-sm"
                  >
                    <FiPlus className="mr-1" /> เพิ่มเส้นทาง
                  </button>
                </div>
              </section>

              {/* ประเภทตั๋ว */}
              <section className="border  rounded-lg overflow-hidden">
                <div className="bg-blue-500 text-white p-3">
                  <h2 className="font-semibold">ประเภทตั๋ว</h2>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      "BSP",
                      "AIRLINE",
                      "DOM",
                      "WEB",
                      "B2B",
                      "GOV",
                      "GMT",
                      "OTHER",
                    ].map((type) => (
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
                  </div>
                </div>
              </section>

              {/* ส่วนของรายการเพิ่มเติม */}
              <div>
                <div className="bg-blue-500 text-white p-2 grid grid-cols-5 text-center">
                  <div>รายละเอียด</div>
                  <div>ราคาต้นทุน</div>
                  <div>ราคาขาย</div>
                  <div>จำนวน</div>
                  <div>รวม</div>
                </div>

                {extras.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-5 gap-2 p-2 border-b items-center"
                  >
                    <div>
                      <input
                        type="text"
                        className="w-full border border-gray-400  rounded-md p-2"
                        placeholder="รายละเอียด"
                        value={item.description}
                        onChange={(e) => {
                          const updatedExtras = [...extras];
                          updatedExtras[index].description = e.target.value;
                          setExtras(updatedExtras);
                        }}
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        className="w-full border border-gray-400  rounded-md p-2"
                        placeholder="0.00"
                        value={item.net}
                        onChange={(e) => {
                          const updatedExtras = [...extras];
                          updatedExtras[index].net = e.target.value;
                          setExtras(updatedExtras);
                        }}
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        className="w-full border border-gray-400  rounded-md p-2"
                        placeholder="0.00"
                        value={item.sale}
                        onChange={(e) => {
                          const updatedExtras = [...extras];
                          updatedExtras[index].sale = e.target.value;
                          setExtras(updatedExtras);
                        }}
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        min="1"
                        className="w-full border border-gray-400  rounded-md p-2"
                        placeholder="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const updatedExtras = [...extras];
                          updatedExtras[index].quantity = e.target.value;
                          setExtras(updatedExtras);
                        }}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        className="w-full border border-gray-400  rounded-md p-2 bg-gray-100"
                        placeholder="0.00"
                        disabled
                      />
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => {
                          const updatedExtras = [...extras];
                          updatedExtras.splice(index, 1);
                          setExtras(updatedExtras);
                        }}
                      >
                        <span className="text-red-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </span>
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  className="mt-2 flex items-center text-white bg-green-500 hover:bg-green-600 px-3 py-2 rounded-md text-sm"
                  onClick={() => {
                    setExtras([
                      ...extras,
                      { description: "", net: "", sale: "", quantity: 1 },
                    ]);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  เพิ่มรายการ
                </button>
              </div>

              {/* การชำระเงิน */}
              <section className="border rounded-lg overflow-hidden">
                <div className="bg-blue-500 text-white p-3">
                  <h2 className="font-semibold">การชำระเงิน</h2>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* การชำระเงินของเรา */}
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h3 className="font-medium mb-3">การชำระเงินของบริษัท</h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="creditCardCompany"
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
                          <label htmlFor="creditCardCompany" className="mr-2">
                            เครดิตการ์ด
                          </label>
                          <input
                            type="text"
                            className="flex-1 border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="รายละเอียดบัตร"
                            disabled={formData.paymentMethod !== "creditCard"}
                          />
                        </div>

                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="bankTransferCompany"
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
                          <label htmlFor="bankTransferCompany" className="mr-2">
                            โอนเงินผ่านธนาคาร
                          </label>
                          <input
                            type="text"
                            className="flex-1 border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="รายละเอียดธนาคาร"
                            disabled={formData.paymentMethod !== "bankTransfer"}
                          />
                        </div>
                      </div>
                    </div>

                    {/* การชำระเงินของลูกค้า */}
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h3 className="font-medium mb-3">การชำระเงินของลูกค้า</h3>
                      <div className="space-y-3">
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
                            checked={
                              formData.customerPayment === "bankTransfer"
                            }
                            onChange={() =>
                              setFormData({
                                ...formData,
                                customerPayment: "bankTransfer",
                              })
                            }
                            className="mr-2 focus:ring-blue-500"
                          />
                          <label
                            htmlFor="bankTransferCustomer"
                            className="mr-2"
                          >
                            โอนเงินผ่านธนาคาร
                          </label>
                          <input
                            type="text"
                            className="flex-1 border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="รายละเอียดธนาคาร"
                            disabled={
                              formData.customerPayment !== "bankTransfer"
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* ส่วนคำนวณราคาและยอดรวม */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* ส่วนตารางราคา */}
                <div className="lg:col-span-8">
                  <div className="mb-4">
                    <div className="bg-blue-500 text-white p-2 rounded-t-md grid grid-cols-4 text-center font-medium">
                      <div>Net</div>
                      <div>Sale</div>
                      <div>Pax</div>
                      <div>Total</div>
                    </div>

                    {/* Adult Row */}
                    <div className="grid grid-cols-4 gap-2 p-3 border-b border-x items-center bg-white">
                      <div className="flex items-center">
                        <span className="w-16 text-right font-medium">
                          Adult
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          className="w-full ml-2 border border-gray-400  rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          className="w-full border border-gray-400  rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          min="0"
                          className="w-full border border-gray-400  rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          className="w-full border border-gray-400  rounded-md p-2 bg-gray-100"
                          placeholder="0.00"
                          disabled
                        />
                      </div>
                    </div>

                    {/* Child Row */}
                    <div className="grid grid-cols-4 gap-2 p-3 border-b border-x items-center bg-white">
                      <div className="flex items-center">
                        <span className="w-16 text-right font-medium">
                          Child
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          className="w-full ml-2 border border-gray-400  rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          className="w-full border border-gray-400  rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          min="0"
                          className="w-full border border-gray-400  rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          className="w-full border border-gray-400  rounded-md p-2 bg-gray-100"
                          placeholder="0.00"
                          disabled
                        />
                      </div>
                    </div>

                    {/* Infant Row */}
                    <div className="grid grid-cols-4 gap-2 p-3 border-b border-x rounded-b-md items-center bg-white">
                      <div className="flex items-center">
                        <span className="w-16 text-right font-medium">
                          Infant
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          className="w-full ml-2 border border-gray-400  rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          className="w-full border border-gray-400  rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          min="0"
                          className="w-full border border-gray-400  rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          className="w-full border border-gray-400  rounded-md p-2 bg-gray-100"
                          placeholder="0.00"
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ส่วนยอดรวม */}
                <div className="lg:col-span-4">
                  <div className="bg-blue-50 p-4 rounded-md shadow-sm h-auto flex flex-col justify-center">
                    <div className="flex justify-between mb-3 items-center">
                      <div className="font-medium">ยอดรวมทั้งหมด</div>
                      <div className="font-bold text-blue-600 text-xl">
                        0.00
                      </div>
                    </div>
                    <div className="flex justify-between mb-3 items-center">
                      <div className="font-medium">ภาษีมูลค่าเพิ่ม 7%</div>
                      <div className="text-gray-700">0.00</div>
                    </div>
                    <div className="flex justify-between items-center border-t border-blue-200 pt-3 mt-2">
                      <div className="font-semibold">ยอดรวมทั้งสิ้น</div>
                      <div className="font-bold text-blue-600 text-2xl">
                        0.00
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ปุ่มบันทึกและยกเลิก */}
            <div className="mt-6 flex justify-center space-x-4">
              {/* <button
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
              </button> */}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SaleTicket;
