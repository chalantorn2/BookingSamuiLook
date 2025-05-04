import { useState, useEffect } from "react";
import { supabase } from "../../../services/supabase";

// อาร์เรย์ของประเภทบริการ - สามารถย้ายไป config หรือ constants ได้ในอนาคต
export const serviceTypes = [
  { id: "all", name: "All Services", icon: "Activity" },
  { id: "flight", name: "Flight Tickets", icon: "Plane" },
  { id: "boat", name: "Boat Tickets", icon: "Ship" },
  { id: "bus", name: "Bus Tickets", icon: "Bus" },
  { id: "hotel", name: "Hotel Bookings", icon: "Hotel" },
  { id: "tour", name: "Tour Packages", icon: "Package" },
  { id: "deposit", name: "Deposits", icon: "Database" },
  { id: "voucher", name: "Vouchers", icon: "FileText" },
  { id: "other", name: "Other Services", icon: "AlertCircle" },
];

// แมปสถานะและรูปแบบการแสดงผล
export const statusMap = {
  pending: { label: "รอดำเนินการ", color: "yellow" },
  confirmed: { label: "ยืนยันแล้ว", color: "green" },
  cancelled: { label: "ยกเลิก", color: "red" },
  completed: { label: "สำเร็จ", color: "blue" },
};

