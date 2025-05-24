import { supabase } from "./supabase";

export const getSuppliers = async (
  type = "Airline",
  search = "",
  limit = 100
) => {
  try {
    let query = supabase.from("information").select("*").eq("active", true);

    // กรองตามประเภท (Airline, Voucher, Other)
    if (type === "Airline") {
      // ใช้ category เดิม
      query = query.eq("category", "airline");
    } else if (type === "Voucher") {
      query = query.eq("category", "supplier-voucher");
    } else if (type === "Other") {
      query = query.eq("category", "supplier-other");
    }

    // ถ้ามีการใช้คอลัมน์ type แล้ว สามารถเพิ่มเงื่อนไขได้
    if (type) {
      query = query.or(
        `type.eq.${type},category.eq.${
          type === "Airline"
            ? "airline"
            : type === "Voucher"
            ? "supplier-voucher"
            : type === "Other"
            ? "supplier-other"
            : ""
        }`
      );
    }

    // ค้นหาตามชื่อ, รหัส, หรือ numeric_code
    if (search) {
      query = query.or(
        `code.ilike.%${search}%,name.ilike.%${search}%,numeric_code.ilike.%${search}%`
      );
    }

    // จำกัดจำนวนผลลัพธ์
    if (limit) {
      query = query.limit(limit);
    }

    // เรียงข้อมูลตามรหัส
    query = query.order("code");

    const { data, error } = await query;

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return [];
  }
};

export const getSupplierById = async (id) => {
  try {
    const { data, error } = await supabase
      .from("information")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching supplier:", error);
    return null;
  }
};

export const createSupplier = async (supplierData) => {
  try {
    // แปลงประเภทเป็น category ที่สอดคล้องกับโครงสร้างเดิม
    let category = "supplier-other"; // ค่าเริ่มต้น

    if (supplierData.type === "Airline") {
      category = "airline";
    } else if (supplierData.type === "Voucher") {
      category = "supplier-voucher";
    } else if (supplierData.type === "Other") {
      category = "supplier-other";
    }

    const payload = {
      category: category,
      code: supplierData.code,
      name: supplierData.name,
      type: supplierData.type || "Other",
      numeric_code: supplierData.numeric_code || null,
      active: true,
    };

    const { data, error } = await supabase
      .from("information")
      .insert(payload)
      .select();

    if (error) throw error;
    return { success: true, supplierId: data[0].id };
  } catch (error) {
    console.error("Error creating supplier:", error);
    return { success: false, error: error.message };
  }
};
