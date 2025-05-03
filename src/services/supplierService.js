import { supabase } from "./supabase";

export const getSuppliers = async (
  category = "airline",
  search = "",
  limit = 100
) => {
  try {
    let query = supabase
      .from("information")
      .select("*")
      .eq("category", category)
      .eq("active", true)
      .order("code");

    if (search) {
      query = query.ilike("code", `%${search}%`);
    }

    if (limit) {
      query = query.limit(limit);
    }

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
    const payload = {
      category: supplierData.category || "airline",
      code: supplierData.code,
      name: supplierData.name,
      description: supplierData.description,
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
