import React, { useState, useEffect } from "react";
import {
  User,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  ChevronDown,
  Shield,
  ChevronsUpDown,
  Eye,
  Lock,
  Unlock,
  Save,
  X,
} from "lucide-react";

const UserManagement = () => {
  // State สำหรับการจัดการข้อมูลและการแสดงผล
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState("username");
  const [sortDirection, setSortDirection] = useState("asc");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [newUser, setNewUser] = useState({
    username: "",
    fullName: "",
    email: "",
    role: "viewer",
    status: "active",
  });
  const [loading, setLoading] = useState(true);

  // ข้อมูลสำหรับตัวเลือก roles
  const roleOptions = [
    {
      id: "admin",
      name: "Admin",
      description: "สามารถทำงานได้ทุกอย่างในระบบ",
    },
    {
      id: "manager",
      name: "Manager",
      description: "ดู แก้ไข ลบข้อมูลได้ (ยกเว้นจัดการ User)",
    },
    { id: "viewer", name: "Viewer", description: "ดูข้อมูลได้อย่างเดียว" },
  ];

  // ข้อมูลสิทธิ์การเข้าถึงโมดูลต่างๆ ของแต่ละ role
  const modulePermissions = [
    { id: "sale", name: "Sale", description: "โมดูลการขาย" },
    { id: "search", name: "Search", description: "โมดูลค้นหาข้อมูล" },
    { id: "reports", name: "Reports", description: "โมดูลรายงาน" },
    { id: "refund", name: "Refund", description: "โมดูลการคืนเงิน" },
    { id: "information", name: "Information", description: "โมดูลข้อมูล" },
    { id: "documents", name: "Documents", description: "โมดูลเอกสาร" },
  ];

  // ข้อมูลสิทธิ์การทำงานต่างๆ
  const actionPermissions = [
    { id: "view", name: "View", description: "สิทธิ์การดูข้อมูล" },
    { id: "create", name: "Create", description: "สิทธิ์การสร้างข้อมูลใหม่" },
    { id: "edit", name: "Edit", description: "สิทธิ์การแก้ไขข้อมูล" },
    { id: "delete", name: "Delete", description: "สิทธิ์การลบข้อมูล" },
    { id: "approve", name: "Approve", description: "สิทธิ์การอนุมัติ" },
    { id: "export", name: "Export", description: "สิทธิ์การส่งออกข้อมูล" },
  ];

  // ข้อมูลจำลองผู้ใช้งาน
  const mockUsers = [
    {
      id: 1,
      username: "admin",
      fullName: "Admin User",
      email: "admin@samuilook.com",
      role: "admin",
      status: "active",
      lastLogin: "2025-03-18T09:30:00",
      createdAt: "2025-01-01T00:00:00",
    },
    {
      id: 2,
      username: "manager1",
      fullName: "ชลันธร มานพ",
      email: "chalanthorn@samuilook.com",
      role: "manager",
      status: "active",
      lastLogin: "2025-03-19T13:45:00",
      createdAt: "2025-01-15T00:00:00",
    },
    {
      id: 3,
      username: "viewer1",
      fullName: "นิสารัต แสงเพชร",
      email: "nisarat@samuilook.com",
      role: "viewer",
      status: "active",
      lastLogin: "2025-03-15T10:20:00",
      createdAt: "2025-02-01T00:00:00",
    },
    {
      id: 4,
      username: "agent1",
      fullName: "สมชาย รักงาน",
      email: "somchai@samuilook.com",
      role: "manager",
      status: "inactive",
      lastLogin: "2025-02-28T16:10:00",
      createdAt: "2025-02-10T00:00:00",
    },
  ];

  // โหลดข้อมูลเมื่อเริ่มต้นหน้า
  useEffect(() => {
    // จำลองการเรียกข้อมูลจาก API
    setTimeout(() => {
      setUsers(mockUsers);
      setRoles(roleOptions);
      setLoading(false);
    }, 800);
  }, []);

  // ฟังก์ชันกรองและเรียงลำดับข้อมูล
  const getFilteredUsers = () => {
    let filteredUsers = [...users];

    // กรองตามคำค้นหา
    if (searchTerm) {
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // กรองตาม role
    if (filterRole !== "all") {
      filteredUsers = filteredUsers.filter((user) => user.role === filterRole);
    }

    // กรองตามสถานะ
    if (filterStatus !== "all") {
      filteredUsers = filteredUsers.filter(
        (user) => user.status === filterStatus
      );
    }

    // เรียงลำดับข้อมูล
    filteredUsers.sort((a, b) => {
      if (sortField === "lastLogin") {
        return sortDirection === "asc"
          ? new Date(a.lastLogin) - new Date(b.lastLogin)
          : new Date(b.lastLogin) - new Date(a.lastLogin);
      }

      if (a[sortField] < b[sortField]) return sortDirection === "asc" ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filteredUsers;
  };

  // ข้อมูลที่ผ่านการกรองและเรียงลำดับ
  const filteredUsers = getFilteredUsers();

  // คำนวณข้อมูลสำหรับการแสดงผลแบบ pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

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

  // ฟังก์ชันเปิด modal เพิ่มผู้ใช้ใหม่
  const openAddModal = () => {
    setNewUser({
      username: "",
      fullName: "",
      email: "",
      role: "viewer",
      status: "active",
    });
    setIsAddModalOpen(true);
  };

  // ฟังก์ชันเปิด modal แก้ไขผู้ใช้
  const openEditModal = (user) => {
    setCurrentUser(user);
    setIsEditModalOpen(true);
  };

  // ฟังก์ชันเปิด modal จัดการสิทธิ์
  const openRoleModal = (user) => {
    setCurrentUser(user);
    setIsRoleModalOpen(true);
  };

  // ฟังก์ชันปิด modal
  const closeModal = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsRoleModalOpen(false);
    setCurrentUser(null);
  };

  // ฟังก์ชันบันทึกข้อมูลผู้ใช้ใหม่
  const handleAddUser = () => {
    // จำลองการเพิ่มผู้ใช้ใหม่
    const newUserId = Math.max(...users.map((user) => user.id)) + 1;
    const newUserWithId = {
      ...newUser,
      id: newUserId,
      lastLogin: null,
      createdAt: new Date().toISOString(),
    };

    setUsers([...users, newUserWithId]);
    closeModal();
  };

  // ฟังก์ชันบันทึกการแก้ไขข้อมูลผู้ใช้
  const handleEditUser = () => {
    // จำลองการแก้ไขข้อมูลผู้ใช้
    const updatedUsers = users.map((user) =>
      user.id === currentUser.id ? currentUser : user
    );

    setUsers(updatedUsers);
    closeModal();
  };

  // ฟังก์ชันลบผู้ใช้
  const handleDeleteUser = (userId) => {
    if (window.confirm("คุณต้องการลบผู้ใช้นี้หรือไม่?")) {
      // จำลองการลบผู้ใช้
      setUsers(users.filter((user) => user.id !== userId));
    }
  };

  // ฟังก์ชันเปลี่ยนสถานะผู้ใช้
  const toggleUserStatus = (userId) => {
    // จำลองการเปลี่ยนสถานะผู้ใช้
    const updatedUsers = users.map((user) => {
      if (user.id === userId) {
        return {
          ...user,
          status: user.status === "active" ? "inactive" : "active",
        };
      }
      return user;
    });

    setUsers(updatedUsers);
  };

  // ฟังก์ชันแสดงชื่อ role
  const getRoleName = (roleId) => {
    const role = roleOptions.find((role) => role.id === roleId);
    return role ? role.name : roleId;
  };

  // ฟังก์ชันแสดงสถานะผู้ใช้ด้วยสี
  const getUserStatusBadge = (status) => {
    if (status === "active") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <XCircle className="w-3 h-3 mr-1" />
          Inactive
        </span>
      );
    }
  };

  // ฟังก์ชันแสดงสีตาม role
  const getRoleColorClass = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "manager":
        return "bg-blue-100 text-blue-800";
      case "viewer":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 p-4 text-white">
            <h1 className="text-xl font-bold">User Management</h1>
            <p className="text-sm opacity-80">
              จัดการรายชื่อผู้ใช้งานและกำหนดสิทธิ์การเข้าถึงระบบ
            </p>
          </div>

          {/* Filters & Search */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex flex-1 items-center">
                <div className="relative w-full md:max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ค้นหาตาม Username, ชื่อ, อีเมล"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-2">
                <div className="relative">
                  <select
                    className="appearance-none w-full border border-gray-300 rounded-lg py-2 pl-3 pr-10 focus:ring-blue-500 focus:border-blue-500"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                  >
                    <option value="all">ทุกตำแหน่ง</option>
                    {roleOptions.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <Filter size={18} className="text-gray-400" />
                  </div>
                </div>

                <div className="relative">
                  <select
                    className="appearance-none w-full border border-gray-300 rounded-lg py-2 pl-3 pr-10 focus:ring-blue-500 focus:border-blue-500"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">ทุกสถานะ</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <Filter size={18} className="text-gray-400" />
                  </div>
                </div>

                <button
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={openAddModal}
                >
                  <Plus size={16} className="mr-2" />
                  เพิ่มผู้ใช้
                </button>
              </div>
            </div>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("username")}
                  >
                    <div className="flex items-center">
                      <span>Username</span>
                      <ChevronsUpDown size={14} className="ml-1" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("fullName")}
                  >
                    <div className="flex items-center">
                      <span>ชื่อ-นามสกุล</span>
                      <ChevronsUpDown size={14} className="ml-1" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("email")}
                  >
                    <div className="flex items-center">
                      <span>อีเมล</span>
                      <ChevronsUpDown size={14} className="ml-1" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("role")}
                  >
                    <div className="flex items-center">
                      <span>ตำแหน่ง</span>
                      <ChevronsUpDown size={14} className="ml-1" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center">
                      <span>สถานะ</span>
                      <ChevronsUpDown size={14} className="ml-1" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("lastLogin")}
                  >
                    <div className="flex items-center">
                      <span>เข้าสู่ระบบล่าสุด</span>
                      <ChevronsUpDown size={14} className="ml-1" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    การจัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan="7"
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
                ) : currentUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-4 py-4 text-center text-gray-500"
                    >
                      ไม่พบข้อมูลผู้ใช้
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.username}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user.fullName}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user.email}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColorClass(
                            user.role
                          )}`}
                        >
                          <Shield className="w-3 h-3 mr-1" />
                          {getRoleName(user.role)}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {getUserStatusBadge(user.status)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {user.lastLogin
                            ? new Date(user.lastLogin).toLocaleString("th-TH")
                            : "ยังไม่เคยเข้าสู่ระบบ"}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() => openRoleModal(user)}
                            title="จัดการสิทธิ์"
                          >
                            <Shield size={16} />
                          </button>
                          <button
                            className="text-yellow-600 hover:text-yellow-900"
                            onClick={() => openEditModal(user)}
                            title="แก้ไข"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className={`${
                              user.status === "active"
                                ? "text-gray-600 hover:text-gray-900"
                                : "text-green-600 hover:text-green-900"
                            }`}
                            onClick={() => toggleUserStatus(user.id)}
                            title={
                              user.status === "active"
                                ? "ปิดการใช้งาน"
                                : "เปิดการใช้งาน"
                            }
                          >
                            {user.status === "active" ? (
                              <Lock size={16} />
                            ) : (
                              <Unlock size={16} />
                            )}
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDeleteUser(user.id)}
                            title="ลบ"
                          >
                            <Trash2 size={16} />
                          </button>
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
                        {Math.min(indexOfLastItem, filteredUsers.length)}
                      </span>{" "}
                      จากทั้งหมด{" "}
                      <span className="font-medium">
                        {filteredUsers.length}
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
                        onClick={() => paginate(1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">First</span>
                        First
                      </button>
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Previous</span>
                        &lsaquo;
                      </button>
                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index}
                          onClick={() => paginate(index + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border ${
                            currentPage === index + 1
                              ? "bg-blue-50 border-blue-500 text-blue-600 z-10"
                              : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                          } text-sm font-medium`}
                        >
                          {index + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Next</span>
                        &rsaquo;
                      </button>
                      <button
                        onClick={() => paginate(totalPages)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Last</span>
                        Last
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-blue-600 px-4 py-3 sm:px-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg leading-6 font-medium text-white">
                    เพิ่มผู้ใช้งานใหม่
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-white hover:text-gray-200"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={newUser.username}
                      onChange={(e) =>
                        setNewUser({ ...newUser, username: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      ชื่อ-นามสกุล
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={newUser.fullName}
                      onChange={(e) =>
                        setNewUser({ ...newUser, fullName: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      อีเมล
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={newUser.email}
                      onChange={(e) =>
                        setNewUser({ ...newUser, email: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="role"
                      className="block text-sm font-medium text-gray-700"
                    >
                      ตำแหน่ง
                    </label>
                    <select
                      id="role"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={newUser.role}
                      onChange={(e) =>
                        setNewUser({ ...newUser, role: e.target.value })
                      }
                    >
                      {roleOptions.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleAddUser}
                >
                  เพิ่มผู้ใช้
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeModal}
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && currentUser && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-blue-600 px-4 py-3 sm:px-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg leading-6 font-medium text-white">
                    แก้ไขข้อมูลผู้ใช้
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-white hover:text-gray-200"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 focus:outline-none"
                      value={currentUser.username}
                      readOnly
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      ชื่อ-นามสกุล
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={currentUser.fullName}
                      onChange={(e) =>
                        setCurrentUser({
                          ...currentUser,
                          fullName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      อีเมล
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={currentUser.email}
                      onChange={(e) =>
                        setCurrentUser({
                          ...currentUser,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="role"
                      className="block text-sm font-medium text-gray-700"
                    >
                      ตำแหน่ง
                    </label>
                    <select
                      id="role"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={currentUser.role}
                      onChange={(e) =>
                        setCurrentUser({ ...currentUser, role: e.target.value })
                      }
                    >
                      {roleOptions.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="status"
                      className="block text-sm font-medium text-gray-700"
                    >
                      สถานะ
                    </label>
                    <select
                      id="status"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={currentUser.status}
                      onChange={(e) =>
                        setCurrentUser({
                          ...currentUser,
                          status: e.target.value,
                        })
                      }
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleEditUser}
                >
                  บันทึกการแก้ไข
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeModal}
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Management Modal */}
      {isRoleModalOpen && currentUser && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-blue-600 px-4 py-3 sm:px-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg leading-6 font-medium text-white">
                    จัดการสิทธิ์ - {currentUser.username}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-white hover:text-gray-200"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <Shield className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium">ตำแหน่งปัจจุบัน: </span>
                    <span
                      className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColorClass(
                        currentUser.role
                      )}`}
                    >
                      {getRoleName(currentUser.role)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {
                      roleOptions.find((role) => role.id === currentUser.role)
                        ?.description
                    }
                  </p>
                </div>

                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    เปลี่ยนตำแหน่ง
                  </h4>
                  <div className="space-y-2">
                    {roleOptions.map((role) => (
                      <div
                        key={role.id}
                        className={`p-3 border rounded-md flex items-center cursor-pointer ${
                          currentUser.role === role.id
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                        onClick={() =>
                          setCurrentUser({ ...currentUser, role: role.id })
                        }
                      >
                        <input
                          type="radio"
                          id={`role-${role.id}`}
                          name="role"
                          checked={currentUser.role === role.id}
                          onChange={() =>
                            setCurrentUser({ ...currentUser, role: role.id })
                          }
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <label
                          htmlFor={`role-${role.id}`}
                          className="ml-3 flex flex-col cursor-pointer"
                        >
                          <span className="text-sm font-medium text-gray-900">
                            {role.name}
                          </span>
                          <span className="text-sm text-gray-500">
                            {role.description}
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    ข้อมูลสิทธิ์
                  </h4>
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b">
                      <h5 className="text-sm font-medium text-gray-900">
                        สิทธิ์การเข้าถึงแต่ละโมดูล
                      </h5>
                    </div>
                    <div className="p-4">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              โมดูล
                            </th>
                            <th className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              ดู
                            </th>
                            <th className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              สร้าง
                            </th>
                            <th className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              แก้ไข
                            </th>
                            <th className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              ลบ
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {modulePermissions.map((module) => (
                            <tr key={module.id}>
                              <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                {module.name}
                              </td>
                              <td className="px-6 py-2 whitespace-nowrap text-center">
                                <CheckCircle
                                  size={16}
                                  className={`mx-auto ${
                                    currentUser.role === "viewer"
                                      ? "text-green-500"
                                      : currentUser.role === "admin" ||
                                        currentUser.role === "manager"
                                      ? "text-green-500"
                                      : "text-gray-300"
                                  }`}
                                />
                              </td>
                              <td className="px-6 py-2 whitespace-nowrap text-center">
                                {currentUser.role === "admin" ||
                                (currentUser.role === "manager" &&
                                  module.id !== "settings") ? (
                                  <CheckCircle
                                    size={16}
                                    className="mx-auto text-green-500"
                                  />
                                ) : (
                                  <XCircle
                                    size={16}
                                    className="mx-auto text-red-500"
                                  />
                                )}
                              </td>
                              <td className="px-6 py-2 whitespace-nowrap text-center">
                                {currentUser.role === "admin" ||
                                (currentUser.role === "manager" &&
                                  module.id !== "settings") ? (
                                  <CheckCircle
                                    size={16}
                                    className="mx-auto text-green-500"
                                  />
                                ) : (
                                  <XCircle
                                    size={16}
                                    className="mx-auto text-red-500"
                                  />
                                )}
                              </td>
                              <td className="px-6 py-2 whitespace-nowrap text-center">
                                {currentUser.role === "admin" ||
                                (currentUser.role === "manager" &&
                                  module.id !== "settings") ? (
                                  <CheckCircle
                                    size={16}
                                    className="mx-auto text-green-500"
                                  />
                                ) : (
                                  <XCircle
                                    size={16}
                                    className="mx-auto text-red-500"
                                  />
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleEditUser}
                >
                  บันทึกการเปลี่ยนแปลง
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeModal}
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
