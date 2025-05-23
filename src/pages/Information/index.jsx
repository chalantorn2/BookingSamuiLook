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
// ส่วนของ DataTable Component ที่ปรับปรุงสำหรับตาราง Customer

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
  const [showModal, setShowModal] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null);

  const formatBranchInfo = (item) => {
    if (item.branch_type === "Branch" && item.branch_number) {
      return (
        <div className="flex items-center">
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            Branch {item.branch_number}
          </span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center">
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Head Office
          </span>
        </div>
      );
    }
  };

  const formatCredit = (days) => {
    if (!days || parseInt(days) === 0) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          ไม่มีเครดิต
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        {days} วัน
      </span>
    );
  };

  const handleOpenEditModal = (item) => {
    setCurrentEditItem({ ...item });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentEditItem(null);
  };

  const handleSaveModalEdit = async () => {
    if (!currentEditItem.name.trim()) {
      alert("กรุณากรอกชื่อลูกค้า");
      return;
    }
    if (
      currentEditItem.branch_type === "Branch" &&
      !currentEditItem.branch_number
    ) {
      alert("กรุณากรอกหมายเลขสาขา (ต้องเป็นตัวเลข 3 หลัก)");
      return;
    }

    // ตรวจสอบรหัสลูกค้า
    if (currentEditItem.code && currentEditItem.code.length !== 3) {
      alert("รหัสลูกค้าต้องเป็นตัวอักษร 3 ตัว");
      return;
    }

    try {
      // ตรวจสอบว่ามีรหัสซ้ำหรือไม่ (ถ้ามีการกรอกรหัส)
      if (currentEditItem.code) {
        const { data: existingCode } = await supabase
          .from("customers")
          .select("id")
          .eq("code", currentEditItem.code)
          .eq("active", true)
          .neq("id", currentEditItem.id);

        if (existingCode && existingCode.length > 0) {
          alert("รหัสลูกค้านี้มีอยู่ในระบบแล้ว");
          return;
        }
      }

      const { error } = await supabase
        .from("customers")
        .update({
          name: currentEditItem.name,
          code: currentEditItem.code || null,
          address: currentEditItem.address || null,
          id_number: currentEditItem.id_number || null,
          phone: currentEditItem.phone || null,
          branch_type: currentEditItem.branch_type || "Head Office",
          branch_number:
            currentEditItem.branch_type === "Branch"
              ? currentEditItem.branch_number
              : null,
          credit_days: currentEditItem.credit_days || 0,
        })
        .eq("id", currentEditItem.id);

      if (error) throw error;
      handleCloseModal();
      window.location.reload(); // รีเฟรชข้อมูลหลังบันทึก
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการบันทึก: " + err.message);
    }
  };

  const handleModalInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "code") {
      // จำกัดให้เป็นตัวอักษร 3 ตัว
      const updatedValue = value.toUpperCase().substring(0, 3);
      setCurrentEditItem({ ...currentEditItem, [name]: updatedValue });
    } else if (name === "branch_type" && value === "Head Office") {
      setCurrentEditItem({
        ...currentEditItem,
        [name]: value,
        branch_number: "",
      });
    } else {
      setCurrentEditItem({ ...currentEditItem, [name]: value });
    }
  };

  return (
    <div className="border rounded-md overflow-hidden">
      {/* Modal สำหรับการแก้ไข */}
      {showModal && currentEditItem && (
        <div className="fixed inset-0 modal-backdrop bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">แก้ไขข้อมูลลูกค้า</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  ชื่อลูกค้า
                </label>
                <input
                  type="text"
                  name="name"
                  value={currentEditItem.name}
                  onChange={handleModalInputChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  รหัสลูกค้า (3 ตัวอักษร)
                </label>
                <input
                  type="text"
                  name="code"
                  value={currentEditItem.code || ""}
                  onChange={handleModalInputChange}
                  maxLength={3}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">สาขา</label>
                <select
                  name="branch_type"
                  value={currentEditItem.branch_type || "Head Office"}
                  onChange={handleModalInputChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200 focus:border-blue-500"
                >
                  <option value="Head Office">Head Office</option>
                  <option value="Branch">Branch</option>
                </select>
                {currentEditItem.branch_type === "Branch" && (
                  <input
                    type="text"
                    name="branch_number"
                    value={currentEditItem.branch_number || ""}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .substring(0, 3);
                      setCurrentEditItem({
                        ...currentEditItem,
                        branch_number: value,
                      });
                    }}
                    placeholder="หมายเลขสาขา"
                    maxLength={3}
                    className="mt-2 w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200 focus:border-blue-500"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  เครดิต (วัน)
                </label>
                <input
                  type="number"
                  name="credit_days"
                  value={currentEditItem.credit_days || 0}
                  onChange={handleModalInputChange}
                  min="0"
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  เลขผู้เสียภาษี
                </label>
                <input
                  type="text"
                  name="id_number"
                  value={currentEditItem.id_number || ""}
                  onChange={handleModalInputChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  โทรศัพท์
                </label>
                <input
                  type="text"
                  name="phone"
                  value={currentEditItem.phone || ""}
                  onChange={handleModalInputChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  ที่อยู่
                </label>
                <textarea
                  name="address"
                  value={currentEditItem.address || ""}
                  onChange={handleModalInputChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={handleCloseModal}
                className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              >
                <X size={16} className="mr-1 inline" /> ยกเลิก
              </button>
              <button
                onClick={handleSaveModalEdit}
                className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                <Save size={16} className="mr-1 inline" /> บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

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
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("code")}
                >
                  <div className="flex items-center">
                    รหัส
                    <ChevronsUpDown size={14} className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center">
                    ชื่อลูกค้า
                    <ChevronsUpDown size={14} className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("branch_type")}
                >
                  <div className="flex items-center">
                    สาขา
                    <ChevronsUpDown size={14} className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("credit_days")}
                >
                  <div className="flex items-center">
                    เครดิต
                    <ChevronsUpDown size={14} className="ml-1" />
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  จัดการ
                </th>
              </>
            ) : (
              // คงส่วนเดิมของ Supplier ไว้
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
                  onClick={() => handleSort("type")}
                >
                  <div className="flex items-center">
                    ประเภท
                    <ChevronsUpDown size={14} className="ml-1" />
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  จัดการ
                </th>
              </>
            )}
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
              <tr key={item.id} className="hover:bg-gray-50">
                {selectedCategory === "customer" ? (
                  <>
                    <td className="px-4 py-3">{item.code || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {item.name}
                      </div>
                      {(item.id_number || item.phone || item.address) && (
                        <div className="text-sm text-gray-600 mt-1">
                          {item.id_number && (
                            <div>เลขผู้เสียภาษี: {item.id_number}</div>
                          )}
                          {item.phone && <div>โทรศัพท์: {item.phone}</div>}
                          {item.address && (
                            <div className="truncate max-w-xs">
                              ที่อยู่: {item.address}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">{formatBranchInfo(item)}</td>
                    <td className="px-4 py-3">
                      {formatCredit(item.credit_days)}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="text-blue-500 hover:text-blue-700 mr-3"
                        title="แก้ไข"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeactivate(item.id)}
                        className="text-red-500 hover:text-red-700"
                        title="ยกเลิกการใช้งาน"
                      >
                        <Trash size={18} />
                      </button>
                    </td>
                  </>
                ) : (
                  // คงส่วนเดิมของ Supplier ไว้
                  <>
                    <td className="px-6 py-4">{item.code}</td>
                    <td className="px-6 py-4">{item.name}</td>
                    <td className="px-6 py-4">{item.type || "-"}</td>
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
                        title="ยกเลิกการใช้งาน"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <label className="block text-sm font-medium mb-1">
              รหัสลูกค้า (3 ตัวอักษร)
            </label>
            <input
              type="text"
              name="code"
              value={newItem.code}
              onChange={(e) => {
                const value = e.target.value.toUpperCase().substring(0, 3);
                handleInputChange({ target: { name: "code", value } }, "new");
              }}
              maxLength={3}
              placeholder="รหัส 3 ตัวอักษร"
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
              เลขผู้เสียภาษี
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
          <div>
            <label className="block text-sm font-medium mb-1">สาขา</label>
            <select
              name="branch_type"
              value={newItem.branch_type || "Head Office"}
              onChange={(e) => handleInputChange(e, "new")}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200 focus:border-blue-500"
            >
              <option value="Head Office">Head Office</option>
              <option value="Branch">Branch</option>
            </select>
            {newItem.branch_type === "Branch" && (
              <div className="mt-2">
                <label className="block text-sm font-medium mb-1">
                  หมายเลขสาขา <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="branch_number"
                  value={newItem.branch_number || ""}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\D/g, "")
                      .substring(0, 3);
                    handleInputChange(
                      {
                        target: { name: "branch_number", value },
                      },
                      "new"
                    );
                  }}
                  placeholder="เฉพาะตัวเลข 3 หลัก"
                  maxLength={3}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200 focus:border-blue-500"
                />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              เครดิต (วัน)
            </label>
            <input
              type="number"
              name="credit_days"
              value={newItem.credit_days || 0}
              onChange={(e) => handleInputChange(e, "new")}
              min="0"
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
            <label className="block text-sm font-medium mb-1">
              ประเภท <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              value={newItem.type}
              onChange={(e) => handleInputChange(e, "new")}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200 focus:border-blue-500"
            >
              <option value="">เลือกประเภท</option>
              <option value="Airline">Airline</option>
              <option value="Voucher">Voucher</option>
              <option value="Other">Other</option>
            </select>
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
          active: true,
        });
        if (error) throw error;
        await loadInformationData();
        setAddingNew(false);
        setNewItem({ code: "", name: "", type: "" });
      } catch (err) {
        setError("เกิดข้อผิดพลาดในการเพิ่มข้อมูล: " + err.message);
      }
    }
  };

  // ฟังก์ชัน handleDeactivate ที่ปรับปรุงใหม่
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
