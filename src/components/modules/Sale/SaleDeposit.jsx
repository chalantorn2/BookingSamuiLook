import React, { useState } from "react";
import { FiEdit, FiPlus, FiTrash2, FiSave, FiX } from "react-icons/fi";
import SaleHeader from "./common/SaleHeader";

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

  // State สำหรับราคา
  const [pricing, setPricing] = useState({
    adult: { net: "8,000", sale: "10,000", pax: "20", total: "200,000" },
    child: { net: "", sale: "", pax: "" },
    infant: { net: "", sale: "", pax: "" },
  });

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
              {/* ข้อมูลผู้โดยสาร */}
              <section className="border border-gray-400 rounded-lg overflow-hidden">
                <div className="bg-blue-500 text-white p-3 flex justify-between items-center">
                  <h2 className="font-semibold">ข้อมูลผู้โดยสาร</h2>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-4 gap-2 font-medium text-sm mb-2 px-2">
                    <div>Passenger Name</div>
                    <div>Age</div>
                    <div>Ticket NO</div>
                    <div></div>
                  </div>

                  {passengers.map((passenger, index) => (
                    <div
                      key={passenger.id}
                      className="grid grid-cols-4 gap-2 mb-2"
                    >
                      <div>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="ชื่อตามหนังสือเดินทาง"
                          value={passenger.name}
                          onChange={(e) => {
                            const updatedPassengers = [...passengers];
                            updatedPassengers[index].name = e.target.value;
                            setPassengers(updatedPassengers);
                          }}
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="อายุ"
                          value={passenger.age}
                          onChange={(e) => {
                            const updatedPassengers = [...passengers];
                            updatedPassengers[index].age = e.target.value;
                            setPassengers(updatedPassengers);
                          }}
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="เลขที่ตั๋ว"
                          value={passenger.ticketNo}
                          onChange={(e) => {
                            const updatedPassengers = [...passengers];
                            updatedPassengers[index].ticketNo = e.target.value;
                            setPassengers(updatedPassengers);
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-center">
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
                    <FiPlus className="mr-1" /> Add
                  </button>
                </div>
              </section>

              {/* ข้อมูลซัพพลายเออร์ */}
              <section className="border border-gray-400 rounded-lg overflow-hidden">
                <div className="bg-blue-500 text-white p-3">
                  <h2 className="font-semibold">Supplier</h2>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="PG"
                        value={formData.supplier}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            supplier: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="BANGKOK AIRWAYS"
                        value={formData.supplierName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            supplierName: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1">
                      Code
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Code"
                    />
                  </div>
                </div>
              </section>

              {/* Routing Information */}
              <section className="border border-gray-400 rounded-lg overflow-hidden">
                <div className="bg-blue-500 text-white p-3">
                  <h2 className="font-semibold">Routing Information</h2>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-7 gap-2 font-medium text-sm mb-2 px-2">
                    <div>Date</div>
                    <div>Airline</div>
                    <div>Flight</div>
                    <div>Origin</div>
                    <div>Desti</div>
                    <div>Departure</div>
                    <div>Arrive</div>
                  </div>

                  {routes.map((route, index) => (
                    <div key={route.id} className="grid grid-cols-7 gap-2 mb-2">
                      <div>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                          value={route.date}
                          onChange={(e) => {
                            const updatedRoutes = [...routes];
                            updatedRoutes[index].date = e.target.value;
                            setRoutes(updatedRoutes);
                          }}
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                          value={route.airline}
                          onChange={(e) => {
                            const updatedRoutes = [...routes];
                            updatedRoutes[index].airline = e.target.value;
                            setRoutes(updatedRoutes);
                          }}
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                          value={route.flight}
                          onChange={(e) => {
                            const updatedRoutes = [...routes];
                            updatedRoutes[index].flight = e.target.value;
                            setRoutes(updatedRoutes);
                          }}
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                          value={route.origin}
                          onChange={(e) => {
                            const updatedRoutes = [...routes];
                            updatedRoutes[index].origin = e.target.value;
                            setRoutes(updatedRoutes);
                          }}
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                          value={route.destination}
                          onChange={(e) => {
                            const updatedRoutes = [...routes];
                            updatedRoutes[index].destination = e.target.value;
                            setRoutes(updatedRoutes);
                          }}
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                          value={route.departure}
                          onChange={(e) => {
                            const updatedRoutes = [...routes];
                            updatedRoutes[index].departure = e.target.value;
                            setRoutes(updatedRoutes);
                          }}
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                          value={route.arrival}
                          onChange={(e) => {
                            const updatedRoutes = [...routes];
                            updatedRoutes[index].arrival = e.target.value;
                            setRoutes(updatedRoutes);
                          }}
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addRoute}
                    className="mt-2 flex items-center text-white bg-green-500 hover:bg-green-600 px-3 py-2 rounded-md text-sm"
                  >
                    <FiPlus className="mr-1" /> Add
                  </button>
                </div>
              </section>

              {/* Type */}
              <section className="border border-gray-400 rounded-lg overflow-hidden">
                <div className="bg-blue-500 text-white p-3">
                  <h2 className="font-semibold">Type</h2>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="bsp"
                        name="ticketType"
                        checked={true}
                        className="mr-2 focus:ring-blue-500"
                      />
                      <label htmlFor="bsp">BSP</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="airline"
                        name="ticketType"
                        className="mr-2 focus:ring-blue-500"
                      />
                      <label htmlFor="airline">AIRLINE</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="dom"
                        name="ticketType"
                        className="mr-2 focus:ring-blue-500"
                      />
                      <label htmlFor="dom">DOM</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="web"
                        name="ticketType"
                        className="mr-2 focus:ring-blue-500"
                      />
                      <label htmlFor="web">WEB</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="b2b"
                        name="ticketType"
                        className="mr-2 focus:ring-blue-500"
                      />
                      <label htmlFor="b2b">B2B</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="gov"
                        name="ticketType"
                        className="mr-2 focus:ring-blue-500"
                      />
                      <label htmlFor="gov">GOV</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="other"
                        name="ticketType"
                        className="mr-2 focus:ring-blue-500"
                      />
                      <label htmlFor="other">OTHER</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="gmt"
                        name="ticketType"
                        className="mr-2 focus:ring-blue-500"
                      />
                      <label htmlFor="gmt">GMT</label>
                    </div>
                  </div>
                </div>
              </section>

              {/* Other */}
              <section className="border border-gray-400 rounded-lg overflow-hidden">
                <div className="bg-blue-500 text-white p-3">
                  <h2 className="font-semibold">Other</h2>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="col-span-1 font-medium text-sm">Other</div>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="font-medium text-sm">Net</div>
                      <div className="font-medium text-sm">Sale</div>
                      <div className="font-medium text-sm">Pax</div>
                      <div className="font-medium text-sm">Total</div>
                    </div>
                  </div>

                  {extras.map((extra, index) => (
                    <div key={extra.id} className="grid grid-cols-2 gap-2 mb-2">
                      <div>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                          value={extra.description}
                          onChange={(e) => {
                            const updatedExtras = [...extras];
                            updatedExtras[index].description = e.target.value;
                            setExtras(updatedExtras);
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                            value={extra.net}
                            onChange={(e) => {
                              const updatedExtras = [...extras];
                              updatedExtras[index].net = e.target.value;
                              setExtras(updatedExtras);
                            }}
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                            value={extra.sale}
                            onChange={(e) => {
                              const updatedExtras = [...extras];
                              updatedExtras[index].sale = e.target.value;
                              setExtras(updatedExtras);
                            }}
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                            value={extra.pax}
                            onChange={(e) => {
                              const updatedExtras = [...extras];
                              updatedExtras[index].pax = e.target.value;
                              setExtras(updatedExtras);
                            }}
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
                            value={extra.total}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addExtra}
                    className="mt-2 flex items-center text-white bg-green-500 hover:bg-green-600 px-3 py-2 rounded-md text-sm"
                  >
                    <FiPlus className="mr-1" /> Add
                  </button>
                </div>
              </section>

              {/* ตารางราคา */}
              <section className="border border-gray-400 rounded-lg overflow-hidden">
                <div className="p-4">
                  <div className="grid grid-cols-5 gap-4 mb-4">
                    <div></div>
                    <div className="text-center font-medium text-sm">Net</div>
                    <div className="text-center font-medium text-sm">Sale</div>
                    <div className="text-center font-medium text-sm">Pax</div>
                    <div className="text-center font-medium text-sm">Total</div>
                  </div>

                  {/* Adult */}
                  <div className="grid grid-cols-5 gap-4 mb-2">
                    <div className="font-medium text-sm flex items-center">
                      Adult
                    </div>
                    <div>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        value={pricing.adult.net}
                        onChange={(e) => {
                          setPricing({
                            ...pricing,
                            adult: {
                              ...pricing.adult,
                              net: e.target.value,
                            },
                          });
                        }}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        value={pricing.adult.sale}
                        onChange={(e) => {
                          setPricing({
                            ...pricing,
                            adult: {
                              ...pricing.adult,
                              sale: e.target.value,
                            },
                          });
                        }}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        value={pricing.adult.pax}
                        onChange={(e) => {
                          setPricing({
                            ...pricing,
                            adult: {
                              ...pricing.adult,
                              pax: e.target.value,
                            },
                          });
                        }}
                      />
                    </div>
                    <div className="font-bold">{pricing.adult.total}</div>
                  </div>

                  {/* Child */}
                  <div className="grid grid-cols-5 gap-4 mb-2">
                    <div className="font-medium text-sm flex items-center">
                      Child
                    </div>
                    <div>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        value={pricing.child.net}
                        onChange={(e) => {
                          setPricing({
                            ...pricing,
                            child: {
                              ...pricing.child,
                              net: e.target.value,
                            },
                          });
                        }}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        value={pricing.child.sale}
                        onChange={(e) => {
                          setPricing({
                            ...pricing,
                            child: {
                              ...pricing.child,
                              sale: e.target.value,
                            },
                          });
                        }}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        value={pricing.child.pax}
                        onChange={(e) => {
                          setPricing({
                            ...pricing,
                            child: {
                              ...pricing.child,
                              pax: e.target.value,
                            },
                          });
                        }}
                      />
                    </div>
                    <div></div>
                  </div>

                  {/* Infant */}
                  <div className="grid grid-cols-5 gap-4 mb-4">
                    <div className="font-medium text-sm flex items-center">
                      Infant
                    </div>
                    <div>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        value={pricing.infant.net}
                        onChange={(e) => {
                          setPricing({
                            ...pricing,
                            infant: {
                              ...pricing.infant,
                              net: e.target.value,
                            },
                          });
                        }}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        value={pricing.infant.sale}
                        onChange={(e) => {
                          setPricing({
                            ...pricing,
                            infant: {
                              ...pricing.infant,
                              sale: e.target.value,
                            },
                          });
                        }}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        value={pricing.infant.pax}
                        onChange={(e) => {
                          setPricing({
                            ...pricing,
                            infant: {
                              ...pricing.infant,
                              pax: e.target.value,
                            },
                          });
                        }}
                      />
                    </div>
                    <div></div>
                  </div>
                </div>
              </section>

              {/* ยอดรวม */}
              <div className="grid grid-cols-2 gap-6 mt-4">
                <div className="col-span-1"></div>
                <div className="col-span-1 bg-blue-50 p-4 rounded-md">
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>รวมเป็นเงิน</div>
                    <div className="text-right font-medium">202,200</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>ภาษีมูลค่าเพิ่ม 0%</div>
                    <div className="text-right"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-t pt-2">
                    <div className="font-medium">ยอดรวมทั้งสิ้น</div>
                    <div className="text-right font-bold text-blue-600 text-xl">
                      202,200
                    </div>
                  </div>
                </div>
              </div>

              {/* การชำระเงินและนโยบายขอคืนเงิน */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Payment */}
                <section className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50 p-4">
                  <h2 className="font-medium mb-3">Payment</h2>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="creditCard"
                        name="paymentMethod"
                        className="mr-2 focus:ring-blue-500"
                      />
                      <label htmlFor="creditCard" className="mr-2">
                        เครดิตการ์ด
                      </label>
                      <input
                        type="text"
                        className="flex-1 border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="bankTransfer"
                        name="paymentMethod"
                        className="mr-2 focus:ring-blue-500"
                      />
                      <label htmlFor="bankTransfer" className="mr-2">
                        โอนเงินผ่านธนาคาร
                      </label>
                      <input
                        type="text"
                        className="flex-1 border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </section>

                {/* ลูกค้าชำระเงิน */}
                <section className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50 p-4">
                  <h2 className="font-medium mb-3">ลูกค้าชำระเงิน</h2>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="cash"
                        name="customerPayment"
                        className="mr-2 focus:ring-blue-500"
                        checked={true}
                      />
                      <label htmlFor="cash">เงินสด</label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="credit"
                        name="customerPayment"
                        className="mr-2 focus:ring-blue-500"
                      />
                      <label htmlFor="credit">เครดิต</label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="creditCardCustomer"
                        name="customerPayment"
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
                        className="mr-2 focus:ring-blue-500"
                      />
                      <label htmlFor="bankTransferCustomer" className="mr-2">
                        โอนเงินผ่านธนาคาร
                      </label>
                      <input
                        type="text"
                        className="flex-1 border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
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
