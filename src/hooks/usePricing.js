// ไฟล์: src/hooks/usePricing.js
import { useState } from "react";

/**
 * Custom hook สำหรับจัดการข้อมูลราคา
 * @param {Object} initialPricing - ข้อมูลราคาเริ่มต้น
 * @param {number} initialVatPercent - เปอร์เซ็นต์ภาษีเริ่มต้น
 * @returns {Object} - ข้อมูลและฟังก์ชันที่เกี่ยวข้องกับราคา
 */
const usePricing = (
  initialPricing = {
    adult: { net: "", sale: "", pax: 0, total: "0" },
    child: { net: "", sale: "", pax: 0, total: "0" },
    infant: { net: "", sale: "", pax: 0, total: "0" },
  },
  initialVatPercent = 7
) => {
  const [pricing, setPricing] = useState(initialPricing);
  const [vatPercent, setVatPercent] = useState(initialVatPercent);

  // ฟังก์ชันอัพเดทข้อมูลราคา
  const updatePricing = (category, field, value, total) => {
    setPricing({
      ...pricing,
      [category]: {
        ...pricing[category],
        [field]: value,
        total: total || pricing[category].total,
      },
    });
  };

  // คำนวณราคารวมก่อนภาษี
  const calculateSubtotal = () => {
    const adultTotal = parseFloat(pricing.adult?.total || 0);
    const childTotal = parseFloat(pricing.child?.total || 0);
    const infantTotal = parseFloat(pricing.infant?.total || 0);

    return adultTotal + childTotal + infantTotal;
  };

  // คำนวณภาษี
  const calculateVat = () => {
    return calculateSubtotal() * (vatPercent / 100);
  };

  // คำนวณราคารวมทั้งหมด
  const calculateTotal = () => {
    return calculateSubtotal() + calculateVat();
  };

  return {
    pricing,
    setPricing,
    vatPercent,
    setVatPercent,
    updatePricing,
    calculateSubtotal,
    calculateVat,
    calculateTotal,
  };
};

export default usePricing;
