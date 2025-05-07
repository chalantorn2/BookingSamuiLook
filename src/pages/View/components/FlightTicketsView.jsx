import React, { useState, useEffect } from "react";
import {
  Search,
  Calendar,
  Filter,
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
import { format, startOfMonth, endOfMonth } from "date-fns";
import DateRangeSelector from "./DateRangeSelector";
import FlightStatusFilter from "./FlightStatusFilter";
import FlightTicketDetail from "./FlightTicketDetail";
import { useFlightTicketsData } from "../hooks/useFlightTicketsData";
import FlightTicketDetail_Edit from "./FlightTicketDetail_Edit";

const FlightTicketsView = () => {
  // สร้างฟังก์ชันเพื่อรับวันแรกและวันสุดท้ายของเดือนปัจจุบัน
  const getCurrentMonthRange = () => {
    const now = new Date();
    const firstDay = startOfMonth(now);
    const lastDay = endOfMonth(now);

    return {
      start: format(firstDay, "yyyy-MM-dd"),
      end: format(lastDay, "yyyy-MM-dd"),
    };
  };

  const dateRange = getCurrentMonthRange();

  // State สำหรับการจัดการข้อมูลและฟิลเตอร์
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState(dateRange.start);
  const [endDate, setEndDate] = useState(dateRange.end);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedTicketForEdit, setSelectedTicketForEdit] = useState(null);

  const openTicketEditDetail = (ticketId) => {
    setSelectedTicketForEdit(ticketId);
  };

  const closeTicketEditDetail = () => {
    setSelectedTicketForEdit(null);
  };

  const { loading, filteredTickets, fetchFlightTickets } = useFlightTicketsData(
    {
      startDate,
      endDate,
      searchTerm,
      filterStatus,
      sortField,
      sortDirection,
    }
  );

  useEffect(() => {
    // เริ่มต้นการโหลดข้อมูลเมื่อ component ถูกโหลด
    fetchFlightTickets();
  }, [startDate, endDate, filterStatus, sortField, sortDirection]);

  const openTicketDetail = (ticketId) => {
    setSelectedTicket(ticketId);
  };

  const closeTicketDetail = () => {
    setSelectedTicket(null);
  };

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

  // แสดงเส้นทางแบบมีหลายเส้นทาง
  const displayRoutes = (routes) => {
    if (!routes || routes.length === 0) return "-";

    return routes.map((route, index) => (
      <div key={index} className="mb-1 last:mb-0">
        <div className="flex items-center text-xs">
          <span className="font-medium text-gray-700">{route.origin}</span>
          <span className="mx-1">➡️</span>
          <span className="font-medium text-gray-700">{route.destination}</span>
        </div>
      </div>
    ));
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
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium flex items-center"
                onClick={() => setIsFilterVisible(!isFilterVisible)}
              >
                <Filter size={16} className="mr-2" />
                ตัวกรอง
              </button>
            </div>
          </div>
        </div>

        {/* Date Range Selector */}
        <DateRangeSelector
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* Status Filter */}
        {isFilterVisible && (
          <FlightStatusFilter
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
          />
        )}

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
                    onClick={() => handleSort("supplier")}
                  >
                    <div className="flex items-center">
                      ซัพพลายเออร์
                      <ChevronsUpDown size={16} className="ml-1" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <div className="flex items-center">เส้นทาง</div>
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
                {loading ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      <div className="flex justify-center">
                        <svg
                          className="animate-spin h-5 w-5 text-blue-500"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </div>
                    </td>
                  </tr>
                ) : currentTickets.length === 0 ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      ไม่พบข้อมูลตามเงื่อนไขที่กำหนด
                    </td>
                  </tr>
                ) : (
                  currentTickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {ticket.reference_number || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ticket.tickets_detail?.issue_date
                          ? new Date(
                              ticket.tickets_detail.issue_date
                            ).toLocaleDateString("th-TH")
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User size={16} className="text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {ticket.customer?.name || "-"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Plane size={16} className="text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {ticket.supplier?.name || "-"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {ticket.additional_info?.code ||
                                ticket.supplier?.code ||
                                "-"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-start">
                          <MapPin
                            size={16}
                            className="text-gray-400 mr-2 mt-0.5"
                          />
                          <div className="text-sm text-gray-900">
                            {displayRoutes(ticket.routes)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar size={16} className="text-gray-400 mr-2" />
                          <div>
                            {ticket.routes && ticket.routes.length > 0 ? (
                              <div className="text-sm font-medium text-gray-900">
                                {new Date(
                                  ticket.routes[0].date
                                ).toLocaleDateString("th-TH")}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500">-</div>
                            )}
                            {ticket.routes && ticket.routes.length > 0 && (
                              <div className="text-sm text-gray-500 flex items-center">
                                <Clock size={12} className="mr-1" />
                                {ticket.routes[0].departure_time || "-"} -{" "}
                                {ticket.routes[0].arrival_time || "-"}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(ticket.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPaymentStatusBadge(ticket.payment_status)}
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
                            onClick={() => openTicketEditDetail(ticket.id)}
                            title="แก้ไข"
                          >
                            <Edit2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
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
                    <span className="font-medium">
                      {filteredTickets.length}
                    </span>{" "}
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
          )}
        </div>
      </div>

      {/* Modal for Ticket Detail */}
      {selectedTicket && (
        <FlightTicketDetail
          ticketId={selectedTicket}
          onClose={closeTicketDetail}
        />
      )}
      {/* Modal for Ticket Edit */}
      {selectedTicketForEdit && (
        <FlightTicketDetail_Edit
          ticketId={selectedTicketForEdit}
          onClose={closeTicketEditDetail}
          onSave={() => {
            closeTicketEditDetail();
            // ให้โหลดข้อมูลใหม่หลังจากบันทึก
            fetchFlightTickets();
          }}
        />
      )}
    </div>
  );
};

export default FlightTicketsView;
