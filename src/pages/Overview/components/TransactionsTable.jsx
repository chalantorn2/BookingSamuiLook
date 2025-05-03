import React from "react";
import { Activity, Clock, User } from "lucide-react";
import {
  StatusBadge,
  PaymentStatusBadge,
  ServiceTypeBadge,
} from "./StatusBadges";
import Pagination from "./Pagination";

/**
 * คอมโพเนนต์ตารางแสดงรายการธุรกรรม
 * @param {Object} props - คุณสมบัติของคอมโพเนนต์
 * @param {boolean} props.loading - สถานะการโหลดข้อมูล
 * @param {Array} props.currentItems - รายการในหน้าปัจจุบัน
 * @param {string} props.dateRange - ช่วงเวลาที่เลือก
 * @param {string} props.sortField - ฟิลด์ที่ใช้ในการเรียงลำดับ
 * @param {string} props.sortDirection - ทิศทางการเรียงลำดับ
 * @param {Function} props.setSortField - ฟังก์ชันตั้งค่าฟิลด์ที่ใช้ในการเรียงลำดับ
 * @param {Function} props.setSortDirection - ฟังก์ชันตั้งค่าทิศทางการเรียงลำดับ
 * @param {number} props.totalPages - จำนวนหน้าทั้งหมด
 * @param {number} props.currentPage - หน้าปัจจุบัน
 * @param {Function} props.setCurrentPage - ฟังก์ชันตั้งค่าหน้าปัจจุบัน
 * @param {number} props.indexOfFirstItem - ดัชนีของรายการแรกในหน้าปัจจุบัน
 * @param {number} props.indexOfLastItem - ดัชนีของรายการสุดท้ายในหน้าปัจจุบัน
 * @param {Array} props.filteredData - ข้อมูลหลังจากผ่านการกรองแล้ว
 */
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
}) => {
  // ฟังก์ชันจัดการการเรียงลำดับ
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <div className="px-4 pb-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <Activity size={20} className="mr-2 text-blue-500" />
        รายการทั้งหมด
        {dateRange === "day" && " (วันนี้)"}
        {dateRange === "week" && " (สัปดาห์นี้)"}
        {dateRange === "month" && " (เดือนนี้)"}
        {dateRange === "year" && " (ปีนี้)"}
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
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("reference_number")}
                  >
                    <div className="flex items-center">
                      รหัสอ้างอิง
                      {sortField === "reference_number" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("created_at")}
                  >
                    <div className="flex items-center">
                      วันที่
                      {sortField === "created_at" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("customer")}
                  >
                    <div className="flex items-center">
                      ลูกค้า
                      {sortField === "customer" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
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
                    รายละเอียด
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("amount")}
                  >
                    <div className="flex items-center justify-end">
                      จำนวนเงิน
                      {sortField === "amount" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center justify-center">
                      สถานะ
                      {sortField === "status" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("paymentStatus")}
                  >
                    <div className="flex items-center justify-center">
                      การชำระ
                      {sortField === "paymentStatus" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
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
                          {new Date(item.date).toLocaleDateString("th-TH")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <User size={16} className="text-gray-400 mr-2" />
                          {item.customer}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <ServiceTypeBadge type={item.serviceType} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.origin && item.destination ? (
                          <div className="flex items-center">
                            <span className="font-medium">{item.origin}</span>
                            <span className="mx-1">-</span>
                            <span className="font-medium">
                              {item.destination}
                            </span>
                          </div>
                        ) : item.airline && item.flightNumber ? (
                          <div className="flex items-center">
                            <span className="font-medium">{item.airline}</span>
                            <span className="mx-1">/</span>
                            <span>{item.flightNumber}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        ฿
                        {item.amount.toLocaleString("th-TH", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <PaymentStatusBadge status={item.paymentStatus} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
    </div>
  );
};

export default TransactionsTable;
