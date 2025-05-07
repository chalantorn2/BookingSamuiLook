import React from "react";
import { CheckCircle, Clock, XCircle, DollarSign } from "lucide-react";

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
    { id: "confirmed", name: "ยืนยันแล้ว", icon: CheckCircle, color: "green" },
    { id: "pending", name: "รอดำเนินการ", icon: Clock, color: "yellow" },
    { id: "cancelled", name: "ยกเลิก", icon: XCircle, color: "red" },
  ];

  // สถานะการชำระเงิน
  const paymentStatuses = [
    { id: "paid", name: "ชำระแล้ว", icon: CheckCircle, color: "blue" },
    { id: "unpaid", name: "ยังไม่ชำระ", icon: DollarSign, color: "gray" },
    { id: "partially", name: "ชำระบางส่วน", icon: DollarSign, color: "purple" },
    { id: "refunded", name: "คืนเงินแล้ว", icon: DollarSign, color: "pink" },
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
      red: isSelected
        ? "bg-red-100 text-red-800 border-red-300"
        : "border-gray-300 hover:bg-red-50",
      blue: isSelected
        ? "bg-blue-100 text-blue-800 border-blue-300"
        : "border-gray-300 hover:bg-blue-50",
      purple: isSelected
        ? "bg-purple-100 text-purple-800 border-purple-300"
        : "border-gray-300 hover:bg-purple-50",
      pink: isSelected
        ? "bg-pink-100 text-pink-800 border-pink-300"
        : "border-gray-300 hover:bg-pink-50",
      gray: isSelected
        ? "bg-gray-100 text-gray-800 border-gray-300"
        : "border-gray-300 hover:bg-gray-50",
    };

    return colorMap[color] || colorMap.gray;
  };

  return (
    <div className="flex justify-center gap-20 bg-gray-50 p-4 mb-4 border-t border-b border-gray-200">
      <div>
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

      <div className="">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          กรองตามสถานะการชำระเงิน
        </h3>
        <div className="flex flex-wrap gap-2">
          {paymentStatuses.map((status) => {
            const isSelected = filterStatus === `payment_${status.id}`;
            const Icon = status.icon;

            return (
              <button
                key={`payment_${status.id}`}
                onClick={() => setFilterStatus(`payment_${status.id}`)}
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
    </div>
  );
};

export default FlightStatusFilter;
