// src/utils/helpers.js

/**
 * สร้างเลขอ้างอิงสำหรับเอกสาร
 * @param {string} prefix - คำนำหน้าเลขอ้างอิง (เช่น FT สำหรับ Flight Ticket)
 * @returns {string} - เลขอ้างอิงที่สร้างขึ้น
 */
export const generateReferenceNumber = (prefix = "FT") => {
  // สร้างส่วนของวันที่
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2); // ใช้เฉพาะ 2 หลักสุดท้ายของปี
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  // สร้างเลขสุ่ม 4 หลัก
  const randomPart = Math.floor(1000 + Math.random() * 9000);

  // สร้างเลขอ้างอิงในรูปแบบ PREFIX-YYMMDD-XXXX
  const referenceNumber = `${prefix}-${year}${month}${day}-${randomPart}`;

  return referenceNumber;
};

// utils/helpers.js - เพิ่มฟังก์ชัน formatDateTime
/**
 * แปลงวันที่และเวลาเป็นรูปแบบ dd/mm/yyyy HH:MM และปรับเขตเวลาเป็น UTC+7 (เวลาประเทศไทย)
 * @param {string|Date} dateTime - วันที่และเวลาที่ต้องการแปลง
 * @returns {string} - วันที่และเวลาในรูปแบบ dd/mm/yyyy HH:MM
 */
export const formatDateTime = (dateTime) => {
  if (!dateTime) return "";

  // สร้างวัตถุ Date จากพารามิเตอร์
  const date = new Date(dateTime);

  // แสดงผลตามเขตเวลาประเทศไทย
  return date.toLocaleString("th-TH", {
    timeZone: "Asia/Bangkok",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * แปลงตัวเลขเป็นรูปแบบเงิน
 * @param {number|string} amount - จำนวนเงิน
 * @param {string} locale - รูปแบบภาษา (default: th-TH)
 * @param {string} currency - สกุลเงิน (default: THB)
 * @returns {string} - จำนวนเงินในรูปแบบเงิน
 */
export const formatCurrency = (amount, locale = "th-TH", currency = "THB") => {
  if (amount === null || amount === undefined || isNaN(amount)) return "0.00";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * แปลงข้อความเป็นตัวพิมพ์ใหญ่เฉพาะตัวแรก
 * @param {string} str - ข้อความที่ต้องการแปลง
 * @returns {string} - ข้อความที่แปลงแล้ว
 */
export const capitalizeFirstLetter = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * หาความแตกต่างระหว่างวันที่
 * @param {string|Date} dateStart - วันที่เริ่มต้น
 * @param {string|Date} dateEnd - วันที่สิ้นสุด
 * @returns {number} - จำนวนวันที่แตกต่าง
 */
export const getDaysDifference = (dateStart, dateEnd) => {
  if (!dateStart || !dateEnd) return 0;

  const start = new Date(dateStart);
  const end = new Date(dateEnd);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};
