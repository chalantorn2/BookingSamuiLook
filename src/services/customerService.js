import { supabase, insertData, fetchData } from "./supabase";

// ฟังก์ชันตัดข้อความให้มีความยาวสูงสุด
const truncateText = (text, maxLength = 50) => {
  if (!text) return text;
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export const getCustomers = async (search = "", limit = 10) => {
  try {
    let query = supabase.from("customers").select("*").order("name");

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    // ตัดข้อความสำหรับการแสดงผลในตาราง
    return data.map((customer) => ({
      ...customer,
      name: truncateText(customer.name, 30), // ตัดชื่อให้ยาวไม่เกิน 30 ตัวอักษร
      address: truncateText(customer.address, 40), // ตัดที่อยู่ให้ยาวไม่เกิน 40 ตัวอักษร
      full_name: customer.name, // เก็บชื่อเต็มไว้สำหรับ tooltip
      full_address: customer.address, // เก็บที่อยู่เต็มไว้สำหรับ tooltip
    }));
  } catch (error) {
    console.error("Error fetching customers:", error);
    return [];
  }
};

export const getCustomerById = async (id) => {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching customer:", error);
    return null;
  }
};

export const createCustomer = async (customerData) => {
  try {
    // ตรวจสอบว่ามีข้อมูลที่จำเป็นหรือไม่
    if (!customerData.name) {
      throw new Error("Customer name is required");
    }

    // สร้าง payload ที่สอดคล้องกับโครงสร้างตาราง customers
    const payload = {
      name: customerData.name,
      address: customerData.address || null,
      id_number:
        customerData.idNumber ||
        customerData.id_number ||
        customerData.id ||
        null,
      phone: customerData.phone || null, // เพิ่ม phone ใน payload
    };

    console.log("Creating customer with payload:", payload);

    // ใช้ .insert() โดยตรงแทนการใช้ insertData เพื่อให้มั่นใจว่าใช้งานได้
    const { data, error } = await supabase
      .from("customers")
      .insert(payload)
      .select();

    if (error) {
      console.error("Database error when creating customer:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error("Failed to create customer: No data returned");
    }

    return { success: true, customerId: data[0].id, customer: data[0] };
  } catch (error) {
    console.error("Error creating customer:", error);
    return { success: false, error: error.message };
  }
};
