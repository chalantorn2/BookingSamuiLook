// src/services/ticketService.js
import { supabase } from "./supabase";
import { generateReferenceNumber } from "../utils/helpers";

/**
 * สร้าง Flight Ticket ใหม่
 * @param {Object} ticketData - ข้อมูลตั๋วเครื่องบิน
 * @returns {Promise<Object>} - ผลลัพธ์การสร้างตั๋ว
 */
export const createFlightTicket = async (ticketData) => {
  try {
    // สร้างเลขอ้างอิง
    const referenceNumber = generateReferenceNumber("FT");

    // 1. บันทึกข้อมูลหลักลงในตาราง bookings_ticket
    const { data: bookingTicket, error: bookingTicketError } = await supabase
      .from("bookings_ticket")
      .insert({
        reference_number: referenceNumber,
        customer_id: ticketData.customerId,
        information_id: ticketData.supplierId,
        status: ticketData.status || "pending",
        payment_status: ticketData.paymentStatus || "unpaid",
        created_by: ticketData.createdBy,
      })
      .select("id, reference_number")
      .single();

    if (bookingTicketError) throw bookingTicketError;

    // 2. บันทึกข้อมูลรายละเอียดตั๋ว
    const { data: ticketDetail, error: ticketDetailError } = await supabase
      .from("tickets_detail")
      .insert({
        bookings_ticket_id: bookingTicket.id,
        total_price: ticketData.totalAmount,
        issue_date: ticketData.bookingDate,
        due_date: ticketData.dueDate,
        credit_days: ticketData.creditDays,
      })
      .select("id")
      .single();

    if (ticketDetailError) throw ticketDetailError;

    // 3. บันทึกข้อมูลเพิ่มเติมของตั๋ว
    const { data: additionalInfoData, error: additionalInfoError } =
      await supabase
        .from("ticket_additional_info")
        .insert({
          bookings_ticket_id: bookingTicket.id,
          company_payment_method: ticketData.companyPaymentMethod,
          company_payment_details: ticketData.companyPaymentDetails,
          customer_payment_method: ticketData.customerPaymentMethod,
          customer_payment_details: ticketData.customerPaymentDetails,
          code: ticketData.code,
          ticket_type: ticketData.ticketType,
          ticket_type_details: ticketData.ticketTypeDetails,
        })
        .select("id")
        .single();

    if (additionalInfoError) throw additionalInfoError;

    // 4. บันทึกข้อมูลผู้โดยสาร (อาจมีหลายคน)
    const passengersToInsert = ticketData.passengers.map((passenger) => ({
      bookings_ticket_id: bookingTicket.id,
      passenger_name: passenger.name,
      age: passenger.age || null,
      ticket_number: passenger.ticketNumber || null,
    }));

    if (passengersToInsert.length > 0) {
      const { error: passengersError } = await supabase
        .from("tickets_passengers")
        .insert(passengersToInsert);

      if (passengersError) throw passengersError;
    }

    // 5. บันทึกข้อมูลราคา
    const { data: pricingData, error: pricingError } = await supabase
      .from("tickets_pricing")
      .insert({
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
        subtotal_amount: ticketData.subtotalAmount,
        vat_percent: ticketData.vatPercent,
        vat_amount: ticketData.vatAmount,
        total_amount: ticketData.totalAmount,
      })
      .select("id")
      .single();

    if (pricingError) throw pricingError;

    // 6. บันทึกข้อมูลเส้นทาง (อาจมีหลายเส้นทาง)
    const routesToInsert = ticketData.routes.map((route) => ({
      bookings_ticket_id: bookingTicket.id,
      airline: route.airline,
      flight_number: route.flight,
      rbd: route.rbd || null,
      date: route.date,
      origin: route.origin,
      destination: route.destination,
      departure_time: route.departure,
      arrival_time: route.arrival,
    }));

    if (routesToInsert.length > 0) {
      const { error: routesError } = await supabase
        .from("tickets_routes")
        .insert(routesToInsert);

      if (routesError) throw routesError;
    }

    // 7. บันทึกข้อมูลรายการเพิ่มเติม (extras) ถ้ามี
    if (ticketData.extras && ticketData.extras.length > 0) {
      const extrasToInsert = ticketData.extras
        .filter((extra) => extra.description && extra.description.trim())
        .map((extra) => ({
          bookings_ticket_id: bookingTicket.id,
          description: extra.description,
          net_price: extra.net_price || 0,
          sale_price: extra.sale_price || 0,
          quantity: extra.quantity || 1,
          total_amount: extra.total_amount || 0,
        }));

      if (extrasToInsert.length > 0) {
        const { error: extrasError } = await supabase
          .from("tickets_extras")
          .insert(extrasToInsert);

        if (extrasError) throw extrasError;
      }
    }

    return {
      success: true,
      referenceNumber: bookingTicket.reference_number,
      ticketId: bookingTicket.id,
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
      query = query
        .gte("created_at", filters.fromDate)
        .lte("created_at", filters.toDate);
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
