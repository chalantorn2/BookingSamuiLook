import { supabase } from "./supabase";

/**
 * สร้างเลขอ้างอิงสำหรับเอกสาร
 * @param {string} table - ชื่อตารางในฐานข้อมูล
 * @param {string} prefix - คำนำหน้าเลขอ้างอิง (เช่น FT สำหรับ Flight Ticket)
 * @returns {Promise<string>} - เลขอ้างอิงที่สร้างขึ้น
 */
export const generateReferenceNumber = async (table, prefix = "FT") => {
  // สร้างส่วนของปี (YY)
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2); // ใช้เฉพาะ 2 หลักสุดท้ายของปี

  try {
    // ดึงข้อมูลเลขอ้างอิงล่าสุดจากฐานข้อมูล
    const { data, error } = await supabase
      .from(table)
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
