import React, { useState } from "react";

const TotalSummary = ({
  subtotal = 0,
  total,
  config = {
    showBorder: true,
    size: "md",
    align: "right",
  },
  extras = [],
  pricing = {},
  setFormData,
}) => {
  const [vatPercentInput, setVatPercentInput] = useState("0");

  // อัปเดต formData.vatPercent เมื่อ vatPercentInput เปลี่ยน
  const handleVatChange = (e) => {
    const value = e.target.value;
    if (value === "" || (Number(value) >= 0 && Number(value) <= 100)) {
      setVatPercentInput(value);
      setFormData((prev) => ({ ...prev, vatPercent: value }));
    }
  };

  const calculatedSubtotal = subtotal;
  const calculatedVatAmount =
    (calculatedSubtotal * parseFloat(vatPercentInput || 0)) / 100;
  const calculatedTotal =
    total !== undefined ? total : calculatedSubtotal + calculatedVatAmount;

  const widthClass =
    config.size === "sm"
      ? "w-full max-w-xs"
      : config.size === "lg"
      ? "w-full max-w-xl"
      : "w-full max-w-md";

  const alignClass =
    config.align === "left"
      ? "mr-auto"
      : config.align === "center"
      ? "mx-auto"
      : "ml-auto";

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
          {formatCurrency(calculatedSubtotal)}
        </div>
      </div>
      <div className="flex justify-between mb-2 items-center">
        <div className="font-medium">
          ภาษีมูลค่าเพิ่ม
          <input
            type="number"
            value={vatPercentInput}
            onChange={handleVatChange}
            className="mx-2 w-8 p-1 border text-center rounded-md"
            placeholder="0"
            min="0"
            max="100"
            step="0.01"
          />
          %
        </div>
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
