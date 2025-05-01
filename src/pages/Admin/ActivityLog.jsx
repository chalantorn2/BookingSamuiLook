import React, { useState, useEffect } from "react";
import {
  Search,
  Calendar,
  Filter,
  Download,
  User,
  Activity,
  AlertTriangle,
  Eye,
  Edit,
  Trash,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Clock,
  Info,
  FileText,
  Settings,
  ShoppingCart,
  BarChart2,
  RefreshCw,
  Database,
  File,
  Shield,
} from "lucide-react";

const ActivityLog = () => {
  // State สำหรับการจัดการข้อมูลและการแสดงผล
  const [activities, setActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState("timestamp");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filterUser, setFilterUser] = useState("all");
  const [filterAction, setFilterAction] = useState("all");
  const [filterModule, setFilterModule] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(null);

  // ข้อมูลสำหรับตัวเลือก users
  const userOptions = [
    { id: "all", name: "ทั้งหมด" },
    { id: "manager1", name: "ชลันธร มานพ", role: "manager" },
    { id: "viewer1", name: "นิสารัต แสงเพชร", role: "viewer" },
    { id: "agent1", name: "สมชาย รักงาน", role: "manager" },
    { id: "admin", name: "Admin User", role: "admin" },
  ];

  // ข้อมูลสำหรับตัวเลือก modules
  const moduleOptions = [
    { id: "all", name: "ทั้งหมด" },
    {
      id: "sale",
      name: "Sale",
      icon: <ShoppingCart size={14} className="mr-1" />,
    },
    {
      id: "reports",
      name: "Reports",
      icon: <BarChart2 size={14} className="mr-1" />,
    },
    {
      id: "refund",
      name: "Refund",
      icon: <RefreshCw size={14} className="mr-1" />,
    },
    {
      id: "information",
      name: "Information",
      icon: <Database size={14} className="mr-1" />,
    },
    {
      id: "documents",
      name: "Documents",
      icon: <File size={14} className="mr-1" />,
    },
  ];

  // ข้อมูลสำหรับตัวเลือก actions
  const actionOptions = [
    { id: "all", name: "ทั้งหมด" },
    { id: "create", name: "เพิ่มข้อมูล", color: "text-green-600" },
    { id: "update", name: "แก้ไขข้อมูล", color: "text-blue-600" },
    { id: "delete", name: "ลบข้อมูล", color: "text-red-600" },
  ];

  // ข้อมูลจำลองประวัติกิจกรรม
  const mockActivities = [
    {
      id: 1,
      user: "manager1",
      username: "ชลันธร มานพ",
      role: "manager",
      action: "create",
      module: "sale",
      itemId: "FT-25-1-0001",
      timestamp: "2025-03-20T09:30:00",
    },
    {
      id: 2,
      user: "manager1",
      username: "ชลันธร มานพ",
      role: "manager",
      action: "update",
      module: "sale",

      itemId: "FT-25-1-0001",
      timestamp: "2025-03-20T10:15:00",
    },
    {
      id: 3,
      user: "admin",
      username: "Admin User",
      role: "admin",
      action: "create",
      module: "sale",
      itemId: "agent1",
      timestamp: "2025-03-19T14:22:00",
    },
    {
      id: 4,
      user: "manager1",
      username: "ชลันธร มานพ",
      role: "manager",
      action: "create",
      module: "documents",
      itemId: "IN-25-0001",
      timestamp: "2025-03-18T11:45:00",
    },
    {
      id: 5,
      user: "agent1",
      username: "สมชาย รักงาน",
      role: "manager",
      action: "update",
      module: "documents",

      itemId: "IN-25-0001",
      timestamp: "2025-03-18T13:20:00",
    },
    {
      id: 6,
      user: "manager1",
      username: "ชลันธร มานพ",
      role: "manager",
      action: "update",
      module: "documents",
      itemId: "IN-25-0001",
      timestamp: "2025-03-17T09:10:00",
    },
    {
      id: 7,
      user: "agent1",
      username: "สมชาย รักงาน",
      role: "manager",
      action: "create",
      module: "sale",
      itemId: "FT-25-1-0002",
      timestamp: "2025-03-16T15:30:00",
    },
    {
      id: 8,
      user: "manager1",
      username: "ชลันธร มานพ",
      role: "manager",
      action: "create",
      module: "information",
      itemId: "FD",
      timestamp: "2025-03-15T10:45:00",
    },
    {
      id: 9,
      user: "agent1",
      username: "สมชาย รักงาน",
      role: "manager",
      action: "delete",
      module: "sale",
      itemId: "FT-25-1-0003",
      timestamp: "2025-03-14T14:25:00",
    },
    {
      id: 10,
      user: "admin",
      username: "Admin User",
      role: "admin",
      action: "update",
      module: "sale",
      itemId: "agent1",
      timestamp: "2025-03-13T11:05:00",
    },
    {
      id: 11,
      user: "viewer1",
      username: "นิสารัต แสงเพชร",
      role: "viewer",
      action: "view",
      module: "documents",
      itemId: "IN-25-0001",
      timestamp: "2025-03-12T09:30:00",
      changes: null,
    },
    {
      id: 12,
      user: "manager1",
      username: "ชลันธร มานพ",
      role: "manager",
      action: "update",
      module: "documents",
      itemId: null,
      timestamp: "2025-03-12T08:45:00",
      changes: null,
    },
  ];

  // โหลดข้อมูลเมื่อเริ่มต้นหน้า
  useEffect(() => {
    // จำลองการเรียกข้อมูลจาก API
    setTimeout(() => {
      setActivities(mockActivities);
      setLoading(false);
    }, 800);
  }, []);

  // ฟังก์ชันกรองและเรียงลำดับข้อมูล
  const getFilteredActivities = () => {
    let filtered = [...activities];

    // กรองตามคำค้นหา
    if (searchTerm) {
      filtered = filtered.filter(
        (activity) =>
          activity.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (activity.itemId &&
            activity.itemId.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // กรองตามผู้ใช้
    if (filterUser !== "all") {
      filtered = filtered.filter((activity) => activity.user === filterUser);
    }

    // กรองตามประเภทการกระทำ
    if (filterAction !== "all") {
      filtered = filtered.filter(
        (activity) => activity.action === filterAction
      );
    }

    // กรองตามโมดูล
    if (filterModule !== "all") {
      filtered = filtered.filter(
        (activity) => activity.module === filterModule
      );
    }

    // กรองตามช่วงวันที่
    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999); // ตั้งเวลาเป็นสิ้นสุดของวัน

      filtered = filtered.filter((activity) => {
        const activityDate = new Date(activity.timestamp);
        return activityDate >= startDate && activityDate <= endDate;
      });
    }

    // เรียงลำดับข้อมูล
    filtered.sort((a, b) => {
      if (sortField === "timestamp") {
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      }

      if (sortDirection === "asc") {
        return a[sortField] > b[sortField] ? 1 : -1;
      } else {
        return a[sortField] < b[sortField] ? 1 : -1;
      }
    });

    return filtered;
  };

  // ข้อมูลที่ผ่านการกรองและเรียงลำดับ
  const filteredActivities = getFilteredActivities();

  // คำนวณข้อมูลสำหรับการแสดงผลแบบ pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentActivities = filteredActivities.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);

  // ฟังก์ชันเปลี่ยนหน้า
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // ฟังก์ชันเรียงลำดับข้อมูล
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // ฟังก์ชันแสดงวันที่ในรูปแบบที่อ่านง่าย
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleString("th-TH", options);
  };

  // ฟังก์ชันแสดงไอคอนและสีตามประเภทการกระทำ
  const getActionIcon = (action) => {
    switch (action) {
      case "create":
        return <Plus size={18} className="text-green-500" />;
      case "update":
        return <Edit size={18} className="text-blue-500" />;
      case "delete":
        return <Trash size={18} className="text-red-500" />;
      case "view":
        return <Eye size={18} className="text-gray-500" />;
      case "login":
        return <User size={18} className="text-indigo-500" />;
      case "logout":
        return <User size={18} className="text-orange-500" />;
      default:
        return <Activity size={18} className="text-purple-500" />;
    }
  };

  // ฟังก์ชันแสดงไอคอนตามโมดูล
  const getModuleIcon = (module) => {
    switch (module) {
      case "sale":
        return <ShoppingCart size={18} className="text-blue-500" />;
      case "reports":
        return <BarChart2 size={18} className="text-purple-500" />;
      case "refund":
        return <RefreshCw size={18} className="text-yellow-500" />;
      case "information":
        return <Database size={18} className="text-green-500" />;
      case "documents":
        return <FileText size={18} className="text-orange-500" />;

      default:
        return <Info size={18} className="text-blue-500" />;
    }
  };

  // ฟังก์ชันแสดงรายละเอียดการเปลี่ยนแปลง
  const toggleDetails = (id) => {
    if (showDetails === id) {
      setShowDetails(null);
    } else {
      setShowDetails(id);
    }
  };

  // ฟังก์ชันส่งออกข้อมูลเป็น CSV
  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";

    // หัวข้อคอลัมน์
    csvContent += "ID,วันที่,ผู้ใช้งาน,การกระทำ,โมดูล,รายละเอียด,IP Address\n";

    // ข้อมูลแต่ละแถว
    filteredActivities.forEach((item) => {
      const timestamp = formatDate(item.timestamp);
      const row = [
        item.id,
        timestamp,
        item.username,
        actionOptions.find((a) => a.id === item.action)?.name || item.action,
        moduleOptions.find((m) => m.id === item.module)?.name || item.module,
        `"${item.details}"`, // ใส่ quote เพื่อป้องกันปัญหาจากเครื่องหมาย comma ในข้อความ
        item.ipAddress,
      ];
      csvContent += row.join(",") + "\n";
    });

    // สร้าง URI สำหรับดาวน์โหลด
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `activity_log_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);

    // คลิกลิงค์เพื่อดาวน์โหลด
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-white rounded-t-lg shadow-sm p-4 mb-2">
            <h1 className="text-xl font-bold flex items-center">
              <Activity size={20} className="mr-2" />
              Activity Log / บันทึกกิจกรรมการใช้งาน
            </h1>
            <p className="text-sm opacity-80">
              ตรวจสอบการทำงานของผู้ใช้ในระบบ เช่นการเพิ่ม, แก้ไข หรือลบข้อมูล
            </p>
          </div>

          {/* Filters & Search */}
          <div className="p-4 border-b border-gray-200 bg-gray-50 space-x-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="pl-10 w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ค้นหาตามรายละเอียด, ชื่อผู้ใช้, รหัสรายการ"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled
                  />
                </div>
              </div>

              <div>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                >
                  {userOptions.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.id === "all"
                        ? user.name
                        : `${user.name} (${user.role})`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value)}
                >
                  {actionOptions.map((action) => (
                    <option key={action.id} value={action.id}>
                      {action.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <div>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filterModule}
                  onChange={(e) => setFilterModule(e.target.value)}
                >
                  {moduleOptions.map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar size={18} className="text-gray-400" />
                </div>
                <input
                  type="date"
                  className="pl-10 w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="จากวันที่"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, start: e.target.value })
                  }
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar size={18} className="text-gray-400" />
                </div>
                <input
                  type="date"
                  className="pl-10 w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ถึงวันที่"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, end: e.target.value })
                  }
                />
              </div>

              <div>
                <button
                  className="w-full bg-blue-100 text-blue-600 hover:bg-blue-200 p-2 rounded-lg flex items-center justify-center"
                  onClick={exportToCSV}
                >
                  <Download size={18} className="mr-2" />
                  ส่งออก CSV
                </button>
              </div>
            </div>
          </div>

          {/* Activity Log Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full  divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-1/12"
                    onClick={() => handleSort("id")}
                  >
                    <div className="flex items-center">
                      <span>ID</span>
                      <ChevronsUpDown size={14} className="ml-1" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-1/6"
                    onClick={() => handleSort("timestamp")}
                  >
                    <div className="flex items-center">
                      <span>วันที่-เวลา</span>
                      <ChevronsUpDown size={14} className="ml-1" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-1/6"
                    onClick={() => handleSort("username")}
                  >
                    <div className="flex items-center">
                      <span>ผู้ใช้งาน</span>
                      <ChevronsUpDown size={14} className="ml-1" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-1/12"
                    onClick={() => handleSort("action")}
                  >
                    <div className="flex items-center">
                      <span>การกระทำ</span>
                      <ChevronsUpDown size={14} className="ml-1" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-1/12"
                    onClick={() => handleSort("module")}
                  >
                    <div className="flex items-center">
                      <span>เมนู</span>
                      <ChevronsUpDown size={14} className="ml-1" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-4 py-4 text-center text-gray-500"
                    >
                      <div className="flex justify-center">
                        <svg
                          className="animate-spin h-5 w-5 text-blue-500"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </div>
                    </td>
                  </tr>
                ) : currentActivities.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-4 py-4 text-center text-gray-500"
                    >
                      ไม่พบข้อมูลกิจกรรม
                    </td>
                  </tr>
                ) : (
                  currentActivities.map((activity) => (
                    <tr key={activity.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {activity.id}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock size={16} className="text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm text-gray-900">
                              {formatDate(activity.timestamp)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="ml-2">
                            <div className="text-sm font-medium text-gray-900">
                              {activity.username}
                            </div>
                            <div className="text-xs text-gray-500">
                              {activity.role === "admin" ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  <Shield size={10} className="mr-1" />
                                  Admin
                                </span>
                              ) : activity.role === "manager" ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Manager
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Viewer
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          {getActionIcon(activity.action)}
                          <span
                            className={`ml-2 ${
                              actionOptions.find(
                                (a) => a.id === activity.action
                              )?.color || ""
                            }`}
                          >
                            {actionOptions.find((a) => a.id === activity.action)
                              ?.name || activity.action}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          {getModuleIcon(activity.module)}
                          <span className="ml-2">
                            {moduleOptions.find((m) => m.id === activity.module)
                              ?.name || activity.module}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      แสดง{" "}
                      <span className="font-medium">
                        {indexOfFirstItem + 1}
                      </span>{" "}
                      ถึง{" "}
                      <span className="font-medium">
                        {Math.min(indexOfLastItem, filteredActivities.length)}
                      </span>{" "}
                      จากทั้งหมด{" "}
                      <span className="font-medium">
                        {filteredActivities.length}
                      </span>{" "}
                      รายการ
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft size={16} />
                      </button>

                      {/* จะแสดงเลขหน้าตามจำนวนที่เหมาะสม */}
                      {Array.from({ length: totalPages }).map((_, index) => {
                        // แสดงแค่ 5 หน้าคั่นกลางรอบๆ หน้าปัจจุบัน
                        if (
                          index + 1 === 1 ||
                          index + 1 === totalPages ||
                          (index + 1 >= currentPage - 2 &&
                            index + 1 <= currentPage + 2)
                        ) {
                          return (
                            <button
                              key={index}
                              onClick={() => paginate(index + 1)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === index + 1
                                  ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                  : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                              }`}
                            >
                              {index + 1}
                            </button>
                          );
                        } else if (
                          index + 1 === currentPage - 3 ||
                          index + 1 === currentPage + 3
                        ) {
                          return (
                            <span
                              key={index}
                              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                            >
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}

                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRight size={16} />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          {/* <div className="bg-gray-50 px-4 py-3 border-t grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
              <h3 className="text-sm font-medium text-gray-500">
                การเพิ่มข้อมูล
              </h3>
              <p className="text-2xl font-bold text-gray-800">
                {activities.filter((a) => a.action === "create").length}
              </p>
              <p className="text-sm text-gray-500">รายการ</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
              <h3 className="text-sm font-medium text-gray-500">
                การแก้ไขข้อมูล
              </h3>
              <p className="text-2xl font-bold text-gray-800">
                {activities.filter((a) => a.action === "update").length}
              </p>
              <p className="text-sm text-gray-500">รายการ</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
              <h3 className="text-sm font-medium text-gray-500">การลบข้อมูล</h3>
              <p className="text-2xl font-bold text-gray-800">
                {activities.filter((a) => a.action === "delete").length}
              </p>
              <p className="text-sm text-gray-500">รายการ</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
              <h3 className="text-sm font-medium text-gray-500">
                กิจกรรมทั้งหมด
              </h3>
              <p className="text-2xl font-bold text-gray-800">
                {activities.length}
              </p>
              <p className="text-sm text-gray-500">รายการ</p>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
