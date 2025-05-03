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
  dateRange,
  selectedDate,
  selectedMonth,
  selectedYear,
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

  // ฟังก์ชันสำหรับคำนวณช่วงเวลาที่เลือก
  const getDateRange = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (dateRange === "day") {
      // ถ้าเลือกวันที่เฉพาะเจาะจง
      if (selectedDate) {
        const selectedDateObj = new Date(selectedDate);
        const startOfDay = new Date(selectedDateObj);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(selectedDateObj);
        endOfDay.setHours(23, 59, 59, 999);

        return { start: startOfDay.toISOString(), end: endOfDay.toISOString() };
      }

      // ถ้าไม่ได้เลือก ใช้วันนี้เป็นค่าเริ่มต้น
      const startOfToday = new Date(today);
      startOfToday.setHours(0, 0, 0, 0);

      const endOfToday = new Date(today);
      endOfToday.setHours(23, 59, 59, 999);

      return {
        start: startOfToday.toISOString(),
        end: endOfToday.toISOString(),
      };
    }

    if (dateRange === "week") {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // เริ่มจากวันอาทิตย์
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // จบที่วันเสาร์
      endOfWeek.setHours(23, 59, 59, 999);

      return { start: startOfWeek.toISOString(), end: endOfWeek.toISOString() };
    }

    if (dateRange === "month") {
      // ถ้าเลือกเดือนเฉพาะเจาะจง
      if (selectedMonth && selectedYear) {
        const startOfMonth = new Date(selectedYear, selectedMonth - 1, 1);
        startOfMonth.setHours(0, 0, 0, 0);

        const endOfMonth = new Date(selectedYear, selectedMonth, 0);
        endOfMonth.setHours(23, 59, 59, 999);

        return {
          start: startOfMonth.toISOString(),
          end: endOfMonth.toISOString(),
        };
      }

      // ค่าเริ่มต้นเป็นเดือนปัจจุบัน
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      startOfMonth.setHours(0, 0, 0, 0);

      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);

      return {
        start: startOfMonth.toISOString(),
        end: endOfMonth.toISOString(),
      };
    }

    if (dateRange === "year") {
      // ถ้าเลือกปีเฉพาะเจาะจง
      if (selectedYear) {
        const startOfYear = new Date(selectedYear, 0, 1);
        startOfYear.setHours(0, 0, 0, 0);

        const endOfYear = new Date(selectedYear, 11, 31);
        endOfYear.setHours(23, 59, 59, 999);

        return {
          start: startOfYear.toISOString(),
          end: endOfYear.toISOString(),
        };
      }

      // ค่าเริ่มต้นเป็นปีปัจจุบัน
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      startOfYear.setHours(0, 0, 0, 0);

      const endOfYear = new Date(today.getFullYear(), 11, 31);
      endOfYear.setHours(23, 59, 59, 999);

      return { start: startOfYear.toISOString(), end: endOfYear.toISOString() };
    }

    // ค่าเริ่มต้น ใช้วันนี้
    return {
      start: new Date(today.setHours(0, 0, 0, 0)).toISOString(),
      end: new Date(today.setHours(23, 59, 59, 999)).toISOString(),
    };
  };

  // ฟังก์ชันดึงข้อมูลจากฐานข้อมูล
  const fetchData = async () => {
    setLoading(true);

    try {
      const dateRangeValues = getDateRange();

      // ตรวจสอบและแสดงช่วงเวลาที่ใช้ในการค้นหา
      console.log("Date range for search:", dateRangeValues);

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
        .gte("created_at", dateRangeValues.start)
        .lte("created_at", dateRangeValues.end);

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

  // ฟังก์ชันพิมพ์รายงาน
  const handlePrint = () => {
    const summaryData = summary;

    // สร้างหน้าต่างใหม่สำหรับการพิมพ์
    const printWindow = window.open("", "_blank");

    // สร้างเนื้อหาสำหรับการพิมพ์
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>รายงานภาพรวม SamuiLookBooking</title>
          <meta charset="UTF-8">
          <style>
            @page {
              size: A4;
              margin: 1cm;
            }
            body {
              font-family: "Prompt", sans-serif;
              color: #333;
              line-height: 1.5;
              margin: 0;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 2px solid #3b82f6;
            }
            h1 {
              font-size: 24px;
              margin: 0 0 10px 0;
            }
            h2 {
              font-size: 18px;
              margin: 30px 0 15px 0;
              color: #333;
            }
            .summary-cards {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
              flex-wrap: wrap;
            }
            .card {
              width: 18%;
              padding: 10px;
              margin-bottom: 10px;
              border-left: 3px solid #3b82f6;
              background-color: #f8fafc;
            }
            .card-title {
              font-size: 14px;
              color: #666;
              margin: 0;
            }
            .card-value {
              font-size: 18px;
              font-weight: bold;
              margin: 5px 0 0 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              page-break-inside: auto;
            }
            tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }
            th, td {
              padding: 8px;
              text-align: left;
              border-bottom: 1px solid #ddd;
              font-size: 12px;
            }
            th {
              background-color: #f8fafc;
              font-weight: 600;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #666;
              margin-top: 30px;
              position: fixed;
              bottom: 0;
              width: 100%;
            }
            .status-confirmed { color: #166534; }
            .status-pending { color: #92400E; }
            .status-cancelled { color: #B91C1C; }
            .payment-paid { color: #1E40AF; }
            .payment-unpaid { color: #4B5563; }
            .payment-partially { color: #7E22CE; }
            .payment-refunded { color: #BE185D; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>รายงานภาพรวม SamuiLookBooking</h1>
            <p>ช่วงเวลา: ${
              dateRange === "day"
                ? "ประจำวัน"
                : dateRange === "week"
                ? "ประจำสัปดาห์"
                : dateRange === "month"
                ? "ประจำเดือน"
                : "ประจำปี"
            } ${new Date().toLocaleDateString("th-TH")}</p>
          </div>
          
          <div class="summary-cards">
            <div class="card">
              <p class="card-title">จำนวนรายการทั้งหมด</p>
              <p class="card-value">${summaryData.total} รายการ</p>
            </div>
            <div class="card">
              <p class="card-title">ยอดเงินรวม</p>
              <p class="card-value">฿${summaryData.totalAmount.toLocaleString(
                "th-TH",
                { minimumFractionDigits: 2 }
              )}</p>
            </div>
            <div class="card">
              <p class="card-title">ยืนยันแล้ว</p>
              <p class="card-value">${summaryData.confirmed} รายการ</p>
            </div>
            <div class="card">
              <p class="card-title">รอดำเนินการ</p>
              <p class="card-value">${summaryData.pending} รายการ</p>
            </div>
            <div class="card">
              <p class="card-title">ชำระแล้ว</p>
              <p class="card-value">${summaryData.paid} รายการ</p>
            </div>
          </div>
          
          <h2>รายการทั้งหมด</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>วันที่</th>
                <th>ลูกค้า</th>
                <th>ประเภท</th>
                <th>จำนวนเงิน</th>
                <th>สถานะ</th>
                <th>การชำระ</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData
                .map(
                  (item) => `
                <tr>
                  <td>${item.referenceNumber}</td>
                  <td>${new Date(item.date).toLocaleDateString("th-TH")}</td>
                  <td>${item.customer}</td>
                  <td>${getServiceName(item.serviceType)}</td>
                  <td>฿${item.amount.toLocaleString("th-TH", {
                    minimumFractionDigits: 2,
                  })}</td>
                  <td class="status-${item.status}">${
                    statusMap[item.status]?.label || item.status
                  }</td>
                  <td class="payment-${item.paymentStatus}">${
                    paymentStatusMap[item.paymentStatus]?.label ||
                    item.paymentStatus
                  }</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          
          <div class="footer">
            <p>วันที่พิมพ์: ${new Date().toLocaleString("th-TH")}</p>
          </div>
        </body>
      </html>
    `;

    // เขียนเนื้อหาลงในหน้าต่างใหม่
    printWindow.document.write(printContent);
    printWindow.document.close();

    // สั่งพิมพ์เมื่อโหลดเนื้อหาเสร็จ
    printWindow.onload = function () {
      printWindow.print();
    };
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
  }, [
    dateRange,
    selectedDate,
    selectedMonth,
    selectedYear,
    serviceTypeFilter,
    sortField,
    sortDirection,
  ]);

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
    getDateRange,
    getFilteredData,
    calculateSummary,
    handlePrint,
  };
};
