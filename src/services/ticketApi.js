// src/services/ticketApi.js
import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "../config/apiConfig";

/**
 * Ticket API Service - แทนที่ Supabase สำหรับ ticket operations
 */
class TicketApi {
  /**
   * Create new flight ticket
   */
  async createFlightTicket(ticketData) {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.TICKETS + "?action=create_flight",
        {
          // Customer & Basic Info
          customer_id: ticketData.customerId,
          information_id: ticketData.supplierId,
          status: "not_invoiced",
          payment_status: "pending",
          created_by: ticketData.createdBy,

          // Ticket Details
          ticket_details: {
            issue_date: ticketData.date,
            due_date: ticketData.dueDate,
            credit_days: parseInt(ticketData.creditDays) || 0,
            subtotal_before_vat: ticketData.subtotalBeforeVat || 0,
            extras_total: ticketData.extrasTotal || 0,
            pricing_total: ticketData.pricingTotal || 0,
            vat_amount: ticketData.vatAmount || 0,
            vat_percent: parseFloat(ticketData.vatPercent) || 0,
            grand_total: ticketData.grandTotal || 0,
          },

          // Additional Info
          additional_info: {
            company_payment_method: ticketData.paymentMethod,
            company_payment_details: ticketData.companyPaymentDetails,
            customer_payment_method: ticketData.customerPayment,
            customer_payment_details: ticketData.customerPaymentDetails,
            code: ticketData.code,
            ticket_type: (ticketData.ticketType || "").toLowerCase(),
            ticket_type_details: ticketData.ticketTypeDetails,
          },

          // Passengers
          passengers:
            ticketData.passengers?.map((passenger) => ({
              passenger_name: passenger.name,
              age: passenger.age || null,
              ticket_number: passenger.ticketNumber || null,
              ticket_code: passenger.ticket_code || null,
            })) || [],

          // Pricing
          pricing: {
            adult_net_price: ticketData.pricing?.adult?.net || 0,
            adult_sale_price: ticketData.pricing?.adult?.sale || 0,
            adult_pax: ticketData.pricing?.adult?.pax || 0,
            adult_total: ticketData.pricing?.adult?.total || 0,
            child_net_price: ticketData.pricing?.child?.net || 0,
            child_sale_price: ticketData.pricing?.child?.sale || 0,
            child_pax: ticketData.pricing?.child?.pax || 0,
            child_total: ticketData.pricing?.child?.total || 0,
            infant_net_price: ticketData.pricing?.infant?.net || 0,
            infant_sale_price: ticketData.pricing?.infant?.sale || 0,
            infant_pax: ticketData.pricing?.infant?.pax || 0,
            infant_total: ticketData.pricing?.infant?.total || 0,
            subtotal_amount: ticketData.pricingSubtotal || 0,
            vat_percent: parseFloat(ticketData.vatPercent) || 0,
            vat_amount: ticketData.vatAmount || 0,
            total_amount: ticketData.pricingSubtotal || 0,
          },

          // Routes
          routes:
            ticketData.routes?.map((route) => ({
              flight_number: route.flight_number || route.flight,
              rbd: route.rbd || null,
              date: route.date,
              origin: route.origin,
              destination: route.destination,
              departure_time: route.departure,
              arrival_time: route.arrival,
            })) || [],

          // Extras
          extras:
            ticketData.extras
              ?.filter((extra) => extra.description && extra.description.trim())
              .map((extra) => ({
                description: extra.description,
                net_price: extra.net_price || 0,
                sale_price: extra.sale_price || 0,
                quantity: extra.quantity || 1,
                total_amount: extra.total_amount || 0,
              })) || [],
        }
      );

      return {
        success: true,
        referenceNumber: response.data?.reference_number,
        ticketId: response.data?.ticket_id,
        grandTotal: response.data?.grand_total,
        subtotal: response.data?.subtotal,
        vatAmount: response.data?.vat_amount,
        data: response.data,
      };
    } catch (error) {
      console.error("Error creating flight ticket:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get flight ticket by ID
   */
  async getFlightTicket(ticketId) {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.TICKETS + `?action=get_flight&id=${ticketId}`
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching flight ticket:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get flight tickets with filters
   */
  async getFlightTickets(filters = {}) {
    try {
      const params = {
        action: "list_flights",
        status: filters.status,
        payment_status: filters.paymentStatus,
        customer_id: filters.customerId,
        from_date: filters.fromDate,
        to_date: filters.toDate,
        page: filters.page || 1,
        limit: filters.limit || 20,
      };

      // ลบ undefined values
      Object.keys(params).forEach((key) => {
        if (params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await apiClient.get(API_ENDPOINTS.TICKETS, params);

      return {
        success: true,
        data: response.data?.data || [],
        total: response.data?.total || 0,
        pagination: response.data?.pagination || {},
      };
    } catch (error) {
      console.error("Error fetching flight tickets:", error);
      return {
        success: false,
        error: error.message,
        data: [],
        total: 0,
      };
    }
  }

  /**
   * Update flight ticket
   */
  async updateFlightTicket(ticketId, ticketData) {
    try {
      const response = await apiClient.put(
        API_ENDPOINTS.TICKETS + `?action=update_flight&id=${ticketId}`,
        ticketData
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error updating flight ticket:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Cancel flight ticket
   */
  async cancelFlightTicket(ticketId, reason = "") {
    try {
      const response = await apiClient.put(
        API_ENDPOINTS.TICKETS + `?action=cancel&id=${ticketId}`,
        { reason }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error cancelling flight ticket:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate reference number
   */
  async generateReferenceNumber() {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.TICKETS + "?action=generate_reference"
      );

      return {
        success: true,
        referenceNumber: response.data?.reference_number,
      };
    } catch (error) {
      console.error("Error generating reference number:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// Create singleton instance
export const ticketApi = new TicketApi();
export default TicketApi;
