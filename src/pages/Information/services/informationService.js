import { supabase } from "../../../services/supabase";

export const fetchSuppliers = async (
  category = null,
  search = "",
  active = true
) => {
  try {
    let query = supabase.from("information").select("*");

    if (active !== null) {
      query = query.eq("active", active);
    }

    if (category) {
      if (Array.isArray(category)) {
        query = query.in("category", category);
      } else {
        query = query.eq("category", category);
      }
    }

    if (search) {
      query = query.or(
        `code.ilike.%${search}%,name.ilike.%${search}%,numeric_code.ilike.%${search}%`
      );
    }

    const { data, error } = await query;

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return { success: false, error: error.message };
  }
};

export const fetchCustomers = async (search = "", active = true) => {
  try {
    let query = supabase.from("customers").select("*");

    if (active !== null) {
      query = query.eq("active", active);
    }

    if (search) {
      query = query.or(
        `code.ilike.%${search}%,name.ilike.%${search}%,phone.ilike.%${search}%,id_number.ilike.%${search}%`
      );
    }

    const { data, error } = await query;

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching customers:", error);
    return { success: false, error: error.message };
  }
};

export const createSupplier = async (supplierData) => {
  try {
    // แปลงประเภทเป็น category
    let category = "supplier-other"; // ค่าเริ่มต้น

    if (supplierData.type === "Airline") {
      category = "airline";
    } else if (supplierData.type === "Voucher") {
      category = "supplier-voucher";
    } else if (supplierData.type === "Other") {
      category = "supplier-other";
    }

    const { data, error } = await supabase
      .from("information")
      .insert({
        category: category,
        code: supplierData.code,
        name: supplierData.name,
        type: supplierData.type,
        numeric_code: supplierData.numeric_code || null,
        active: true,
      })
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error("Error creating supplier:", error);
    return { success: false, error: error.message };
  }
};

export const updateSupplier = async (id, supplierData) => {
  try {
    // แปลงประเภทเป็น category
    let category = "supplier-other"; // ค่าเริ่มต้น

    if (supplierData.type === "Airline") {
      category = "airline";
    } else if (supplierData.type === "Voucher") {
      category = "supplier-voucher";
    } else if (supplierData.type === "Other") {
      category = "supplier-other";
    }

    const { data, error } = await supabase
      .from("information")
      .update({
        category: category,
        code: supplierData.code,
        name: supplierData.name,
        type: supplierData.type,
        numeric_code: supplierData.numeric_code || null,
      })
      .eq("id", id)
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error("Error updating supplier:", error);
    return { success: false, error: error.message };
  }
};

export const deactivateItem = async (table, id) => {
  try {
    const { error } = await supabase
      .from(table)
      .update({ active: false })
      .eq("id", id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error(`Error deactivating item in ${table}:`, error);
    return { success: false, error: error.message };
  }
};
