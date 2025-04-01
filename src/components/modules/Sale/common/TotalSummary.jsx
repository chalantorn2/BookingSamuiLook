import React from "react";

/**
 * TotalSummary Component - ใช้สำหรับแสดงยอดรวมทั้งหมดในหน้าต่างๆ
 *
 * @param {Object} props - Properties ของ component
 * @param {number} props.subtotal - ยอดรวมก่อนภาษี
 * @param {number} props.vatPercent - เปอร์เซ็นต์ภาษีมูลค่าเพิ่ม (default: 0)
 * @param {number} props.vatAmount - จำนวนเงินภาษีมูลค่าเพิ่ม (ถ้าไม่กำหนด จะคำนวณจาก subtotal * vatPercent)
 * @param {number} props.total - ยอดรวมทั้งสิ้น (ถ้าไม่กำหนด จะคำนวณจาก subtotal + vatAmount)
 * @param {Object} props.config - การตั้งค่าเพิ่มเติม (optional)
 * @param {boolean} props.config.showBorder - แสดงเส้นขอบหรือไม่ (default: true)
 * @param {string} props.config.size - ขนาดของ component ('sm', 'md', 'lg') (default: 'md')
 * @param {string} props.config.align - จัดตำแหน่ง ('left', 'right', 'center') (default: 'right')
 * @returns {JSX.Element}
 */
const TotalSummary = ({
  subtotal = 0,
  vatPercent = 0,
  vatAmount,
  total,
  config = {
    showBorder: true,
    size: "md",
    align: "right",
  },
}) => {
  // คำนวณภาษีและยอดรวมถ้าไม่ได้กำหนดมา
  const calculatedVatAmount =
    vatAmount !== undefined ? vatAmount : (subtotal * vatPercent) / 100;
  const calculatedTotal =
    total !== undefined ? total : subtotal + calculatedVatAmount;

  // กำหนดขนาดตาม config
  const widthClass =
    config.size === "sm"
      ? "w-full max-w-xs"
      : config.size === "lg"
      ? "w-full max-w-xl"
      : "w-full max-w-md";

  // กำหนดการจัดวาง
  const alignClass =
    config.align === "left"
      ? "mr-auto"
      : config.align === "center"
      ? "mx-auto"
      : "ml-auto";

  // ฟังก์ชันสำหรับการ format ตัวเลขเป็นรูปแบบเงิน
  const formatCurrency = (amount) => {
    return parseFloat(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div
      className={`${widthClass} ${alignClass} ${
        config.showBorder ? "border border-gray-200 rounded-lg" : ""
      } bg-blue-50 p-4 rounded-md`}
    >
      <div className="flex justify-between mb-2">
        <div className="font-medium">ยอดรวมเป็นเงิน</div>
        <div className="font-bold text-gray-700">
          {formatCurrency(subtotal)}
        </div>
      </div>
      <div className="flex justify-between mb-2">
        <div className="font-medium">ภาษีมูลค่าเพิ่ม {vatPercent}%</div>
        <div className="text-gray-700">
          {formatCurrency(calculatedVatAmount)}
        </div>
      </div>
      <div className="flex justify-between border-t border-blue-200 pt-2 mt-2">
        <div className="font-semibold">ยอดรวมทั้งสิ้น</div>
        <div className="font-bold text-blue-600 text-xl">
          {formatCurrency(calculatedTotal)}
        </div>
      </div>
    </div>
  );
};

export default TotalSummary;
