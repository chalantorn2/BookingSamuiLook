import { supabase, insertData, fetchData } from "./supabase";

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
    return data;
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
