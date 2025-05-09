import { useState, useEffect } from "react";
import { supabase } from "../../../services/supabase";
import { toThaiTimeZone } from "../../../utils/helpers";

export const serviceTypes = [
  { id: "all", name: "All Services", icon: "Activity" },
  { id: "flight", name: "Flight Tickets", icon: "Plane" },
  { id: "boat", name: "Boat Tickets", icon: "Ship" },
  { id: "bus", name: "Bus Tickets", icon: "Bus" },
  { id: "hotel", name: "Hotel Bookings", icon: "Hotel" },
  { id: "tour", name: "Tour Packages", icon: "Package" },
  { id: "deposit", name: "Deposits", icon: "Database" },
  { id: "voucher", name: "Vouchers", icon: "Voucher" },
  { id: "other", name: "Other Services", icon: "AlertCircle" },
];

export const statusMap = {
  not_invoiced: { label: "Not Invoiced", color: "yellow" },
  invoiced: { label: "Invoiced", color: "green" },
  cancelled: { label: "ยกเลิก", color: "red" },
};

export const useOverviewData = ({
  startDate,
  endDate,
  serviceTypeFilter,
  sortField,
  sortDirection,
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

  const fetchData = async () => {
    setLoading(true);

    try {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const startISO = toThaiTimeZone(start, false);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      const endISO = toThaiTimeZone(end, false);

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
          user:created_by(fullname),
          customer:customer_id(name),
          supplier:information_id(name),
          tickets_detail(issue_date, total_price)
        `
        )
        .gte("created_at", startISO)
        .lte("created_at", endISO);

      query = query.order(sortField, { ascending: sortDirection === "asc" });

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

        return {
          id: item.id,
          referenceNumber: item.reference_number,
          date: issueDate || timestamp,
          customer: item.customer?.name || "N/A",
          supplier: item.supplier?.name || "N/A",
          status: item.status || "not_invoiced",
          createdBy: item.user?.fullname || "System", // ใช้ fullname จากตาราง users
          timestamp: timestamp,
          serviceType: serviceType,
          amount: amount,
        };
      });

      setActivities(processedData);
      const filtered = getFilteredData(processedData, searchTerm);
      setFilteredData(filtered);
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
          (item.customer && item.customer.toLowerCase().includes(searchLower))
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
        cancelled: 0,
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

  useEffect(() => {
    fetchData();
  }, [startDate, endDate, serviceTypeFilter, sortField, sortDirection]);

  useEffect(() => {
    const filtered = getFilteredData();
    setFilteredData(filtered);
    const summaryData = calculateSummary(filtered);
    setSummary(summaryData);
  }, [searchTerm, activities]);

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
