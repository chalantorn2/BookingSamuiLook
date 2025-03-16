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
import CreateInvoice from "./CreateInvoice";

const InvoiceList = () => {
  // State สำหรับการจัดการข้อมูลและฟิลเตอร์
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const openCreateInvoice = () => setIsCreateInvoiceOpen(true);
  const closeCreateInvoice = () => setIsCreateInvoiceOpen(false);

  // ข้อมูลจำลองสำหรับตัวอย่าง
  const sampleInvoices = [
    {
      id: "IN-25-0001",
      date: "01/02/2025",
      dueDate: "01/03/2025",
      customer: "ABC TRAVEL",
      customerPhone: "077-123456",
      amount: 15000.0,
      status: "paid",
      paymentDate: "15/02/2025",
      supplier: "PG",
      description: "AIR TICKET BKK-HKT",
    },
    {
      id: "IN-25-0002",
      date: "05/02/2025",
      dueDate: "05/03/2025",
      customer: "XYZ TOURS",
      customerPhone: "081-9876543",
      amount: 75000.0,
      status: "unpaid",
      paymentDate: "",
      supplier: "TG",
      description: "GROUP TOUR PACKAGE 4D3N",
    },
    {
      id: "IN-25-0003",
      date: "10/02/2025",
      dueDate: "25/02/2025",
      customer: "SAMUI HOLIDAY",
      customerPhone: "062-3456789",
      amount: 24500.0,
      status: "partially",
      paymentDate: "20/02/2025",
      supplier: "FD",
      description: "AIR TICKET HKT-DMK",
    },
    {
      id: "IN-25-0004",
      date: "15/02/2025",
      dueDate: "15/03/2025",
      customer: "PHUKET EXPLORER",
      customerPhone: "091-2345678",
      amount: 35000.0,
      status: "paid",
      paymentDate: "20/02/2025",
      supplier: "PG",
      description: "FLIGHT TICKETS AND HOTEL BOOKING",
    },
    {
      id: "IN-25-0005",
      date: "18/02/2025",
      dueDate: "18/03/2025",
      customer: "KRABI ADVENTURE",
      customerPhone: "085-6543210",
      amount: 42000.0,
      status: "overdue",
      paymentDate: "",
      supplier: "TG",
      description: "TOUR PACKAGE WITH INSURANCE",
    },
    {
      id: "IN-25-0006",
      date: "22/02/2025",
      dueDate: "22/03/2025",
      customer: "BANGKOK TRAVEL",
      customerPhone: "098-7654321",
      amount: 18500.0,
      status: "cancelled",
      paymentDate: "",
      supplier: "FD",
      description: "DOMESTIC FLIGHTS",
    },
    {
      id: "IN-25-0007",
      date: "25/02/2025",
      dueDate: "25/03/2025",
      customer: "CHIANG MAI TOURS",
      customerPhone: "064-8765432",
      amount: 28000.0,
      status: "unpaid",
      paymentDate: "",
      supplier: "PG",
      description: "NORTHERN THAILAND TOUR",
    },
  ];

  const handleSaveInvoice = (invoiceData) => {
    console.log("บันทึกใบแจ้งหนี้ใหม่:", invoiceData);
    // ในระบบจริงควรส่งข้อมูลไปยัง API หรือจัดเก็บในฐานข้อมูล
    // จากนั้นอัพเดต state ของรายการใบแจ้งหนี้

    // ตัวอย่างการเพิ่มใบแจ้งหนี้ใหม่เข้าไปในรายการ (ถ้ามี state เก็บรายการ)
    // setSampleInvoices([...sampleInvoices, {
    //   id: invoiceData.invoiceNo,
    //   date: invoiceData.date,
    //   dueDate: invoiceData.dueDate,
    //   customer: invoiceData.customer,
    //   customerPhone: invoiceData.customerPhone,
    //   amount: parseFloat(invoiceData.total),
    //   status: "unpaid",
    //   paymentDate: "",
    //   supplier: invoiceData.supplier,
    //   description: invoiceData.items[0]?.description || "",
    // }]);

    closeCreateInvoice();
  };
  // ฟังก์ชันสำหรับการกรองข้อมูล
  const filterInvoices = () => {
    let filtered = [...sampleInvoices];

    // กรองตามคำค้นหา
    if (searchTerm) {
      filtered = filtered.filter(
        (invoice) =>
          invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // กรองตามสถานะ
    if (filterStatus !== "all") {
      filtered = filtered.filter((invoice) => invoice.status === filterStatus);
    }

    // กรองตามช่วงวันที่
    if (dateRange.start && dateRange.end) {
      // ในระบบจริงควรใช้ library จัดการวันที่ เช่น date-fns หรือ moment.js
      filtered = filtered.filter((invoice) => {
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
  const filteredInvoices = filterInvoices();

  // คำนวณข้อมูลสำหรับการแสดงผลหน้าปัจจุบัน
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInvoices = filteredInvoices.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

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
            ชำระแล้ว
          </span>
        );
      case "unpaid":
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            รอชำระ
          </span>
        );
      case "partially":
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            ชำระบางส่วน
          </span>
        );
      case "overdue":
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            เกินกำหนด
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
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

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-t-lg shadow-sm p-4 mb-2">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                รายการใบแจ้งหนี้ (Invoice List)
              </h1>
              <p className="text-sm text-gray-500">
                จัดการและติดตามใบแจ้งหนี้ทั้งหมดของคุณ
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-2">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
                onClick={openCreateInvoice} // เพิ่ม onClick handler
              >
                <Plus size={16} className="mr-2" />
                สร้างใบแจ้งหนี้ใหม่
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
                placeholder="ค้นหาหมายเลขใบแจ้งหนี้, ลูกค้า, คำอธิบาย..."
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
                  <option value="paid">ชำระแล้ว</option>
                  <option value="unpaid">รอชำระ</option>
                  <option value="partially">ชำระบางส่วน</option>
                  <option value="overdue">เกินกำหนด</option>
                  <option value="cancelled">ยกเลิก</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronLeft size={18} className="text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Table */}
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
                      หมายเลขใบแจ้งหนี้
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
                {currentInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {invoice.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {invoice.customer}
                      </div>
                      <div className="text-sm text-gray-500">
                        {invoice.customerPhone}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      <div className="flex items-center">
                        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded mr-2">
                          {invoice.supplier}
                        </span>
                        {invoice.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ฿{invoice.amount.toLocaleString("th-TH")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye size={18} />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Printer size={18} />
                        </button>
                        <button className="text-indigo-600 hover:text-indigo-900">
                          <Mail size={18} />
                        </button>
                        <button className="text-yellow-600 hover:text-yellow-900">
                          <Edit2 size={18} />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
                    {Math.min(indexOfLastItem, filteredInvoices.length)}
                  </span>{" "}
                  จากทั้งหมด{" "}
                  <span className="font-medium">{filteredInvoices.length}</span>{" "}
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

        {/* Summary Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
            <h3 className="text-sm font-medium text-gray-500">ชำระแล้ว</h3>
            <p className="text-2xl font-bold text-gray-800">
              ฿{" "}
              {sampleInvoices
                .filter((inv) => inv.status === "paid")
                .reduce((sum, inv) => sum + inv.amount, 0)
                .toLocaleString("th-TH")}
            </p>
            <p className="text-sm text-gray-500">
              {sampleInvoices.filter((inv) => inv.status === "paid").length}{" "}
              รายการ
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-500">
            <h3 className="text-sm font-medium text-gray-500">รอชำระ</h3>
            <p className="text-2xl font-bold text-gray-800">
              ฿{" "}
              {sampleInvoices
                .filter((inv) => inv.status === "unpaid")
                .reduce((sum, inv) => sum + inv.amount, 0)
                .toLocaleString("th-TH")}
            </p>
            <p className="text-sm text-gray-500">
              {sampleInvoices.filter((inv) => inv.status === "unpaid").length}{" "}
              รายการ
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
            <h3 className="text-sm font-medium text-gray-500">เกินกำหนด</h3>
            <p className="text-2xl font-bold text-gray-800">
              ฿{" "}
              {sampleInvoices
                .filter((inv) => inv.status === "overdue")
                .reduce((sum, inv) => sum + inv.amount, 0)
                .toLocaleString("th-TH")}
            </p>
            <p className="text-sm text-gray-500">
              {sampleInvoices.filter((inv) => inv.status === "overdue").length}{" "}
              รายการ
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
            <h3 className="text-sm font-medium text-gray-500">รวมทั้งหมด</h3>
            <p className="text-2xl font-bold text-gray-800">
              ฿{" "}
              {sampleInvoices
                .reduce((sum, inv) => sum + inv.amount, 0)
                .toLocaleString("th-TH")}
            </p>
            <p className="text-sm text-gray-500">
              {sampleInvoices.length} รายการ
            </p>
          </div>
        </div>
      </div>
      {isCreateInvoiceOpen && (
        <CreateInvoice
          onClose={closeCreateInvoice}
          onSave={handleSaveInvoice}
        />
      )}
    </div>
  );
};

export default InvoiceList;
