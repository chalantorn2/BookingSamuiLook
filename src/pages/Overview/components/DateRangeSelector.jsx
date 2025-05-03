import React from "react";
import { Calendar, Search } from "lucide-react";

/**
 * คอมโพเนนต์สำหรับเลือกช่วงเวลาและค้นหา
 * @param {Object} props - คุณสมบัติของคอมโพเนนต์
 * @param {string} props.dateRange - ช่วงเวลาปัจจุบัน ('day', 'week', 'month', 'year')
 * @param {string} props.selectedDate - วันที่เลือก (รูปแบบ 'YYYY-MM-DD')
 * @param {number} props.selectedMonth - เดือนที่เลือก (1-12)
 * @param {number} props.selectedYear - ปีที่เลือก
 * @param {Function} props.setSelectedDate - ฟังก์ชันตั้งค่าวันที่เลือก
 * @param {Function} props.setSelectedMonth - ฟังก์ชันตั้งค่าเดือนที่เลือก
 * @param {Function} props.setSelectedYear - ฟังก์ชันตั้งค่าปีที่เลือก
 * @param {Function} props.handleDateRangeChange - ฟังก์ชันจัดการการเปลี่ยนช่วงเวลา
 * @param {string} props.searchTerm - คำค้นหา
 * @param {Function} props.setSearchTerm - ฟังก์ชันตั้งค่าคำค้นหา
 */
const DateRangeSelector = ({
  dateRange,
  selectedDate,
  selectedMonth,
  selectedYear,
  setSelectedDate,
  setSelectedMonth,
  setSelectedYear,
  handleDateRangeChange,
  searchTerm,
  setSearchTerm,
}) => {
  return (
    <div className="bg-white shadow-sm p-4 mb-4">
      <div className="flex flex-wrap gap-4 items-center">
        {/* ปุ่มเลือกช่วงเวลา */}
        <div className="flex space-x-1">
          <button
            onClick={() => handleDateRangeChange("day")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              dateRange === "day"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            วันนี้
          </button>
          <button
            onClick={() => handleDateRangeChange("week")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              dateRange === "week"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            สัปดาห์นี้
          </button>
          <button
            onClick={() => handleDateRangeChange("month")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              dateRange === "month"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            เดือนนี้
          </button>
          <button
            onClick={() => handleDateRangeChange("year")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              dateRange === "year"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            ปีนี้
          </button>
        </div>

        {/* ช่องค้นหา */}
        <div className="ml-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="ค้นหา..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* เลือกวันที่ตาม dateRange */}
        {dateRange === "day" && (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar size={18} className="text-gray-400" />
            </div>
            <input
              type="date"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        )}

        {dateRange === "month" && (
          <div className="flex space-x-2">
            <select
              className="pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            >
              <option value="1">มกราคม</option>
              <option value="2">กุมภาพันธ์</option>
              <option value="3">มีนาคม</option>
              <option value="4">เมษายน</option>
              <option value="5">พฤษภาคม</option>
              <option value="6">มิถุนายน</option>
              <option value="7">กรกฎาคม</option>
              <option value="8">สิงหาคม</option>
              <option value="9">กันยายน</option>
              <option value="10">ตุลาคม</option>
              <option value="11">พฤศจิกายน</option>
              <option value="12">ธันวาคม</option>
            </select>

            <select
              className="pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {Array.from(
                { length: 5 },
                (_, i) => new Date().getFullYear() - 2 + i
              ).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        )}

        {dateRange === "year" && (
          <div className="relative">
            <select
              className="pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {Array.from(
                { length: 10 },
                (_, i) => new Date().getFullYear() - 5 + i
              ).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default DateRangeSelector;
