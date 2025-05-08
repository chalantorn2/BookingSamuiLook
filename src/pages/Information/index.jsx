import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash,
  Save,
  X,
  Search,
  ChevronsUpDown,
} from "lucide-react";
import { supabase } from "../../services/supabase";

// Component สำหรับตารางข้อมูล
const DataTable = ({
  data,
  selectedCategory,
  sortField,
  sortDirection,
  handleSort,
  handleEditItem,
  handleDeactivate,
  editingItem,
  handleInputChange,
  handleCancelEdit,
  handleSaveEdit,
}) => {
  return (
    <div className="border rounded-md overflow-hidden">
      <table
        className={`min-w-full divide-y divide-gray-200 ${
          selectedCategory === "customer" ? "table-customer" : ""
        }`}
      >
        <thead className="bg-gray-50">
          <tr>
            {selectedCategory === "customer" ? (
              <>
                <th
                  className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center">
                    ชื่อ
                    <ChevronsUpDown size={14} className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("address")}
                >
                  <div className="flex items-center">
                    ที่อยู่
                    <ChevronsUpDown size={14} className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("id_number")}
                >
                  <div className="flex items-center">
                    เลขประจำตัว/พาสปอร์ต
                    <ChevronsUpDown size={14} className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("phone")}
                >
                  <div className="flex items-center">
                    เบอร์โทรศัพท์
                    <ChevronsUpDown size={14} className="ml-1" />
                  </div>
                </th>
              </>
            ) : (
              <>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("code")}
                >
                  <div className="flex items-center">
                    รหัส
                    <ChevronsUpDown size={14} className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center">
                    ชื่อ
                    <ChevronsUpDown size={14} className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("description")}
                >
                  <div className="flex items-center">
                    รายละเอียด
                    <ChevronsUpDown size={14} className="ml-1" />
                  </div>
                </th>
              </>
            )}
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              จัดการ
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={selectedCategory === "customer" ? 5 : 4}
                className="px-6 py-4 text-center text-gray-500"
              >
                ไม่พบข้อมูล
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={item.id}>
                {editingItem && editingItem.id === item.id ? (
                  selectedCategory === "customer" ? (
                    <>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          name="name"
                          value={editingItem.name}
                          onChange={(e) => handleInputChange(e, "edit")}
                          className="w-full border border-gray-300 rounded-md p-1 focus:ring focus:ring-blue-200 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          name="address"
                          value={editingItem.address || ""}
                          onChange={(e) => handleInputChange(e, "edit")}
                          className="w-full border border-gray-300 rounded-md p-1 focus:ring focus:ring-blue-200 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          name="id_number"
                          value={editingItem.id_number || ""}
                          onChange={(e) => handleInputChange(e, "edit")}
                          className="w-full border border-gray-300 rounded-md p-1 focus:ring focus:ring-blue-200 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          name="phone"
                          value={editingItem.phone || ""}
                          onChange={(e) => handleInputChange(e, "edit")}
                          className="w-full border border-gray-300 rounded-md p-1 focus:ring focus:ring-blue-200 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2 text-right whitespace-nowrap">
                        <button
                          onClick={handleCancelEdit}
                          className="text-gray-500 hover:text-gray-700 mr-2"
                          title="ยกเลิก"
                        >
                          <X size={18} />
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          className="text-green-500 hover:text-green-700"
                          title="บันทึก"
                        >
                          <Save size={18} />
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          name="code"
                          value={editingItem.code}
                          onChange={(e) => handleInputChange(e, "edit")}
                          className="w-full border border-gray-300 rounded-md p-1 focus:ring focus:ring-blue-200 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          name="name"
                          value={editingItem.name}
                          onChange={(e) => handleInputChange(e, "edit")}
                          className="w-full border border-gray-300 rounded-md p-1 focus:ring focus:ring-blue-200 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          name="description"
                          value={editingItem.description || ""}
                          onChange={(e) => handleInputChange(e, "edit")}
                          className="w-full border border-gray-300 rounded-md p-1 focus:ring focus:ring-blue-200 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={handleCancelEdit}
                          className="text-gray-500 hover:text-gray-700 mr-2"
                          title="ยกเลิก"
                        >
                          <X size={18} />
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          className="text-green-500 hover:text-green-700"
                          title="บันทึก"
                        >
                          <Save size={18} />
                        </button>
                      </td>
                    </>
                  )
                ) : selectedCategory === "customer" ? (
                  <>
                    <td className="px-3 py-2">{item.name}</td>
                    <td className="px-3 py-2">{item.address || "-"}</td>
                    <td className="px-3 py-2">{item.id_number || "-"}</td>
                    <td className="px-3 py-2">{item.phone || "-"}</td>
                    <td className="px-3 py-2 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="text-blue-500 hover:text-blue-700 mr-3"
                        title="แก้ไข"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeactivate(item.id)}
                        className="text-red-500 hover:text-red-700"
                        title="ลบ"
                      >
                        <Trash size={18} />
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4">{item.code}</td>
                    <td className="px-6 py-4">{item.name}</td>
                    <td className="px-6 py-4">{item.description || "-"}</td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="text-blue-500 hover:text-blue-700 mr-3"
                        title="แก้ไข"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeactivate(item.id)}
                        className="text-red-500 hover:text-red-700"
                        title="ลบ"
                      >
                        <Trash size={18} />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

