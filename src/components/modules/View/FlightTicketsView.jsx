import React, { useState } from "react";
import {
  Search,
  Calendar,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit2,
  ChevronsUpDown,
  User,
  Plane,
  MapPin,
  Clock,
} from "lucide-react";
import FlightTicketDetail from "./FlightTicketDetail_2";

const FlightTicketsView = () => {
  // State สำหรับการจัดการข้อมูลและฟิลเตอร์
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [editingTicket, setEditingTicket] = useState(null);

  const openTicketDetail = (ticketId) => {
    setSelectedTicket(ticketId);
  };

  const closeTicketDetail = () => {
    setSelectedTicket(null);
  };

  const openEditTicket = (ticketId) => {
    setEditingTicket(ticketId);
  };

  const closeEditTicket = () => {
    setEditingTicket(null);
  };

  // ข้อมูลจำลองสำหรับตัวอย่าง
  const sampleFlightTickets = [
    {
      id: "FT-25-1-0001",
      date: "2025-02-01",
      bookingDate: "2025-01-15",
      customer: "นายสมชาย รักเที่ยว",
      contactNumber: "081-234-5678",
      airline: "Thai Airways",
      flightNumber: "TG203",
      route: "BKK-HKT",
      departureDate: "2025-02-20",
      departureTime: "10:00",
      arrivalTime: "11:30",
      passengers: 2,
      passengerNames: ["นายสมชาย รักเที่ยว", "นางสาวสมหญิง รักเที่ยว"],
      ticketNumbers: ["TG203-ABC123", "TG203-ABC124"],
      amount: 8500.0,
      status: "confirmed",
      paymentStatus: "paid",
      remarks: "",
    },
    {
      id: "FT-25-1-0002",
      date: "2025-02-03",
      bookingDate: "2025-01-25",
      customer: "บริษัท ABC ทัวร์",
      contactNumber: "02-345-6789",
      airline: "Bangkok Airways",
      flightNumber: "PG273",
      route: "HKT-USM",
      departureDate: "2025-02-15",
      departureTime: "14:30",
      arrivalTime: "15:30",
      passengers: 4,
      passengerNames: [
        "Mr. John Smith",
        "Mrs. Jane Smith",
        "Ms. Sarah Smith",
        "Mr. James Smith",
      ],
      ticketNumbers: [
        "PG273-DEF456",
        "PG273-DEF457",
        "PG273-DEF458",
        "PG273-DEF459",
      ],
      amount: 24000.0,
      status: "confirmed",
      paymentStatus: "paid",
      remarks: "VIP customers",
    },
    {
      id: "FT-25-1-0003",
      date: "2025-02-05",
      bookingDate: "2025-01-30",
      customer: "นางสาวนิชา วงศ์ธรรม",
      contactNumber: "089-876-5432",
      airline: "Thai AirAsia",
      flightNumber: "FD3015",
      route: "DMK-CNX",
      departureDate: "2025-03-01",
      departureTime: "08:25",
      arrivalTime: "09:45",
      passengers: 1,
      passengerNames: ["นางสาวนิชา วงศ์ธรรม"],
      ticketNumbers: ["FD3015-GHI789"],
      amount: 2250.0,
      status: "confirmed",
      paymentStatus: "partially",
      remarks: "ต้องการที่นั่งริมหน้าต่าง",
    },
    {
      id: "FT-25-1-0004",
      date: "2025-02-10",
      bookingDate: "2025-02-01",
      customer: "คุณประเสริฐ มั่งมี",
      contactNumber: "062-345-6789",
      airline: "Thai Airways",
      flightNumber: "TG679",
      route: "BKK-HKG",
      departureDate: "2025-03-15",
      departureTime: "13:40",
      arrivalTime: "17:30",
      passengers: 2,
      passengerNames: ["คุณประเสริฐ มั่งมี", "คุณสุดา มั่งมี"],
      ticketNumbers: ["TG679-JKL012", "TG679-JKL013"],
      amount: 32000.0,
      status: "pending",
      paymentStatus: "unpaid",
      remarks: "",
    },
    {
      id: "FT-25-1-0005",
      date: "2025-02-12",
      bookingDate: "2025-02-05",
      customer: "Mr. Robert Johnson",
      contactNumber: "+1-234-567-8901",
      airline: "Thai Airways",
      flightNumber: "TG930",
      route: "BKK-LHR",
      departureDate: "2025-04-10",
      departureTime: "00:55",
      arrivalTime: "07:15",
      passengers: 3,
      passengerNames: [
        "Mr. Robert Johnson",
        "Mrs. Emily Johnson",
        "Miss Lucy Johnson",
      ],
      ticketNumbers: ["TG930-MNO345", "TG930-MNO346", "TG930-MNO347"],
      amount: 145000.0,
      status: "confirmed",
      paymentStatus: "paid",
      remarks: "Business class",
    },
    {
      id: "FT-25-1-0006",
      date: "2025-02-15",
      bookingDate: "2025-02-10",
      customer: "คุณพิชัย นวลศรี",
      contactNumber: "099-876-5432",
      airline: "Thai AirAsia",
      flightNumber: "FD253",
      route: "DMK-SIN",
      departureDate: "2025-03-20",
      departureTime: "11:10",
      arrivalTime: "14:40",
      passengers: 1,
      passengerNames: ["คุณพิชัย นวลศรี"],
      ticketNumbers: ["FD253-PQR678"],
      amount: 4500.0,
      status: "cancelled",
      paymentStatus: "refunded",
      remarks: "ยกเลิกเนื่องจากป่วย",
    },
    {
      id: "FT-25-1-0007",
      date: "2025-02-18",
      bookingDate: "2025-02-12",
      customer: "บริษัท XYZ ทราเวล",
      contactNumber: "02-987-6543",
      airline: "Bangkok Airways",
      flightNumber: "PG711",
      route: "BKK-REP",
      departureDate: "2025-03-25",
      departureTime: "08:00",
      arrivalTime: "09:10",
      passengers: 10,
      passengerNames: ["Group booking - details in remarks"],
      ticketNumbers: ["PG711-STU901 through PG711-STU910"],
      amount: 75000.0,
      status: "confirmed",
      paymentStatus: "partially",
      remarks: "กรุ๊ปทัวร์นักศึกษา มหาวิทยาลัย ABC",
    },
  ];

  const filterTickets = () => {
    let filtered = [...sampleFlightTickets];

    // กรองตามคำค้นหา
    if (searchTerm) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.airline.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.flightNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          ticket.route.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // กรองตามสถานะ
    if (filterStatus !== "all") {
      filtered = filtered.filter((ticket) => ticket.status === filterStatus);
    }

    // กรองตามช่วงวันที่
    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);

      filtered = filtered.filter((ticket) => {
        const ticketDate = new Date(ticket.date);
        return ticketDate >= startDate && ticketDate <= endDate;
      });
    }

    // เรียงลำดับข้อมูล
    filtered.sort((a, b) => {
      let valueA = a[sortField];
      let valueB = b[sortField];

      // แปลงเป็น Date สำหรับการเรียงลำดับวันที่
      if (
        sortField === "date" ||
        sortField === "departureDate" ||
        sortField === "bookingDate"
      ) {
        valueA = new Date(valueA);
        valueB = new Date(valueB);
      }

      if (sortDirection === "asc") {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    return filtered;
  };

  // ข้อมูลที่ผ่านการกรองแล้ว
  const filteredTickets = filterTickets();

  // คำนวณข้อมูลสำหรับการแสดงผลหน้าปัจจุบัน
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTickets = filteredTickets.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);

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
      case "confirmed":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            ยืนยันแล้ว
          </span>
        );
      case "pending":
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            รอดำเนินการ
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

  // ฟังก์ชันแสดงสถานะการชำระเงินด้วยสี
  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            ชำระแล้ว
          </span>
        );
      case "unpaid":
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            ยังไม่ชำระ
          </span>
        );
      case "partially":
        return (
          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
            ชำระบางส่วน
          </span>
        );
      case "refunded":
        return (
          <span className="px-2 py-1 bg-pink-100 text-pink-800 rounded-full text-xs font-medium">
            คืนเงินแล้ว
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
                รายการตั๋วเครื่องบิน (Flight Tickets)
              </h1>
              <p className="text-sm text-gray-500">
                จัดการและติดตามรายการตั๋วเครื่องบินทั้งหมด
              </p>
            </div>
            <div className="mt-4 md:mt-0">
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
                placeholder="ค้นหาเลขที่ตั๋ว, ชื่อลูกค้า, สายการบิน, เส้นทาง..."
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
                  <option value="confirmed">ยืนยันแล้ว</option>
                  <option value="pending">รอดำเนินการ</option>
                  <option value="cancelled">ยกเลิก</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronLeft size={18} className="text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Table */}
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
                      เลขที่ตั๋ว
                      <ChevronsUpDown size={16} className="ml-1" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("date")}
                  >
                    <div className="flex items-center">
                      วันที่บันทึก
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
                    onClick={() => handleSort("airline")}
                  >
                    <div className="flex items-center">
                      สายการบิน
                      <ChevronsUpDown size={16} className="ml-1" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("route")}
                  >
                    <div className="flex items-center">
                      เส้นทาง
                      <ChevronsUpDown size={16} className="ml-1" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("departureDate")}
                  >
                    <div className="flex items-center">
                      วันที่เดินทาง
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
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("paymentStatus")}
                  >
                    <div className="flex items-center">
                      การชำระเงิน
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
                {currentTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {ticket.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(ticket.date).toLocaleDateString("th-TH")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User size={16} className="text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {ticket.customer}
                          </div>
                          <div className="text-sm text-gray-500">
                            {ticket.contactNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Plane size={16} className="text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {ticket.airline}
                          </div>
                          <div className="text-sm text-gray-500">
                            {ticket.flightNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin size={16} className="text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {ticket.route}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar size={16} className="text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(ticket.departureDate).toLocaleDateString(
                              "th-TH"
                            )}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Clock size={12} className="mr-1" />
                            {ticket.departureTime} - {ticket.arrivalTime}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ฿{ticket.amount.toLocaleString("th-TH")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(ticket.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPaymentStatusBadge(ticket.paymentStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => openTicketDetail(ticket.id)}
                          title="ดูรายละเอียด"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className="text-yellow-600 hover:text-yellow-900"
                          onClick={() => openEditTicket(ticket.id)}
                          title="แก้ไข"
                        >
                          <Edit2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {currentTickets.length === 0 && (
                  <tr>
                    <td
                      colSpan="9"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      ไม่พบข้อมูลตามเงื่อนไขที่กำหนด
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
                    {Math.min(indexOfLastItem, filteredTickets.length)}
                  </span>{" "}
                  จากทั้งหมด{" "}
                  <span className="font-medium">{filteredTickets.length}</span>{" "}
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
            <h3 className="text-sm font-medium text-gray-500">ยืนยันแล้ว</h3>
            <p className="text-2xl font-bold text-gray-800">
              ฿{" "}
              {sampleFlightTickets
                .filter((ticket) => ticket.status === "confirmed")
                .reduce((sum, ticket) => sum + ticket.amount, 0)
                .toLocaleString("th-TH")}
            </p>
            <p className="text-sm text-gray-500">
              {
                sampleFlightTickets.filter(
                  (ticket) => ticket.status === "confirmed"
                ).length
              }{" "}
              รายการ
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-500">
            <h3 className="text-sm font-medium text-gray-500">รอดำเนินการ</h3>
            <p className="text-2xl font-bold text-gray-800">
              ฿{" "}
              {sampleFlightTickets
                .filter((ticket) => ticket.status === "pending")
                .reduce((sum, ticket) => sum + ticket.amount, 0)
                .toLocaleString("th-TH")}
            </p>
            <p className="text-sm text-gray-500">
              {
                sampleFlightTickets.filter(
                  (ticket) => ticket.status === "pending"
                ).length
              }{" "}
              รายการ
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
            <h3 className="text-sm font-medium text-gray-500">ยกเลิก</h3>
            <p className="text-2xl font-bold text-gray-800">
              ฿{" "}
              {sampleFlightTickets
                .filter((ticket) => ticket.status === "cancelled")
                .reduce((sum, ticket) => sum + ticket.amount, 0)
                .toLocaleString("th-TH")}
            </p>
            <p className="text-sm text-gray-500">
              {
                sampleFlightTickets.filter(
                  (ticket) => ticket.status === "cancelled"
                ).length
              }{" "}
              รายการ
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
            <h3 className="text-sm font-medium text-gray-500">รวมทั้งหมด</h3>
            <p className="text-2xl font-bold text-gray-800">
              ฿{" "}
              {sampleFlightTickets
                .reduce((sum, ticket) => sum + ticket.amount, 0)
                .toLocaleString("th-TH")}
            </p>
            <p className="text-sm text-gray-500">
              {sampleFlightTickets.length} รายการ
            </p>
          </div>
        </div>
      </div>

      {/* Modal for Ticket Detail */}
      {selectedTicket && (
        <FlightTicketDetail
          ticketId={selectedTicket}
          onClose={closeTicketDetail}
          ticketData={sampleFlightTickets.find(
            (ticket) => ticket.id === selectedTicket
          )}
        />
      )}
    </div>
  );
};

export default FlightTicketsView;
