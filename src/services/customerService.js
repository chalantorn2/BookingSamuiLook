import { supabase, insertData, fetchData } from "./supabase";

// ฟังก์ชันตัดข้อความให้มีความยาวสูงสุด
const truncateText = (text, maxLength = 50) => {
  if (!text) return text;
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export const getCustomers = async (search = "", limit = 10) => {
  try {
    let query = supabase
      .from("customers")
      .select("*")
      .eq("active", true)
      .order("name");

    if (search) {
      // เพิ่มการค้นหาด้วยรหัส (code)
      query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data.map((customer) => ({
      ...customer,
      name: truncateText(customer.name),
      address: truncateText(customer.address),
      full_name: customer.name,
      full_address: customer.address,
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

// ในไฟล์ customerService.js
export const createCustomer = async (customerData) => {
  try {
    // ตรวจสอบรหัสลูกค้า
    if (customerData.code) {
      // ตรวจสอบความยาว 3-5 ตัว
      if (customerData.code.length < 3 || customerData.code.length > 5) {
        return { success: false, error: "รหัสลูกค้าต้องเป็น 3-5 ตัวอักษร" };
      }

      // ตรวจสอบว่ามีรหัสซ้ำหรือไม่
      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("*")
        .eq("code", customerData.code)
        .eq("active", true);

      if (existingCustomer && existingCustomer.length > 0) {
        return { success: false, error: "รหัสลูกค้านี้มีอยู่ในระบบแล้ว" };
      }
    }

    // เตรียมข้อมูลสำหรับบันทึก
    const payload = {
      name: customerData.name,
      code: customerData.code || null,
      address: customerData.address || null,
      id_number: customerData.id_number || null,
      phone: customerData.phone || null,
      credit_days: customerData.credit_days || 0,
      branch_type: customerData.branch_type || "Head Office",
      branch_number: customerData.branch_number || null,
      active: true,
    };

    const { data, error } = await supabase
      .from("customers")
      .insert(payload)
      .select();

    if (error) throw error;
    return { success: true, customerId: data[0].id };
  } catch (error) {
    console.error("Error creating customer:", error);
    return { success: false, error: error.message };
  }
};

export const updateCustomer = async (id, customerData) => {
  try {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!customerData.name) {
      throw new Error("Customer name is required");
    }

    // ตรวจสอบรหัสลูกค้า
    if (customerData.code) {
      // ตรวจสอบความยาว 3-5 ตัว
      if (customerData.code.length < 3 || customerData.code.length > 5) {
        throw new Error("รหัสลูกค้าต้องเป็น 3-5 ตัวอักษร");
      }

      // ตรวจสอบว่ามีรหัสซ้ำหรือไม่
      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("*")
        .eq("code", customerData.code)
        .eq("active", true)
        .neq("id", id); // ไม่นับรหัสของลูกค้าคนนี้

      if (existingCustomer && existingCustomer.length > 0) {
        throw new Error("รหัสลูกค้านี้มีอยู่ในระบบแล้ว");
      }
    }

    // ตรวจสอบความถูกต้องของข้อมูลสาขา
    if (customerData.branch_type === "Branch" && !customerData.branch_number) {
      throw new Error("Branch number is required when branch type is Branch");
    }

    const payload = {
      name: customerData.name,
      code: customerData.code || null,
      address: customerData.address || null,
      id_number: customerData.id_number || null,
      phone: customerData.phone || null,
      branch_type: customerData.branch_type || "Head Office",
      branch_number:
        customerData.branch_type === "Branch"
          ? customerData.branch_number
          : null,
      credit_days: customerData.credit_days || 0,
    };

    const { data, error } = await supabase
      .from("customers")
      .update(payload)
      .eq("id", id)
      .select();

    if (error) {
      console.error("Database error when updating customer:", error);
      throw error;
    }

    return { success: true, customer: data ? data[0] : null };
  } catch (error) {
    console.error("Error updating customer:", error);
    return { success: false, error: error.message };
  }
};
