// ไฟล์: src/pages/View/hooks/useFlightTicketsData.js
import { useState, useEffect } from "react";
import { supabase } from "../../../services/supabase";

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

  // ฟังก์ชันสำหรับดึงข้อมูลตั๋วเครื่องบิน
  const fetchFlightTickets = async () => {
    setLoading(true);
    setError(null);

    try {
      // แปลงวันที่ให้อยู่ในรูปแบบที่เหมาะสมสำหรับ query
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      console.log("Fetching flight tickets with date range:", {
        start: start.toISOString(),
        end: end.toISOString(),
      });

      // ดึงข้อมูลหลักของตั๋วและข้อมูลที่เกี่ยวข้อง (ปรับแก้ตามโครงสร้างฐานข้อมูลที่ถูกต้อง)
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
          customer:customer_id(*),
          supplier:information_id(*),
          tickets_detail(*)
        `
        )
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString());

      // ถ้ามีการกรองสถานะ
      if (filterStatus && filterStatus !== "all") {
        if (filterStatus.startsWith("payment_")) {
          // กรองตามสถานะการชำระเงิน
          const paymentStatus = filterStatus.replace("payment_", "");
          query = query.eq("payment_status", paymentStatus);
        } else {
          // กรองตามสถานะรายการ
          query = query.eq("status", filterStatus);
        }
      }

      // ดำเนินการ query
      const { data, error } = await query;

      if (error) {
        console.error("Error fetching flight tickets:", error);
        setError("ไม่สามารถโหลดข้อมูลตั๋วเครื่องบินได้");
        setAllTickets([]);
        setFilteredTickets([]);
        return;
      }

      console.log("Flight tickets data:", data);

      // ดึงข้อมูลเพิ่มเติมสำหรับแต่ละตั๋ว
      const processedData = [];

      for (const ticket of data || []) {
        try {
          // ดึงข้อมูลผู้โดยสาร
          const { data: passengersData, error: passengersError } =
            await supabase
              .from("tickets_passengers")
              .select("*")
              .eq("bookings_ticket_id", ticket.id);

          if (passengersError) {
            console.error(
              `Error fetching passengers for ticket ${ticket.id}:`,
              passengersError
            );
          }

          // ดึงข้อมูลเส้นทาง
          const { data: routesData, error: routesError } = await supabase
            .from("tickets_routes")
            .select("*")
            .eq("bookings_ticket_id", ticket.id);

          if (routesError) {
            console.error(
              `Error fetching routes for ticket ${ticket.id}:`,
              routesError
            );
          }

          // ดึงข้อมูลเพิ่มเติม
          const { data: additionalInfoData, error: additionalInfoError } =
            await supabase
              .from("ticket_additional_info")
              .select("*")
              .eq("bookings_ticket_id", ticket.id)
              .maybeSingle();

          if (
            additionalInfoError &&
            !additionalInfoError.message.includes("No rows found")
          ) {
            console.error(
              `Error fetching additional info for ticket ${ticket.id}:`,
              additionalInfoError
            );
          }

          // เพิ่มข้อมูลทั้งหมดเข้าไปในตั๋ว
          const processedTicket = {
            ...ticket,
            passengers: passengersData || [],
            routes: routesData || [],
            additional_info: additionalInfoData || {},
          };

          processedData.push(processedTicket);
        } catch (err) {
          console.error(`Error processing ticket ${ticket.id}:`, err);
          processedData.push(ticket); // เพิ่มข้อมูลตั๋วเดิมหากมีข้อผิดพลาด
        }
      }

      setAllTickets(processedData);

      // กรองข้อมูลตามคำค้นหา
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

  // ส่วนที่เหลือของโค้ดปล่อยไว้เหมือนเดิม
  // ฟังก์ชันกรองข้อมูลตามคำค้นหา
  const filterData = (data = allTickets, search = searchTerm) => {
    if (!data || !Array.isArray(data)) {
      setFilteredTickets([]);
      return;
    }

    let filtered = [...data];

    // ถ้ามีคำค้นหา
    if (search && search.trim() !== "") {
      const searchLower = search.toLowerCase().trim();

      filtered = filtered.filter(
        (ticket) =>
          // ค้นหาจากเลขที่ตั๋ว
          (ticket.reference_number &&
            ticket.reference_number.toLowerCase().includes(searchLower)) ||
          // ค้นหาจากชื่อลูกค้า
          (ticket.customer?.name &&
            ticket.customer.name.toLowerCase().includes(searchLower)) ||
          // ค้นหาจากชื่อผู้โดยสาร
          (ticket.passengers &&
            ticket.passengers.some(
              (passenger) =>
                passenger.passenger_name &&
                passenger.passenger_name.toLowerCase().includes(searchLower)
            )) ||
          // ค้นหาจากชื่อซัพพลายเออร์
          (ticket.supplier?.name &&
            ticket.supplier.name.toLowerCase().includes(searchLower)) ||
          // ค้นหาจากรหัสซัพพลายเออร์
          (ticket.supplier?.code &&
            ticket.supplier.code.toLowerCase().includes(searchLower)) ||
          // ค้นหาจากเส้นทาง (origin-destination)
          (ticket.routes &&
            ticket.routes.some(
              (route) =>
                (route.origin &&
                  route.origin.toLowerCase().includes(searchLower)) ||
                (route.destination &&
                  route.destination.toLowerCase().includes(searchLower))
            ))
      );
    }

    // เรียงลำดับข้อมูล
    filtered = sortTickets(filtered, sortField, sortDirection);

    setFilteredTickets(filtered);
  };

  // ฟังก์ชันเรียงลำดับข้อมูล
  const sortTickets = (tickets, field, direction) => {
    // Clone array ก่อนเรียงลำดับ
    const sorted = [...tickets];

    // แมปชื่อฟิลด์กับโครงสร้างข้อมูล
    const fieldMap = {
      id: "id",
      reference_number: "reference_number",
      created_at: "created_at",
      date: "tickets_detail.issue_date",
      customer: "customer.name",
      supplier: "supplier.name",
      status: "status",
      payment_status: "payment_status",
      departureDate: "routes[0].date",
    };

    // ทำการเรียงลำดับ
    sorted.sort((a, b) => {
      let valueA, valueB;

      // หาค่าตามโครงสร้างที่กำหนดใน fieldMap
      if (field === "date") {
        valueA = a.tickets_detail?.[0]?.issue_date;
        valueB = b.tickets_detail?.[0]?.issue_date;
      } else if (field === "customer") {
        valueA = a.customer?.name || "";
        valueB = b.customer?.name || "";
      } else if (field === "supplier") {
        valueA = a.supplier?.name || "";
        valueB = b.supplier?.name || "";
      } else if (field === "departureDate") {
        valueA = a.routes?.[0]?.date || "";
        valueB = b.routes?.[0]?.date || "";
      } else {
        valueA = a[fieldMap[field] || field] || "";
        valueB = b[fieldMap[field] || field] || "";
      }

      // แปลงเป็น Date สำหรับการเรียงลำดับวันที่
      if (
        field === "date" ||
        field === "created_at" ||
        field === "departureDate"
      ) {
        valueA = valueA ? new Date(valueA) : new Date(0);
        valueB = valueB ? new Date(valueB) : new Date(0);
      }

      // เรียงลำดับตาม direction
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

  // เมื่อ searchTerm เปลี่ยน ให้กรองข้อมูลใหม่
  useEffect(() => {
    filterData(allTickets, searchTerm);
  }, [searchTerm]);

  // เมื่อ sortField หรือ sortDirection เปลี่ยน ให้เรียงลำดับข้อมูลใหม่
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
