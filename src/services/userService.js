import { supabase, insertData, fetchData } from "./supabase";
import { transformToUpperCase } from "../utils/helpers";

export const getUsers = async (search = "", limit = 10) => {
  try {
    let query = supabase.from("users").select("*").order("full_name");

    if (search) {
      query = query.ilike("full_name", `%${search}%`);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

export const getUserById = async (id) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

export const createUser = async (userData) => {
  try {
    const payload = transformToUpperCase(
      {
        username: userData.username,
        full_name: userData.full_name,
        display_name: userData.display_name,
        email: userData.email,
        position: userData.position,
        phone: userData.phone,
        role: userData.role || "viewer",
        status: userData.status || "active",
        password_hash: userData.password_hash,
      },
      ["username", "email", "phone", "password_hash"]
    );

    const result = await insertData("users", payload);
    return { success: true, userId: result[0].id };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, error: error.message };
  }
};