// Component สำหรับฟอร์มเพิ่ม/แก้ไขข้อมูล
const AddEditForm = ({
  selectedCategory,
  newItem,
  handleInputChange,
  handleCancelAdd,
  handleSaveNew,
}) => {
  return (
    <div className="mb-6 bg-blue-50 p-4 rounded-md">
      <h3 className="font-semibold mb-2">เพิ่มข้อมูลใหม่</h3>
      {selectedCategory === "customer" ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1">
              ชื่อ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={newItem.name}
              onChange={(e) => handleInputChange(e, "new")}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">ที่อยู่</label>
            <input
              type="text"
              name="address"
              value={newItem.address}
              onChange={(e) => handleInputChange(e, "new")}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              เลขประจำตัว/พาสปอร์ต
            </label>
            <input
              type="text"
              name="id_number"
              value={newItem.id_number}
              onChange={(e) => handleInputChange(e, "new")}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              เบอร์โทรศัพท์
            </label>
            <input
              type="text"
              name="phone"
              value={newItem.phone}
              onChange={(e) => handleInputChange(e, "new")}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200 focus:border-blue-500"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              รหัส <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="code"
              value={newItem.code}
              onChange={(e) => handleInputChange(e, "new")}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              ชื่อ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={newItem.name}
              onChange={(e) => handleInputChange(e, "new")}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">รายละเอียด</label>
            <input
              type="text"
              name="description"
              value={newItem.description}
              onChange={(e) => handleInputChange(e, "new")}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200 focus:border-blue-500"
            />
          </div>
        </div>
      )}
      <div className="flex justify-end mt-3 space-x-2">
        <button
          onClick={handleCancelAdd}
          className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
        >
          <X size={16} className="mr-1 inline" /> ยกเลิก
        </button>
        <button
          onClick={handleSaveNew}
          className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          <Save size={16} className="mr-1 inline" /> บันทึก
        </button>
      </div>
    </div>
  );
};

