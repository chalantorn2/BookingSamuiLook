// src/utils/helpers.js
import { supabase } from "../services/supabase";

/**
 * สร้างเลขอ้างอิงสำหรับเอกสาร
 * @param {string} prefix - คำนำหน้าเลขอ้างอิง (เช่น FT สำหรับ Flight Ticket)
 * @returns {string} - เลขอ้างอิงที่สร้างขึ้น
 */
export const generateReferenceNumber = async (prefix = "FT") => {
  // สร้างส่วนของปี (YY)
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2); // ใช้เฉพาะ 2 หลักสุดท้ายของปี

  try {
    // ดึงข้อมูลเลขอ้างอิงล่าสุดจากฐานข้อมูล
    const { data, error } = await supabase
      .from("bookings_ticket")
      .select("reference_number")
      .ilike("reference_number", `${prefix}-%`)
      .order("reference_number", { ascending: false })
      .limit(1);

    if (error) throw error;

    let batchNumber = 1; // เริ่มต้นที่ batch 1
    let sequence = 1; // เริ่มต้นที่ sequence 0001

    if (data && data.length > 0) {
      // แยกส่วนประกอบของเลขอ้างอิงล่าสุด
      const lastRef = data[0].reference_number;
      const parts = lastRef.split("-");

      if (parts.length >= 4) {
        const lastYear = parts[1];

        // ถ้าปีปัจจุบันเท่ากับปีล่าสุด ให้ใช้ค่า batch และ sequence ต่อจากเดิม
        if (lastYear === year) {
          batchNumber = parseInt(parts[2], 10);
          sequence = parseInt(parts[3], 10) + 1;

          // ถ้า sequence เกิน 9999 ให้เพิ่ม batch และ reset sequence
          if (sequence > 9999) {
            batchNumber++;
            sequence = 1;
          }
        }
        // ถ้าเปลี่ยนปี ให้เริ่มต้นใหม่ที่ batch 1 และ sequence 0001
        else {
          batchNumber = 1;
          sequence = 1;
        }
      }
    }

    // จัดรูปแบบ sequence เป็น 4 หลัก (เติม 0 ข้างหน้า)
    const formattedSequence = String(sequence).padStart(4, "0");

    // สร้างเลขอ้างอิงในรูปแบบ PREFIX-YY-B-NNNN
    // โดย PREFIX คือคำนำหน้า, YY คือปี, B คือ batch, NNNN คือ sequence
    return `${prefix}-${year}-${batchNumber}-${formattedSequence}`;
  } catch (error) {
    console.error("Error generating reference number:", error);
    // ในกรณีที่มีข้อผิดพลาด ให้สร้างเลขอ้างอิงแบบง่ายเพื่อให้ระบบยังทำงานได้
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${year}-1-${String(randomPart).padStart(4, "0")}`;
  }
};

/**
 * แปลงวันที่เป็นรูปแบบ ddMMMyy
 * @param {string|Date} date - วันที่ที่ต้องการแปลง
 * @returns {string} - วันที่ในรูปแบบ ddMMMyy
 */
export const formatDate = (date) => {
  if (!date) return "";
  if (typeof date === "string") {
    const d = new Date(date);
    if (isNaN(d.getTime())) return date;
    date = d;
  }

  const day = date.getDate().toString().padStart(2, "0");
  const month = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ][date.getMonth()];
  const year = date.getFullYear().toString().slice(-2);

  return `${day}${month}${year}`;
};

/**
 * แปลงเวลาให้เป็น UTC+7 (เวลาประเทศไทย)
 * @param {Date} date - วันที่ที่ต้องการแปลง
 * @param {boolean} adjustTimezone - ต้องการปรับเวลาตาม timezone หรือไม่ (default: true)
 * @returns {string} - วันที่ในรูปแบบ ISO string ที่ปรับเป็น UTC+7 แล้ว
 */
export const toThaiTimeZone = (date, adjustTimezone = true) => {
  if (!date) return "";

  // Clone วันที่เพื่อไม่ให้แก้ไขต้นฉบับ
  const newDate = new Date(date);

  if (adjustTimezone) {
    // ปรับเวลาให้เป็น UTC+7
    const thaiOffset = 7 * 60 * 60 * 1000; // 7 ชั่วโมงในมิลลิวินาที
    return new Date(newDate.getTime() + thaiOffset).toISOString();
  } else {
    // เมื่อต้องการส่งวันที่ไปยัง Supabase ตามเวลาที่กำหนด
    // ต้องคำนวณ offset ระหว่างเวลาท้องถิ่นกับ UTC แล้วบวกกลับเพื่อชดเชย
    const localOffset = newDate.getTimezoneOffset() * 60 * 1000; // offset ในมิลลิวินาที
    const thaiOffset = -7 * 60 * 60 * 1000; // UTC+7 = -7 ชั่วโมง offset จาก UTC

    // ปรับเวลาจากเวลาท้องถิ่นเป็น UTC+7
    return new Date(newDate.getTime() + localOffset + thaiOffset).toISOString();
  }
};

/**
 * แปลงวันที่และเวลาเป็นรูปแบบ dd/mm/yyyy HH:MM และปรับเขตเวลาเป็น UTC+7 (เวลาประเทศไทย)
 * @param {string|Date} dateTime - วันที่และเวลาที่ต้องการแปลง
 * @param {boolean} fromUTC - บอกว่าวันที่ที่รับมาเป็น UTC หรือไม่ (default: true)
 * @returns {string} - วันที่และเวลาในรูปแบบ dd/mm/yyyy HH:MM
 */
export const formatDateTime = (dateTime, fromUTC = true) => {
  if (!dateTime) return "";

  // สร้างวัตถุ Date จากพารามิเตอร์
  let date = new Date(dateTime);

  // ถ้าเป็นวันที่จาก UTC และต้องการปรับเป็น UTC+7
  if (fromUTC) {
    // บวกเวลาเพิ่มอีก 7 ชั่วโมง
    date = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  }

  // แสดงผลตามเขตเวลาประเทศไทย
  return date.toLocaleString("th-TH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // ใช้รูปแบบ 24 ชั่วโมง
  });
};

/**
 * แสดงวันที่เวลาในรูปแบบไทย (dd/mm/yyyy HH:MM) จากวันที่ใดๆ
 * @param {string|Date} dateTime - วันที่และเวลาที่ต้องการแปลง
 * @returns {string} - วันที่และเวลาในรูปแบบ dd/mm/yyyy HH:MM
 */
export const displayThaiDateTime = (dateTime) => {
  if (!dateTime) return "";

  // สร้างวัตถุ Date จากพารามิเตอร์
  const date = new Date(dateTime);

  // ปรับเป็น UTC+7 (เวลาไทย)
  const thaiTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);

  // จัดรูปแบบการแสดงผล
  return thaiTime.toLocaleString("th-TH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
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

/**
 * แปลงวันที่เป็นรูปแบบไทย (dd/mm/yyyy) โดยเปลี่ยน ค.ศ. เป็น พ.ศ.
 * @param {string|Date} date - วันที่ที่ต้องการแปลง
 * @returns {string} - วันที่ในรูปแบบไทย
 */
export const formatThaiDate = (date) => {
  if (!date) return "";
  if (typeof date === "string") {
    const d = new Date(date);
    if (isNaN(d.getTime())) return date;
    date = d;
  }

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const yearThai = date.getFullYear() + 543; // แปลง ค.ศ. เป็น พ.ศ. โดยบวก 543

  return `${day}/${month}/${yearThai}`;
};
