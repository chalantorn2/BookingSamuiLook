import React from "react";
import { Activity, Clock, User, Building, Shield } from "lucide-react";
// import { StatusBadge } from "./StatusBadges";
import Pagination from "./Pagination";
import CancelledDetailsModal from "../../View/components/CancelledDetailsModal";

const TransactionsTable = ({
  loading,
  currentItems,
  dateRange,
  sortField,
  sortDirection,
  setSortField,
  setSortDirection,
  totalPages,
  currentPage,
  setCurrentPage,
  indexOfFirstItem,
  indexOfLastItem,
  filteredData,
  showCancelledDetails, // เพิ่ม
  setShowCancelledDetails, // เพิ่ม
  selectedCancelledTicket, // เพิ่ม
  setSelectedCancelledTicket, // เพิ่ม
}) => {
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const formatDate = (date) => {
    if (!date || isNaN(new Date(date).getTime())) return "-";
    const dateObj = new Date(date);
    const day = dateObj.getDate().toString().padStart(2, "0");
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

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

  const getStatusDisplay = (item) => {
    // ตรวจสอบสถานะยกเลิก
    if (item.status === "cancelled") {
      return (
        <button
          onClick={() => {
            setSelectedCancelledTicket({
              referenceNumber: item.referenceNumber,
              cancelledAt: item.cancelled_at,
              cancelledBy: item.cancelled_by_name,
              cancelReason: item.cancel_reason,
              poNumber: item.po_number,
              customer: item.customer,
              supplier: item.supplier,
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
    if (item.po_number && item.po_number.trim() !== "") {
      return (
        <div className="flex items-center justify-center">
          <span className="text-sm font-medium text-gray-900">
            {item.po_number}
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
    <div className="px-4 pb-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <Activity size={20} className="mr-2 text-blue-500" />
        รายการทั้งหมด
        {dateRange.startDate === dateRange.endDate
          ? ` (${formatDate(dateRange.startDate)})`
          : ` (${formatDate(dateRange.startDate)} - ${formatDate(
              dateRange.endDate
            )})`}
      </h2>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("reference_number")}
                  >
                    <div className="flex items-center">ID</div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("date")}
                  >
                    <div className="flex items-center">DATE</div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("customer")}
                  >
                    <div className="flex items-center">CUSTOMER</div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("supplier")}
                  >
                    <div className="flex items-center">SUPPLIER</div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center justify-center">
                      STATUS
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("created_by")}
                  >
                    <div className="flex items-center">CREATE BY</div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("timestamp")}
                  >
                    <div className="flex items-center">TIMESTAMP</div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      ไม่พบข้อมูลในช่วงเวลาที่เลือก
                    </td>
                  </tr>
                ) : (
                  currentItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {item.referenceNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock size={16} className="text-gray-400 mr-2" />
                          {formatDate(item.date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <User size={16} className="text-gray-400 mr-2" />
                          {item.customer}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Building size={16} className="text-gray-400 mr-2" />
                          {item.supplier}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {getStatusDisplay(item)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Shield size={16} className="text-gray-400 mr-2" />
                          {item.createdBy}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(item.timestamp)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
              indexOfFirstItem={indexOfFirstItem}
              indexOfLastItem={indexOfLastItem}
              filteredData={filteredData}
            />
          )}
        </div>
      )}
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

export default TransactionsTable;
