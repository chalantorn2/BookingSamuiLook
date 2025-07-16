import { useState, useEffect } from "react";
import { supabase } from "../../../services/supabase";
import { toThaiTimeZone } from "../../../utils/helpers";

/**
 * สร้าง Multi-Segment Route Format (จำกัดแสดงสูงสุด 5 airports)
 * @param {Array} routes - array ของเส้นทาง
 * @returns {string} - route ในรูปแบบ Multi-Segment
 */
const generateMultiSegmentRoute = (routes) => {
  if (!routes || routes.length === 0) return "";

  const routeSegments = [];
  let currentSegment = [];
  let totalAirports = 0; // นับจำนวน airports ทั้งหมด
  const MAX_AIRPORTS = 5;

  for (let index = 0; index < routes.length; index++) {
    const route = routes[index];
    const origin = route.origin;
    const destination = route.destination;

    if (currentSegment.length === 0) {
      // เริ่มต้น segment ใหม่
      currentSegment = [origin, destination];
      totalAirports = 2; // origin + destination
    } else {
      // ตรวจสอบว่าต่อเนื่องกับ segment ปัจจุบันหรือไม่
      const lastDestination = currentSegment[currentSegment.length - 1];

      if (origin === lastDestination) {
        // ต่อเนื่อง - ตรวจสอบว่าเพิ่ม destination แล้วจะเกิน 5 airports ไหม
        if (totalAirports + 1 <= MAX_AIRPORTS) {
          currentSegment.push(destination);
          totalAirports++;
        } else {
          // เกิน 5 airports แล้ว - หยุดและบันทึก segment ปัจจุบัน
          routeSegments.push(currentSegment.join("-"));
          break;
        }
      } else {
        // ไม่ต่อเนื่อง - บันทึก segment เดิมและตรวจสอบว่าเริ่ม segment ใหม่ได้ไหม
        routeSegments.push(currentSegment.join("-"));

        // ตรวจสอบว่าเริ่ม segment ใหม่แล้วจะเกิน 5 airports ไหม
        if (totalAirports + 2 <= MAX_AIRPORTS) {
          currentSegment = [origin, destination];
          totalAirports += 2;
        } else {
          // เกิน 5 airports แล้ว - หยุด
          break;
        }
      }
    }

    // ถ้าเป็นเส้นทางสุดท้าย ให้บันทึก segment ปัจจุบัน
    if (index === routes.length - 1 && currentSegment.length > 0) {
      routeSegments.push(currentSegment.join("-"));
    }
  }

  // รวม segments ด้วย "//"
  return routeSegments.join("//");
};

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
  cancelled_at,
  cancelled_by,
  cancel_reason,
  customer:customer_id(name, code),
  supplier:information_id(name, code),
  cancelled_user:cancelled_by(fullname)
`
        )
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString());

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

        let routingDisplay = "";
        if (ticketRoutes.length > 0) {
          routingDisplay = generateMultiSegmentRoute(ticketRoutes);
        }

        let ticketNumberDisplay = "-";
        if (ticketPassengers.length > 0) {
          const ticketCodes = ticketPassengers
            .map((p) => p.ticket_code)
            .filter((code) => code && code.trim() !== "");

          if (ticketCodes.length === 1) {
            ticketNumberDisplay = ticketCodes[0];
          } else if (ticketCodes.length > 1) {
            const firstCode = ticketCodes[0];
            const lastCode = ticketCodes[ticketCodes.length - 1];
            const lastThreeDigits = lastCode.slice(-3);
            ticketNumberDisplay = `${firstCode}-${lastThreeDigits}`;
          }
        }

        return {
          ...ticket,
          code: additionalInfoMap.get(ticket.id) || null,
          passengersDisplay,
          routingDisplay,
          passengersCount: ticketPassengers.length,
          ticketNumberDisplay, // เพิ่มฟิลด์ใหม่
          firstPassengerTicketInfo,
          cancelled_by_name: ticket.cancelled_user?.fullname,
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
          return ticket.po_number && ticket.po_number.trim() !== "";
        } else if (filterStatus === "not_invoiced") {
          return !ticket.po_number || ticket.po_number.trim() === "";
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
