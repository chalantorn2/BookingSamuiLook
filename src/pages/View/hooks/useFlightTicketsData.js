import { useState, useEffect } from "react";
import { supabase } from "../../../services/supabase";
import { toThaiTimeZone } from "../../../utils/helpers";

export const useFlightTicketsData = ({
  startDate,
  endDate,
  searchTerm = "",
  filterStatus = "all",
  sortField = "created_at", // เปลี่ยนค่าเริ่มต้นเป็น created_at
  sortDirection = "desc", // เรียงจากล่าสุดไปเก่าสุด
}) => {
  const [loading, setLoading] = useState(true);
  const [allTickets, setAllTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [error, setError] = useState(null);

  const fetchFlightTickets = async () => {
    setLoading(true);
    setError(null);

    try {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      let query = supabase
        .from("bookings_ticket")
        .select(
          `
        id,
        reference_number,
        status,
        payment_status,
        created_at,
        updated_at,
        customer:customer_id(name),
        supplier:information_id(name)
      `
        )
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString());

      if (filterStatus && filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }

      const { data: tickets, error: ticketError } = await query;

      if (ticketError) {
        console.error("Error fetching flight tickets:", ticketError);
        setError("ไม่สามารถโหลดข้อมูลตั๋วเครื่องบินได้");
        setAllTickets([]);
        setFilteredTickets([]);
        return;
      }

      // ปรับ created_at ให้อยู่ใน timezone +07:00
      const adjustedTickets = tickets.map((ticket) => {
        const createdAt = new Date(ticket.created_at);
        createdAt.setHours(createdAt.getHours() + 7); // ปรับเป็น +07:00
        return {
          ...ticket,
          created_at: createdAt.toISOString(),
        };
      });

      // ดึงข้อมูล ticket_additional_info แยก
      const ticketIds = adjustedTickets.map((ticket) => ticket.id);
      const { data: additionalInfo, error: additionalInfoError } =
        await supabase
          .from("ticket_additional_info")
          .select("bookings_ticket_id, code")
          .in("bookings_ticket_id", ticketIds);

      if (additionalInfoError) {
        console.error(
          "Error fetching ticket_additional_info:",
          additionalInfoError
        );
      }

      const additionalInfoMap = new Map(
        additionalInfo?.map((info) => [info.bookings_ticket_id, info.code]) ||
          []
      );

      const processedData = adjustedTickets.map((ticket) => ({
        ...ticket,
        code: additionalInfoMap.get(ticket.id) || null,
      }));

      console.log("Processed tickets with code:", processedData);

      setAllTickets(processedData);
      filterData(processedData, searchTerm);
    } catch (error) {
      console.error("Error in fetchFlightTickets:", error);
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      setAllTickets([]);
      setFilteredTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const filterData = (data = allTickets, search = searchTerm) => {
    if (!data || !Array.isArray(data)) {
      setFilteredTickets([]);
      return;
    }

    let filtered = [...data];

    if (search && search.trim() !== "") {
      const searchLower = search.toLowerCase().trim();

      filtered = filtered.filter(
        (ticket) =>
          (ticket.reference_number &&
            ticket.reference_number.toLowerCase().includes(searchLower)) ||
          (ticket.customer?.name &&
            ticket.customer.name.toLowerCase().includes(searchLower)) ||
          (ticket.supplier?.name &&
            ticket.supplier.name.toLowerCase().includes(searchLower)) ||
          (ticket.code && ticket.code.toLowerCase().includes(searchLower)) ||
          (ticket.status &&
            (ticket.status.toLowerCase().includes(searchLower) ||
              (ticket.status === "confirmed" &&
                "invoiced".includes(searchLower)) ||
              (ticket.status !== "confirmed" &&
                "not invoiced".includes(searchLower))))
      );
    }

    // กรองตามสถานะ
    if (filterStatus && filterStatus !== "all") {
      filtered = filtered.filter((ticket) => {
        if (filterStatus === "invoiced") {
          return ticket.status === "confirmed" || ticket.status === "invoiced";
        } else if (filterStatus === "not_invoiced") {
          return ticket.status !== "confirmed" && ticket.status !== "invoiced";
        }
        return true;
      });
    }

    filtered = sortTickets(filtered, sortField, sortDirection);
    setFilteredTickets(filtered);
  };

  const sortTickets = (tickets, field, direction) => {
    const sorted = [...tickets];

    const fieldMap = {
      id: "reference_number",
      customer: "customer.name",
      supplier: "supplier.name",
      status: "status",
      created_at: "created_at",
    };

    sorted.sort((a, b) => {
      let valueA, valueB;

      if (field === "customer") {
        valueA = a.customer?.name || "";
        valueB = b.customer?.name || "";
      } else if (field === "supplier") {
        valueA = a.supplier?.name || "";
        valueB = b.supplier?.name || "";
      } else if (field === "status") {
        // แปลงสถานะให้เป็นมาตรฐาน
        valueA = a.status === "confirmed" ? "invoiced" : "not_invoiced";
        valueB = b.status === "confirmed" ? "invoiced" : "not_invoiced";
      } else if (field === "created_at") {
        valueA = a.created_at ? new Date(a.created_at) : new Date(0);
        valueB = b.created_at ? new Date(b.created_at) : new Date(0);
      } else {
        valueA = a[fieldMap[field] || field] || "";
        valueB = b[fieldMap[field] || field] || "";
      }

      if (direction === "asc") {
        if (valueA < valueB) return -1;
        if (valueA > valueB) return 1;
        return 0;
      } else {
        if (valueA > valueB) return -1;
        if (valueA < valueB) return 1;
        return 0;
      }
    });

    return sorted;
  };

  useEffect(() => {
    filterData(allTickets, searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    setFilteredTickets(sortTickets(filteredTickets, sortField, sortDirection));
  }, [sortField, sortDirection]);

  return {
    loading,
    error,
    allTickets,
    filteredTickets,
    fetchFlightTickets,
    filterData,
  };
};

export default useFlightTicketsData;
