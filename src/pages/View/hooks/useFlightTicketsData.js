import { useState, useEffect } from "react";
import { ticketApi } from "../../../services/ticketApi";

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
      // เตรียม filters สำหรับ API
      const filters = {
        from_date: startDate,
        to_date: endDate,
        limit: 1000, // ดึงข้อมูลเยอะๆ เพื่อให้ filter ได้ครบ
        page: 1,
      };

      // เรียก API
      const result = await ticketApi.getFlightTickets(filters);

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch tickets");
      }

      const tickets = result.data || [];
      console.log("🔍 API Response tickets:", tickets);
      console.log("🔍 First ticket structure:", tickets[0]);

      // ประมวลผลข้อมูลให้ตรงกับ format เดิม
      const processedData = await processTicketData(tickets);

      console.log("Processed tickets with additional data:", processedData);

      setAllTickets(processedData);
      filterData(processedData, searchTerm);
    } catch (error) {
      console.error("Error in fetchFlightTickets:", error);
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูล: " + error.message);
      setAllTickets([]);
      setFilteredTickets([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * ประมวลผลข้อมูล ticket ให้ตรงกับ format ที่ component ต้องการ
   */
  const processTicketData = async (tickets) => {
    // ดึงข้อมูลเพิ่มเติมแบบ parallel สำหรับทุก ticket
    const processedTickets = await Promise.all(
      tickets.map(async (ticket) => {
        try {
          // ดึงข้อมูลรายละเอียดของแต่ละ ticket
          const detailResult = await ticketApi.getFlightTicket(ticket.id);

          if (!detailResult.success) {
            console.warn(`Failed to get details for ticket ${ticket.id}`);
            return mapBasicTicketData(ticket);
          }

          const fullTicketData = detailResult.data;
          return mapFullTicketData(fullTicketData);
        } catch (error) {
          console.warn(`Error processing ticket ${ticket.id}:`, error);
          return mapBasicTicketData(ticket);
        }
      })
    );

    return processedTickets.filter(Boolean); // กรองข้อมูลที่ null ออก
  };

  /**
   * แปลงข้อมูล ticket พื้นฐาน (กรณีดึงรายละเอียดไม่ได้)
   */
  const mapBasicTicketData = (ticket) => {
    console.log("🔍 Mapping basic ticket:", ticket);
    console.log("🔍 Customer data:", ticket.customer_name, ticket.customer);
    console.log("🔍 Supplier data:", ticket.supplier_name, ticket.supplier);

    return {
      id: ticket.id,
      reference_number: ticket.reference_number,
      status: ticket.status || "not_invoiced",
      payment_status: ticket.payment_status || "pending",
      created_at: ticket.created_at,
      updated_at: ticket.updated_at,
      po_number: ticket.po_number,
      po_generated_at: ticket.po_generated_at,
      cancelled_at: ticket.cancelled_at,
      cancelled_by: ticket.cancelled_by,
      cancel_reason: ticket.cancel_reason,
      // 🔧 แก้ไข: รองรับทั้ง API format และ Supabase format
      customer: ticket.customer_name
        ? { name: ticket.customer_name, code: ticket.customer_code || null }
        : ticket.customer || null,
      supplier: ticket.supplier_name
        ? { name: ticket.supplier_name, code: ticket.supplier_code || null }
        : ticket.supplier || null,
      code: null,
      passengersDisplay: "Loading...",
      routingDisplay: "Loading...",
      passengersCount: 0,
      ticketNumberDisplay: "-",
      firstPassengerTicketInfo: {},
      cancelled_by_name: null,
    };
  };

  /**
   * แปลงข้อมูล ticket แบบเต็ม
   */
  const mapFullTicketData = (ticketData) => {
    console.log("🔍 Mapping FULL ticket data:", ticketData);

    const ticket = ticketData.ticket || {};
    const passengers = ticketData.passengers || [];
    const routes = ticketData.routes || [];
    const additional = ticket.ticket_additional_info?.[0] || {};

    console.log("🔍 Ticket customer:", ticket.customer);
    console.log("🔍 Ticket supplier:", ticket.supplier);

    // สร้างชื่อผู้โดยสาร
    let passengersDisplay = "";
    if (passengers.length > 0) {
      const firstName = passengers[0].passenger_name || "Unknown";
      if (passengers.length === 1) {
        passengersDisplay = firstName;
      } else {
        const additionalCount = passengers.length - 1;
        passengersDisplay = `${firstName}...+${additionalCount}`;
      }
    }

    // สร้างเส้นทาง
    let routingDisplay = "";
    if (routes.length > 0) {
      routingDisplay = generateMultiSegmentRoute(routes);
    }

    // สร้าง ticket number display
    let ticketNumberDisplay = "-";
    if (passengers.length > 0) {
      const ticketCodes = passengers
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

    // ข้อมูล ticket ของผู้โดยสารคนแรก
    const firstPassengerTicketInfo =
      passengers.length > 0
        ? {
            ticket_number: passengers[0].ticket_number,
            ticket_code: passengers[0].ticket_code,
          }
        : {};

    const result = {
      id: ticket.id,
      reference_number: ticket.reference_number,
      status: ticket.status || "not_invoiced",
      payment_status: ticket.payment_status || "pending",
      created_at: ticket.created_at,
      updated_at: ticket.updated_at,
      po_number: ticket.po_number,
      po_generated_at: ticket.po_generated_at,
      cancelled_at: ticket.cancelled_at,
      cancelled_by: ticket.cancelled_by,
      cancel_reason: ticket.cancel_reason,
      customer: ticket.customer,
      supplier: ticket.supplier,
      code: additional.code || null,
      passengersDisplay,
      routingDisplay,
      passengersCount: passengers.length,
      ticketNumberDisplay,
      firstPassengerTicketInfo,
      cancelled_by_name: ticket.cancelled_user?.fullname || null,
    };

    console.log("🔍 Final mapped result:", result);
    console.log("🔍 Result customer:", result.customer);
    console.log("🔍 Result supplier:", result.supplier);

    return result;
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
