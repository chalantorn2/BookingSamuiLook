import { supabase } from "../../services/supabase";

/**
 * ดึงข้อมูลผู้ใช้ทั้งหมด
 * @returns {Promise<{data: Array, error: Object}>} ข้อมูลผู้ใช้หรือข้อผิดพลาด
 */
export const fetchAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("username");

    return { data, error };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { data: null, error: error.message };
  }
};

/**
 * สร้างผู้ใช้ใหม่
 * @param {Object} userData ข้อมูลผู้ใช้
 * @returns {Promise<{success: boolean, error: string}>} สถานะการสร้างผู้ใช้
 */
export const createUser = async (userData) => {
  try {
    // ตรวจสอบว่ามี username หรือ email นี้อยู่แล้วหรือไม่
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("*")
      .or(`username.eq.${userData.username},email.eq.${userData.email}`);

    if (existingUser && existingUser.length > 0) {
      return {
        success: false,
        error: "ชื่อผู้ใช้หรืออีเมลนี้มีอยู่ในระบบแล้ว",
      };
    }

    if (checkError) {
      throw checkError;
    }

    // บันทึกข้อมูลในตาราง users
    const { error: insertError } = await supabase.from("users").insert([
      {
        username: userData.username,
        password: userData.password, // เก็บ plain text
        fullname: userData.fullname,
        email: userData.email,
        role: userData.role,
        active: userData.active,
      },
    ]);

    if (insertError) {
      throw insertError;
    }

    return { success: true };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, error: error.message };
  }
};

/**
 * อัปเดตข้อมูลผู้ใช้
 * @param {string} userId ID ของผู้ใช้
 * @param {Object} userData ข้อมูลผู้ใช้ที่ต้องการอัปเดต
 * @returns {Promise<{success: boolean, error: string}>} สถานะการอัปเดต
 */
export const updateUser = async (userId, userData) => {
  try {
    // ตรวจสอบว่าอีเมลนี้มีอยู่ในระบบแล้วหรือไม่ (ยกเว้นของผู้ใช้เอง)
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("*")
      .eq("email", userData.email)
      .neq("id", userId);

    if (existingUser && existingUser.length > 0) {
      return { success: false, error: "อีเมลนี้มีอยู่ในระบบแล้ว" };
    }

    if (checkError) {
      throw checkError;
    }

    const { error } = await supabase
      .from("users")
      .update({
        fullname: userData.fullname,
        email: userData.email,
        role: userData.role,
        active: userData.active,
      })
      .eq("id", userId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, error: error.message };
  }
};

/**
 * เปลี่ยนรหัสผ่านผู้ใช้
 * @param {string} userId ID ของผู้ใช้
 * @param {string} newPassword รหัสผ่านใหม่
 * @returns {Promise<{success: boolean, error: string}>} สถานะการเปลี่ยนรหัสผ่าน
 */
export const changePassword = async (userId, newPassword) => {
  try {
    const { error } = await supabase
      .from("users")
      .update({ password: newPassword }) // อัปเดตรหัสผ่านแบบ plain text
      .eq("id", userId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Error changing password:", error);
    return { success: false, error: error.message };
  }
};

/**
 * ลบผู้ใช้
 * @param {string} userId ID ของผู้ใช้
 * @param {boolean} hardDelete หากต้องการลบข้อมูลออกจากฐานข้อมูลเลย
 * @returns {Promise<{success: boolean, error: string}>} สถานะการลบ
 */
export const deleteUser = async (userId, hardDelete = false) => {
  try {
    if (hardDelete) {
      const { error } = await supabase.from("users").delete().eq("id", userId);
      if (error) {
        throw error;
      }
    } else {
      const { error } = await supabase
        .from("users")
        .update({ active: false })
        .eq("id", userId);
      if (error) {
        throw error;
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: error.message };
  }
};

/**
 * ดึงข้อมูลผู้ใช้ตาม ID
 * @param {string} userId ID ของผู้ใช้
 * @returns {Promise<{data: Object, error: Object}>} ข้อมูลผู้ใช้หรือข้อผิดพลาด
 */
export const fetchUserById = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error fetching user:", error);
    return { data: null, error: error.message };
  }
};
