import { useState, useEffect } from "react";
import { supabase } from "../../../services/supabase";

/**
 * Hook สำหรับจัดการข้อมูลตั๋วเครื่องบิน
 * @param {Object} options - ตัวเลือกสำหรับการดึงข้อมูล
 * @param {string} options.startDate - วันที่เริ่มต้น
 * @param {string} options.endDate - วันที่สิ้นสุด
 * @param {string} options.searchTerm - คำค้นหา
 * @param {string} options.filterStatus - สถานะที่ต้องการกรอง
 * @param {string} options.sortField - ฟิลด์ที่ใช้เรียงลำดับ
 * @param {string} options.sortDirection - ทิศทางการเรียงลำดับ (asc|desc)
 * @returns {Object} ข้อมูลและฟังก์ชันที่เกี่ยวข้อง
 */
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

      // ดึงข้อมูลพร้อมความสัมพันธ์ตามโครงสร้างฐานข้อมูลจริง
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
          tickets_detail:tickets_detail_id(
            id, 
            total_price, 
            issue_date, 
            due_date, 
            credit_days
          ),
          customer:customer_id(
            id, 
            name, 
            address, 
            id_number
          ),
          supplier:information_id(
            id, 
            category, 
            code, 
            name, 
            description
          ),
          passenger:tickets_passengers_id(
            id, 
            passenger_name, 
            age, 
            ticket_number, 
            ticket_code
          ),
          additional_info:ticket_additional_info_id(
            id, 
            company_payment_method, 
            company_payment_details, 
            customer_payment_method, 
            customer_payment_details, 
            code, 
            ticket_type, 
            ticket_type_details
          )
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

      // ดูโครงสร้างข้อมูลของตั๋วตัวแรก (ถ้ามี)
      if (data && data.length > 0) {
        console.log(
          "Sample ticket structure:",
          JSON.stringify(data[0], null, 2)
        );
      }

      // ปรับโครงสร้างข้อมูลและดึงข้อมูลเส้นทางเพิ่มเติม
      const processedData = [];

      for (const ticket of data || []) {
        try {
          // ดึงข้อมูลเส้นทางสำหรับตั๋วนี้
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

          // เพิ่มข้อมูลเส้นทางเข้าไปในตั๋ว
          const processedTicket = {
            ...ticket,
            routes: routesData || [],
          };

          processedData.push(processedTicket);
        } catch (err) {
          console.error(`Error processing ticket ${ticket.id}:`, err);
          processedData.push(ticket); // เพิ่มข้อมูลตั๋วเดิมหากมีข้อผิดพลาด
        }
      }

      // แสดงโครงสร้างข้อมูลหลังจากดึงข้อมูลเพิ่มเติม
      if (processedData && processedData.length > 0) {
        console.log(
          "Processed ticket sample:",
          JSON.stringify(processedData[0], null, 2)
        );
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
          (ticket.passenger?.passenger_name &&
            ticket.passenger.passenger_name
              .toLowerCase()
              .includes(searchLower)) ||
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
        valueA = a.tickets_detail?.issue_date;
        valueB = b.tickets_detail?.issue_date;
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
