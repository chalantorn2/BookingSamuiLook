// src/services/ticketService.js
import { ticketApi } from "./ticketApi";
import { transformToUpperCase, toThaiTimeZone } from "../utils/helpers";
import { generatePONumber } from "./referencesService";

/**
 * สร้างตั๋วเครื่องบินใหม่
 * @param {Object} ticketData - ข้อมูลตั๋ว
 * @returns {Promise<Object>} - ผลลัพธ์การสร้างตั๋ว
 */
export const createFlightTicket = async (ticketData) => {
  try {
    // 1. คำนวณราคาต่างๆ
    const pricingSubtotal = calculatePricingSubtotal(ticketData.pricing);
    const extrasTotal = calculateExtrasTotal(ticketData.extras);
    const subtotalBeforeVat = pricingSubtotal + extrasTotal;
    const vatAmount =
      subtotalBeforeVat * (parseFloat(ticketData.vatPercent || 0) / 100);
    const grandTotal = subtotalBeforeVat + vatAmount;

    // 2. เตรียมข้อมูลสำหรับส่งไป API
    const preparedData = {
      // Customer & Supplier
      customerId: ticketData.customerId,
      supplierId: ticketData.supplierId,
      createdBy: ticketData.createdBy,

      // Dates & Payment
      date: ticketData.date,
      dueDate: ticketData.dueDate,
      creditDays: ticketData.creditDays,

      // Payment Methods
      paymentMethod: ticketData.paymentMethod,
      companyPaymentDetails: ticketData.companyPaymentDetails,
      customerPayment: ticketData.customerPayment,
      customerPaymentDetails: ticketData.customerPaymentDetails,

      // Ticket Info
      code: ticketData.code,
      ticketType: ticketData.ticketType,
      ticketTypeDetails: ticketData.ticketTypeDetails,

      // Pricing
      pricing: ticketData.pricing,
      pricingSubtotal,
      extrasTotal,
      subtotalBeforeVat,
      vatPercent: ticketData.vatPercent,
      vatAmount,
      grandTotal,

      // Passengers, Routes, Extras
      passengers: ticketData.passengers || [],
      routes: ticketData.routes || [],
      extras: ticketData.extras || [],
    };

    console.log("Creating flight ticket with data:", preparedData);

    // 3. เรียก API
    const result = await ticketApi.createFlightTicket(preparedData);

    if (!result.success) {
      throw new Error(result.error || "Failed to create ticket");
    }

    console.log("Ticket created successfully:", result);

    return {
      success: true,
      referenceNumber: result.referenceNumber,
      ticketId: result.ticketId,
      grandTotal: result.grandTotal,
      subtotal: result.subtotal,
      vatAmount: result.vatAmount,
    };
  } catch (error) {
    console.error("Error creating flight ticket:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * ดึงข้อมูลตั๋วเครื่องบินตาม ID
 * @param {number} ticketId - ID ของตั๋ว
 * @returns {Promise<Object>} - ข้อมูลตั๋ว
 */
export const getFlightTicket = async (ticketId) => {
  try {
    const result = await ticketApi.getFlightTicket(ticketId);

    if (!result.success) {
      throw new Error(result.error || "Failed to get ticket");
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error("Error fetching flight ticket:", error);
    return { success: false, error: error.message };
  }
};

/**
 * ดึงรายการตั๋วเครื่องบินทั้งหมด
 * @param {Object} filters - ฟิลเตอร์การค้นหา
 * @returns {Promise<Object>} - รายการตั๋ว
 */
export const getFlightTickets = async (filters = {}) => {
  try {
    const result = await ticketApi.getFlightTickets(filters);

    if (!result.success) {
      throw new Error(result.error || "Failed to get tickets");
    }

    return {
      success: true,
      data: result.data,
      total: result.total,
      pagination: result.pagination,
    };
  } catch (error) {
    console.error("Error fetching flight tickets:", error);
    return { success: false, error: error.message };
  }
};

/**
 * อัปเดตตั๋วเครื่องบิน
 * @param {number} ticketId - ID ของตั๋ว
 * @param {Object} ticketData - ข้อมูลที่ต้องการอัปเดต
 * @returns {Promise<Object>} - ผลลัพธ์การอัปเดต
 */
export const updateFlightTicket = async (ticketId, ticketData) => {
  try {
    const result = await ticketApi.updateFlightTicket(ticketId, ticketData);

    if (!result.success) {
      throw new Error(result.error || "Failed to update ticket");
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error("Error updating flight ticket:", error);
    return { success: false, error: error.message };
  }
};

/**
 * ยกเลิกตั๋วเครื่องบิน
 * @param {number} ticketId - ID ของตั๋ว
 * @param {string} reason - เหตุผลในการยกเลิก
 * @returns {Promise<Object>} - ผลลัพธ์การยกเลิก
 */
export const cancelFlightTicket = async (ticketId, reason = "") => {
  try {
    const result = await ticketApi.cancelFlightTicket(ticketId, reason);

    if (!result.success) {
      throw new Error(result.error || "Failed to cancel ticket");
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error("Error cancelling flight ticket:", error);
    return { success: false, error: error.message };
  }
};

/**
 * สร้างหมายเลขอ้างอิงใหม่
 * @returns {Promise<Object>} - หมายเลขอ้างอิง
 */
export const generateReferenceNumber = async () => {
  try {
    const result = await ticketApi.generateReferenceNumber();

    if (!result.success) {
      throw new Error(result.error || "Failed to generate reference number");
    }

    return { success: true, referenceNumber: result.referenceNumber };
  } catch (error) {
    console.error("Error generating reference number:", error);
    return { success: false, error: error.message };
  }
};

/**
 * สร้างและบันทึก PO Number สำหรับ booking ticket
 * @param {number} ticketId - ID ของ booking ticket
 * @returns {Promise<Object>} - ผลลัพธ์การสร้าง PO
 */
export const generatePOForTicket = async (ticketId) => {
  try {
    // ✅ ใช้ ticketApi แทน supabase
    const ticketResult = await ticketApi.getFlightTicket(ticketId);

    if (!ticketResult.success) {
      throw new Error("ไม่พบข้อมูลตั๋ว");
    }

    const existingTicket = ticketResult.data.ticket;

    // ถ้ามี PO Number แล้ว ให้ return PO Number เดิม
    if (existingTicket.po_number) {
      return {
        success: true,
        poNumber: existingTicket.po_number,
        isNew: false,
        message: "PO Number already exists",
      };
    }

    // สร้าง PO Number ใหม่
    const poNumber = await generatePONumber();

    if (!poNumber) {
      throw new Error("ไม่สามารถสร้าง PO Number ได้");
    }

    // บันทึก PO Number และอัปเดต status เป็น invoiced
    const now = new Date();
    const thaiTime = toThaiTimeZone(now, false);

    const updateResult = await ticketApi.updateFlightTicket(ticketId, {
      po_number: poNumber,
      po_generated_at: thaiTime,
      status: "invoiced",
    });

    if (!updateResult.success) {
      throw new Error("ไม่สามารถบันทึก PO Number ได้");
    }

    return {
      success: true,
      poNumber: poNumber,
      isNew: true,
      message: "PO Number generated successfully",
    };
  } catch (error) {
    console.error("Error generating PO Number:", error);
    return {
      success: false,
      error: error.message,
      poNumber: null,
    };
  }
};

/**
 * อัปเดตสถานะการชำระเงินของตั๋ว
 * @param {number} ticketId - ID ของตั๋ว
 * @param {string} paymentStatus - สถานะการชำระเงินใหม่
 * @returns {Promise<Object>} - ผลลัพธ์การอัปเดต
 */
export const updatePaymentStatus = async (ticketId, paymentStatus) => {
  try {
    const result = await ticketApi.updateFlightTicket(ticketId, {
      payment_status: paymentStatus,
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to update payment status");
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error("Error updating payment status:", error);
    return { success: false, error: error.message };
  }
};

/**
 * ดึงข้อมูลสถิติตั๋วต่างๆ
 * @param {Object} filters - ฟิลเตอร์การค้นหา
 * @returns {Promise<Object>} - ข้อมูลสถิติ
 */
export const getTicketStatistics = async (filters = {}) => {
  try {
    const result = await ticketApi.getFlightTickets({
      ...filters,
      includeStats: true,
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to get statistics");
    }

    return {
      success: true,
      statistics: result.statistics || {},
    };
  } catch (error) {
    console.error("Error fetching ticket statistics:", error);
    return { success: false, error: error.message };
  }
};

/**
 * ค้นหาตั๋วตามหมายเลขอ้างอิง
 * @param {string} referenceNumber - หมายเลขอ้างอิง
 * @returns {Promise<Object>} - ข้อมูลตั๋ว
 */
export const searchTicketByReference = async (referenceNumber) => {
  try {
    const result = await ticketApi.getFlightTickets({
      referenceNumber: referenceNumber,
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to search ticket");
    }

    const ticket =
      result.data && result.data.length > 0 ? result.data[0] : null;

    return {
      success: true,
      data: ticket,
    };
  } catch (error) {
    console.error("Error searching ticket by reference:", error);
    return { success: false, error: error.message };
  }
};

/**
 * ดึงรายการตั๋วของลูกค้าคนหนึ่ง
 * @param {number} customerId - ID ของลูกค้า
 * @param {Object} options - ตัวเลือกเพิ่มเติม
 * @returns {Promise<Object>} - รายการตั๋วของลูกค้า
 */
export const getCustomerTickets = async (customerId, options = {}) => {
  try {
    const result = await ticketApi.getFlightTickets({
      customerId: customerId,
      ...options,
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to get customer tickets");
    }

    return {
      success: true,
      data: result.data,
      total: result.total,
    };
  } catch (error) {
    console.error("Error fetching customer tickets:", error);
    return { success: false, error: error.message };
  }
};

/**
 * ดึงรายการตั๋วที่ยังไม่ได้ออกใบแจ้งหนี้
 * @param {Object} filters - ฟิลเตอร์เพิ่มเติม
 * @returns {Promise<Object>} - รายการตั๋วที่ยังไม่ได้ออกใบแจ้งหนี้
 */
export const getUnInvoicedTickets = async (filters = {}) => {
  try {
    const result = await ticketApi.getFlightTickets({
      status: "not_invoiced",
      ...filters,
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to get uninvoiced tickets");
    }

    return {
      success: true,
      data: result.data,
      total: result.total,
    };
  } catch (error) {
    console.error("Error fetching uninvoiced tickets:", error);
    return { success: false, error: error.message };
  }
};

// ===== Helper Functions =====

/**
 * คำนวณราคารวมจากข้อมูลราคา
 */
const calculatePricingSubtotal = (pricing) => {
  if (!pricing) return 0;

  const adultTotal = parseFloat(pricing.adult?.total || 0);
  const childTotal = parseFloat(pricing.child?.total || 0);
  const infantTotal = parseFloat(pricing.infant?.total || 0);

  return adultTotal + childTotal + infantTotal;
};

/**
 * คำนวณราคารวมจากรายการเพิ่มเติม
 */
const calculateExtrasTotal = (extras) => {
  if (!extras || !Array.isArray(extras)) return 0;

  return extras.reduce((total, extra) => {
    const amount = parseFloat(extra.total_amount || 0);
    return total + amount;
  }, 0);
};

/**
 * Validate ticket data before submitting
 */
export const validateTicketData = (ticketData) => {
  const errors = {};

  // Required fields
  if (!ticketData.customerId) {
    errors.customer = "กรุณาเลือกลูกค้า";
  }

  if (!ticketData.supplierId) {
    errors.supplier = "กรุณาเลือกซัพพลายเออร์";
  }

  if (!ticketData.passengers || ticketData.passengers.length === 0) {
    errors.passengers = "กรุณาเพิ่มข้อมูลผู้โดยสาร";
  }

  // Validate passengers
  if (ticketData.passengers) {
    ticketData.passengers.forEach((passenger, index) => {
      if (!passenger.name || passenger.name.trim() === "") {
        errors[`passenger_${index}`] = `กรุณากรอกชื่อผู้โดยสารคนที่ ${
          index + 1
        }`;
      }
    });
  }

  // Validate routes if provided
  if (ticketData.routes && ticketData.routes.length > 0) {
    ticketData.routes.forEach((route, index) => {
      if (!route.origin || !route.destination) {
        errors[`route_${index}`] = `กรุณากรอกข้อมูลเส้นทางที่ ${
          index + 1
        } ให้ครบถ้วน`;
      }
    });
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Format ticket data for display
 */
export const formatTicketForDisplay = (ticket) => {
  if (!ticket) return null;

  return {
    id: ticket.id,
    referenceNumber: ticket.reference_number,
    poNumber: ticket.po_number,
    customerName: ticket.customer?.name || "N/A",
    supplierName: ticket.supplier?.name || "N/A",
    status: ticket.status,
    paymentStatus: ticket.payment_status,
    grandTotal: ticket.tickets_detail?.[0]?.grand_total || 0,
    issueDate: ticket.tickets_detail?.[0]?.issue_date,
    dueDate: ticket.tickets_detail?.[0]?.due_date,
    createdAt: ticket.created_at,
    passengerCount: ticket.tickets_passengers?.length || 0,
    routeCount: ticket.tickets_routes?.length || 0,
  };
};
