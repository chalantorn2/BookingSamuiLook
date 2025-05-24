import React, { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { supabase } from "../../services/supabase";
import DataTable from "./components/DataTable";
import AddEditForm from "./components/AddEditForm";

const Information = () => {
  const [categories] = useState([
    { id: "supplier", label: "Supplier" },
    { id: "customer", label: "Customer" },
  ]);

  const [selectedCategory, setSelectedCategory] = useState("supplier");
  const [informationData, setInformationData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    name: "",
    code: "",
    numeric_code: "", // เพิ่มฟิลด์ใหม่
    address: "",
    id_number: "",
    phone: "",
    branch_type: "Head Office",
    branch_number: "",
    credit_days: 0,
    type: "",
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
      // แสดงข้อมูลของ airline, supplier-voucher, supplier-other ทั้งหมด
      const { data, error } = await supabase
        .from("information")
        .select("*")
        .in("category", ["airline", "supplier-voucher", "supplier-other"])
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
      // เพิ่มการกรองเฉพาะข้อมูลที่ active = true
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("active", true);

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
      const updatedItem = { ...editingItem };

      if (name === "code" && selectedCategory === "customer") {
        // จำกัดให้รหัสลูกค้าเป็นตัวอักษร 3 ตัว
        updatedItem[name] = value.toUpperCase().substring(0, 3);
      } else if (name === "numeric_code") {
        // จำกัดให้รหัสตัวเลขเป็นตัวเลข 3 ตัว
        updatedItem[name] = value.replace(/\D/g, "").substring(0, 3);
      } else if (name === "branch_type" && value === "Head Office") {
        updatedItem[name] = value;
        updatedItem.branch_number = "";
      } else {
        updatedItem[name] = value;
      }

      setEditingItem(updatedItem);
    } else {
      const updatedItem = { ...newItem };

      if (name === "code" && selectedCategory === "customer") {
        // จำกัดให้รหัสลูกค้าเป็นตัวอักษร 3 ตัว
        updatedItem[name] = value.toUpperCase().substring(0, 3);
      } else if (name === "numeric_code") {
        // จำกัดให้รหัสตัวเลขเป็นตัวเลข 3 ตัว
        updatedItem[name] = value.replace(/\D/g, "").substring(0, 3);
      } else if (name === "branch_type" && value === "Head Office") {
        updatedItem[name] = value;
        updatedItem.branch_number = "";
      } else {
        updatedItem[name] = value;
      }

      setNewItem(updatedItem);
    }
  };

  const handleSaveEdit = async () => {
    if (selectedCategory === "customer") {
      if (!editingItem.name.trim()) {
        alert("กรุณากรอกชื่อลูกค้า");
        return;
      }

      // ตรวจสอบรหัสลูกค้า
      if (editingItem.code && editingItem.code.length !== 3) {
        alert("รหัสลูกค้าต้องเป็นตัวอักษร 3 ตัว");
        return;
      }

      // ตรวจสอบความถูกต้องของข้อมูลสาขา
      if (editingItem.branch_type === "Branch" && !editingItem.branch_number) {
        alert("กรุณากรอกหมายเลขสาขา (ต้องเป็นตัวเลข 3 หลัก)");
        return;
      }

      try {
        // ตรวจสอบว่ามีรหัสซ้ำหรือไม่ (ถ้ามีการกรอกรหัส)
        if (editingItem.code) {
          const { data: existingCode } = await supabase
            .from("customers")
            .select("id")
            .eq("code", editingItem.code)
            .eq("active", true)
            .neq("id", editingItem.id);

          if (existingCode && existingCode.length > 0) {
            alert("รหัสลูกค้านี้มีอยู่ในระบบแล้ว");
            return;
          }
        }

        const { error } = await supabase
          .from("customers")
          .update({
            name: editingItem.name,
            code: editingItem.code || null,
            address: editingItem.address || null,
            id_number: editingItem.id_number || null,
            phone: editingItem.phone || null,
            branch_type: editingItem.branch_type || "Head Office",
            branch_number:
              editingItem.branch_type === "Branch"
                ? editingItem.branch_number
                : null,
            credit_days: editingItem.credit_days || 0,
          })
          .eq("id", editingItem.id);

        if (error) throw error;
        await loadCustomerData();
        setEditingItem(null);
      } catch (err) {
        setError("เกิดข้อผิดพลาดในการบันทึก: " + err.message);
      }
    } else {
      if (
        !editingItem.code.trim() ||
        !editingItem.name.trim() ||
        !editingItem.type
      ) {
        alert("กรุณากรอกข้อมูลให้ครบถ้วน");
        return;
      }

      // ตรวจสอบรหัสตัวเลข (ถ้ามี)
      if (editingItem.numeric_code && editingItem.numeric_code.length !== 3) {
        alert("รหัสตัวเลขต้องเป็นตัวเลข 3 ตัว");
        return;
      }

      // แปลงประเภทเป็น category
      let category = "supplier-other"; // ค่าเริ่มต้น

      if (editingItem.type === "Airline") {
        category = "airline";
      } else if (editingItem.type === "Voucher") {
        category = "supplier-voucher";
      } else if (editingItem.type === "Other") {
        category = "supplier-other";
      }

      try {
        const { error } = await supabase
          .from("information")
          .update({
            category: category,
            code: editingItem.code,
            name: editingItem.name,
            type: editingItem.type,
            numeric_code: editingItem.numeric_code || null,
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
      code: "",
      numeric_code: "",
      address: "",
      id_number: "",
      phone: "",
      branch_type: "Head Office",
      branch_number: "",
      credit_days: 0,
      type: "",
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

      // ตรวจสอบรหัสลูกค้า
      if (newItem.code && newItem.code.length !== 3) {
        alert("รหัสลูกค้าต้องเป็นตัวอักษร 3 ตัว");
        return;
      }

      if (newItem.branch_type === "Branch" && !newItem.branch_number) {
        alert("กรุณากรอกหมายเลขสาขา (ต้องเป็นตัวเลข 3 หลัก)");
        return;
      }

      try {
        // ตรวจสอบว่ามีรหัสซ้ำหรือไม่ (ถ้ามีการกรอกรหัส)
        if (newItem.code) {
          const { data: existingCode } = await supabase
            .from("customers")
            .select("id")
            .eq("code", newItem.code)
            .eq("active", true);

          if (existingCode && existingCode.length > 0) {
            alert("รหัสลูกค้านี้มีอยู่ในระบบแล้ว");
            return;
          }
        }

        const { error } = await supabase.from("customers").insert({
          name: newItem.name,
          code: newItem.code || null,
          address: newItem.address || null,
          id_number: newItem.id_number || null,
          phone: newItem.phone || null,
          branch_type: newItem.branch_type || "Head Office",
          branch_number:
            newItem.branch_type === "Branch" ? newItem.branch_number : null,
          credit_days: newItem.credit_days || 0,
          active: true,
        });

        if (error) throw error;
        await loadCustomerData();
        setAddingNew(false);
        setNewItem({
          name: "",
          code: "",
          numeric_code: "",
          address: "",
          id_number: "",
          phone: "",
          branch_type: "Head Office",
          branch_number: "",
          credit_days: 0,
        });
      } catch (err) {
        setError("เกิดข้อผิดพลาดในการเพิ่มข้อมูล: " + err.message);
      }
    } else {
      if (!newItem.code.trim() || !newItem.name.trim() || !newItem.type) {
        alert("กรุณากรอกข้อมูลให้ครบถ้วน");
        return;
      }

      // ตรวจสอบรหัสตัวเลข (ถ้ามี)
      if (newItem.numeric_code && newItem.numeric_code.length !== 3) {
        alert("รหัสตัวเลขต้องเป็นตัวเลข 3 ตัว");
        return;
      }

      // แปลงประเภทเป็น category
      let category = "supplier-other"; // ค่าเริ่มต้น

      if (newItem.type === "Airline") {
        category = "airline";
      } else if (newItem.type === "Voucher") {
        category = "supplier-voucher";
      } else if (newItem.type === "Other") {
        category = "supplier-other";
      }

      try {
        const { error } = await supabase.from("information").insert({
          category: category,
          code: newItem.code,
          name: newItem.name,
          type: newItem.type,
          numeric_code: newItem.numeric_code || null,
          active: true,
        });
        if (error) throw error;
        await loadInformationData();
        setAddingNew(false);
        setNewItem({ code: "", name: "", type: "", numeric_code: "" });
      } catch (err) {
        setError("เกิดข้อผิดพลาดในการเพิ่มข้อมูล: " + err.message);
      }
    }
  };

  // ฟังก์ชัน handleDeactivate
  const handleDeactivate = async (id) => {
    const confirmText =
      selectedCategory === "customer"
        ? "คุณต้องการยกเลิกการใช้งานข้อมูลลูกค้านี้ใช่หรือไม่?"
        : "คุณต้องการยกเลิกการใช้งานข้อมูลนี้ใช่หรือไม่?";

    if (window.confirm(confirmText)) {
      try {
        const table =
          selectedCategory === "customer" ? "customers" : "information";

        // ใช้การอัปเดตสถานะ active เป็น false แทนการลบ
        const { error } = await supabase
          .from(table)
          .update({ active: false })
          .eq("id", id);

        if (error) throw error;

        selectedCategory === "customer"
          ? await loadCustomerData()
          : await loadInformationData();
      } catch (err) {
        setError("เกิดข้อผิดพลาดในการยกเลิกรายการ: " + err.message);
      }
    }
  };

  const getFilteredAndSortedData = () => {
    let filteredData = informationData;
    if (searchTerm) {
      filteredData = informationData.filter((item) =>
        selectedCategory === "customer"
          ? (item.code &&
              item.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
            item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.address &&
              item.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.id_number &&
              item.id_number
                .toLowerCase()
                .includes(searchTerm.toLowerCase())) ||
            (item.phone &&
              item.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.branch_number && item.branch_number.includes(searchTerm))
          : item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.numeric_code && item.numeric_code.includes(searchTerm)) ||
            (item.type &&
              item.type.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    return filteredData.sort((a, b) => {
      const aValue = a[sortField] || "";
      const bValue = b[sortField] || "";

      // Handle numeric sorting for credit_days
      if (sortField === "credit_days") {
        const aNum = parseInt(aValue) || 0;
        const bNum = parseInt(bValue) || 0;
        return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
      }

      // Default string comparison
      const comparison = String(aValue).localeCompare(String(bValue));
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
      max-width: 80px; /* รหัส */
    }
    .table-customer th:nth-child(2), .table-customer td:nth-child(2) {
      max-width: 200px; /* ชื่อ */
    }
    .table-customer th:nth-child(3), .table-customer td:nth-child(3) {
      max-width: 100px; /* สาขา */
    }
    .table-customer th:nth-child(4), .table-customer td:nth-child(4) {
      max-width: 80px; /* เครดิต */
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
