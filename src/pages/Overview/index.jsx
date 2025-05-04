import React, { useState, useEffect } from "react";
import { Filter } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import DateRangeSelector from "./components/DateRangeSelector";
import ServiceTypeFilter from "./components/ServiceTypeFilter";
import SummaryCards from "./components/SummaryCards";
import ServiceDistribution from "./components/ServiceDistribution";
import TransactionsTable from "./components/TransactionsTable";
import { useOverviewData } from "./hooks/useOverviewData";

const Overview = () => {
  const getCurrentMonthRange = () => {
    const now = new Date(); // 5/4/2025
    const firstDay = startOfMonth(now); // 2025-05-01
    const lastDay = endOfMonth(now); // 2025-05-31

    return {
      start: format(firstDay, "yyyy-MM-dd"), // '2025-05-01'
      end: format(lastDay, "yyyy-MM-dd"), // '2025-05-31'
    };
  };

  const dateRange = getCurrentMonthRange();

  const [startDate, setStartDate] = useState(dateRange.start); // '2025-05-01'
  const [endDate, setEndDate] = useState(dateRange.end); // '2025-05-31'

  // ดีบักเพื่อดูค่า startDate และ endDate
  useEffect(() => {
    console.log("Initial startDate:", startDate); // ควรเป็น '2025-05-01'
    console.log("Initial endDate:", endDate); // ควรเป็น '2025-05-31'

    const range = getCurrentMonthRange();
    setStartDate(range.start);
    setEndDate(range.end);

    console.log("After set startDate:", range.start); // ควรเป็น '2025-05-01'
    console.log("After set endDate:", range.end); // ควรเป็น '2025-05-31'
  }, []); // ทำงานครั้งเดียวเมื่อโหลดหน้า

  // ดีบักเมื่อ startDate หรือ endDate เปลี่ยนแปลง
  useEffect(() => {
    console.log("Updated startDate:", startDate);
    console.log("Updated endDate:", endDate);
  }, [startDate, endDate]);

  const [serviceTypeFilter, setServiceTypeFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const {
    loading,
    filteredData,
    summary,
    fetchData,
    getFilteredData,
    calculateSummary,
  } = useOverviewData({
    startDate,
    endDate,
    serviceTypeFilter,
    sortField,
    sortDirection,
    searchTerm,
    currentPage,
    itemsPerPage,
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
    fetchData();
  }, [startDate, endDate]);

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
                  onClick={() => setIsFilterVisible(!isFilterVisible)}
                >
                  <Filter size={16} className="mr-2" />
                  ตัวกรอง
                </button>
              </div>
            </div>
          </div>

          <DateRangeSelector
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />

          {isFilterVisible && (
            <ServiceTypeFilter
              serviceTypeFilter={serviceTypeFilter}
              setServiceTypeFilter={setServiceTypeFilter}
            />
          )}

          <SummaryCards summary={summary} />

          {serviceTypeFilter === "all" && summary.total > 0 && (
            <ServiceDistribution summary={summary} />
          )}

          <TransactionsTable
            loading={loading}
            currentItems={currentItems}
            dateRange={{ startDate, endDate }}
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
