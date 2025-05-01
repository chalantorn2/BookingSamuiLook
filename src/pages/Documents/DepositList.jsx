import React, { useState } from "react";
import {
  Search,
  FileText,
  Printer,
  Mail,
  Download,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  ChevronsUpDown,
} from "lucide-react";

const DepositList = () => {
  // State สำหรับการจัดการข้อมูลและฟิลเตอร์
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filterStatus, setFilterStatus] = useState("all");

  // ข้อมูลจำลองสำหรับตัวอย่าง (ตามรูปที่ส่งมา)
  const sampleDeposits = [
    {
      id: "DP-25-1-0001",
      date: "14FEB25",
      customer: "ABC TRAVEL",
      customerPhone: "077-123456",
      supplier: "PG",
      description: "AIR TICKET",
      amount: 15000.0,
      status: "paid",
      paymentDate: "12Mar25",
      fullPayDate: "12Mar25",
    },
    {
      id: "DP-25-1-0002",
      date: "14FEB25",
      customer: "JJJ TOUR",
      customerPhone: "081-9876543",
      supplier: "TG",
      description: "Tour ญี่ปุ่น โตเกียว โยโกฮาม่า 6 วัน 5 คืน",
      amount: 75000.0,
      status: "pending",
      paymentDate: "04APR25",
      fullPayDate: "31MAR25",
    },
    {
      id: "DP-25-1-0003",
      date: "15FEB25",
      customer: "ZZZZ TRAVEL",
      customerPhone: "062-3456789",
      supplier: "FD",
      description: "DMK-NRT-DMK",
      amount: 35000.0,
      status: "pending",
      paymentDate: "01MAY25",
      fullPayDate: "01MAY25",
    },
    {
      id: "DP-25-1-0004",
      date: "16FEB25",
      customer: "SAMUI HOLIDAY",
      customerPhone: "077-654321",
      supplier: "PG",
      description: "FLIGHT TICKETS AND HOTEL BOOKING",
      amount: 28000.0,
      status: "paid",
      paymentDate: "20FEB25",
      fullPayDate: "25FEB25",
    },
    {
      id: "DP-25-1-0005",
      date: "18FEB25",
      customer: "PHUKET EXPLORER",
      customerPhone: "076-543219",
      supplier: "TG",
      description: "GROUP TOUR PACKAGE WITH INSURANCE",
      amount: 42000.0,
      status: "cancelled",
      paymentDate: "",
      fullPayDate: "",
    },
    {
      id: "DP-25-1-0006",
      date: "20FEB25",
      customer: "BANGKOK TRAVEL",
      customerPhone: "02-1234567",
      supplier: "FD",
      description: "DOMESTIC FLIGHTS PACKAGE",
      amount: 18500.0,
      status: "pending",
      paymentDate: "15MAR25",
      fullPayDate: "25MAR25",
    },
    {
      id: "DP-25-1-0007",
      date: "22FEB25",
      customer: "CHIANG MAI TOURS",
      customerPhone: "053-123456",
      supplier: "PG",
      description: "NORTHERN THAILAND TOUR",
      amount: 28000.0,
      status: "paid",
      paymentDate: "01MAR25",
      fullPayDate: "01MAR25",
    },
  ];

  const filterDeposits = () => {
    let filtered = [...sampleDeposits];

    // กรองตามคำค้นหา
    if (searchTerm) {
      filtered = filtered.filter(
        (deposit) =>
          deposit.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          deposit.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          deposit.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // กรองตามสถานะ
    if (filterStatus !== "all") {
      filtered = filtered.filter((deposit) => deposit.status === filterStatus);
    }

    // กรองตามช่วงวันที่
    if (dateRange.start && dateRange.end) {
      // ในระบบจริงควรใช้ library จัดการวันที่ เช่น date-fns หรือ moment.js
      filtered = filtered.filter((deposit) => {
        // โค้ดจัดการกรองตามวันที่จริงๆ จะซับซ้อนกว่านี้
        return true; // แทนที่ด้วยตรรกะการกรองตามวันที่
      });
    }

    // เรียงลำดับข้อมูล
    filtered.sort((a, b) => {
      if (sortDirection === "asc") {
        return a[sortField] > b[sortField] ? 1 : -1;
      } else {
        return a[sortField] < b[sortField] ? 1 : -1;
      }
    });

    return filtered;
  };

  // ข้อมูลที่ผ่านการกรองแล้ว
  const filteredDeposits = filterDeposits();

  // คำนวณข้อมูลสำหรับการแสดงผลหน้าปัจจุบัน
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDeposits = filteredDeposits.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredDeposits.length / itemsPerPage);

  // ฟังก์ชันเปลี่ยนหน้า
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // ฟังก์ชันเรียงลำดับข้อมูล
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // ฟังก์ชันแสดงสถานะด้วยสี
  const getStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            วางมัดจำแล้ว
          </span>
        );
      case "pending":
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            รอชำระมัดจำ
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            ยกเลิก
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            {status}
          </span>
        );
    }
  };

  // สร้างฟังก์ชัน mock สำหรับการทำงานของปุ่มต่างๆ
  const openDepositDetail = (id) => {
    console.log(`ดูรายละเอียดมัดจำ: ${id}`);
  };

  const openPrintView = (deposit) => {
    console.log(`พิมพ์ใบมัดจำ: ${deposit.id}`);
  };

  const openEmailModal = (deposit) => {
    console.log(`ส่งอีเมลใบมัดจำ: ${deposit.id}`);
  };

  const openEditDeposit = (id) => {
    console.log(`แก้ไขข้อมูลมัดจำ: ${id}`);
  };

  const handleDeleteDeposit = (id) => {
    console.log(`ลบข้อมูลมัดจำ: ${id}`);
  };

  const openCreateDeposit = () => {
    console.log("สร้างใบมัดจำใหม่");
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-t-lg shadow-sm p-4 mb-2">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                รายการใบมัดจำ (Deposit List)
              </h1>
              <p className="text-sm text-gray-500">
                จัดการและติดตามใบมัดจำทั้งหมดของคุณ
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-2">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
                onClick={openCreateDeposit}
              >
                <Plus size={16} className="mr-2" />
                สร้างใบมัดจำใหม่
              </button>
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium flex items-center">
                <Download size={16} className="mr-2" />
                ส่งออก
              </button>
            </div>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="bg-white shadow-sm p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="relative col-span-1 md:col-span-1 lg:col-span-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="pl-10 w-full border border-gray-300 rounded-md py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ค้นหาหมายเลขใบมัดจำ, ลูกค้า, คำอธิบาย..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="col-span-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar size={18} className="text-gray-400" />
                </div>
                <input
                  type="date"
                  className="pl-10 w-full border border-gray-300 rounded-md py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="จากวันที่"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, start: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="col-span-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar size={18} className="text-gray-400" />
                </div>
                <input
                  type="date"
                  className="pl-10 w-full border border-gray-300 rounded-md py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ถึงวันที่"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, end: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="col-span-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter size={18} className="text-gray-400" />
                </div>
                <select
                  className="pl-10 w-full border border-gray-300 rounded-md py-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="paid">วางมัดจำแล้ว</option>
                  <option value="pending">รอชำระมัดจำ</option>
                  <option value="cancelled">ยกเลิก</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronLeft size={18} className="text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Deposit Table */}
        <div className="bg-white shadow-sm rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("id")}
                  >
                    <div className="flex items-center">
                      หมายเลขใบมัดจำ
                      <ChevronsUpDown size={16} className="ml-1" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("date")}
                  >
                    <div className="flex items-center">
                      วันที่
                      <ChevronsUpDown size={16} className="ml-1" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("customer")}
                  >
                    <div className="flex items-center">
                      ลูกค้า
                      <ChevronsUpDown size={16} className="ml-1" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("description")}
                  >
                    <div className="flex items-center">
                      รายละเอียด
                      <ChevronsUpDown size={16} className="ml-1" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("amount")}
                  >
                    <div className="flex items-center">
                      จำนวนเงิน
                      <ChevronsUpDown size={16} className="ml-1" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("paymentDate")}
                  >
                    <div className="flex items-center">
                      วันที่มัดจำ
                      <ChevronsUpDown size={16} className="ml-1" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("fullPayDate")}
                  >
                    <div className="flex items-center">
                      วันชำระเต็ม
                      <ChevronsUpDown size={16} className="ml-1" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center">
                      สถานะ
                      <ChevronsUpDown size={16} className="ml-1" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    ดำเนินการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentDeposits.map((deposit) => (
                  <tr
                    key={deposit.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {deposit.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {deposit.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {deposit.customer}
                      </div>
                      <div className="text-sm text-gray-500">
                        {deposit.customerPhone}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      <div className="flex items-center">
                        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded mr-2">
                          {deposit.supplier}
                        </span>
                        {deposit.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ฿{deposit.amount.toLocaleString("th-TH")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {deposit.paymentDate || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {deposit.fullPayDate || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(deposit.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => openDepositDetail(deposit.id)}
                          title="ดูรายละเอียด"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-900"
                          onClick={() => openPrintView(deposit)}
                          title="พิมพ์"
                        >
                          <Printer size={18} />
                        </button>
                        <button
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => openEmailModal(deposit)}
                          title="ส่งอีเมล"
                        >
                          <Mail size={18} />
                        </button>
                        <button
                          className="text-yellow-600 hover:text-yellow-900"
                          onClick={() => openEditDeposit(deposit.id)}
                          title="แก้ไข"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDeleteDeposit(deposit.id)}
                          title="ลบ"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {currentDeposits.length === 0 && (
                  <tr>
                    <td
                      colSpan="9"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      ไม่พบข้อมูลใบมัดจำตามเงื่อนไขที่กำหนด
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ก่อนหน้า
              </button>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ถัดไป
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  แสดง{" "}
                  <span className="font-medium">
                    {indexOfFirstItem + 1} ถึง{" "}
                    {Math.min(indexOfLastItem, filteredDeposits.length)}
                  </span>{" "}
                  จากทั้งหมด{" "}
                  <span className="font-medium">{filteredDeposits.length}</span>{" "}
                  รายการ
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>

                  {/* จะแสดงเลขหน้าตามจำนวนที่เหมาะสม */}
                  {Array.from({ length: totalPages }, (_, index) => {
                    // แสดงแค่ 5 หน้าคั่นกลางรอบๆ หน้าปัจจุบัน
                    if (
                      index + 1 === 1 ||
                      index + 1 === totalPages ||
                      (index + 1 >= currentPage - 2 &&
                        index + 1 <= currentPage + 2)
                    ) {
                      return (
                        <button
                          key={index}
                          onClick={() => paginate(index + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === index + 1
                              ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {index + 1}
                        </button>
                      );
                    } else if (
                      index + 1 === currentPage - 3 ||
                      index + 1 === currentPage + 3
                    ) {
                      return (
                        <span
                          key={index}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                        >
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepositList;
