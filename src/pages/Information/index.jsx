import React, { useState, useEffect } from "react";
import { Search, Plus, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "../../services/supabase";
import DataTable from "./components/DataTable";
import AddEditForm from "./components/AddEditForm";

const Information = () => {
  const [categories] = useState([
    { id: "supplier", label: "Supplier" },
    { id: "customer", label: "Customer" },
  ]);

  // เพิ่ม supplier types สำหรับ filter
  const [supplierTypes] = useState([
    { value: "all", label: "ทั้งหมด" },
    { value: "Airline", label: "Airline" },
    { value: "Voucher", label: "Voucher" },
    { value: "Other", label: "Other" },
  ]);

  const [selectedCategory, setSelectedCategory] = useState("supplier");
  const [informationData, setInformationData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    name: "",
    code: "",
    numeric_code: "",
    email: "", // เพิ่มบรรทัดนี้
    address_line1: "", // เพิ่มบรรทัดนี้
    address_line2: "", // เพิ่มบรรทัดนี้
    address_line3: "", // เพิ่มบรรทัดนี้
    // ลบ address: "", ออก
    id_number: "",
    phone: "",
    branch_type: "Head Office",
    branch_number: "",
    credit_days: 0,
    type: "",
  });
  const [addingNew, setAddingNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");

  // เพิ่ม state สำหรับ pagination และ filter
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedSupplierType, setSelectedSupplierType] = useState("all");

  useEffect(() => {
    if (selectedCategory === "customer") {
      loadCustomerData();
    } else {
      loadInformationData();
    }
  }, [
    selectedCategory,
    currentPage,
    selectedSupplierType,
    searchTerm,
    sortField,
    sortDirection,
  ]);

  const loadInformationData = async () => {
    setLoading(true);
    setError(null);
    try {
      // คำนวณ offset สำหรับ pagination
      const offset = (currentPage - 1) * itemsPerPage;

      // สร้าง query พื้นฐาน
      let query = supabase
        .from("information")
        .select("*", { count: "exact" })
        .in("category", ["airline", "supplier-voucher", "supplier-other"])
        .eq("active", true);

      // เพิ่ม filter สำหรับประเภท supplier
      if (selectedSupplierType !== "all") {
        query = query.eq("type", selectedSupplierType);
      }

      // เพิ่มการค้นหา
      if (searchTerm) {
        query = query.or(
          `code.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%,numeric_code.ilike.%${searchTerm}%,type.ilike.%${searchTerm}%`
        );
      }

      // เพิ่มการเรียงลำดับ
      query = query.order(sortField, { ascending: sortDirection === "asc" });

      // เพิ่ม pagination
      query = query.range(offset, offset + itemsPerPage - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      setInformationData(data || []);
      setTotalItems(count || 0);
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
      // คำนวณ offset สำหรับ pagination
      const offset = (currentPage - 1) * itemsPerPage;

      let query = supabase
        .from("customers")
        .select("*", { count: "exact" })
        .eq("active", true);

      // เพิ่มการค้นหา - แก้บรรทัดนี้
      if (searchTerm) {
        query = query.or(
          `code.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,id_number.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,address_line1.ilike.%${searchTerm}%,address_line2.ilike.%${searchTerm}%,address_line3.ilike.%${searchTerm}%`
        );
      }

      // เพิ่มการเรียงลำดับ
      query = query.order(sortField, { ascending: sortDirection === "asc" });

      // เพิ่ม pagination
      query = query.range(offset, offset + itemsPerPage - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      setInformationData(data || []);
      setTotalItems(count || 0);
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
    setCurrentPage(1); // รีเซ็ตหน้าเมื่อเปลี่ยนประเภท
    setSelectedSupplierType("all"); // รีเซ็ต filter
  };

  const handleSupplierTypeChange = (type) => {
    setSelectedSupplierType(type);
    setCurrentPage(1); // รีเซ็ตหน้าเมื่อเปลี่ยน filter
  };

  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // รีเซ็ตหน้าเมื่อค้นหา
  };

  // คำนวณจำนวนหน้าทั้งหมด
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // สร้างอาร์เรย์ของหมายเลขหน้า
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }

    return pages;
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
        updatedItem[name] = value.toUpperCase().substring(0, 5);
      } else if (name === "numeric_code") {
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
        updatedItem[name] = value.toUpperCase().substring(0, 5);
      } else if (name === "numeric_code") {
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

      // เพิ่มการตรวจสอบ address_line1
      if (!editingItem.address_line1 || !editingItem.address_line1.trim()) {
        alert("กรุณากรอกที่อยู่บรรทัดที่ 1");
        return;
      }

      if (
        editingItem.code &&
        (editingItem.code.length < 3 || editingItem.code.length > 5)
      ) {
        alert("รหัสลูกค้าต้องเป็นตัวอักษร 3-5 ตัว");
        return;
      }

      if (editingItem.branch_type === "Branch" && !editingItem.branch_number) {
        alert("กรุณากรอกหมายเลขสาขา (ต้องเป็นตัวเลข 3 หลัก)");
        return;
      }

      // เพิ่มการตรวจสอบ email
      if (editingItem.email && editingItem.email.trim() !== "") {
        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        if (!emailRegex.test(editingItem.email)) {
          alert("รูปแบบอีเมลไม่ถูกต้อง");
          return;
        }
      }

      try {
        if (editingItem.code) {
          const { data: existingCode } = await supabase
            .from("customers")
            .select("id")
            .eq("code", editingItem.code.toUpperCase()) // แปลงเป็นตัวใหญ่ก่อนเช็ค
            .eq("active", true)
            .neq("id", editingItem.id);

          if (existingCode && existingCode.length > 0) {
            alert("รหัสลูกค้านี้มีอยู่ในระบบแล้ว");
            return;
          }
        }

        // แก้ไขส่วน update - เปลี่ยนจาก address เป็น address_line1, 2, 3 และแปลงเป็นตัวพิมพ์ใหญ่
        const { error } = await supabase
          .from("customers")
          .update({
            name: editingItem.name ? editingItem.name.toUpperCase() : null,
            code: editingItem.code ? editingItem.code.toUpperCase() : null,
            email: editingItem.email ? editingItem.email.toLowerCase() : null, // email เป็นตัวเล็ก
            address_line1: editingItem.address_line1
              ? editingItem.address_line1.toUpperCase()
              : null,
            address_line2: editingItem.address_line2
              ? editingItem.address_line2.toUpperCase()
              : null,
            address_line3: editingItem.address_line3
              ? editingItem.address_line3.toUpperCase()
              : null,
            id_number: editingItem.id_number || null, // ไม่แปลง
            phone: editingItem.phone ? editingItem.phone.toUpperCase() : null,
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
      // ส่วน supplier ไม่เปลี่ยน - คงเดิม
      if (
        !editingItem.code.trim() ||
        !editingItem.name.trim() ||
        !editingItem.type
      ) {
        alert("กรุณากรอกข้อมูลให้ครบถ้วน");
        return;
      }

      if (editingItem.numeric_code && editingItem.numeric_code.length !== 3) {
        alert("รหัสตัวเลขต้องเป็นตัวเลข 3 ตัว");
        return;
      }

      let category = "supplier-other";

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
      email: "", // เพิ่มบรรทัดนี้
      address_line1: "", // เพิ่มบรรทัดนี้
      address_line2: "", // เพิ่มบรรทัดนี้
      address_line3: "", // เพิ่มบรรทัดนี้
      // ลบ address: "", ออก
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

      // เพิ่มการตรวจสอบ address_line1
      if (!newItem.address_line1 || !newItem.address_line1.trim()) {
        alert("กรุณากรอกที่อยู่บรรทัดที่ 1");
        return;
      }

      if (
        newItem.code &&
        (newItem.code.length < 3 || newItem.code.length > 5)
      ) {
        alert("รหัสลูกค้าต้องเป็นตัวอักษร 3-5 ตัว");
        return;
      }

      if (newItem.branch_type === "Branch" && !newItem.branch_number) {
        alert("กรุณากรอกหมายเลขสาขา (ต้องเป็นตัวเลข 3 หลัก)");
        return;
      }

      // เพิ่มการตรวจสอบ email
      if (newItem.email && newItem.email.trim() !== "") {
        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        if (!emailRegex.test(newItem.email)) {
          alert("รูปแบบอีเมลไม่ถูกต้อง");
          return;
        }
      }

      try {
        if (newItem.code) {
          const { data: existingCode } = await supabase
            .from("customers")
            .select("id")
            .eq("code", newItem.code.toUpperCase()) // แปลงเป็นตัวใหญ่ก่อนเช็ค
            .eq("active", true);

          if (existingCode && existingCode.length > 0) {
            alert("รหัสลูกค้านี้มีอยู่ในระบบแล้ว");
            return;
          }
        }

        // แก้ไขส่วน insert - เปลี่ยนจาก address เป็น address_line1, 2, 3 และแปลงเป็นตัวพิมพ์ใหญ่
        const { error } = await supabase.from("customers").insert({
          name: newItem.name ? newItem.name.toUpperCase() : null,
          code: newItem.code ? newItem.code.toUpperCase() : null,
          email: newItem.email ? newItem.email.toLowerCase() : null, // email เป็นตัวเล็ก
          address_line1: newItem.address_line1
            ? newItem.address_line1.toUpperCase()
            : null,
          address_line2: newItem.address_line2
            ? newItem.address_line2.toUpperCase()
            : null,
          address_line3: newItem.address_line3
            ? newItem.address_line3.toUpperCase()
            : null,
          id_number: newItem.id_number || null, // ไม่แปลง
          phone: newItem.phone ? newItem.phone.toUpperCase() : null,
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
          email: "",
          address_line1: "",
          address_line2: "",
          address_line3: "",
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
      // ส่วน supplier ไม่เปลี่ยน - คงเดิม
      if (!newItem.code.trim() || !newItem.name.trim() || !newItem.type) {
        alert("กรุณากรอกข้อมูลให้ครบถ้วน");
        return;
      }

      if (newItem.numeric_code && newItem.numeric_code.length !== 3) {
        alert("รหัสตัวเลขต้องเป็นตัวเลข 3 ตัว");
        return;
      }

      let category = "supplier-other";

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

  const handleDeactivate = async (id) => {
    const confirmText =
      selectedCategory === "customer"
        ? "คุณต้องการยกเลิกการใช้งานข้อมูลลูกค้านี้ใช่หรือไม่?"
        : "คุณต้องการยกเลิกการใช้งานข้อมูลนี้ใช่หรือไม่?";

    if (window.confirm(confirmText)) {
      try {
        const table =
          selectedCategory === "customer" ? "customers" : "information";

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

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1); // รีเซ็ตหน้าเมื่อเรียงลำดับใหม่
  };

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
      white-space: normal;
      overflow: hidden;
    }
    .table-customer th:nth-child(1), .table-customer td:nth-child(1) {
      max-width: 80px;
    }
    .table-customer th:nth-child(2), .table-customer td:nth-child(2) {
      max-width: 200px;
    }
    .table-customer th:nth-child(3), .table-customer td:nth-child(3) {
      max-width: 100px;
    }
    .table-customer th:nth-child(4), .table-customer td:nth-child(4) {
      max-width: 80px;
    }
    .table-customer th:nth-child(5), .table-customer td:nth-child(5) {
      max-width: 80px;
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
              <div className="flex flex-col gap-4 mb-4">
                {/* Header และปุ่มเพิ่มข้อมูล */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-xl font-semibold">
                    {
                      categories.find((cat) => cat.id === selectedCategory)
                        ?.label
                    }
                  </h2>
                  <button
                    onClick={handleAddNew}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-md flex items-center"
                    disabled={addingNew}
                  >
                    <Plus size={18} className="mr-1" />
                    เพิ่มข้อมูลใหม่
                  </button>
                </div>

                {/* แถบค้นหาและ filter */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* ช่องค้นหา */}
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="ค้นหา..."
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                    />
                  </div>

                  {/* Filter สำหรับ Supplier */}
                  {selectedCategory === "supplier" && (
                    <div className="flex items-center gap-2">
                      <Filter size={16} className="text-gray-400" />
                      <select
                        value={selectedSupplierType}
                        onChange={(e) =>
                          handleSupplierTypeChange(e.target.value)
                        }
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        {supplierTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* แสดงจำนวนข้อมูลและหน้าปัจจุบัน */}
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <div>
                    แสดง {(currentPage - 1) * itemsPerPage + 1} -{" "}
                    {Math.min(currentPage * itemsPerPage, totalItems)} จาก{" "}
                    {totalItems} รายการ
                    {selectedCategory === "supplier" &&
                      selectedSupplierType !== "all" && (
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          ประเภท:{" "}
                          {
                            supplierTypes.find(
                              (t) => t.value === selectedSupplierType
                            )?.label
                          }
                        </span>
                      )}
                  </div>
                  <div>
                    หน้า {currentPage} จาก {totalPages}
                  </div>
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
                    data={informationData}
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

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center mt-6 gap-2">
                      {/* ปุ่มหน้าก่อนหน้า */}
                      <button
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                        className={`p-2 rounded-md ${
                          currentPage === 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                        }`}
                      >
                        <ChevronLeft size={16} />
                      </button>

                      {/* หมายเลขหน้า */}
                      {getPageNumbers().map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 rounded-md ${
                            currentPage === pageNum
                              ? "bg-blue-500 text-white"
                              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}

                      {/* ปุ่มหน้าถัดไป */}
                      <button
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded-md ${
                          currentPage === totalPages
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                        }`}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
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
