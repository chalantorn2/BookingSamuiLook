import React from "react";

/**
 * คอมโพเนนต์แสดงการ์ดสรุปข้อมูล
 * @param {Object} props - คุณสมบัติของคอมโพเนนต์
 * @param {Object} props.summary - ข้อมูลสรุป
 */
const SummaryCards = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 px-4 mb-6">
      {/* Total Items Card */}
      <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500 flex flex-col">
        <h3 className="text-sm font-medium text-gray-500">รายการทั้งหมด</h3>
        <p className="text-2xl font-bold text-gray-800">
          {summary.total} รายการ
        </p>
        <p className="text-sm text-gray-500 mt-1">
          ยอดเงินรวม: ฿
          {summary.totalAmount.toLocaleString("th-TH", {
            minimumFractionDigits: 2,
          })}
        </p>
      </div>

      {/* Confirmed Card */}
      <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500 flex flex-col">
        <h3 className="text-sm font-medium text-gray-500">ยืนยันแล้ว</h3>
        <p className="text-2xl font-bold text-gray-800">
          {summary.confirmed} รายการ
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {summary.total > 0
            ? Math.round((summary.confirmed / summary.total) * 100)
            : 0}
          % ของทั้งหมด
        </p>
      </div>

      {/* Pending Card */}
      <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500 flex flex-col">
        <h3 className="text-sm font-medium text-gray-500">รอดำเนินการ</h3>
        <p className="text-2xl font-bold text-gray-800">
          {summary.pending} รายการ
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {summary.total > 0
            ? Math.round((summary.pending / summary.total) * 100)
            : 0}
          % ของทั้งหมด
        </p>
      </div>

      {/* Partially Paid Card */}
      <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500 flex flex-col">
        <h3 className="text-sm font-medium text-gray-500">ชำระบางส่วน</h3>
        <p className="text-2xl font-bold text-gray-800">
          {summary.partially} รายการ
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {summary.total > 0
            ? Math.round((summary.partially / summary.total) * 100)
            : 0}
          % ของทั้งหมด
        </p>
      </div>

      {/* Paid Card */}
      <div className="bg-teal-50 rounded-lg p-4 border-l-4 border-teal-500 flex flex-col">
        <h3 className="text-sm font-medium text-gray-500">ชำระแล้ว</h3>
        <p className="text-2xl font-bold text-gray-800">
          {summary.paid} รายการ
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {summary.total > 0
            ? Math.round((summary.paid / summary.total) * 100)
            : 0}
          % ของทั้งหมด
        </p>
      </div>
    </div>
  );
};

export default SummaryCards;
