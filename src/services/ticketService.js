import { supabase, insertData, updateData, fetchData } from "./supabase";
import { generateReferenceNumber } from "./referencesService";

export const createFlightTicket = async (ticketData) => {
  try {
    // สร้างรหัสอ้างอิงใหม่
    const referenceNumber = await generateReferenceNumber(
      "flight_tickets",
      "FT"
    );

    // เตรียมข้อมูลหลักของตั๋ว
    const ticketPayload = {
      reference_number: referenceNumber,
      customer_id: ticketData.customerId,
      supplier_id: ticketData.supplierId,
      ticket_type: ticketData.ticketType,
      booking_date: ticketData.bookingDate,
      status: ticketData.status || "pending",
      payment_status: ticketData.paymentStatus || "unpaid",
      company_payment_method: ticketData.companyPaymentMethod,
      company_payment_details: ticketData.companyPaymentDetails,
      customer_payment_method: ticketData.customerPaymentMethod,
      customer_payment_details: ticketData.customerPaymentDetails,
      remarks: ticketData.remarks,
      total_amount: ticketData.totalAmount,
      vat_percent: ticketData.vatPercent || 0,
      vat_amount: ticketData.vatAmount || 0,
      created_by: ticketData.createdBy,
    };

    // บันทึกข้อมูลตั๋ว
    const ticketResult = await insertData("flight_tickets", ticketPayload);
    const ticketId = ticketResult[0].id;

    // บันทึกข้อมูลผู้โดยสาร
    if (ticketData.passengers && ticketData.passengers.length > 0) {
      const passengerPromises = ticketData.passengers.map((passenger) =>
        insertData("passengers", {
          flight_ticket_id: ticketId,
          name: passenger.name,
          age: passenger.age,
          ticket_number: passenger.ticketNo,
          passport_number: passenger.passportNumber,
        })
      );
      await Promise.all(passengerPromises);
    }

    // บันทึกข้อมูลเส้นทาง
    if (ticketData.routes && ticketData.routes.length > 0) {
      const routePromises = ticketData.routes.map((route) =>
        insertData("flight_routes", {
          flight_ticket_id: ticketId,
          airline: route.airline,
          flight_number: route.flight,
          rbd: route.rbd,
          date: route.date,
          origin: route.origin,
          destination: route.destination,
          departure_time: route.departure,
          arrival_time: route.arrival,
        })
      );
      await Promise.all(routePromises);
    }

    // บันทึกข้อมูลราคา
    if (ticketData.pricing) {
      const pricingTypes = ["adult", "child", "infant"];
      const pricingPromises = [];

      for (const type of pricingTypes) {
        if (ticketData.pricing[type] && ticketData.pricing[type].pax > 0) {
          pricingPromises.push(
            insertData("service_pricing", {
              service_id: ticketId,
              service_type: "flight_ticket",
              passenger_type: type,
              net_price: ticketData.pricing[type].net || 0,
              sale_price: ticketData.pricing[type].sale || 0,
              quantity: ticketData.pricing[type].pax || 0,
              total_amount: ticketData.pricing[type].total || 0,
            })
          );
        }
      }

      // บันทึกข้อมูลรายการเพิ่มเติม (extras)
      if (ticketData.extras && ticketData.extras.length > 0) {
        for (const extra of ticketData.extras) {
          if (extra.description) {
            pricingPromises.push(
              insertData("service_pricing", {
                service_id: ticketId,
                service_type: "flight_ticket_extra",
                passenger_type: "extra",
                description: extra.description,
                net_price: extra.net || 0,
                sale_price: extra.sale || 0,
                quantity: extra.pax || 1,
                total_amount: extra.total || 0,
              })
            );
          }
        }
      }

      await Promise.all(pricingPromises);
    }

    return { success: true, ticketId, referenceNumber };
  } catch (error) {
    console.error("Error creating flight ticket:", error);
    return { success: false, error: error.message };
  }
};

export const getSupplierList = async (type = "airline") => {
  try {
    const { data, error } = await fetchData({
      table: "suppliers",
      filters: { type },
      orderBy: "name",
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return [];
  }
};

export const getCustomerList = async (search = "") => {
  try {
    let filters = {};
    if (search) {
      filters = { name: { operator: "ilike", value: `%${search}%` } };
    }

    const { data, error } = await fetchData({
      table: "customers",
      filters,
      orderBy: "name",
      limit: 20,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching customers:", error);
    return [];
  }
};

export const saveCustomer = async (customerData) => {
  try {
    const result = await insertData("customers", {
      name: customerData.name,
      address: customerData.address,
      phone: customerData.phone,
      email: customerData.email,
      contact_person: customerData.contactPerson,
      id_number: customerData.idNumber,
      tax_id: customerData.taxId,
      type: customerData.type || "individual",
    });

    return { success: true, customerId: result[0].id };
  } catch (error) {
    console.error("Error saving customer:", error);
    return { success: false, error: error.message };
  }
};
