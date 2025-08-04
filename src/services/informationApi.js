// src/services/informationApi.js
import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "../config/apiConfig";

/**
 * Information API Service - แทนที่ Supabase
 */
class InformationApi {
  // ===== SUPPLIERS =====

  /**
   * Get suppliers with filtering และ pagination
   */
  async getSuppliers(options = {}) {
    const {
      type = "Airline",
      search = "",
      limit = 100,
      active = true,
      page = 1,
      pageSize = 10,
    } = options;

    try {
      // คำนวณ offset สำหรับ pagination
      const offset = (page - 1) * pageSize;

      const params = {
        action: "suppliers",
        type: type !== "all" ? type : undefined,
        search,
        limit: pageSize, // ใช้ pageSize แทน limit
        offset,
        active: active ? 1 : 0,
      };

      // ลบ undefined values
      Object.keys(params).forEach((key) => {
        if (params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await apiClient.get(API_ENDPOINTS.INFORMATION, params);

      return {
        success: true,
        data: response.data?.data || [],
        count: response.data?.count || 0,
        total: response.data?.total || 0,
        pagination: {
          page,
          pageSize,
          total: response.data?.total || 0,
          pages: Math.ceil((response.data?.total || 0) / pageSize),
        },
      };
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      return {
        success: false,
        error: error.message,
        data: [],
        count: 0,
        total: 0,
        pagination: { page: 1, pageSize, total: 0, pages: 0 },
      };
    }
  }

  /**
   * Get customers with filtering และ pagination
   */
  async getCustomers(options = {}) {
    const {
      search = "",
      limit = 10,
      active = true,
      page = 1,
      pageSize = 10,
    } = options;

    try {
      // คำนวณ offset สำหรับ pagination
      const offset = (page - 1) * pageSize;

      const params = {
        action: "customers",
        search,
        limit: pageSize, // ใช้ pageSize แทน limit
        offset,
        active: active ? 1 : 0,
      };

      const response = await apiClient.get(API_ENDPOINTS.INFORMATION, params);

      return {
        success: true,
        data: response.data?.data || [],
        count: response.data?.count || 0,
        total: response.data?.total || 0,
        pagination: {
          page,
          pageSize,
          total: response.data?.total || 0,
          pages: Math.ceil((response.data?.total || 0) / pageSize),
        },
      };
    } catch (error) {
      console.error("Error fetching customers:", error);
      return {
        success: false,
        error: error.message,
        data: [],
        count: 0,
        total: 0,
        pagination: { page: 1, pageSize, total: 0, pages: 0 },
      };
    }
  }

  /**
   * Create new supplier
   */
  async createSupplier(supplierData) {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.INFORMATION + "?action=supplier",
        supplierData
      );

      return {
        success: true,
        data: response.data,
        supplierId: response.data?.id,
      };
    } catch (error) {
      console.error("Error creating supplier:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Update supplier
   */
  async updateSupplier(id, supplierData) {
    try {
      const response = await apiClient.put(
        API_ENDPOINTS.INFORMATION + `?action=supplier&id=${id}`,
        supplierData
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error updating supplier:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Deactivate supplier
   */
  async deactivateSupplier(id) {
    try {
      await apiClient.delete(
        API_ENDPOINTS.INFORMATION + `?action=supplier&id=${id}`
      );
      return { success: true };
    } catch (error) {
      console.error("Error deactivating supplier:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create new customer
   */
  async createCustomer(customerData) {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.INFORMATION + "?action=customer",
        customerData
      );

      return {
        success: true,
        data: response.data,
        customerId: response.data?.id,
      };
    } catch (error) {
      console.error("Error creating customer:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Update customer
   */
  async updateCustomer(id, customerData) {
    try {
      const response = await apiClient.put(
        API_ENDPOINTS.INFORMATION + `?action=customer&id=${id}`,
        customerData
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error updating customer:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Deactivate customer
   */
  async deactivateCustomer(id) {
    try {
      await apiClient.delete(
        API_ENDPOINTS.INFORMATION + `?action=customer&id=${id}`
      );
      return { success: true };
    } catch (error) {
      console.error("Error deactivating customer:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// Create singleton instance
export const informationApi = new InformationApi();
export default InformationApi;
