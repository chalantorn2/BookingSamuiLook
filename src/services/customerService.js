import { transformToUpperCase } from "../utils/helpers";
import { informationApi } from "./informationApi";

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

export const getCustomers = async (options = {}) => {
  try {
    const result = await informationApi.getCustomers({
      active: true,
      ...options,
    });

    return result.success ? result.data : [];
  } catch (error) {
    console.error("Error getting customers:", error);
    return [];
  }
  console.log("getCustomers function:", getCustomers);
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
    const result = await informationApi.createCustomer(customerData);
    return result;
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
