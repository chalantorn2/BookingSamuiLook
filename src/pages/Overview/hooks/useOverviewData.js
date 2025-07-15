// src/pages/Overview/hooks/useOverviewData.js
import { useState, useEffect } from "react";
import { supabase } from "../../../services/supabase";
import { toThaiTimeZone } from "../../../utils/helpers";

export const serviceTypes = [
  { id: "all", name: "All Services", icon: "Activity" },
  { id: "deposit", name: "Deposits", icon: "Database" },
  { id: "voucher", name: "Vouchers", icon: "Voucher" },
  { id: "flight", name: "Flight Tickets", icon: "Plane" },
  { id: "boat", name: "Boat Tickets", icon: "Ship" },
  { id: "bus", name: "Bus Tickets", icon: "Bus" },
  { id: "hotel", name: "Hotel Bookings", icon: "Hotel" },
  { id: "tour", name: "Tour Packages", icon: "Package" },
  { id: "other", name: "Other Services", icon: "AlertCircle" },
];

// อัปเดต statusMap ให้แสดงเฉพาะ Not Invoiced และ Invoiced
export const statusMap = {
  not_invoiced: { label: "Not Invoiced", color: "yellow" },
  invoiced: { label: "Invoiced", color: "green" },
  cancelled: { label: "Cancelled", color: "red" },
};

