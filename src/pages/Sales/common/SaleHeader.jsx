// SaleHeader.jsx
import React from "react";
import { FiEdit } from "react-icons/fi";

const SaleHeader = ({ formData, setFormData, section }) => {
  if (section === "customer") {
    return (
      <>
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">
            Customer Name
          </label>
          <div className="relative">
            <input
              type="text"
              className="w-full border border-gray-400 rounded-md p-2"
            ></input>
          </div>
        </div>

        <div className="mb-2">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium mb-1">
              Contact Details
            </label>
            <button className="text-blue-500 flex items-center text-sm">
              <FiEdit className="mr-1" /> แก้ไข
            </button>
          </div>
          <textarea
            className="w-full border border-gray-400 rounded-md p-2 h-24"
            placeholder="ที่อยู่และข้อมูลติดต่อ"
            value={
              formData.contactDetails ||
              "88 หมู่ 7 ต.ไสไทย อ.เมือง จ.กระบี่ 89111"
            }
            disabled
            onChange={(e) =>
              setFormData({ ...formData, contactDetails: e.target.value })
            }
          ></textarea>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <input
              type="text"
              className="w-full border border-gray-400 rounded-md p-2"
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
              className="w-full border border-gray-400 rounded-md p-2"
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
        <div className="bg-blue-50 p-4 rounded-md mb-2">
          <div className="text-sm text-gray-600 mb-1">ราคารวมทั้งสิ้น</div>
          <div className="text-2xl font-bold mb-1 text-blue-600">0.00</div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">วันที่:</label>
            <input
              type="date"
              className="w-full border border-gray-400 rounded-md p-2"
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
              className="w-full border border-gray-400 rounded-md p-2"
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
              className="w-full border border-gray-400  rounded-md p-2"
              value={formData.date || ""}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              ชื่อผู้บันทึก:
            </label>
            <input
              type="text"
              className="w-full border border-gray-400 rounded-md p-2"
              placeholder="ชื่อผู้บันทึก"
              value={formData.salesName || "นายชลันธร มานพ"}
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
