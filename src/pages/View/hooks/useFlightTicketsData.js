import { useState, useEffect } from "react";
import { supabase } from "../../../services/supabase";
import { toThaiTimeZone } from "../../../utils/helpers";

export const useFlightTicketsData = ({
  startDate,
  endDate,
  searchTerm = "",
  filterStatus = "all",
  sortField = "created_at",
  sortDirection = "desc",
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
        po_number,
        po_generated_at,
        customer:customer_id(name, code),
        supplier:information_id(name, code)
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
        createdAt.setHours(createdAt.getHours() + 7);
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

      // ดึงข้อมูลผู้โดยสาร พร้อม ticket_number และ ticket_code
      const { data: passengers, error: passengersError } = await supabase
        .from("tickets_passengers")
        .select(
          "bookings_ticket_id, passenger_name, ticket_number, ticket_code"
        )
        .in("bookings_ticket_id", ticketIds)
        .order("id"); // เรียงตาม id เพื่อให้ได้ผู้โดยสารคนแรก

      if (passengersError) {
        console.error("Error fetching passengers:", passengersError);
      }

      // ดึงข้อมูลเส้นทาง
      const { data: routes, error: routesError } = await supabase
        .from("tickets_routes")
        .select("bookings_ticket_id, origin, destination")
        .in("bookings_ticket_id", ticketIds)
        .order("id");

      if (routesError) {
        console.error("Error fetching routes:", routesError);
      }

      // สร้าง Maps สำหรับจับคู่ข้อมูล
      const additionalInfoMap = new Map(
        additionalInfo?.map((info) => [info.bookings_ticket_id, info.code]) ||
          []
      );

      const passengersMap = new Map();
      const firstPassengerTicketMap = new Map(); // Map สำหรับเก็บข้อมูล ticket ของผู้โดยสารคนแรก

      passengers?.forEach((passenger) => {
        if (!passengersMap.has(passenger.bookings_ticket_id)) {
          passengersMap.set(passenger.bookings_ticket_id, []);
          // เก็บข้อมูล ticket ของผู้โดยสารคนแรก
          firstPassengerTicketMap.set(passenger.bookings_ticket_id, {
            ticket_number: passenger.ticket_number,
            ticket_code: passenger.ticket_code,
          });
        }
        passengersMap.get(passenger.bookings_ticket_id).push(passenger);
      });

      const routesMap = new Map();
      routes?.forEach((route) => {
        if (!routesMap.has(route.bookings_ticket_id)) {
          routesMap.set(route.bookings_ticket_id, []);
        }
        routesMap.get(route.bookings_ticket_id).push(route);
      });

      // รวมข้อมูลทั้งหมด
      const processedData = adjustedTickets.map((ticket) => {
        const ticketPassengers = passengersMap.get(ticket.id) || [];
        const ticketRoutes = routesMap.get(ticket.id) || [];
        const firstPassengerTicketInfo =
          firstPassengerTicketMap.get(ticket.id) || {};

        // สร้างชื่อผู้โดยสาร
        let passengersDisplay = "";
        if (ticketPassengers.length > 0) {
          const firstName = ticketPassengers[0].passenger_name || "Unknown";
          if (ticketPassengers.length === 1) {
            passengersDisplay = firstName;
          } else {
            const additionalCount = ticketPassengers.length - 1;
            passengersDisplay = `${firstName}...+${additionalCount}`;
          }
        }

        // สร้างเส้นทาง (แสดงเฉพาะ 2 เส้นทางแรก)
        let routingDisplay = "";
        if (ticketRoutes.length > 0) {
          if (ticketRoutes.length === 1) {
            routingDisplay = ticketRoutes[0].origin || "";
          } else {
            const firstRoute = ticketRoutes[0];
            const secondRoute = ticketRoutes[1];
            routingDisplay = `${firstRoute.origin || ""}-${
              secondRoute.origin || ""
            }`;
          }
        }

        return {
          ...ticket,
          code: additionalInfoMap.get(ticket.id) || null,
          passengersDisplay,
          routingDisplay,
          passengersCount: ticketPassengers.length,
          firstPassengerTicketInfo, // เพิ่มข้อมูล ticket ของผู้โดยสารคนแรก
        };
      });

      console.log("Processed tickets with additional data:", processedData);

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
          (ticket.customer?.code &&
            ticket.customer.code.toLowerCase().includes(searchLower)) ||
          (ticket.supplier?.name &&
            ticket.supplier.name.toLowerCase().includes(searchLower)) ||
          (ticket.supplier?.code &&
            ticket.supplier.code.toLowerCase().includes(searchLower)) ||
          (ticket.code && ticket.code.toLowerCase().includes(searchLower)) ||
          (ticket.passengersDisplay &&
            ticket.passengersDisplay.toLowerCase().includes(searchLower)) ||
          (ticket.routingDisplay &&
            ticket.routingDisplay.toLowerCase().includes(searchLower)) ||
          (ticket.po_number &&
            ticket.po_number.toLowerCase().includes(searchLower)) ||
          // เพิ่มการค้นหาด้วย ticket_number และ ticket_code
          (ticket.firstPassengerTicketInfo?.ticket_number &&
            ticket.firstPassengerTicketInfo.ticket_number
              .toLowerCase()
              .includes(searchLower)) ||
          (ticket.firstPassengerTicketInfo?.ticket_code &&
            ticket.firstPassengerTicketInfo.ticket_code
              .toLowerCase()
              .includes(searchLower)) ||
          // เพิ่มการค้นหาด้วยสถานะที่แปลงแล้ว
          (ticket.po_number &&
            ticket.po_number.trim() !== "" &&
            "invoiced".includes(searchLower)) ||
          ((!ticket.po_number || ticket.po_number.trim() === "") &&
            "not invoiced".includes(searchLower))
      );
    }

    // กรองตามสถานะ
    if (filterStatus && filterStatus !== "all") {
      filtered = filtered.filter((ticket) => {
        if (filterStatus === "invoiced") {
          return ticket.status === "invoiced";
        } else if (filterStatus === "not_invoiced") {
          return ticket.status === "not_invoiced";
        }
        return true;
      });
    }

    filtered = sortTickets(filtered, sortField, sortDirection);
    setFilteredTickets(filtered);
  };

  const sortTickets = (tickets, field, direction) => {
    const sorted = [...tickets];

    sorted.sort((a, b) => {
      let valueA, valueB;

      if (field === "customer") {
        valueA = a.customer?.code || a.customer?.name || "";
        valueB = b.customer?.code || b.customer?.name || "";
      } else if (field === "supplier") {
        valueA = a.supplier?.code || a.supplier?.name || "";
        valueB = b.supplier?.code || b.supplier?.name || "";
      } else if (field === "status") {
        // ใช้ status field โดยตรง
        valueA = a.status || "not_invoiced";
        valueB = b.status || "not_invoiced";
      } else if (field === "created_at") {
        valueA = a.created_at ? new Date(a.created_at) : new Date(0);
        valueB = b.created_at ? new Date(b.created_at) : new Date(0);
      } else {
        valueA = a[field] || "";
        valueB = b[field] || "";
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