export const paymentStatusMap = {
  unpaid: { label: "ยังไม่ชำระ", color: "gray" },
  partially: { label: "ชำระบางส่วน", color: "purple" },
  paid: { label: "ชำระแล้ว", color: "green" },
  refunded: { label: "คืนเงินแล้ว", color: "pink" },
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
  // State สำหรับข้อมูลหลัก
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    totalAmount: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    paid: 0,
    unpaid: 0,
    partially: 0,
    flight: 0,
    boat: 0,
    bus: 0,
    hotel: 0,
    tour: 0,
    deposit: 0,
    voucher: 0,
    other: 0,
  });

  // ฟังก์ชันดึงข้อมูลจากฐานข้อมูล
  const fetchData = async () => {
    setLoading(true);

    try {
      // ใช้ startDate และ endDate ที่ส่งเข้ามาโดยตรง
      // แปลงวันที่ให้อยู่ในรูปแบบที่เหมาะสมสำหรับ query
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      console.log("Using date range:", {
        start: start.toISOString(),
        end: end.toISOString(),
        startFormatted: start.toLocaleDateString(),
        endFormatted: end.toLocaleDateString(),
      });

      // ดึงข้อมูลตั๋วเครื่องบิน - ปรับปรุงตามโครงสร้างฐานข้อมูลจริง
      let query = supabase
        .from("bookings_ticket")
        .select(
          `
          id,
          reference_number,
          status,
          payment_status,
          created_at,
          customer:customer_id(*),
          detail:tickets_detail_id(*),
          tickets_pricing:tickets_pricing_id(*),
          ticket_additional_info:ticket_additional_info_id(*)
        `
        )
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString());

      // แสดง query เพื่อตรวจสอบ
      console.log("Executing query:", query);

      // ดำเนินการ query
      const { data, error } = await query;

      // ตรวจสอบและแสดงข้อมูลและข้อผิดพลาดที่ได้จาก API
      console.log("Raw data from API:", data);
      console.log("API error:", error);

      if (error) {
        console.error("Error fetching data:", error);
        setActivities([]);
        setFilteredData([]);
        setLoading(false);
        return; // ไม่ทำงานต่อเมื่อเกิด error
      }

      // ตรวจสอบว่ามีข้อมูลที่ได้รับหรือไม่
      if (!data || data.length === 0) {
        console.log("No data returned from query");
        setActivities([]);
        setFilteredData([]);
        setLoading(false);
        return; // ไม่ทำงานต่อเมื่อไม่มีข้อมูล
      }

      // แปลงและจัดรูปแบบข้อมูล
      const processedData = data.map((item) => {
        console.log("Processing item:", item);

        // กำหนดประเภทบริการตาม ticket_type ที่อยู่ในฐานข้อมูล
        let serviceType = "flight"; // ค่าเริ่มต้น

        if (
          item.ticket_additional_info &&
          item.ticket_additional_info.ticket_type
        ) {
          // ให้ตรงกับค่าที่เป็นไปได้จาก enum ในฐานข้อมูล: bsp, airline, dom, web, b2b, other
          const ticketType = item.ticket_additional_info.ticket_type;
          switch (ticketType) {
            case "bsp":
            case "airline":
            case "dom":
            case "web":
              serviceType = "flight"; // ทั้งหมดนี้เป็นประเภทเครื่องบิน
              break;
            case "b2b":
              serviceType = "tour"; // สมมติว่า b2b เป็นทัวร์
              break;
            case "other":
              serviceType = "other";
              break;
            default:
              serviceType = "flight";
          }
        }

        // แปลงข้อมูลให้อยู่ในรูปแบบที่ต้องการ
        return {
          id: item.id,
          referenceNumber: item.reference_number,
          date: item.created_at,
          customer: item.customer?.name || "N/A",
          customerId: item.customer?.id,
          amount:
            item.tickets_pricing?.total_amount || item.detail?.total_price || 0,
          status: item.status || "pending",
          paymentStatus: item.payment_status || "unpaid",
          serviceType: serviceType, // ใช้ค่าที่กำหนดจากการตรวจสอบ ticket_type
        };
      });

      console.log("Processed data:", processedData);

      setActivities(processedData);

      // อัปเดตข้อมูลที่ผ่านการกรอง
      const filtered = getFilteredData(processedData, searchTerm);
      setFilteredData(filtered);

      // คำนวณข้อมูลสรุป
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

  // กรองและค้นหาข้อมูล
  const getFilteredData = (data = activities, search = searchTerm) => {
    if (!data || !data.length) {
      console.log("No data to filter");
      return [];
    }

    let filtered = [...data];

    // ใช้คำค้นหาในการกรอง
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          (item.referenceNumber &&
            item.referenceNumber.toLowerCase().includes(searchLower)) ||
          (item.customer && item.customer.toLowerCase().includes(searchLower))
      );
    }

    // กรองตามประเภทบริการถ้าไม่ได้เลือก "all"
    if (serviceTypeFilter !== "all") {
      filtered = filtered.filter(
        (item) => item.serviceType === serviceTypeFilter
      );
    }

    console.log("Filtered data:", filtered);
    return filtered;
  };

  // คำนวณข้อมูลสรุป
  const calculateSummary = (data) => {
    if (!data || !data.length) {
      console.log("No data for summary calculation");
      return {
        total: 0,
        totalAmount: 0,
        confirmed: 0,
        pending: 0,
        cancelled: 0,
        paid: 0,
        unpaid: 0,
        partially: 0,
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
        // นับจำนวนรายการทั้งหมด
        summary.total++;

        // รวมยอดเงิน
        summary.totalAmount += parseFloat(item.amount || 0);

        // นับตามสถานะ
        if (item.status === "confirmed") summary.confirmed++;
        else if (item.status === "pending") summary.pending++;
        else if (item.status === "cancelled") summary.cancelled++;

        // นับตามสถานะการชำระเงิน
        if (item.paymentStatus === "paid") summary.paid++;
        else if (item.paymentStatus === "unpaid") summary.unpaid++;
        else if (item.paymentStatus === "partially") summary.partially++;

        // นับตามประเภทบริการ
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
        confirmed: 0,
        pending: 0,
        cancelled: 0,
        paid: 0,
        unpaid: 0,
        partially: 0,
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

    console.log("Calculated summary:", result);
    return result;
  };

  // Helper function สำหรับแปลงประเภทบริการเป็นข้อความ
  const getServiceName = (type) => {
    const service = serviceTypes.find((s) => s.id === type);
    return service ? service.name : type;
  };

  // โหลดข้อมูลเมื่อพารามิเตอร์เปลี่ยน
  useEffect(() => {
    console.log("Parameters changed, fetching data...");
    fetchData();
  }, [startDate, endDate, serviceTypeFilter, sortField, sortDirection]);

  // อัปเดตข้อมูลกรองเมื่อมีการค้นหาหรือเมื่อกิจกรรมเปลี่ยน
  useEffect(() => {
    console.log("Search term or activities changed, filtering data...");
    const filtered = getFilteredData();
    setFilteredData(filtered);

    // คำนวณสรุปใหม่
    const summaryData = calculateSummary(filtered);
    setSummary(summaryData);
  }, [searchTerm, activities]);

  // ส่งกลับฟังก์ชันและค่าต่างๆ ที่จำเป็น
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
