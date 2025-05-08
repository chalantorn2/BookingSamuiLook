/**
 * formatNumber - แปลงตัวเลขให้มี comma และไม่มีทศนิยม
 * @param {string|number} value - ค่าที่ต้องการ format
 * @returns {string} - ตัวเลขที่มี comma
 */
export const formatNumber = (value) => {
  if (!value && value !== 0) return "";
  const num = parseInt(value.toString().replace(/,/g, "")) || 0;
  return num.toLocaleString("en-US");
};

/**
 * parseInput - ลบ comma ออกจาก string เพื่อให้เป็นตัวเลขสะอาด
 * @param {string} value - string ที่ต้องการลบ comma
 * @returns {string} - string ที่ไม่มี comma
 */
export const parseInput = (value) => {
  if (!value) return "";
  return value.replace(/,/g, "");
};
