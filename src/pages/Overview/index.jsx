import React, { useState } from "react";
import { Printer, Filter } from "lucide-react";
import DateRangeSelector from "./components/DateRangeSelector";
import ServiceTypeFilter from "./components/ServiceTypeFilter";
import SummaryCards from "./components/SummaryCards";
import ServiceDistribution from "./components/ServiceDistribution";
import TransactionsTable from "./components/TransactionsTable";
import { useOverviewData } from "./hooks/useOverviewData";

const Overview = () => {
  // สถานะหลักของหน้า Overview
  const [dateRange, setDateRange] = useState("day");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  // ใช้ custom hook สำหรับดึงและจัดการข้อมูล
  const {
    loading,
    filteredData,
    summary,
    fetchData,
    getDateRange,
    getFilteredData,
    handlePrint,
  } = useOverviewData({
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
  });

  // ฟังก์ชันสำหรับการเปลี่ยนช่วงเวลา
  const handleDateRangeChange = (range) => {
    setDateRange(range);
    setCurrentPage(1); // รีเซ็ตกลับไปหน้าแรกเมื่อเปลี่ยนช่วงเวลา
  };

  // คำนวณค่าต่างๆ สำหรับการแบ่งหน้า
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

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
                <button
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium flex items-center"
                  onClick={() => setIsFilterVisible(!isFilterVisible)}
                >
                  <Filter size={16} className="mr-2" />
                  ตัวกรอง
                </button>
              </div>
            </div>
          </div>

          {/* Date Range Selector */}
          <DateRangeSelector
            dateRange={dateRange}
            selectedDate={selectedDate}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            setSelectedDate={setSelectedDate}
            setSelectedMonth={setSelectedMonth}
            setSelectedYear={setSelectedYear}
            handleDateRangeChange={handleDateRangeChange}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />

          {/* Service Type Filter */}
          {isFilterVisible && (
            <ServiceTypeFilter
              serviceTypeFilter={serviceTypeFilter}
              setServiceTypeFilter={setServiceTypeFilter}
            />
          )}

          {/* Summary Cards */}
          <SummaryCards summary={summary} />

          {/* Service Type Distribution */}
          {serviceTypeFilter === "all" && summary.total > 0 && (
            <ServiceDistribution summary={summary} />
          )}

          {/* Transactions Table */}
          <TransactionsTable
            loading={loading}
            currentItems={currentItems}
            dateRange={dateRange}
            sortField={sortField}
            sortDirection={sortDirection}
            setSortField={setSortField}
            setSortDirection={setSortDirection}
            totalPages={totalPages}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            indexOfFirstItem={indexOfFirstItem}
            indexOfLastItem={indexOfLastItem}
            filteredData={filteredData}
          />
        </div>
      </div>
    </div>
  );
};

export default Overview;
