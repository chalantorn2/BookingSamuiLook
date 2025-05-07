import { createClient } from "@supabase/supabase-js";

// ดึงค่า URL และ API Key จากไฟล์ .env ที่กำหนดไว้
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ตรวจสอบว่ามีค่า URL และ API Key หรือไม่
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase URL or Anonymous Key. Check your .env file.");
}

// สร้าง Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// ฟังก์ชันช่วยเหลือสำหรับการดึงข้อมูลและจัดการข้อผิดพลาด
export const fetchData = async ({
  table,
  columns = "*",
  filters = {},
  limit = null,
  orderBy = null,
  orderDirection = "desc",
  page = null,
  pageSize = 10,
}) => {
  try {
    let query = supabase.from(table).select(columns);

    // เพิ่มการกรอง
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (typeof value === "object" && value.operator) {
          // กรณีที่มีการระบุตัวดำเนินการเช่น eq, gt, lt, etc.
          query = query.filter(key, value.operator, value.value);
        } else {
          // ค่าตรงเป๊ะ
          query = query.eq(key, value);
        }
      }
    });

    // เพิ่มการเรียงลำดับ
    if (orderBy) {
      query = query.order(orderBy, { ascending: orderDirection === "asc" });
    }

    // เพิ่มการจำกัดจำนวน
    if (limit) {
      query = query.limit(limit);
    }

    // เพิ่มการแบ่งหน้า
    if (page !== null) {
      const from = page * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return { data, count };
  } catch (error) {
    console.error(`Error fetching data from ${table}:`, error);
    throw error;
  }
};

// ฟังก์ชันสำหรับการเพิ่มข้อมูล
// services/supabase.js - แก้ไขส่วน insertData function
export const insertData = async (table, data) => {
  try {
    // ถ้ามีฟิลด์ created_at และไม่ได้กำหนดค่าไว้ ให้กำหนดเป็นเวลาปัจจุบันในรูปแบบ ISO string
    // แต่ต้องปรับเขตเวลาให้เป็น UTC+7 (เวลาประเทศไทย)
    if (!data.created_at) {
      // สร้างวัตถุ Date ปัจจุบันและแปลงเป็น ISO string
      // (วิธีนี้จะส่งเวลาในรูปแบบ ISO ที่เป็น UTC แต่เป็นเวลาที่ถูกปรับแล้ว)
      const now = new Date();
      // ไม่ต้องแก้ timezone ที่นี่ เพราะ toISOString จะแปลงเป็น UTC โดยอัตโนมัติ
      data.created_at = now.toISOString();
    }

    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select();

    if (error) {
      throw error;
    }

    return result;
  } catch (error) {
    console.error(`Error inserting data to ${table}:`, error);
    throw error;
  }
};
// ฟังก์ชันสำหรับการอัพเดทข้อมูล
export const updateData = async (table, id, data) => {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq("id", id)
      .select();

    if (error) {
      throw error;
    }

    return result;
  } catch (error) {
    console.error(`Error updating data in ${table}:`, error);
    throw error;
  }
};

// ฟังก์ชันสำหรับการลบข้อมูล
export const deleteData = async (table, id) => {
  try {
    const { error } = await supabase.from(table).delete().eq("id", id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error(`Error deleting data from ${table}:`, error);
    throw error;
  }
};

// ฟังก์ชันสำหรับการเรียกใช้ฟังก์ชันใน Supabase
export const callFunction = async (functionName, payload = {}) => {
  try {
    const { data, error } = await supabase.rpc(functionName, payload);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Error calling function ${functionName}:`, error);
    throw error;
  }
};

export default supabase;
