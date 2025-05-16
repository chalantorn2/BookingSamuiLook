import React from "react";
import { CheckCircle, Clock } from "lucide-react";

/**
 * คอมโพเนนต์สำหรับกรองตามสถานะของตั๋วเครื่องบิน
 * @param {Object} props - คุณสมบัติของคอมโพเนนต์
 * @param {string} props.filterStatus - สถานะที่เลือกในตัวกรอง
 * @param {Function} props.setFilterStatus - ฟังก์ชันตั้งค่าตัวกรองสถานะ
 */
const FlightStatusFilter = ({ filterStatus, setFilterStatus }) => {
  // สถานะทั้งหมดที่สามารถกรองได้
  const statuses = [
    { id: "all", name: "ทั้งหมด", icon: null, color: "gray" },
    { id: "confirmed", name: "Invoiced", icon: CheckCircle, color: "green" },
    { id: "not_invoiced", name: "Not Invoiced", icon: Clock, color: "yellow" },
  ];

  // กำหนดสีพื้นหลังตามสถานะ
  const getColorClass = (color, isSelected) => {
    const colorMap = {
      green: isSelected
        ? "bg-green-100 text-green-800 border-green-300"
        : "border-gray-300 hover:bg-green-50",
      yellow: isSelected
        ? "bg-yellow-100 text-yellow-800 border-yellow-300"
        : "border-gray-300 hover:bg-yellow-50",
      gray: isSelected
        ? "bg-gray-100 text-gray-800 border-gray-300"
        : "border-gray-300 hover:bg-gray-50",
    };

    return colorMap[color] || colorMap.gray;
  };

  return (
    <div className="bg-gray-50 p-4 mb-4 border-t border-b border-gray-200">
      <h3 className="text-sm font-medium text-gray-700 mb-3">กรองตามสถานะ</h3>
      <div className="flex flex-wrap gap-2">
        {statuses.map((status) => {
          const isSelected = filterStatus === status.id;
          const Icon = status.icon;

          return (
            <button
              key={status.id}
              onClick={() => setFilterStatus(status.id)}
              className={`flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${getColorClass(
                status.color,
                isSelected
              )}`}
            >
              {Icon && <Icon size={14} className="mr-1" />}
              <span>{status.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FlightStatusFilter;
