// src/services/ticketService.js
import { supabase } from "./supabase";
import { generateReferenceNumber, generatePONumber } from "./referencesService";
import { toThaiTimeZone } from "../utils/helpers";
import { transformToUpperCase } from "../utils/helpers"; // เพิ่ม import

/**
 * สร้างและบันทึก PO Number สำหรับ booking ticket
 * @param {number} ticketId - ID ของ booking ticket
 * @returns {Promise<Object>} - ผลลัพธ์การสร้าง PO
 */
export const generatePOForTicket = async (ticketId) => {
  try {
    // ตรวจสอบว่า ticket นี้มี PO Number แล้วหรือยัง
    const { data: existingTicket, error: checkError } = await supabase
      .from("bookings_ticket")
      .select("po_number, po_generated_at, status")
      .eq("id", ticketId)
      .single();

    if (checkError) throw checkError;

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

    const { error: updateError } = await supabase
      .from("bookings_ticket")
      .update({
        po_number: poNumber,
        po_generated_at: thaiTime,
        status: "invoiced", // เพิ่มการอัปเดต status
      })
      .eq("id", ticketId);

    if (updateError) throw updateError;

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
 * สร้าง Flight Ticket ใหม่
 * @param {Object} ticketData - ข้อมูลตั๋วเครื่องบิน
 * @returns {Promise<Object>} - ผลลัพธ์การสร้างตั๋ว
 */
export const createFlightTicket = async (ticketData) => {
  try {
    // สร้างเลขอ้างอิง
    const referenceNumber = await generateReferenceNumber(
      "bookings_ticket",
      "FT"
    );

    if (!referenceNumber) {
      throw new Error("ไม่สามารถสร้างเลขอ้างอิงได้");
    }

    // คำนวณยอดรวมที่ถูกต้อง
    const pricingSubtotal = Object.values(ticketData.pricing).reduce(
      (sum, item) => sum + parseFloat(item.total || 0),
      0
    );

    const extrasSubtotal =
      ticketData.extras?.reduce(
        (sum, item) => sum + parseFloat(item.total_amount || 0),
        0
      ) || 0;

    const subtotalBeforeVat = pricingSubtotal + extrasSubtotal;
    const vatAmount =
      (subtotalBeforeVat * parseFloat(ticketData.vatPercent || 0)) / 100;
    const grandTotal = subtotalBeforeVat + vatAmount;

    // 1. บันทึกข้อมูลหลักลงในตาราง bookings_ticket
    // แปลงข้อมูลเป็นตัวพิมพ์ใหญ่ก่อนบันทึก
    const mainTicketData = transformToUpperCase(
      {
        reference_number: referenceNumber,
        customer_id: ticketData.customerId,
        information_id: ticketData.supplierId,
        status: "not_invoiced",
        payment_status: ticketData.paymentStatus || "unpaid",
        created_by: ticketData.createdBy,
        updated_by: ticketData.updatedBy,
        po_number: null,
        po_generated_at: null,
      },
      ["customer_id", "information_id", "created_by", "updated_by"]
    );

    const { data: bookingTicket, error: bookingTicketError } = await supabase
      .from("bookings_ticket")
      .insert(mainTicketData)
      .select("id, reference_number")
      .single();

    if (bookingTicketError) throw bookingTicketError;

    let bookingDate = ticketData.bookingDate;
    if (bookingDate) {
      bookingDate = toThaiTimeZone(new Date(bookingDate), false);
    } else {
      bookingDate = toThaiTimeZone(new Date(), false);
    }

    let dueDate = ticketData.dueDate;
    if (dueDate) {
      dueDate = toThaiTimeZone(new Date(dueDate), false);
    }

    // 2. บันทึกข้อมูลรายละเอียดตั๋ว
    const ticketDetailData = {
      bookings_ticket_id: bookingTicket.id,
      total_price: grandTotal,
      pricing_total: pricingSubtotal,
      extras_total: extrasSubtotal,
      subtotal_before_vat: subtotalBeforeVat,
      vat_percent: parseFloat(ticketData.vatPercent || 0),
      vat_amount: vatAmount,
      grand_total: grandTotal,
      issue_date: bookingDate,
      due_date: dueDate,
      credit_days: ticketData.creditDays,
    };

    const { data: ticketDetail, error: ticketDetailError } = await supabase
      .from("tickets_detail")
      .insert(ticketDetailData)
      .select("id")
      .single();

    if (ticketDetailError) throw ticketDetailError;

    // 3. บันทึกข้อมูลเพิ่มเติมของตั๋ว
    const additionalInfoData = transformToUpperCase(
      {
        bookings_ticket_id: bookingTicket.id,
        company_payment_method: ticketData.companyPaymentMethod,
        company_payment_details: ticketData.companyPaymentDetails,
        customer_payment_method: ticketData.customerPaymentMethod,
        customer_payment_details: ticketData.customerPaymentDetails,
        code: ticketData.code,
        ticket_type: (ticketData.ticketType || "").toLowerCase(),
        ticket_type_details: ticketData.ticketTypeDetails,
      },
      ["bookings_ticket_id"]
    );

    const { data: additionalInfoResult, error: additionalInfoError } =
      await supabase
        .from("ticket_additional_info")
        .insert(additionalInfoData)
        .select("id")
        .single();

    if (additionalInfoError) throw additionalInfoError;

    // 4. บันทึกข้อมูลผู้โดยสาร
    if (ticketData.passengers && ticketData.passengers.length > 0) {
      const passengersToInsert = ticketData.passengers.map((passenger) =>
        transformToUpperCase(
          {
            bookings_ticket_id: bookingTicket.id,
            passenger_name: passenger.name,
            age: passenger.age || null,
            ticket_number: passenger.ticketNumber || null,
            ticket_code: passenger.ticket_code || null,
          },
          ["bookings_ticket_id", "age"]
        )
      );

      const { error: passengersError } = await supabase
        .from("tickets_passengers")
        .insert(passengersToInsert);

      if (passengersError) throw passengersError;
    }

    // 5. บันทึกข้อมูลราคา
    const pricingData = {
      bookings_ticket_id: bookingTicket.id,
      adult_net_price: ticketData.pricing.adult?.net || 0,
      adult_sale_price: ticketData.pricing.adult?.sale || 0,
      adult_pax: ticketData.pricing.adult?.pax || 0,
      adult_total: ticketData.pricing.adult?.total || 0,
      child_net_price: ticketData.pricing.child?.net || 0,
      child_sale_price: ticketData.pricing.child?.sale || 0,
      child_pax: ticketData.pricing.child?.pax || 0,
      child_total: ticketData.pricing.child?.total || 0,
      infant_net_price: ticketData.pricing.infant?.net || 0,
      infant_sale_price: ticketData.pricing.infant?.sale || 0,
      infant_pax: ticketData.pricing.infant?.pax || 0,
      infant_total: ticketData.pricing.infant?.total || 0,
      subtotal_amount: pricingSubtotal,
      vat_percent: parseFloat(ticketData.vatPercent || 0),
      vat_amount: vatAmount,
      total_amount: pricingSubtotal,
    };

    const { data: pricingResult, error: pricingError } = await supabase
      .from("tickets_pricing")
      .insert(pricingData)
      .select("id")
      .single();

    if (pricingError) throw pricingError;

    // 6. บันทึกข้อมูลเส้นทาง
    if (ticketData.routes && ticketData.routes.length > 0) {
      const routesToInsert = ticketData.routes.map((route) =>
        transformToUpperCase(
          {
            bookings_ticket_id: bookingTicket.id,
            flight_number: route.flight_number || route.flight,
            rbd: route.rbd || null,
            date: route.date,
            origin: route.origin,
            destination: route.destination,
            departure_time: route.departure,
            arrival_time: route.arrival,
          },
          ["bookings_ticket_id", "date", "departure_time", "arrival_time"]
        )
      );

      const { error: routesError } = await supabase
        .from("tickets_routes")
        .insert(routesToInsert);

      if (routesError) throw routesError;
    }

    // 7. บันทึกข้อมูลรายการเพิ่มเติม (extras)
    if (ticketData.extras && ticketData.extras.length > 0) {
      const extrasToInsert = ticketData.extras
        .filter((extra) => extra.description && extra.description.trim())
        .map((extra) =>
          transformToUpperCase(
            {
              bookings_ticket_id: bookingTicket.id,
              description: extra.description,
              net_price: extra.net_price || 0,
              sale_price: extra.sale_price || 0,
              quantity: extra.quantity || 1,
              total_amount: extra.total_amount || 0,
            },
            [
              "bookings_ticket_id",
              "net_price",
              "sale_price",
              "quantity",
              "total_amount",
            ]
          )
        );

      if (extrasToInsert.length > 0) {
        const { error: extrasError } = await supabase
          .from("tickets_extras")
          .insert(extrasToInsert);

        if (extrasError) throw extrasError;
      }
    }

    // 8. เรียก stored procedure เพื่อคำนวณยอดรวมใหม่ (ถ้ามี)
    try {
      await supabase.rpc("update_ticket_totals", {
        ticket_id: bookingTicket.id,
      });
    } catch (procError) {
      console.warn(
        "Stored procedure not available, totals calculated manually"
      );
    }

    return {
      success: true,
      referenceNumber: bookingTicket.reference_number,
      ticketId: bookingTicket.id,
      grandTotal: grandTotal,
      subtotal: subtotalBeforeVat,
      vatAmount: vatAmount,
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
    const { data, error } = await supabase
      .from("bookings_ticket")
      .select(
        `
        *,
        customer:customer_id(*),
        detail:tickets_detail_id(*),
        supplier:information_id(*)
      `
      )
      .eq("id", ticketId)
      .single();

    if (error) throw error;

    // ดึงข้อมูลที่เกี่ยวข้องอื่นๆ
    // ข้อมูลผู้โดยสาร
    const { data: passengersData, error: passengersError } = await supabase
      .from("tickets_passengers")
      .select("*")
      .eq("bookings_ticket_id", ticketId);

    if (passengersError) throw passengersError;

    // ข้อมูลเส้นทาง
    const { data: routesData, error: routesError } = await supabase
      .from("tickets_routes")
      .select("*")
      .eq("bookings_ticket_id", ticketId);

    if (routesError) throw routesError;

    // ข้อมูลราคา
    const { data: pricingData, error: pricingError } = await supabase
      .from("tickets_pricing")
      .select("*")
      .eq("bookings_ticket_id", ticketId)
      .single();

    if (pricingError) throw pricingError;

    // ข้อมูลเพิ่มเติม
    const { data: additionalInfoData, error: additionalInfoError } =
      await supabase
        .from("ticket_additional_info")
        .select("*")
        .eq("bookings_ticket_id", ticketId)
        .single();

    if (additionalInfoError) throw additionalInfoError;

    // ข้อมูล extras
    const { data: extrasData, error: extrasError } = await supabase
      .from("tickets_extras")
      .select("*")
      .eq("bookings_ticket_id", ticketId);

    if (extrasError) throw extrasError;

    // รวมข้อมูลทั้งหมดเป็นชุดเดียว
    const fullTicketData = {
      ...data,
      passengers: passengersData || [],
      routes: routesData || [],
      pricing: pricingData || {},
      additionalInfo: additionalInfoData || {},
      extras: extrasData || [],
    };

    return { success: true, data: fullTicketData };
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
    let query = supabase.from("bookings_ticket").select(`
        *,
        customer:customer_id(name),
        detail:tickets_detail_id(issue_date, due_date),
        supplier:information_id(name)
      `);

    // เพิ่มฟิลเตอร์ต่างๆ
    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    if (filters.paymentStatus) {
      query = query.eq("payment_status", filters.paymentStatus);
    }

    if (filters.customerId) {
      query = query.eq("customer_id", filters.customerId);
    }

    if (filters.fromDate && filters.toDate) {
      // ใช้ฟังก์ชัน toThaiTimeZone เพื่อปรับเวลาก่อนใช้ในการกรอง
      const fromDate = toThaiTimeZone(new Date(filters.fromDate), false);
      const toDate = toThaiTimeZone(new Date(filters.toDate), false);

      query = query.gte("created_at", fromDate).lte("created_at", toDate);
    }

    // เรียงลำดับตามวันที่สร้าง
    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching flight tickets:", error);
    return { success: false, error: error.message };
  }
};
