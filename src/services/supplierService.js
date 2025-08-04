import { transformToUpperCase } from "../utils/helpers";
import { informationApi } from "./informationApi";

export const getSuppliers = async (type = "airline", options = {}) => {
  try {
    const result = await informationApi.getSuppliers({
      type: type === "airline" ? "Airline" : type,
      active: true,
      ...options,
    });

    return result.success ? result.data : [];
  } catch (error) {
    console.error("Error getting suppliers:", error);
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

    const payload = transformToUpperCase({
      category: category,
      code: supplierData.code,
      name: supplierData.name,
      type: supplierData.type || "Other",
      numeric_code: supplierData.numeric_code || null,
      active: true,
    });

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

export const searchSupplierByCode = async (code) => {
  try {
    const result = await informationApi.getSuppliers({
      type: "Airline",
      search: code.toUpperCase(),
      active: true,
      limit: 1,
    });

    return result.success && result.data.length > 0 ? result.data[0] : null;
  } catch (error) {
    console.error("Error searching supplier by code:", error);
    return null;
  }
};

// แก้ใน supplierService.js
export const searchSupplierByNumericCode = async (numericCode) => {
  try {
    console.log(
      "🔎 Searching for numeric_code:",
      numericCode,
      typeof numericCode
    );

    // ✅ ใช้ search parameter แทน limit
    const result = await informationApi.getSuppliers({
      type: "Airline",
      search: numericCode, // 🆕 ใช้ search แทน
      active: true,
      limit: 100, // 🆕 เพิ่ม limit ให้มากขึ้น
    });

    console.log("📦 All suppliers returned:", result.data);
    console.log(
      "🔢 Available numeric_codes:",
      result.data.map((s) => `${s.numeric_code} (${typeof s.numeric_code})`)
    );

    const exactMatch =
      result.success && result.data.length > 0
        ? result.data.find(
            (supplier) => String(supplier.numeric_code) === String(numericCode)
          )
        : null;

    console.log("🎯 Exact match found:", exactMatch);

    return exactMatch || null;
  } catch (error) {
    console.error("Error searching supplier by numeric code:", error);
    return null;
  }
};
