import { supabase, insertData, fetchData } from "./supabase";
import { transformToUpperCase } from "../utils/helpers";

// ฟังก์ชันตัดข้อความให้มีความยาวสูงสุด
const truncateText = (text, maxLength = 50) => {
  if (!text) return text;
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

// ฟังก์ชันสำหรับจัดการที่อยู่แบบใหม่
const formatFullAddress = (customer) => {
  const addressParts = [
    customer.address_line1,
    customer.address_line2,
    customer.address_line3,
  ].filter((part) => part && part.trim() !== "");

  return addressParts.join(" ");
};

export const getCustomers = async (search = "", limit = 10) => {
  try {
    let query = supabase
      .from("customers")
      .select("*")
      .eq("active", true)
      .order("name");

    if (search) {
      // ตรวจสอบว่าเป็นการค้นหาด้วย code หรือไม่
      const isCodeSearch = search.length <= 5 && /^[A-Za-z0-9]+$/.test(search);

      if (isCodeSearch) {
        // ถ้าเป็นการค้นหาด้วย code ให้จำกัดผลลัพธ์และเรียงตามวันที่ล่าสุด
        query = query
          .eq("code", search.toUpperCase())
          .order("created_at", { ascending: false })
          .limit(3);
      } else {
        // การค้นหาปกติ
        query = query.or(
          `name.ilike.%${search}%,code.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,address_line1.ilike.%${search}%`
        );
      }
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data.map((customer) => ({
      ...customer,
      name: truncateText(customer.name),
      address: formatFullAddress(customer), // สำหรับ backward compatibility
      full_address: formatFullAddress(customer),
      full_name: customer.name,
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

    // เพิ่ม address สำหรับ backward compatibility
    if (data) {
      data.address = formatFullAddress(data);
      data.full_address = formatFullAddress(data);
    }

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
      // ลบการเช็ครหัสซ้ำออก - อนุญาตให้ซ้ำกันได้
    }

    // ตรวจสอบรูปแบบอีเมล
    if (customerData.email && customerData.email.trim() !== "") {
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(customerData.email)) {
        return { success: false, error: "รูปแบบอีเมลไม่ถูกต้อง" };
      }
    }

    // จัดการข้อมูลที่อยู่ - ถ้าเป็นแบบเก่า (address) ให้ย้ายไป address_line1
    let addressLine1 = customerData.address_line1;
    let addressLine2 = customerData.address_line2;
    let addressLine3 = customerData.address_line3;

    // Backward compatibility: ถ้ามี address แต่ไม่มี address_line1
    if (!addressLine1 && customerData.address) {
      addressLine1 = customerData.address;
    }

    // เตรียมข้อมูลสำหรับบันทึก - แปลงเป็นตัวพิมพ์ใหญ่
    const payload = {
      name: customerData.name ? customerData.name.toUpperCase() : null,
      code: customerData.code ? customerData.code.toUpperCase() : null,
      email: customerData.email ? customerData.email.toLowerCase() : null, // email เป็นตัวเล็ก
      address_line1: addressLine1 ? addressLine1.toUpperCase() : null,
      address_line2: addressLine2 ? addressLine2.toUpperCase() : null,
      address_line3: addressLine3 ? addressLine3.toUpperCase() : null,
      id_number: customerData.id_number || null, // ไม่แปลง
      phone: customerData.phone ? customerData.phone.toUpperCase() : null,
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

    // ตรวจสอบว่ามี address_line1 หรือไม่
    if (!customerData.address_line1 && !customerData.address) {
      throw new Error("ที่อยู่บรรทัดที่ 1 เป็นข้อมูลที่จำเป็น");
    }

    // ตรวจสอบรหัสลูกค้า
    if (customerData.code) {
      // ตรวจสอบความยาว 3-5 ตัว
      if (customerData.code.length < 3 || customerData.code.length > 5) {
        throw new Error("รหัสลูกค้าต้องเป็น 3-5 ตัวอักษร");
      }

      // อนุญาตให้รหัสลูกค้าซ้ำกันได้ - ไม่ต้องเช็ค
    }

    // ตรวจสอบรูปแบบอีเมล
    if (customerData.email && customerData.email.trim() !== "") {
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(customerData.email)) {
        throw new Error("รูปแบบอีเมลไม่ถูกต้อง");
      }
    }

    // ตรวจสอบความถูกต้องของข้อมูลสาขา
    if (customerData.branch_type === "Branch" && !customerData.branch_number) {
      throw new Error("Branch number is required when branch type is Branch");
    }

    // จัดการข้อมูลที่อยู่ - Backward compatibility
    let addressLine1 = customerData.address_line1;
    if (!addressLine1 && customerData.address) {
      addressLine1 = customerData.address;
    }

    // เตรียมข้อมูลสำหรับบันทึก - แปลงเป็นตัวพิมพ์ใหญ่
    const payload = {
      name: customerData.name ? customerData.name.toUpperCase() : null,
      code: customerData.code ? customerData.code.toUpperCase() : null,
      email: customerData.email ? customerData.email.toLowerCase() : null, // email เป็นตัวเล็ก
      address_line1: addressLine1 ? addressLine1.toUpperCase() : null,
      address_line2: customerData.address_line2
        ? customerData.address_line2.toUpperCase()
        : null,
      address_line3: customerData.address_line3
        ? customerData.address_line3.toUpperCase()
        : null,
      id_number: customerData.id_number || null, // ไม่แปลง
      phone: customerData.phone ? customerData.phone.toUpperCase() : null,
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

    // เพิ่ม address สำหรับ backward compatibility
    if (data && data[0]) {
      const formatFullAddress = (customer) => {
        const addressParts = [
          customer.address_line1,
          customer.address_line2,
          customer.address_line3,
        ].filter((part) => part && part.trim() !== "");
        return addressParts.join(" ");
      };

      data[0].address = formatFullAddress(data[0]);
      data[0].full_address = formatFullAddress(data[0]);
    }

    return { success: true, customer: data ? data[0] : null };
  } catch (error) {
    console.error("Error updating customer:", error);
    return { success: false, error: error.message };
  }
};