// Main Component
const Information = () => {
  const [categories] = useState([
    { id: "airline", label: "Airline" },
    { id: "supplier-voucher", label: "Supplier Voucher" },
    { id: "supplier-other", label: "Supplier Other" },
    { id: "customer", label: "Customer" },
  ]);

  const [selectedCategory, setSelectedCategory] = useState("airline");
  const [informationData, setInformationData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    name: "",
    address: "",
    id_number: "",
    phone: "",
    code: "",
    description: "",
  });
  const [addingNew, setAddingNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  useEffect(() => {
    if (selectedCategory === "customer") {
      loadCustomerData();
    } else {
      loadInformationData();
    }
  }, [selectedCategory]);

  const loadInformationData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("information")
        .select("*")
        .eq("category", selectedCategory)
        .eq("active", true);
      if (error) throw error;
      setInformationData(data || []);
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูล: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from("customers").select("*");
      if (error) throw error;
      setInformationData(data || []);
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูลลูกค้า: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setEditingItem(null);
    setAddingNew(false);
    setSearchTerm("");
  };

  const handleEditItem = (item) => {
    setEditingItem({ ...item });
    setAddingNew(false);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  const handleInputChange = (e, type) => {
    const { name, value } = e.target;
    if (type === "edit") {
      setEditingItem({ ...editingItem, [name]: value });
    } else {
      setNewItem({ ...newItem, [name]: value });
    }
  };

  const handleSaveEdit = async () => {
    if (selectedCategory === "customer") {
      if (!editingItem.name.trim()) {
        alert("กรุณากรอกชื่อลูกค้า");
        return;
      }
      try {
        const { error } = await supabase
          .from("customers")
          .update({
            name: editingItem.name,
            address: editingItem.address || null,
            id_number: editingItem.id_number || null,
            phone: editingItem.phone || null,
          })
          .eq("id", editingItem.id);
        if (error) throw error;
        await loadCustomerData();
        setEditingItem(null);
      } catch (err) {
        setError("เกิดข้อผิดพลาดในการบันทึก: " + err.message);
      }
    } else {
      if (!editingItem.code.trim() || !editingItem.name.trim()) {
        alert("กรุณากรอกข้อมูลให้ครบถ้วน");
        return;
      }
      try {
        const { error } = await supabase
          .from("information")
          .update({
            code: editingItem.code,
            name: editingItem.name,
            description: editingItem.description,
          })
          .eq("id", editingItem.id);
        if (error) throw error;
        await loadInformationData();
        setEditingItem(null);
      } catch (err) {
        setError("เกิดข้อผิดพลาดในการบันทึก: " + err.message);
      }
    }
  };

  const handleAddNew = () => {
    setAddingNew(true);
    setEditingItem(null);
    setNewItem({
      name: "",
      address: "",
      id_number: "",
      phone: "",
      code: "",
      description: "",
    });
  };

  const handleCancelAdd = () => {
    setAddingNew(false);
  };

  const handleSaveNew = async () => {
    if (selectedCategory === "customer") {
      if (!newItem.name.trim()) {
        alert("กรุณากรอกชื่อลูกค้า");
        return;
      }
      try {
        const { error } = await supabase.from("customers").insert({
          name: newItem.name,
          address: newItem.address || null,
          id_number: newItem.id_number || null,
          phone: newItem.phone || null,
        });
        if (error) throw error;
        await loadCustomerData();
        setAddingNew(false);
        setNewItem({ name: "", address: "", id_number: "", phone: "" });
      } catch (err) {
        setError("เกิดข้อผิดพลาดในการเพิ่มข้อมูล: " + err.message);
      }
    } else {
      if (!newItem.code.trim() || !newItem.name.trim()) {
        alert("กรุณากรอกข้อมูลให้ครบถ้วน");
        return;
      }
      try {
        const { error } = await supabase.from("information").insert({
          category: selectedCategory,
          code: newItem.code,
          name: newItem.name,
          description: newItem.description || null,
          active: true,
        });
        if (error) throw error;
        await loadInformationData();
        setAddingNew(false);
        setNewItem({ code: "", name: "", description: "" });
      } catch (err) {
        setError("เกิดข้อผิดพลาดในการเพิ่มข้อมูล: " + err.message);
      }
    }
  };

  const handleDeactivate = async (id) => {
    const confirmText =
      selectedCategory === "customer"
        ? "คุณต้องการลบข้อมูลลูกค้านี้ใช่หรือไม่?"
        : "คุณต้องการยกเลิกการใช้งานข้อมูลนี้ใช่หรือไม่?";
    if (window.confirm(confirmText)) {
      try {
        const table =
          selectedCategory === "customer" ? "customers" : "information";
        const updateData =
          selectedCategory === "customer" ? undefined : { active: false };
        const { error } = await (updateData
          ? supabase.from(table).update(updateData).eq("id", id)
          : supabase.from(table).delete().eq("id", id));
        if (error) throw error;
        selectedCategory === "customer"
          ? await loadCustomerData()
          : await loadInformationData();
      } catch (err) {
        setError("เกิดข้อผิดพลาดในการลบ: " + err.message);
      }
    }
  };

  const getFilteredAndSortedData = () => {
    let filteredData = informationData;
    if (searchTerm) {
      filteredData = informationData.filter((item) =>
        selectedCategory === "customer"
          ? item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.address &&
              item.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.id_number &&
              item.id_number
                .toLowerCase()
                .includes(searchTerm.toLowerCase())) ||
            (item.phone &&
              item.phone.toLowerCase().includes(searchTerm.toLowerCase()))
          : item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.description &&
              item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    return filteredData.sort((a, b) => {
      const aValue = a[sortField] || "";
      const bValue = b[sortField] || "";
      const comparison = aValue.localeCompare(bValue);
      return sortDirection === "asc" ? comparison : -comparison;
    });
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedData = getFilteredAndSortedData();

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <style>
        {`
    .table-customer {
      width: 100%;
      
    }
    .table-customer th, .table-customer td {
      padding-left: 0.75rem;
      padding-right: 0.75rem;
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
      white-space: normal; /* ป้องกันการขึ้นบรรทัดใหม่ */
      overflow: hidden;
      
    }
    .table-customer th:nth-child(1), .table-customer td:nth-child(1) {
      max-width: 250px; /* ชื่อ */
    }
    .table-customer th:nth-child(2), .table-customer td:nth-child(2) {
      max-width: 250px; /* ที่อยู่ */
    }
    .table-customer th:nth-child(3), .table-customer td:nth-child(3) {
      max-width: 150px; /* เลขประจำตัว/พาสปอร์ต */
    }
    .table-customer th:nth-child(4), .table-customer td:nth-child(4) {
      max-width: 120px; /* เบอร์โทรศัพท์ */
    }
    .table-customer th:nth-child(5), .table-customer td:nth-child(5) {
      max-width: 80px; /* จัดการ */
    }
  `}
      </style>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-white rounded-t-lg shadow-sm p-4 mb-4">
            <h1 className="text-xl font-bold">Information / ข้อมูล</h1>
            <p className="text-sm opacity-80">
              จัดการข้อมูล Supplier, Customer, Type ที่ใช้ในระบบ
            </p>
          </div>

          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/4 bg-gray-50 p-4 border-r border-gray-200">
              <h2 className="text-lg font-semibold mb-4">ประเภทข้อมูล</h2>
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li key={category.id}>
                    <button
                      className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                        selectedCategory === category.id
                          ? "bg-blue-500 text-white"
                          : "hover:bg-gray-200"
                      }`}
                      onClick={() => handleCategoryChange(category.id)}
                    >
                      {category.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full md:w-3/4 p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <h2 className="text-xl font-semibold">
                  {categories.find((cat) => cat.id === selectedCategory)?.label}
                </h2>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="ค้นหา..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={handleAddNew}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-md flex items-center"
                    disabled={addingNew}
                  >
                    <Plus size={18} className="mr-1" />
                    เพิ่มข้อมูลใหม่
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-6">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-blue-500 border-r-transparent"></div>
                  <p className="mt-2 text-gray-600">กำลังโหลดข้อมูล...</p>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {error}
                </div>
              ) : (
                <>
                  {addingNew && (
                    <AddEditForm
                      selectedCategory={selectedCategory}
                      newItem={newItem}
                      handleInputChange={handleInputChange}
                      handleCancelAdd={handleCancelAdd}
                      handleSaveNew={handleSaveNew}
                    />
                  )}
                  <DataTable
                    data={filteredAndSortedData}
                    selectedCategory={selectedCategory}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    handleSort={handleSort}
                    handleEditItem={handleEditItem}
                    handleDeactivate={handleDeactivate}
                    editingItem={editingItem}
                    handleInputChange={handleInputChange}
                    handleCancelEdit={handleCancelEdit}
                    handleSaveEdit={handleSaveEdit}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Information;
