// SaleHeader.jsx
import React from "react";
import { FiEdit } from "react-icons/fi";

const SaleHeader = ({ formData, setFormData, section }) => {
  if (section === "customer") {
    return (
      <>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Customer Name
          </label>
          <div className="relative">
            <select
              className="w-full border rounded-md p-2 pr-10 appearance-none"
              value={formData.customer || ""}
              onChange={(e) =>
                setFormData({ ...formData, customer: e.target.value })
              }
            >
              <option value="">เลือกลูกค้า</option>
              <option value="customer1">ลูกค้า 1</option>
              <option value="customer2">ลูกค้า 2</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium mb-1">
              Contact Details
            </label>
            <button className="text-blue-500 flex items-center text-sm">
              <FiEdit className="mr-1" /> แก้ไข
            </button>
          </div>
          <textarea
            className="w-full border rounded-md p-2 h-24"
            placeholder="ที่อยู่และข้อมูลติดต่อ"
            value={formData.contactDetails || ""}
            onChange={(e) =>
              setFormData({ ...formData, contactDetails: e.target.value })
            }
          ></textarea>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              className="w-full border rounded-md p-2"
              placeholder="เบอร์โทรศัพท์"
              value={formData.phone || ""}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>
          <div>
            <input
              type="text"
              className="w-full border rounded-md p-2"
              placeholder="เลขประจำตัว/พาสปอร์ต"
              value={formData.id || ""}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
            />
          </div>
        </div>
      </>
    );
  }

  if (section === "price") {
    return (
      <>
        <div className="bg-blue-50 p-4 rounded-md mb-4">
          <div className="text-sm text-gray-600 mb-1">ราคารวมทั้งสิ้น</div>
          <div className="text-2xl font-bold text-blue-600">0.00</div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">วันที่:</label>
            <input
              type="date"
              className="w-full border rounded-md p-2"
              value={formData.date || ""}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              เครดิต (วัน):
            </label>
            <select
              className="w-full border rounded-md p-2"
              value={formData.creditDays || "0"}
              onChange={(e) =>
                setFormData({ ...formData, creditDays: e.target.value })
              }
            >
              <option value="0">0</option>
              <option value="7">7</option>
              <option value="15">15</option>
              <option value="30">30</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              วันครบกำหนด:
            </label>
            <input
              type="date"
              className="w-full border rounded-md p-2 bg-gray-100"
              disabled
              value={formData.dueDate || ""}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              ชื่อผู้บันทึก:
            </label>
            <input
              type="text"
              className="w-full border rounded-md p-2"
              placeholder="ชื่อผู้บันทึก"
              value={formData.salesName || ""}
              onChange={(e) =>
                setFormData({ ...formData, salesName: e.target.value })
              }
            />
          </div>
        </div>
      </>
    );
  }

  return null;
};

export default SaleHeader;
