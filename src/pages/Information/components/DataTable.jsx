import React, { useState } from "react";
import { Edit, Trash, Save, X, ChevronsUpDown } from "lucide-react";
import SupplierForm from "./SupplierForm";

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
  handleSaveEdit, // 👈 รับจาก parent
  onSaveCustomer, // 👈 เพิ่ม callback สำหรับ Customer
  onSaveSupplier, // 👈 เพิ่ม callback สำหรับ Supplier
}) => {
  const [showModal, setShowModal] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [currentEditSupplier, setCurrentEditSupplier] = useState(null);

  // Helper function to format address from multiple lines
  const formatFullAddress = (item) => {
    const addressParts = [
      item.address_line1,
      item.address_line2,
      item.address_line3,
    ].filter((part) => part && part.trim() !== "");

    return addressParts.length > 0 ? addressParts.join(" ") : "-";
  };

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

  // สำหรับแก้ไขข้อมูลลูกค้า
  const handleOpenEditModal = (item) => {
    setCurrentEditItem({ ...item });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentEditItem(null);
  };

  // สำหรับแก้ไขข้อมูล Supplier
  const handleOpenSupplierEditModal = (item) => {
    setCurrentEditSupplier({ ...item });
    setShowSupplierModal(true);
  };

  const handleCloseSupplierModal = () => {
    setShowSupplierModal(false);
    setCurrentEditSupplier(null);
  };

  // ✅ ใช้ callback จาก parent แทน Supabase
  const handleSaveSupplierEdit = async () => {
    if (
      !currentEditSupplier.code.trim() ||
      !currentEditSupplier.name.trim() ||
      !currentEditSupplier.type
    ) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    // ตรวจสอบรหัสตัวเลข (ถ้ามี)
    if (
      currentEditSupplier.numeric_code &&
      currentEditSupplier.numeric_code.length !== 3
    ) {
      alert("รหัสตัวเลขต้องเป็นตัวเลข 3 ตัว");
      return;
    }

    try {
      // 👈 เรียก callback แทน Supabase
      await onSaveSupplier(currentEditSupplier.id, currentEditSupplier);
      handleCloseSupplierModal();
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการบันทึก: " + err.message);
    }
  };

  const handleSupplierInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "numeric_code") {
      // จำกัดให้เป็นตัวเลข 3 ตัว
      const updatedValue = value.replace(/\D/g, "").substring(0, 5);
      setCurrentEditSupplier({ ...currentEditSupplier, [name]: updatedValue });
    } else {
      setCurrentEditSupplier({ ...currentEditSupplier, [name]: value });
    }
  };

  // ✅ ใช้ callback จาก parent แทน Supabase
  const handleSaveModalEdit = async () => {
    if (!currentEditItem.name.trim()) {
      alert("กรุณากรอกชื่อลูกค้า");
      return;
    }

    if (
      !currentEditItem.address_line1 ||
      !currentEditItem.address_line1.trim()
    ) {
      alert("กรุณากรอกที่อยู่บรรทัดที่ 1");
      return;
    }

    if (
      currentEditItem.branch_type === "Branch" &&
      !currentEditItem.branch_number
    ) {
      alert("กรุณากรอกหมายเลขสาขา (ต้องเป็นตัวเลข 4 หลัก)");
      return;
    }

    // ตรวจสอบรหัสลูกค้า
    if (
      currentEditItem.code &&
      (currentEditItem.code.length < 3 || currentEditItem.code.length > 5)
    ) {
      alert("รหัสลูกค้าต้องเป็นตัวอักษร 3-5 ตัว");
      return;
    }

    // ตรวจสอบรูปแบบอีเมล
    if (currentEditItem.email && currentEditItem.email.trim() !== "") {
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(currentEditItem.email)) {
        alert("รูปแบบอีเมลไม่ถูกต้อง");
        return;
      }
    }

    try {
      // 👈 เรียก callback แทน Supabase
      await onSaveCustomer(currentEditItem.id, currentEditItem);
      handleCloseModal();
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการบันทึก: " + err.message);
    }
  };

  const handleModalInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "code") {
      // จำกัดให้เป็นตัวอักษร 3-5 ตัว
      const updatedValue = value.toUpperCase().substring(0, 5);
      setCurrentEditItem({ ...currentEditItem, [name]: updatedValue });
    } else if (name === "numeric_code") {
      // จำกัดให้เป็นตัวเลข 3 ตัว
      const updatedValue = value.replace(/\D/g, "").substring(0, 4);
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
      {/* Modal สำหรับการแก้ไขลูกค้า */}
      {showModal && currentEditItem && (
        <div className="fixed inset-0 modal-backdrop bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto information-modal">
            <h3 className="text-lg font-semibold mb-4">แก้ไขข้อมูลลูกค้า</h3>
            <div className="space-y-4">
              {/* ชื่อลูกค้า */}
              <div className="grid grid-cols-5 gap-2">
                <div className="col-span-1">
                  <label className="block text-sm font-medium mb-1">
                    รหัสลูกค้า
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={currentEditItem.code || ""}
                    onChange={handleModalInputChange}
                    maxLength={5}
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200 focus:border-blue-500"
                    placeholder="3-5 ตัวอักษร"
                  />
                </div>
                <div className="col-span-4">
                  <label className="block text-sm font-medium mb-1">
                    ชื่อลูกค้า <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={currentEditItem.name || ""}
                    onChange={handleModalInputChange}
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* รหัสลูกค้า และ อีเมล */}
              <div className="grid grid-cols-2 gap-4">
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
                    อีเมล
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={currentEditItem.email || ""}
                    onChange={handleModalInputChange}
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200 focus:border-blue-500"
                    placeholder="example@email.com"
                  />
                </div>
              </div>

              {/* ที่อยู่บรรทัดที่ 1 */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  ที่อยู่บรรทัดที่ 1 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address_line1"
                  value={currentEditItem.address_line1 || ""}
                  onChange={handleModalInputChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200 focus:border-blue-500"
                  placeholder="บ้านเลขที่ ซอย ถนน"
                />
              </div>

              {/* ที่อยู่บรรทัดที่ 2 */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  ที่อยู่บรรทัดที่ 2
                </label>
                <input
                  type="text"
                  name="address_line2"
                  value={currentEditItem.address_line2 || ""}
                  onChange={handleModalInputChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200 focus:border-blue-500"
                  placeholder="ตำบล/แขวง อำเภอ/เขต"
                />
              </div>

              {/* ที่อยู่บรรทัดที่ 3 */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  ที่อยู่บรรทัดที่ 3
                </label>
                <input
                  type="text"
                  name="address_line3"
                  value={currentEditItem.address_line3 || ""}
                  onChange={handleModalInputChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200 focus:border-blue-500"
                  placeholder="จังหวัด รหัสไปรษณีย์"
                />
              </div>

              {/* เลขผู้เสียภาษี และ โทรศัพท์ */}
              <div className="grid grid-cols-7 gap-2">
                <div className="col-span-2">
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
                          .substring(0, 4);
                        setCurrentEditItem({
                          ...currentEditItem,
                          branch_number: value,
                        });
                      }}
                      placeholder="หมายเลขสาขา"
                      maxLength={4}
                      className="mt-2 w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200 focus:border-blue-500"
                    />
                  )}
                </div>

                <div className="col-span-4">
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
                <div className="col-span-1">
                  <label className="block text-sm font-medium mb-1">
                    เครดิต (วัน)
                  </label>
                  <input
                    type="number"
                    name="credit_days"
                    value={currentEditItem.credit_days || 0}
                    onChange={handleModalInputChange}
                    min="0"
                    className="w-full border text-center border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* ปุ่มบันทึก และ ยกเลิก */}
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

      {/* Modal สำหรับการแก้ไข Supplier */}
      {showSupplierModal && currentEditSupplier && (
        <div className="fixed inset-0 modal-backdrop bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md information-modal">
            <h3 className="text-lg font-semibold mb-4">
              แก้ไขข้อมูลซัพพลายเออร์
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {" "}
                <div className="col-span-1">
                  <label className="block text-sm font-medium mb-1">
                    รหัสตัวเลข (3 ตัว)
                  </label>
                  <input
                    type="text"
                    name="numeric_code"
                    value={currentEditSupplier.numeric_code || ""}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .substring(0, 3);
                      handleSupplierInputChange({
                        target: { name: "numeric_code", value },
                      });
                    }}
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200 focus:border-blue-500"
                    placeholder="เช่น 235"
                    maxLength={3}
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium mb-1">
                    รหัส <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={currentEditSupplier.code || ""}
                    onChange={handleSupplierInputChange}
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  ชื่อ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={currentEditSupplier.name || ""}
                  onChange={handleSupplierInputChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  ประเภท <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={currentEditSupplier.type || ""}
                  onChange={handleSupplierInputChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200 focus:border-blue-500"
                >
                  <option value="">เลือกประเภท</option>
                  <option value="Airline">Airline</option>
                  <option value="Voucher">Voucher</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={handleCloseSupplierModal}
                className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              >
                <X size={16} className="mr-1 inline" /> ยกเลิก
              </button>
              <button
                onClick={handleSaveSupplierEdit}
                className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                <Save size={16} className="mr-1 inline" /> บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      <table
        className={`min-w-full divide-y divide-gray-200 information-table ${
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
              // สำหรับ Supplier
              <>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("numeric_code")}
                >
                  <div className="flex items-center">
                    รหัสตัวเลข
                    <ChevronsUpDown size={14} className="ml-1" />
                  </div>
                </th>
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
                    ชื่อ
                    <ChevronsUpDown size={14} className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("type")}
                >
                  <div className="flex items-center">
                    ประเภท
                    <ChevronsUpDown size={14} className="ml-1" />
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                colSpan={selectedCategory === "customer" ? 5 : 5}
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
                      {(item.id_number ||
                        item.phone ||
                        item.email ||
                        item.address_line1) && (
                        <div className="text-sm text-gray-600 mt-1">
                          {item.email && (
                            <div className="email">อีเมล: {item.email}</div>
                          )}
                          {item.id_number && (
                            <div>เลขผู้เสียภาษี: {item.id_number}</div>
                          )}
                          {item.phone && <div>โทรศัพท์: {item.phone}</div>}
                          {item.address_line1 && (
                            <div className="truncate max-w-xs">
                              ที่อยู่: {formatFullAddress(item)}
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
                  // สำหรับ Supplier
                  <>
                    <td className="px-4 py-3">{item.numeric_code || "-"}</td>
                    <td className="px-4 py-3">{item.code || "-"}</td>
                    <td className="px-4 py-3">{item.name}</td>
                    <td className="px-4 py-3">{item.type || "-"}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenSupplierEditModal(item)}
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

export default DataTable;
