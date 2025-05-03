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

    // 1. บันทึกข้อมูลรายละเอียดตั๋ว
    const { data: ticketDetail, error: ticketDetailError } = await supabase
      .from("tickets_detail")
      .insert({
        total_price: ticketData.totalAmount,
        issue_date: ticketData.bookingDate,
        due_date: ticketData.dueDate,
        credit_days: ticketData.creditDays,
      })
      .select("id")
      .single();

    if (ticketDetailError) throw ticketDetailError;

    // 2. บันทึกข้อมูลผู้โดยสาร (อาจมีหลายคน)
    const passengersToInsert = ticketData.passengers.map((passenger) => ({
      passenger_name: passenger.name,
      age: passenger.age || null,
      ticket_number: passenger.ticketNumber || null,
      ticket_code: ticketData.code || null,
    }));

    const { data: passengersData, error: passengersError } = await supabase
      .from("tickets_passengers")
      .insert(passengersToInsert)
      .select("id");

    if (passengersError) throw passengersError;

    // หมายเหตุ: เราจะย้ายส่วนนี้ไปไว้หลังจากสร้าง booking_ticket แล้ว เพื่อให้มี bookings_ticket_id

    // หมายเหตุ: เราจะย้ายส่วนนี้ไปไว้หลังจากสร้าง booking_ticket แล้ว เพื่อให้มี bookings_ticket_id

    // 5. สร้าง bookings_ticket หลัก (ยังไม่ใส่ ID ของตารางอื่นๆ)
    const { data: bookingTicket, error: bookingTicketError } = await supabase
      .from("bookings_ticket")
      .insert({
        reference_number: referenceNumber,
        customer_id: ticketData.customerId,
        tickets_detail_id: ticketDetail.id,
        tickets_passengers_id: passengersData[0].id,
        information_id: ticketData.supplierId,
        status: ticketData.status || "pending",
        payment_status: ticketData.paymentStatus || "unpaid",
        created_by: ticketData.createdBy,
      })
      .select("id, reference_number")
      .single();

    if (bookingTicketError) throw bookingTicketError;

    // 6. บันทึกข้อมูลเพิ่มเติมของตั๋วพร้อม bookings_ticket_id
    const { data: additionalInfoData, error: additionalInfoError } =
      await supabase
        .from("ticket_additional_info")
        .insert({
          company_payment_method: ticketData.companyPaymentMethod,
          company_payment_details: ticketData.companyPaymentDetails,
          customer_payment_method: ticketData.customerPaymentMethod,
          customer_payment_details: ticketData.customerPaymentDetails,
          code: ticketData.code,
          ticket_type: ticketData.ticketType,
          ticket_type_details: ticketData.ticketTypeDetails,
          bookings_ticket_id: bookingTicket.id, // เพิ่ม bookings_ticket_id
        })
        .select("id")
        .single();

    if (additionalInfoError) throw additionalInfoError;

    // 7. อัปเดต bookings_ticket ด้วย ticket_additional_info_id
    const { error: updateAdditionalInfoError } = await supabase
      .from("bookings_ticket")
      .update({ ticket_additional_info_id: additionalInfoData.id })
      .eq("id", bookingTicket.id);

    if (updateAdditionalInfoError) throw updateAdditionalInfoError;

    // 8. บันทึกข้อมูลราคาพร้อม bookings_ticket_id
    const { data: pricingData, error: pricingError } = await supabase
      .from("tickets_pricing")
      .insert({
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
        bookings_ticket_id: bookingTicket.id, // เพิ่ม bookings_ticket_id
      })
      .select("id")
      .single();

    if (pricingError) throw pricingError;

    // 9. อัปเดต bookings_ticket ด้วย tickets_pricing_id
    const { error: updatePricingError } = await supabase
      .from("bookings_ticket")
      .update({ tickets_pricing_id: pricingData.id })
      .eq("id", bookingTicket.id);

    if (updatePricingError) throw updatePricingError;

    // 10. บันทึกข้อมูลเส้นทาง (อาจมีหลายเส้นทาง) พร้อม bookings_ticket_id
    const routesToInsert = ticketData.routes.map((route) => ({
      airline: route.airline,
      flight_number: route.flight,
      rbd: route.rbd || null,
      date: route.date,
      origin: route.origin,
      destination: route.destination,
      departure_time: route.departure,
      arrival_time: route.arrival,
      bookings_ticket_id: bookingTicket.id, // เพิ่ม bookings_ticket_id ที่นี่
    }));

    const { data: routesData, error: routesError } = await supabase
      .from("tickets_routes")
      .insert(routesToInsert)
      .select("id");

    if (routesError) throw routesError;

    // 11. บันทึกข้อมูล bookings_ticket กับ tickets_routes_id
    const { error: updateBookingError } = await supabase
      .from("bookings_ticket")
      .update({ tickets_routes_id: routesData[0].id })
      .eq("id", bookingTicket.id);

    if (updateBookingError) throw updateBookingError;

    // 12. บันทึกข้อมูลรายการเพิ่มเติม (extras) ถ้ามี
    if (ticketData.extras && ticketData.extras.length > 0) {
      const extrasToInsert = ticketData.extras.map((extra) => ({
        description: extra.description,
        net_price: extra.net_price || extra.net || 0,
        sale_price: extra.sale_price || extra.sale || 0,
        quantity: extra.quantity || extra.pax || 1,
        total_amount: extra.total_amount || extra.total || 0,
        bookings_ticket_id: bookingTicket.id, // เพิ่ม bookings_ticket_id ที่นี่
      }));

      const { data: extrasInserted, error: extrasError } = await supabase
        .from("tickets_extras")
        .insert(extrasToInsert)
        .select("id");

      if (extrasError) throw extrasError;

      // 13. อัพเดท tickets_extras_id ในตาราง bookings_ticket
      const { error: updateExtrasError } = await supabase
        .from("bookings_ticket")
        .update({ tickets_extras_id: extrasInserted[0].id })
        .eq("id", bookingTicket.id);

      if (updateExtrasError) throw updateExtrasError;
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
        passengers:tickets_passengers_id(*),
        supplier:information_id(*),
        routes:tickets_routes_id(*),
        extras:tickets_extras_id(*),
        pricing:tickets_pricing_id(*),
        additionalInfo:ticket_additional_info_id(*)
      `
      )
      .eq("id", ticketId)
      .single();

    if (error) throw error;
    return { success: true, data };
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
        supplier:information_id(name),
        pricing:tickets_pricing_id(total_amount)
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
