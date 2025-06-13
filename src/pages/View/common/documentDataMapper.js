// src/pages/View/common/documentDataMapper.js
import { supabase } from "../../../services/supabase";
import { generatePOForTicket } from "../../../services/ticketService";

/**
 * ดึงและแปลงข้อมูลสำหรับการพิมพ์เอกสาร Invoice
 * @param {number} ticketId - ID ของ ticket
 * @returns {Promise<Object>} - ข้อมูลที่แปลงแล้วสำหรับการพิมพ์
 */
export const getInvoiceData = async (ticketId) => {
  try {
    // ขั้นตอนที่ 1: สร้าง PO Number ก่อน
    const poResult = await generatePOForTicket(ticketId);
    if (!poResult.success) {
      throw new Error(poResult.error);
    }

    // ขั้นตอนที่ 2: ดึงข้อมูลทั้งหมดจากฐานข้อมูล
    const { data: ticket, error } = await supabase
      .from("bookings_ticket")
      .select(
        `
        id,
        reference_number,
        po_number,
        po_generated_at,
        created_at,
        customer:customer_id(name, address_line1, address_line2, address_line3, phone, id_number, branch_type, branch_number, code),
        supplier:information_id(name, code, numeric_code),
        tickets_detail(issue_date, due_date, credit_days, subtotal_before_vat, vat_percent, vat_amount, grand_total),
        ticket_additional_info(code, ticket_type, ticket_type_details, company_payment_method, company_payment_details, customer_payment_method, customer_payment_details),
        tickets_pricing(adult_sale_price, adult_pax, adult_total, child_sale_price, child_pax, child_total, infant_sale_price, infant_pax, infant_total),
        tickets_passengers(passenger_name, age, ticket_number, ticket_code),
        tickets_routes(flight_number, rbd, date, origin, destination, departure_time, arrival_time),
        tickets_extras(description, sale_price, quantity, total_amount),
        user:created_by(fullname)
      `
      )
      .eq("id", ticketId)
      .single();

    if (error) throw error;

    // ขั้นตอนที่ 3: แปลงข้อมูลให้พร้อมสำหรับการพิมพ์
    const detail = ticket.tickets_detail?.[0] || {};
    const additional = ticket.ticket_additional_info?.[0] || {};
    const pricing = ticket.tickets_pricing?.[0] || {};

    // แปลงข้อมูลลูกค้า - รองรับที่อยู่หลายบรรทัด
    const customerInfo = {
      name: ticket.customer?.name || "",
      address: formatCustomerAddressForPrint(ticket.customer),
      phone: ticket.customer?.phone || "",
      taxId: ticket.customer?.id_number || "",
      branch: getBranchDisplay(
        ticket.customer?.branch_type,
        ticket.customer?.branch_number
      ),
    };

    // แปลงข้อมูลใบแจ้งหนี้
    const invoiceInfo = {
      poNumber: ticket.po_number || poResult.poNumber,
      date: formatDate(detail.issue_date),
      dueDate: formatDate(detail.due_date),
      salesPerson: ticket.user?.fullname || "System",
    };

    // แปลงข้อมูลผู้โดยสาร - ปรับรูปแบบให้เหมือน PDF
    const passengers =
      ticket.tickets_passengers?.map((p, index) => ({
        index: index + 1,
        name: p.passenger_name || "",
        age: p.age || "",
        ticketNumber: p.ticket_number || "",
        ticketCode: p.ticket_code || "",
        display: `${index + 1}. ${p.passenger_name || ""} ${p.age || ""} ${
          p.ticket_number || ""
        } ${p.ticket_code || ""}`
          .trim()
          .replace(/\s+/g, " "),
      })) || [];

    // แปลงข้อมูลเที่ยวบิน - ปรับรูปแบบให้เหมือน PDF
    const flights =
      ticket.tickets_routes?.map((route) => ({
        flightNumber: route.flight_number || "",
        rbd: route.rbd || "",
        date: formatRouteDate(route.date),
        route: `${route.origin || ""}-${route.destination || ""}`,
        display: `${route.flight_number || ""} ${formatRouteDate(route.date)} ${
          route.origin || ""
        }${route.destination || ""}`
          .trim()
          .replace(/\s+/g, " "),
      })) || [];

    // แปลงข้อมูลราคาผู้โดยสาร (เฉพาะที่มี pax > 0)
    const passengerTypes = [];
    if (pricing.adult_pax > 0) {
      passengerTypes.push({
        type: "Adult",
        quantity: pricing.adult_pax,
        unitPrice: pricing.adult_sale_price || 0,
        amount: pricing.adult_total || 0,
      });
    }
    if (pricing.child_pax > 0) {
      passengerTypes.push({
        type: "Child",
        quantity: pricing.child_pax,
        unitPrice: pricing.child_sale_price || 0,
        amount: pricing.child_total || 0,
      });
    }
    if (pricing.infant_pax > 0) {
      passengerTypes.push({
        type: "Infant",
        quantity: pricing.infant_pax,
        unitPrice: pricing.infant_sale_price || 0,
        amount: pricing.infant_total || 0,
      });
    }

    // แปลงข้อมูลรายการเพิ่มเติม
    const extras =
      ticket.tickets_extras?.map((extra) => ({
        description: extra.description || "",
        quantity: extra.quantity || 1,
        unitPrice: extra.sale_price || 0,
        amount: extra.total_amount || 0,
      })) || [];

    // สรุปยอดเงิน
    const summary = {
      subtotal: detail.subtotal_before_vat || 0,
      vatPercent: detail.vat_percent || 0,
      vat: detail.vat_amount || 0,
      total: detail.grand_total || 0,
    };

    return {
      success: true,
      data: {
        customer: customerInfo,
        invoice: invoiceInfo,
        passengers,
        flights,
        passengerTypes,
        extras,
        summary,
        poResult, // ส่งผลลัพธ์การสร้าง PO กลับไปด้วย
      },
    };
  } catch (error) {
    console.error("Error getting invoice data:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * แปลงที่อยู่ลูกค้าสำหรับการพิมพ์ (หลายบรรทัด)
 * @param {Object} customer - ข้อมูลลูกค้า
 * @returns {string} - ที่อยู่ที่แปลงแล้ว (ขึ้นบรรทัดใหม่ด้วย \n)
 */
const formatCustomerAddressForPrint = (customer) => {
  if (!customer) return "";

  const addressLines = [
    customer.address_line1,
    customer.address_line2,
    customer.address_line3,
  ].filter((line) => line && line.trim() !== "");

  return addressLines.join("\n"); // ใช้ \n สำหรับขึ้นบรรทัดใหม่
};

/**
 * แปลงวันที่เป็นรูปแบบ DD/MM/YYYY
 */
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

/**
 * แปลงวันที่เที่ยวบินเป็นรูปแบบ ddMMM (เช่น 05APR)
 */
const formatRouteDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  const day = date.getDate().toString().padStart(2, "0");
  const monthNames = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  const month = monthNames[date.getMonth()];

  return `${day}${month}`;
};

/**
 * แปลงข้อมูลสาขาให้แสดงผลถูกต้อง
 */
const getBranchDisplay = (branchType, branchNumber) => {
  if (branchType === "Branch" && branchNumber) {
    return `${branchType} ${branchNumber}`;
  }
  return branchType || "Head Office";
};

/**
 * จัดรูปแบบตัวเลขไม่มีทศนิยม
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return "0";
  return Math.floor(parseFloat(amount)).toLocaleString("th-TH");
};
