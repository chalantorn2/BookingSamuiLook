import React, { useState, useEffect } from "react";
import { FiSave, FiX, FiCheck, FiSearch } from "react-icons/fi";

const SelectForInvoice = ({ onClose, onGenerate }) => {
  // สร้าง state สำหรับการเลือกรายการ
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [invoiceStatus, setInvoiceStatus] = useState("all");
  const sampleSales = [
    {
      id: "FT-25-1-0001",
      type: "flight",
      typeName: "ตั๋วเครื่องบิน",
      date: "01/02/2025",
      customer: "ABC TRAVEL",
      description: "AIR TICKET BKK-HKT",
      amount: 15000.0,
      paymentStatus: "paid",
      invoiceStatus: null, // ยังไม่มีใบแจ้งหนี้
    },
    {
      id: "BS-25-1-0001",
      type: "bus",
      typeName: "บัส",
      date: "05/02/2025",
      customer: "XYZ TOURS",
      description: "BUS TICKET HKT-PHANG NGA",
      amount: 5000.0,
      paymentStatus: "paid",
      invoiceStatus: null,
    },
    {
      id: "BT-25-1-0001",
      type: "boat",
      typeName: "เรือ",
      date: "07/02/2025",
      customer: "XYZ TOURS",
      description: "BOAT TICKET TO PHI PHI ISLAND",
      amount: 7500.0,
      paymentStatus: "paid",
      invoiceStatus: null,
    },
    {
      id: "TR-25-1-0001",
      type: "tour",
      typeName: "ทัวร์",
      date: "10/02/2025",
      customer: "SAMUI HOLIDAY",
      description: "GROUP TOUR PACKAGE 4D3N",
      amount: 45000.0,
      paymentStatus: "paid",
      invoiceStatus: null,
    },
    {
      id: "INS-25-1-0001",
      type: "insurance",
      typeName: "ประกันการเดินทาง",
      date: "12/02/2025",
      customer: "MR. JOHN DOE",
      description: "TRAVEL INSURANCE 7 DAYS",
      amount: 1200.0,
      paymentStatus: "paid",
      invoiceStatus: null,
    },
    {
      id: "HTL-25-1-0001",
      type: "hotel",
      typeName: "โรงแรม",
      date: "15/02/2025",
      customer: "PHUKET EXPLORER",
      description: "HOTEL BOOKING 3 NIGHTS",
      amount: 9000.0,
      paymentStatus: "paid",
      invoiceStatus: "IN-25-0001", // มีการสร้างใบแจ้งหนี้แล้ว
    },
    {
      id: "TRN-25-1-0001",
      type: "train",
      typeName: "รถไฟ",
      date: "18/02/2025",
      customer: "MS. JANE SMITH",
      description: "TRAIN TICKET BKK-CHIANG MAI",
      amount: 1800.0,
      paymentStatus: "paid",
      invoiceStatus: null,
    },
    {
      id: "VSA-25-1-0001",
      type: "visa",
      typeName: "วีซ่า",
      date: "20/02/2025",
      customer: "MR. SMITH FAMILY",
      description: "VISA APPLICATION SERVICE",
      amount: 4500.0,
      paymentStatus: "paid",
      invoiceStatus: null,
    },
    {
      id: "OTH-25-1-0001",
      type: "other",
      typeName: "บริการอื่นๆ",
      date: "25/02/2025",
      customer: "BANGKOK TRAVEL",
      description: "AIRPORT TRANSFER SERVICE",
      amount: 1200.0,
      paymentStatus: "paid",
      invoiceStatus: null,
    },
  ];

  const filteredSales = sampleSales.filter((sale) => {
    // กรองตามประเภทบริการ
    if (filterType !== "all" && sale.type !== filterType) return false;

    // กรองตามสถานะใบแจ้งหนี้
    if (invoiceStatus === "withInvoice" && sale.invoiceStatus === null)
      return false;
    if (invoiceStatus === "withoutInvoice" && sale.invoiceStatus !== null)
      return false;

    // กรองตามคำค้นหา
    if (
      searchTerm &&
      !sale.id.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !sale.customer.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !sale.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  // ฟังก์ชันจัดการเลือก/ยกเลิกรายการ
  const toggleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((item) => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  // ฟังก์ชันเลือกทั้งหมด
  const selectAll = () => {
    const allIds = filteredSales
      .filter((sale) => sale.invoiceStatus === null) // เลือกเฉพาะที่ยังไม่มีใบแจ้งหนี้
      .map((sale) => sale.id);
    setSelectedItems(allIds);
  };

  // ฟังก์ชันยกเลิกเลือกทั้งหมด
  const deselectAll = () => {
    setSelectedItems([]);
  };

  // ฟังก์ชันสร้างใบแจ้งหนี้
  const handleGenerate = () => {
    if (selectedItems.length === 0) {
      alert("กรุณาเลือกรายการอย่างน้อย 1 รายการ");
      return;
    }

    if (onGenerate) {
      onGenerate(selectedItems);
    }
  };
  const getSaleTypeBadge = (type, typeName) => {
    // ใช้เฉพาะคลาสที่มีอยู่ใน Tailwind
    let bgClass = "bg-gray-100";
    let textClass = "text-gray-800";

    if (type === "flight") {
      bgClass = "bg-blue-100";
      textClass = "text-blue-800";
    } else if (type === "bus") {
      bgClass = "bg-green-100";
      textClass = "text-green-800";
    } else if (type === "boat") {
      bgClass = "bg-cyan-100";
      textClass = "text-cyan-800";
    } else if (type === "tour") {
      bgClass = "bg-purple-100";
      textClass = "text-purple-800";
    } else if (type === "insurance") {
      bgClass = "bg-red-100";
      textClass = "text-red-800";
    } else if (type === "hotel") {
      bgClass = "bg-yellow-100";
      textClass = "text-yellow-800";
    } else if (type === "train") {
      bgClass = "bg-indigo-100";
      textClass = "text-indigo-800";
    } else if (type === "visa") {
      bgClass = "bg-pink-100";
      textClass = "text-pink-800";
    }

    return (
      <span
        className={`px-2 py-1 ${bgClass} ${textClass} rounded-full text-xs font-medium`}
      >
        {typeName}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black modal-backdrop bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
          <h1 className="text-xl font-bold">
            เลือกรายการขายเพื่อสร้างใบแจ้งหนี้
          </h1>
          {/* <div className="flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md flex items-center hover:bg-gray-300 transition-colors"
            >
              <FiX className="mr-1" /> ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              className="px-4 py-2 bg-green-500 text-white rounded-md flex items-center hover:bg-green-600 transition-colors"
              disabled={selectedItems.length === 0}
            >
              <FiSave className="mr-1" /> สร้างใบแจ้งหนี้
            </button>
          </div> */}
        </div>

        {/* Search and Filter */}
        <div className="bg-gray-50 p-4 border-b">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="pl-10 w-full border border-gray-300 rounded-md py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ค้นหารายการขาย..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* ตัวเลือกประเภทบริการ */}
            <div className="sm:w-64">
              <select
                className="w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 focus:ring-blue-500 focus:border-blue-500"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">ทั้งหมด</option>
                <option value="flight">ตั๋วเครื่องบิน</option>
                <option value="bus">บัส</option>
                <option value="boat">เรือ</option>
                <option value="tour">ทัวร์</option>
                <option value="insurance">ประกันการเดินทาง</option>
                <option value="hotel">โรงแรม</option>
                <option value="train">รถไฟ</option>
                <option value="visa">วีซ่า</option>
                <option value="other">บริการอื่นๆ</option>
              </select>
            </div>

            {/* ตัวเลือกสถานะใบแจ้งหนี้ */}
            <div className="sm:w-64">
              <select
                className="w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 focus:ring-blue-500 focus:border-blue-500"
                value={invoiceStatus}
                onChange={(e) => setInvoiceStatus(e.target.value)}
              >
                <option value="all">ทั้งหมด</option>
                <option value="withoutInvoice">ยังไม่มีใบแจ้งหนี้</option>
                <option value="withInvoice">มีใบแจ้งหนี้แล้ว</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Action buttons */}
          <div className="flex justify-between mb-4">
            <div>
              <span className="text-sm text-gray-500">
                เลือกแล้ว {selectedItems.length} รายการ
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={selectAll}
                className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md text-sm hover:bg-blue-100 transition-colors"
              >
                เลือกทั้งหมด
              </button>
              <button
                type="button"
                onClick={deselectAll}
                className="px-3 py-1 bg-gray-50 text-gray-600 rounded-md text-sm hover:bg-gray-100 transition-colors"
                disabled={selectedItems.length === 0}
              >
                ยกเลิกทั้งหมด
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10"
                  >
                    <span className="sr-only">Select</span>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    รหัสรายการ
                  </th>
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
                    ประเภท
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    ลูกค้า
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    รายละเอียด
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
                    สถานะใบแจ้งหนี้
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSales.length > 0 ? (
                  filteredSales.map((sale) => (
                    <tr
                      key={sale.id}
                      className={`hover:bg-gray-50 ${
                        selectedItems.includes(sale.id) ? "bg-blue-50" : ""
                      } ${sale.invoiceStatus ? "opacity-50" : ""}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={selectedItems.includes(sale.id)}
                          onChange={() => toggleSelectItem(sale.id)}
                          disabled={sale.invoiceStatus !== null} // ถ้ามีใบแจ้งหนี้แล้วจะไม่สามารถเลือกได้
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {sale.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sale.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getSaleTypeBadge(sale.type, sale.typeName)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {sale.customer}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {sale.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                        ฿{sale.amount.toLocaleString("th-TH")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {sale.invoiceStatus ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            {sale.invoiceStatus}
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                            ยังไม่มีใบแจ้งหนี้
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      ไม่พบรายการตามเงื่อนไขที่กำหนด
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-600">
              เลือกรายการที่ต้องการสร้างใบแจ้งหนี้
            </span>
          </div>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              disabled={selectedItems.length === 0}
            >
              สร้างใบแจ้งหนี้
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectForInvoice;
