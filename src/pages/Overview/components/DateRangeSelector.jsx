import React from "react";
import { Calendar, Search } from "lucide-react";

const DateRangeSelector = ({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  searchTerm,
  setSearchTerm,
}) => {
  // แปลงวันที่จาก YYYY-MM-DD เป็น DD/MM/YYYY
  const formatDisplayDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  // แปลงวันที่จาก DD/MM/YYYY เป็น YYYY-MM-DD
  const parseInputDate = (dateString) => {
    if (!dateString) return "";
    const [day, month, year] = dateString.split("/");
    return `${year}-${month}-${day}`;
  };

  // ฟังก์ชันจัดการการเปลี่ยนวันที่
  const handleDateChange = (e, setter) => {
    const value = e.target.value;
    setter(value);
  };

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
              type="text"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={startDate ? formatDisplayDate(startDate) : ""}
              onChange={(e) => handleDateChange(e, setStartDate)}
              placeholder="วัน/เดือน/ปี (เช่น 09/05/2025)"
            />
          </div>
          <span className="text-gray-500">ถึง</span>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={endDate ? formatDisplayDate(endDate) : ""}
              onChange={(e) => handleDateChange(e, setEndDate)}
              placeholder="วัน/เดือน/ปี (เช่น 09/05/2025)"
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
