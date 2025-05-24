import React from "react";

const CustomerForm = ({ item, handleInputChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          ชื่อ <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={item.name}
          onChange={handleInputChange}
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
          value={item.code}
          onChange={handleInputChange}
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
          value={item.address}
          onChange={handleInputChange}
          className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200 focus:border-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">เลขผู้เสียภาษี</label>
        <input
          type="text"
          name="id_number"
          value={item.id_number}
          onChange={handleInputChange}
          className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200 focus:border-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">เบอร์โทรศัพท์</label>
        <input
          type="text"
          name="phone"
          value={item.phone}
          onChange={handleInputChange}
          className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200 focus:border-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">สาขา</label>
        <select
          name="branch_type"
          value={item.branch_type || "Head Office"}
          onChange={handleInputChange}
          className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200 focus:border-blue-500"
        >
          <option value="Head Office">Head Office</option>
          <option value="Branch">Branch</option>
        </select>
        {item.branch_type === "Branch" && (
          <div className="mt-2">
            <label className="block text-sm font-medium mb-1">
              หมายเลขสาขา <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="branch_number"
              value={item.branch_number || ""}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").substring(0, 3);
                handleInputChange({
                  target: { name: "branch_number", value },
                });
              }}
              placeholder="เฉพาะตัวเลข 3 หลัก"
              maxLength={3}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200 focus:border-blue-500"
            />
          </div>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">เครดิต (วัน)</label>
        <input
          type="number"
          name="credit_days"
          value={item.credit_days || 0}
          onChange={handleInputChange}
          min="0"
          className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200 focus:border-blue-500"
        />
      </div>
    </div>
  );
};

export default CustomerForm;