export const useOverviewData = ({
  startDate,
  endDate,
  serviceTypeFilter,
  sortField = "timestamp", // เปลี่ยนค่าเริ่มต้นเป็น timestamp
  sortDirection = "desc", // เปลี่ยนเป็น desc เพื่อให้ล่าสุดขึ้นก่อน
  searchTerm,
  currentPage,
  itemsPerPage,
}) => {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    totalAmount: 0,
    not_invoiced: 0,
    invoiced: 0,
    cancelled: 0,
    flight: 0,
    boat: 0,
    bus: 0,
    hotel: 0,
    tour: 0,
    deposit: 0,
    voucher: 0,
    other: 0,
  });

  // เพิ่มฟังก์ชัน sortData ที่ครบถ้วน
  const sortData = (data, field, direction) => {
    if (!data || data.length === 0) return data;

    const sortedData = [...data].sort((a, b) => {
      let aValue, bValue;

      // กำหนดค่าสำหรับการ sort ตาม field ต่างๆ
      switch (field) {
        case "reference_number":
          aValue = a.referenceNumber || "";
          bValue = b.referenceNumber || "";
          break;
        case "date":
          aValue = a.date ? new Date(a.date) : new Date(0);
          bValue = b.date ? new Date(b.date) : new Date(0);
          break;
        case "customer":
          aValue = a.customer || "";
          bValue = b.customer || "";
          break;
        case "supplier":
          aValue = a.supplier || "";
          bValue = b.supplier || "";
          break;
        case "status":
          aValue = a.status || "";
          bValue = b.status || "";
          break;
        case "created_by":
          aValue = a.createdBy || "";
          bValue = b.createdBy || "";
          break;
        case "timestamp":
          aValue = a.timestamp ? new Date(a.timestamp) : new Date(0);
          bValue = b.timestamp ? new Date(b.timestamp) : new Date(0);
          break;
        default:
          aValue = a[field] || "";
          bValue = b[field] || "";
      }

      // สำหรับ Date objects
      if (aValue instanceof Date && bValue instanceof Date) {
        if (direction === "asc") {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      }

      // สำหรับ String values
      if (typeof aValue === "string" && typeof bValue === "string") {
        const comparison = aValue.localeCompare(bValue, "th", {
          numeric: true,
          sensitivity: "base",
        });
        return direction === "asc" ? comparison : -comparison;
      }

      // สำหรับ Number values
      if (typeof aValue === "number" && typeof bValue === "number") {
        if (direction === "asc") {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      }

      // Default comparison
      if (direction === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return sortedData;
  };

  const fetchData = async () => {
    setLoading(true);

    try {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const startISO = toThaiTimeZone(start, false);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      const endISO = toThaiTimeZone(end, false);

      // ลบการ order ออกจาก query เพราะเราจะ sort ใน frontend
      let query = supabase
        .from("bookings_ticket")
        .select(
          `
    id,
    reference_number,
    status,
    created_at,
    updated_at,
    created_by,
    po_number,
    cancelled_at,
    cancelled_by,
    cancel_reason,
    user:created_by(fullname),
    customer:customer_id(name),
    supplier:information_id(name),
    tickets_detail(issue_date, total_price),
    cancelled_user:cancelled_by(fullname)
  `
        )
        .gte("created_at", startISO)
        .lte("created_at", endISO);

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching data:", error);
        setActivities([]);
        setFilteredData([]);
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        console.log("No data returned from query");
        setActivities([]);
        setFilteredData([]);
        setLoading(false);
        return;
      }

      const processedData = data.map((item) => {
        let serviceType = "flight";
        let issueDate = null;
        if (item.tickets_detail && item.tickets_detail.length > 0) {
          const rawDate = item.tickets_detail[0].issue_date;
          issueDate = rawDate
            ? new Date(new Date(rawDate).getTime() + 7 * 60 * 60 * 1000)
            : null;
        }

        let amount = 0;
        if (
          item.tickets_detail &&
          item.tickets_detail.length > 0 &&
          item.tickets_detail[0].total_price
        ) {
          amount = parseFloat(item.tickets_detail[0].total_price);
        }

        const timestamp = new Date(
          new Date(item.created_at).getTime() + 7 * 60 * 60 * 1000
        );

        // ปรับสถานะให้แสดงตามที่ได้จากฐานข้อมูล
        let normalizedStatus = item.status; // ใช้สถานะจริงจากฐานข้อมูล

        // ถ้าไม่ใช่ cancelled ให้ใช้ logic เดิม
        if (item.status !== "cancelled") {
          if (item.status === "confirmed" || item.status === "invoiced") {
            normalizedStatus = "invoiced";
          } else {
            normalizedStatus = "not_invoiced";
          }
        }

        return {
          id: item.id,
          referenceNumber: item.reference_number,
          date: issueDate || timestamp,
          customer: item.customer?.name || "N/A",
          supplier: item.supplier?.name || "N/A",
          status: normalizedStatus, // ใช้สถานะที่ปรับแล้ว
          createdBy: item.user?.fullname || "System",
          timestamp: timestamp,
          serviceType: serviceType,
          amount: amount,
          po_number: item.po_number,
          po_generated_at: item.po_generated_at,
          cancelled_at: item.cancelled_at,
          cancel_reason: item.cancel_reason,
          cancelled_by_name: item.cancelled_user?.fullname || null,
        };
      });

      setActivities(processedData);

      // ใช้ฟังก์ชัน getFilteredData แล้วค่อย sort
      const filtered = getFilteredData(processedData, searchTerm);
      const sorted = sortData(filtered, sortField, sortDirection);
      setFilteredData(sorted);

      const summaryData = calculateSummary(filtered);
      setSummary(summaryData);
    } catch (error) {
      console.error("Error in fetchData:", error);
      setActivities([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredData = (data = activities, search = searchTerm) => {
    if (!data || !data.length) {
      return [];
    }

    let filtered = [...data];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          (item.referenceNumber &&
            item.referenceNumber.toLowerCase().includes(searchLower)) ||
          (item.customer &&
            item.customer.toLowerCase().includes(searchLower)) ||
          (item.supplier &&
            item.supplier.toLowerCase().includes(searchLower)) ||
          (item.createdBy && item.createdBy.toLowerCase().includes(searchLower))
      );
    }

    if (serviceTypeFilter !== "all") {
      filtered = filtered.filter(
        (item) => item.serviceType === serviceTypeFilter
      );
    }

    return filtered;
  };

  const calculateSummary = (data) => {
    if (!data || !data.length) {
      return {
        total: 0,
        totalAmount: 0,
        not_invoiced: 0,
        invoiced: 0,
        // ลบ cancelled และ pending
        flight: 0,
        boat: 0,
        bus: 0,
        hotel: 0,
        tour: 0,
        deposit: 0,
        voucher: 0,
        other: 0,
      };
    }

    const result = data.reduce(
      (summary, item) => {
        summary.total++;
        summary.totalAmount += parseFloat(item.amount || 0);

        // นับเฉพาะสถานะ not_invoiced และ invoiced
        if (item.status === "not_invoiced") summary.not_invoiced++;
        else if (item.status === "invoiced") summary.invoiced++;
        else if (item.status === "cancelled") summary.cancelled++;

        if (
          item.serviceType &&
          typeof summary[item.serviceType] !== "undefined"
        ) {
          summary[item.serviceType]++;
        }

        return summary;
      },
      {
        total: 0,
        totalAmount: 0,
        not_invoiced: 0,
        invoiced: 0,
        cancelled: 0,
        flight: 0,
        boat: 0,
        bus: 0,
        hotel: 0,
        tour: 0,
        deposit: 0,
        voucher: 0,
        other: 0,
      }
    );

    return result;
  };

  // เรียกข้อมูลใหม่เมื่อ dependencies เปลี่ยน
  useEffect(() => {
    fetchData();
  }, [startDate, endDate, serviceTypeFilter]);

  // จัดการ search term แยกต่างหาก
  useEffect(() => {
    const filtered = getFilteredData();
    const sorted = sortData(filtered, sortField, sortDirection);
    setFilteredData(sorted);
    const summaryData = calculateSummary(filtered);
    setSummary(summaryData);
  }, [searchTerm, activities]);

  // จัดการ sort แยกต่างหาก
  useEffect(() => {
    const sorted = sortData(filteredData, sortField, sortDirection);
    setFilteredData(sorted);
  }, [sortField, sortDirection]);

  return {
    loading,
    activities,
    filteredData,
    summary,
    fetchData,
    getFilteredData,
    calculateSummary,
  };
};
