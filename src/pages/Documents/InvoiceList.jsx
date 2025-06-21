// src/pages/Documents/InvoiceList.jsx
import React, { useState, useEffect } from "react";
import {
  Search,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  User,
  Plane,
  Users,
  Ticket,
} from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import DateRangeSelector from "../View/components/DateRangeSelector";
import FlightStatusFilter from "../View/components/FlightStatusFilter";
import { useInvoiceData } from "./hooks/useInvoiceData";

const InvoiceList = () => {
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

  const { loading, filteredTickets, fetchFlightTickets } = useInvoiceData({
    startDate,
    endDate,
    searchTerm,
    filterStatus,
    sortField,
    sortDirection,
  });

  useEffect(() => {
    fetchFlightTickets();
  }, [startDate, endDate, filterStatus, sortField, sortDirection]);

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

  // ฟังก์ชันแสดง Ticket Number จากผู้โดยสารคนแรก
  const getTicketNumberDisplay = (ticket) => {
    if (ticket.firstPassengerTicketInfo) {
      const { ticket_number, ticket_code } = ticket.firstPassengerTicketInfo;

      if (ticket_number && ticket_code) {
        return `${ticket_number}-${ticket_code}`;
      } else if (ticket_number) {
        return ticket_number;
      } else if (ticket_code) {
        return ticket_code;
      }
    }
    return "-";
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section - เหมือน FlightTicketsView */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                รายการใบแจ้งหนี้ (Invoice List)
              </h1>
              <p className="text-sm text-gray-500">
                จัดการและติดตามรายการใบแจ้งหนี้ทั้งหมด
              </p>
            </div>
            {/* <div className="mt-4 md:mt-0">
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium flex items-center"
                onClick={() => setIsFilterVisible(!isFilterVisible)}
              >
                <Filter size={16} className="mr-2" />
                ตัวกรอง
              </button>
            </div> */}
          </div>
        </div>

        {/* Date Range Selector - เหมือน FlightTicketsView */}
        <DateRangeSelector
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* Status Filter - เหมือน FlightTicketsView */}
        {isFilterVisible && (
          <FlightStatusFilter
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
          />
        )}

        {/* Table Section - เหมือน FlightTicketsView แต่ไม่มี Status และ Actions */}
        <div className="bg-white shadow-sm rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr className="text-center">
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("po_number")}
                  >
                    <div className="flex items-center justify-center">
                      รหัส PO
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
                  // Loading state - เหมือน FlightTicketsView
                  Array.from({ length: itemsPerPage }).map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </td>
                    </tr>
                  ))
                ) : currentTickets.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
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
                      {/* รหัส PO */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {ticket.po_number || "-"}
                      </td>

                      {/* Customer */}
                      <td className="px-2 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User size={16} className="text-gray-400 mr-2" />
                          <div className="text-sm font-medium text-gray-900">
                            {ticket.customer?.code ||
                              ticket.customer?.name ||
                              "-"}
                          </div>
                        </div>
                      </td>

                      {/* Supplier */}
                      <td className="px-2 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Plane size={16} className="text-gray-400 mr-2" />
                          <div className="text-sm font-medium text-gray-900">
                            {ticket.supplier?.code ||
                              ticket.supplier?.name ||
                              "-"}
                          </div>
                        </div>
                      </td>

                      {/* Pax's Name */}
                      <td className="px-2 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Users size={16} className="text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">
                            {ticket.passengersDisplay}
                          </div>
                        </div>
                      </td>

                      {/* Routing */}
                      <td className="px-2 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {ticket.routingDisplay}
                        </div>
                      </td>

                      {/* Ticket Number */}
                      <td className="px-2 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center ">
                          <Ticket size={16} className="text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">
                            {getTicketNumberDisplay(ticket)}
                          </div>
                        </div>
                      </td>

                      {/* Code */}
                      <td className="px-2 py-4 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-900">
                          {ticket.code || "-"}
                        </div>
                      </td>

                      {/* Created At */}
                      <td className="px-2 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center">
                          <Calendar size={16} className="text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">
                            {formatDateTime(ticket.created_at)}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination - เหมือน FlightTicketsView */}
          {!loading && currentTickets.length > 0 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    แสดง{" "}
                    <span className="font-medium">{indexOfFirstItem + 1}</span>{" "}
                    ถึง{" "}
                    <span className="font-medium">
                      {Math.min(indexOfLastItem, filteredTickets.length)}
                    </span>{" "}
                    จาก{" "}
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
                      const pageNumber = index + 1;
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 2 &&
                          pageNumber <= currentPage + 2)
                      ) {
                        return (
                          <button
                            key={index}
                            onClick={() => paginate(pageNumber)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === pageNumber
                                ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      } else if (
                        pageNumber === currentPage - 3 ||
                        pageNumber === currentPage + 3
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
    </div>
  );
};

export default InvoiceList;
