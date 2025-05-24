import React from "react";

const SupplierForm = ({ item, handleInputChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          รหัสตัวเลข (3 ตัว)
        </label>
        <input
          type="text"
          name="numeric_code"
          value={item.numeric_code || ""}
          onChange={(e) => {
            // จำกัดให้เป็นตัวเลข 3 ตัว
            const value = e.target.value.replace(/\D/g, "").substring(0, 3);
            handleInputChange({
              target: { name: "numeric_code", value },
            });
          }}
          className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200 focus:border-blue-500"
          placeholder="เช่น 235"
          maxLength={3}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          รหัส <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="code"
          value={item.code}
          onChange={handleInputChange}
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
          value={item.name}
          onChange={handleInputChange}
          className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200 focus:border-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          ประเภท <span className="text-red-500">*</span>
        </label>
        <select
          name="type"
          value={item.type}
          onChange={handleInputChange}
          className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200 focus:border-blue-500"
        >
          <option value="">เลือกประเภท</option>
          <option value="Airline">Airline</option>
          <option value="Voucher">Voucher</option>
          <option value="Other">Other</option>
        </select>
      </div>
    </div>
  );
};

export default SupplierForm;
