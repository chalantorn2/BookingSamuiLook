import React from "react";
import { Calendar, Search } from "lucide-react";

/**
 * คอมโพเนนต์สำหรับเลือกช่วงวันที่และค้นหา
 * @param {Object} props - คุณสมบัติของคอมโพเนนต์
 * @param {string} props.startDate - วันที่เริ่มต้น (รูปแบบ 'YYYY-MM-DD')
 * @param {string} props.endDate - วันที่สิ้นสุด (รูปแบบ 'YYYY-MM-DD')
 * @param {Function} props.setStartDate - ฟังก์ชันตั้งค่าวันที่เริ่มต้น
 * @param {Function} props.setEndDate - ฟังก์ชันตั้งค่าวันที่สิ้นสุด
 * @param {string} props.searchTerm - คำค้นหา
 * @param {Function} props.setSearchTerm - ฟังก์ชันตั้งค่าคำค้นหา
 */
const DateRangeSelector = ({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  searchTerm,
  setSearchTerm,
}) => {
  return (
    <div className="bg-white shadow-sm p-4 mb-4">
      <div className="flex flex-wrap gap-4 items-center">
        {/* ตัวเลือกช่วงวันที่ */}
        <div className="flex space-x-2 items-center">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar size={18} className="text-gray-400" />
            </div>
            <input
              type="date"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="ตั้งแต่วันที่"
            />
          </div>
          <span className="text-gray-500">ถึง</span>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar size={18} className="text-gray-400" />
            </div>
            <input
              type="date"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="ถึงวันที่"
            />
          </div>
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
      </div>
    </div>
  );
};

export default DateRangeSelector;
