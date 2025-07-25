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
  Users,
  MapPin,
  Ticket, // เพิ่ม icon สำหรับ ticket number
} from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import DateRangeSelector from "./DateRangeSelector";
import FlightStatusFilter from "./FlightStatusFilter";
import FlightTicketDetail from "./FlightTicketDetail";
import { useFlightTicketsData } from "../hooks/useFlightTicketsData";
import FlightTicketDetail_Edit from "./FlightTicketDetail_Edit";
import CancelledDetailsModal from "./CancelledDetailsModal";

const FlightTicketsView = () => {
  const formatDateTime = (dateTime) => {
    if (!dateTime || isNaN(new Date(dateTime).getTime())) return "-";
    const dateObj = new Date(dateTime);
    const day = dateObj.getDate().toString().padStart(2, "0");
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const year = dateObj.getFullYear();
    const hours = dateObj.getHours().toString().padStart(2, "0");
    const minutes = dateObj.getMinutes().toString().padStart(2, "0");
    const seconds = dateObj.getSeconds().toString().padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

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
  const [showCancelledDetails, setShowCancelledDetails] = useState(false);
  const [selectedCancelledTicket, setSelectedCancelledTicket] = useState(null);

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
    fetchFlightTickets();
  }, [startDate, endDate, filterStatus, sortField, sortDirection]);

  const openTicketDetail = (ticketId) => {
    setSelectedTicket(ticketId);
  };

  const closeTicketDetail = () => {
    setSelectedTicket(null);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTickets = filteredTickets.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getStatusDisplay = (ticket) => {
    // ตรวจสอบสถานะยกเลิก
    if (ticket.status === "cancelled") {
      return (
        <button
          onClick={() => {
            setSelectedCancelledTicket({
              referenceNumber: ticket.reference_number,
              cancelledAt: ticket.cancelled_at,
              cancelledBy: ticket.cancelled_by_name,
              cancelReason: ticket.cancel_reason,
              poNumber: ticket.po_number,
              customer: ticket.customer?.name,
              supplier: ticket.supplier?.name,
            });
            setShowCancelledDetails(true);
          }}
          className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
        >
          Cancelled
        </button>
      );
    }

    // แสดง PO Number หรือ Not Invoiced สำหรับสถานะปกติ
    if (ticket.po_number && ticket.po_number.trim() !== "") {
      return (
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-900">
            {ticket.po_number}
          </span>
        </div>
      );
    } else {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Not Invoiced
        </span>
      );
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
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

        <DateRangeSelector
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {isFilterVisible && (
          <FlightStatusFilter
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
          />
        )}

        <div className="bg-white shadow-sm rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr className="text-center">
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("id")}
                  >
                    <div className="flex items-center justify-center">
                      ID
                      <ChevronsUpDown size={16} className="ml-1" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("customer")}
                  >
                    <div className="flex items-center justify-center">
                      Customer
                      <ChevronsUpDown size={16} className="ml-1" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("supplier")}
                  >
                    <div className="flex items-center justify-center">
                      Supplier
                      <ChevronsUpDown size={16} className="ml-1" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Pax's Name
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Routing
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Ticket Number
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Code
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center justify-center">
                      Status
                      <ChevronsUpDown size={16} className="ml-1" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("created_at")}
                  >
                    <div className="flex items-center justify-center">
                      Created At
                      <ChevronsUpDown size={16} className="ml-1" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan="10" // เปลี่ยนจาก 9 เป็น 10 เนื่องจากเพิ่มคอลัม
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
                      colSpan="10" // เปลี่ยนจาก 9 เป็น 10 เนื่องจากเพิ่มคอลัม
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
                      <td className="px-2 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-medium text-gray-900">
                          {ticket.customer?.code ||
                            ticket.customer?.name ||
                            "-"}
                        </div>
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-medium text-gray-900">
                          {ticket.supplier?.code ||
                            ticket.supplier?.name ||
                            "-"}
                        </div>
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {ticket.passengersDisplay || "-"}
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {ticket.routingDisplay || "-"}
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-4  whitespace-nowrap ">
                        <div className="text-sm font-medium text-gray-900">
                          {ticket.ticketNumberDisplay || "-"}
                        </div>
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ticket.code || "-"}
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap">
                        {getStatusDisplay(ticket)}
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() => openTicketDetail(ticket.id)}
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>

                          {/* แสดงปุ่ม Edit เฉพาะตั๋วที่ไม่ใช่สถานะ cancelled */}
                          {ticket.status !== "cancelled" && (
                            <button
                              className="text-yellow-600 hover:text-yellow-900"
                              onClick={() => openTicketEditDetail(ticket.id)}
                              title="Edit"
                            >
                              <Edit2 size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(ticket.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

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
                    {Array.from({ length: totalPages }, (_, index) => {
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

      {selectedTicket && (
        <FlightTicketDetail
          ticketId={selectedTicket}
          onClose={closeTicketDetail}
          onPOGenerated={fetchFlightTickets}
        />
      )}
      {selectedTicketForEdit && (
        <FlightTicketDetail_Edit
          ticketId={selectedTicketForEdit}
          onClose={closeTicketEditDetail}
          onSave={() => {
            closeTicketEditDetail();
            fetchFlightTickets();
          }}
        />
      )}
      {/* Cancelled Details Modal */}
      <CancelledDetailsModal
        isOpen={showCancelledDetails}
        onClose={() => {
          setShowCancelledDetails(false);
          setSelectedCancelledTicket(null);
        }}
        cancelledData={selectedCancelledTicket}
      />
    </div>
  );
};

export default FlightTicketsView;
