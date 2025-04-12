import React, { useState, useEffect } from "react";
import {
  Calendar,
  Filter,
  BarChart2,
  Printer,
  Download,
  ArrowUp,
  ArrowDown,
  Activity,
} from "lucide-react";

const Overview = () => {
  // State สำหรับการจัดการข้อมูลและการแสดงผล
  const [dateRange, setDateRange] = useState("day");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [loading, setLoading] = useState(true);

  // ข้อมูลจำลองสำหรับการแสดงผล
  const mockData = {
    // สร้างข้อมูลสำหรับวันนี้
    dailyData: [
      {
        id: "FT-25-1-0001",
        type: "SaleTicket",
        date: "2025-04-11",
        createdBy: "ชลันธร มานพ",
        status: "confirmed",
      },
      {
        id: "FT-25-1-0002",
        type: "SaleTicket",
        date: "2025-04-11",
        createdBy: "สมชาย รักงาน",
        status: "confirmed",
      },
      {
        id: "DP-25-1-0001",
        type: "SaleDeposit",
        date: "2025-04-11",
        createdBy: "นิสารัต แสงเพชร",
        status: "pending",
      },
      {
        id: "VC-25-1-0001",
        type: "SaleVoucher",
        date: "2025-04-11",
        createdBy: "Admin User",
        status: "confirmed",
      },
      {
        id: "INS-25-1-0001",
        type: "SaleOther",
        date: "2025-04-11",
        createdBy: "ชลันธร มานพ",
        status: "confirmed",
      },
    ],

    // สร้างข้อมูลสำหรับสัปดาห์นี้ (เพิ่มข้อมูลจากวันก่อนหน้านี้ในสัปดาห์)
    weeklyData: [
      {
        id: "FT-25-1-0003",
        type: "SaleTicket",
        date: "2025-04-10",
        createdBy: "นิสารัต แสงเพชร",
        status: "confirmed",
      },
      {
        id: "FT-25-1-0004",
        type: "SaleTicket",
        date: "2025-04-09",
        createdBy: "สมชาย รักงาน",
        status: "pending",
      },
      {
        id: "DP-25-1-0002",
        type: "SaleDeposit",
        date: "2025-04-08",
        createdBy: "Admin User",
        status: "pending",
      },
      {
        id: "HTL-25-1-0001",
        type: "SaleOther",
        date: "2025-04-07",
        createdBy: "ชลันธร มานพ",
        status: "confirmed",
      },
    ],

    // สร้างข้อมูลเพิ่มเติมสำหรับเดือนนี้
    monthlyData: [
      {
        id: "FT-25-1-0005",
        type: "SaleTicket",
        date: "2025-04-05",
        createdBy: "Admin User",
        status: "confirmed",
      },
      {
        id: "VC-25-1-0002",
        type: "SaleVoucher",
        date: "2025-04-03",
        createdBy: "นิสารัต แสงเพชร",
        status: "confirmed",
      },
      {
        id: "DP-25-1-0003",
        type: "SaleDeposit",
        date: "2025-04-01",
        createdBy: "สมชาย รักงาน",
        status: "confirmed",
      },
    ],

    // สร้างข้อมูลเพิ่มเติมสำหรับปีนี้
    yearlyData: [
      {
        id: "FT-25-1-0006",
        type: "SaleTicket",
        date: "2025-03-15",
        createdBy: "ชลันธร มานพ",
        status: "confirmed",
      },
      {
        id: "TRN-25-1-0001",
        type: "SaleOther",
        date: "2025-02-18",
        createdBy: "สมชาย รักงาน",
        status: "confirmed",
      },
    ],
  };

  // สร้างข้อมูลสรุปตามประเภท
  const getSummaryData = () => {
    const data = getCurrentData();

    const summary = {
      SaleTicket: { count: 0 },
      SaleDeposit: { count: 0 },
      SaleVoucher: { count: 0 },
      SaleOther: { count: 0 },
      Total: { count: 0 },
    };

    data.forEach((item) => {
      if (summary[item.type]) {
        summary[item.type].count += 1;
        summary.Total.count += 1;
      }
    });

    return summary;
  };

  // ดึงข้อมูลตามช่วงเวลาที่เลือก
  const getCurrentData = () => {
    let result = [];

    if (dateRange === "day") {
      result = [...mockData.dailyData];
    } else if (dateRange === "week") {
      result = [...mockData.dailyData, ...mockData.weeklyData];
    } else if (dateRange === "month") {
      result = [
        ...mockData.dailyData,
        ...mockData.weeklyData,
        ...mockData.monthlyData,
      ];
    } else if (dateRange === "year") {
      result = [
        ...mockData.dailyData,
        ...mockData.weeklyData,
        ...mockData.monthlyData,
        ...mockData.yearlyData,
      ];
    }

    // เรียงลำดับข้อมูล
    result.sort((a, b) => {
      if (sortDirection === "asc") {
        return a[sortField] > b[sortField] ? 1 : -1;
      } else {
        return a[sortField] < b[sortField] ? 1 : -1;
      }
    });

    return result;
  };

  // จำลองการโหลดข้อมูล
  useEffect(() => {
    setLoading(true);

    // จำลองการเรียกข้อมูลจาก API
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, [dateRange, selectedDate, selectedMonth, selectedYear]);

  // ฟังก์ชันเรียงลำดับข้อมูล
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // ฟังก์ชันเปลี่ยนช่วงเวลา
  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  // ฟังก์ชันแสดงสถานะด้วยสี
  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            ยืนยันแล้ว
          </span>
        );
      case "pending":
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            รอดำเนินการ
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            ยกเลิก
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            {status}
          </span>
        );
    }
  };

  // ฟังก์ชันแสดงประเภทรายการด้วยสี
  const getTypeBadge = (type) => {
    switch (type) {
      case "SaleTicket":
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            Flight Ticket
          </span>
        );
      case "SaleDeposit":
        return (
          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
            Deposit
          </span>
        );
      case "SaleVoucher":
        return (
          <span className="px-2 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-medium">
            Voucher
          </span>
        );
      case "SaleOther":
        return (
          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
            Other Services
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            {type}
          </span>
        );
    }
  };

  // ข้อมูลสำหรับแสดงผล
  const data = getCurrentData();
  const summary = getSummaryData();

  // เพิ่มฟังก์ชันนี้ใน Overview.jsx component

  const handlePrint = () => {
    // สร้าง iframe สำหรับการพิมพ์
    const printFrame = document.createElement("iframe");
    printFrame.style.position = "absolute";
    printFrame.style.top = "-9999px";
    printFrame.style.left = "-9999px";
    document.body.appendChild(printFrame);

    // สร้างเนื้อหาสำหรับ iframe
    const frameDocument =
      printFrame.contentDocument || printFrame.contentWindow.document;
    frameDocument.open();

    // สร้าง HTML สำหรับการพิมพ์ - เพิ่ม CSS เพื่อควบคุม page break
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>รายงานภาพรวม SamuiLookBooking</title>
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
              padding: 0;
            }
            .container {
              max-width: 900px;
              margin: 0 auto;
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
            .divider {
              border-top: 1px solid #3b82f6;
              margin: 20px 0;
            }
            .summary-cards {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
              flex-wrap: wrap;
            }
            .card {
              width: 15%;
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
            .other-badge { color: #9A3412; }
            .voucher-badge { color: #0D9488; }
            .deposit-badge { color: #7E22CE; }
            .flight-badge { color: #1D4ED8; }
            .status-confirmed { color: #166534; }
            .status-pending { color: #92400E; }
            .status-cancelled { color: #B91C1C; }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #666;
              margin-top: 30px;
              position: fixed;
              bottom: 0;
              width: 100%;
            }
            /* ป้องกันการแบ่งหน้าที่ไม่ต้องการ */
            .no-break-inside {
              page-break-inside: avoid;
            }
          </style>
        </head>
        <body>
          <div class="container">
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
            
      
            
            <div class="no-break-inside">
            
              <div class="summary-cards">
                <div class="card">
                  <p class="card-title">Flight Ticket</p>
                  <p class="card-value">${summary.SaleTicket.count} รายการ</p>
                </div>
                <div class="card">
                  <p class="card-title">Deposit</p>
                  <p class="card-value">${summary.SaleDeposit.count} รายการ</p>
                </div>
                <div class="card">
                  <p class="card-title">Voucher</p>
                  <p class="card-value">${summary.SaleVoucher.count} รายการ</p>
                </div>
                <div class="card">
                  <p class="card-title">Other</p>
                  <p class="card-value">${summary.SaleOther.count} รายการ</p>
                </div>
                <div class="card">
                  <p class="card-title">รวมทั้งหมด</p>
                  <p class="card-value">${summary.Total.count} รายการ</p>
                </div>
              </div>
            </div>
            
            <div class="no-break-inside">
              <h2>รายการทั้งหมด</h2>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>ประเภท</th>
                    <th>วันที่</th>
                    <th>ผู้สร้าง</th>
                    <th>สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  ${data
                    .map(
                      (item) => `
                    <tr>
                      <td>${item.id}</td>
                      <td class="${
                        item.type === "SaleTicket"
                          ? "flight-badge"
                          : item.type === "SaleDeposit"
                          ? "deposit-badge"
                          : item.type === "SaleVoucher"
                          ? "voucher-badge"
                          : "other-badge"
                      }">
                        ${
                          item.type === "SaleTicket"
                            ? "Flight Ticket"
                            : item.type === "SaleDeposit"
                            ? "Deposit"
                            : item.type === "SaleVoucher"
                            ? "Voucher"
                            : "Other Services"
                        }
                      </td>
                      <td>${new Date(item.date).toLocaleDateString(
                        "th-TH"
                      )}</td>
                      <td>${item.createdBy}</td>
                      <td class="${
                        item.status === "confirmed"
                          ? "status-confirmed"
                          : item.status === "pending"
                          ? "status-pending"
                          : "status-cancelled"
                      }">
                        ${
                          item.status === "confirmed"
                            ? "ยืนยันแล้ว"
                            : item.status === "pending"
                            ? "รอดำเนินการ"
                            : "ยกเลิก"
                        }
                      </td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
            
            <div class="footer">
              <p>วันที่พิมพ์: ${new Date().toLocaleString("th-TH")}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    frameDocument.write(printContent);
    frameDocument.close();

    // รอให้โหลดเสร็จก่อนพิมพ์
    setTimeout(() => {
      printFrame.contentWindow.focus();
      printFrame.contentWindow.print();

      // ลบ iframe หลังจากพิมพ์เสร็จ
      setTimeout(() => {
        document.body.removeChild(printFrame);
      }, 1000);
    }, 500);
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-white rounded-t-lg shadow-sm p-4 mb-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-xl font-bold text-gray-800">Overview</h1>
                <p className="text-sm text-gray-500">
                  ภาพรวมการดำเนินงานและเอกสารที่ออกในระบบ
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-2">
                <button
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium flex items-center"
                  onClick={handlePrint}
                >
                  <Printer size={16} className="mr-2" />
                  พิมพ์
                </button>
                {/* <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium flex items-center">
                  <Download size={16} className="mr-2" />
                  ส่งออก
                </button> */}
              </div>
            </div>
          </div>

          {/* Filter & Date Range */}
          <div className="bg-white shadow-sm p-4 mb-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex space-x-1">
                <button
                  onClick={() => handleDateRangeChange("day")}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    dateRange === "day"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  วันนี้
                </button>
                <button
                  onClick={() => handleDateRangeChange("week")}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    dateRange === "week"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  สัปดาห์นี้
                </button>
                <button
                  onClick={() => handleDateRangeChange("month")}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    dateRange === "month"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  เดือนนี้
                </button>
                <button
                  onClick={() => handleDateRangeChange("year")}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    dateRange === "year"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  ปีนี้
                </button>
              </div>

              <div className="flex-grow"></div>

              {dateRange === "day" && (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
              )}

              {dateRange === "month" && (
                <div className="relative">
                  <select
                    className="pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    <option value="1">มกราคม</option>
                    <option value="2">กุมภาพันธ์</option>
                    <option value="3">มีนาคม</option>
                    <option value="4">เมษายน</option>
                    <option value="5">พฤษภาคม</option>
                    <option value="6">มิถุนายน</option>
                    <option value="7">กรกฎาคม</option>
                    <option value="8">สิงหาคม</option>
                    <option value="9">กันยายน</option>
                    <option value="10">ตุลาคม</option>
                    <option value="11">พฤศจิกายน</option>
                    <option value="12">ธันวาคม</option>
                  </select>
                </div>
              )}

              {(dateRange === "month" || dateRange === "year") && (
                <div className="relative">
                  <select
                    className="pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 px-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500 flex flex-col">
              <h3 className="text-sm font-medium text-gray-500">
                Flight Ticket
              </h3>
              <p className="text-2xl font-bold text-gray-800">
                {summary.SaleTicket.count} รายการ
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500 flex flex-col">
              <h3 className="text-sm font-medium text-gray-500">Deposit</h3>
              <p className="text-2xl font-bold text-gray-800">
                {summary.SaleDeposit.count} รายการ
              </p>
            </div>

            <div className="bg-teal-50 rounded-lg p-4 border-l-4 border-teal-500 flex flex-col">
              <h3 className="text-sm font-medium text-gray-500">Voucher</h3>
              <p className="text-2xl font-bold text-gray-800">
                {summary.SaleVoucher.count} รายการ
              </p>
            </div>

            <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500 flex flex-col">
              <h3 className="text-sm font-medium text-gray-500">
                Other Services
              </h3>
              <p className="text-2xl font-bold text-gray-800">
                {summary.SaleOther.count} รายการ
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500 flex flex-col">
              <h3 className="text-sm font-medium text-gray-500">Total</h3>
              <p className="text-2xl font-bold text-gray-800">
                {summary.Total.count} รายการ
              </p>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="px-4 pb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Activity size={20} className="mr-2 text-blue-500" />
              รายการทั้งหมด
              {dateRange === "day" && " (วันนี้)"}
              {dateRange === "week" && " (สัปดาห์นี้)"}
              {dateRange === "month" && " (เดือนนี้)"}
              {dateRange === "year" && " (ปีนี้)"}
            </h2>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-blue-500 border-r-transparent"></div>
                <p className="mt-2 text-gray-600">กำลังโหลดข้อมูล...</p>
              </div>
            ) : (
              <div className="bg-white shadow-sm rounded-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort("id")}
                        >
                          <div className="flex items-center">
                            ID
                            {sortField === "id" && (
                              <span className="ml-1">
                                {sortDirection === "asc" ? (
                                  <ArrowUp size={14} />
                                ) : (
                                  <ArrowDown size={14} />
                                )}
                              </span>
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort("type")}
                        >
                          <div className="flex items-center">
                            Type
                            {sortField === "type" && (
                              <span className="ml-1">
                                {sortDirection === "asc" ? (
                                  <ArrowUp size={14} />
                                ) : (
                                  <ArrowDown size={14} />
                                )}
                              </span>
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort("date")}
                        >
                          <div className="flex items-center">
                            Date
                            {sortField === "date" && (
                              <span className="ml-1">
                                {sortDirection === "asc" ? (
                                  <ArrowUp size={14} />
                                ) : (
                                  <ArrowDown size={14} />
                                )}
                              </span>
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort("createdBy")}
                        >
                          <div className="flex items-center">
                            Create by
                            {sortField === "createdBy" && (
                              <span className="ml-1">
                                {sortDirection === "asc" ? (
                                  <ArrowUp size={14} />
                                ) : (
                                  <ArrowDown size={14} />
                                )}
                              </span>
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort("status")}
                        >
                          <div className="flex items-center justify-center">
                            Status
                            {sortField === "status" && (
                              <span className="ml-1">
                                {sortDirection === "asc" ? (
                                  <ArrowUp size={14} />
                                ) : (
                                  <ArrowDown size={14} />
                                )}
                              </span>
                            )}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.length === 0 ? (
                        <tr>
                          <td
                            colSpan="5"
                            className="px-6 py-4 text-center text-gray-500"
                          >
                            ไม่พบข้อมูลในช่วงเวลาที่เลือก
                          </td>
                        </tr>
                      ) : (
                        data.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                              {item.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getTypeBadge(item.type)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(item.date).toLocaleDateString("th-TH")}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.createdBy || "นายชลันธร มานพ"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              {getStatusBadge(item.status)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
