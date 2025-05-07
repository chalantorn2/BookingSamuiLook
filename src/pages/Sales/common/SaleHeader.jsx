import React, { useState, useEffect } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { getCustomers } from "../../../services/customerService";
import { getUsers } from "../../../services/userService";
import { formatCurrency } from "../../../utils/helpers";

const SaleHeader = ({
  formData,
  setFormData,
  section,
  selectedCustomer,
  setSelectedCustomer,
  totalAmount = 0,
  vatPercent = 0,
  subtotalAmount = 0,
  vatAmount = 0,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  const handleSearchCustomer = async (term) => {
    setSearchTerm(term);
    if (term.length >= 2) {
      const results = await getCustomers(term, 5);
      setSearchResults(results);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const selectCustomer = async (customer) => {
    if (!customer.id) {
      console.log("Creating new customer:", customer);
      const { success, customerId, error } = await createCustomer({
        name: customer.name,
        address: customer.address || "",
        id_number: customer.id_number || customer.idNumber || "",
      });

      if (success) {
        console.log("Customer created successfully with ID:", customerId);
        customer.id = customerId;
      } else {
        console.error("Failed to create customer:", error);
      }
    }

    setSelectedCustomer(customer);
    setFormData({
      ...formData,
      customer: customer.name,
      contactDetails: customer.address || "",
      phone: customer.phone || "",
      id: customer.id_number || "",
      date: today,
      dueDate: today,
      creditDays: "0",
    });
    setShowResults(false);
  };

  const formatCurrencyLocal = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return "0.00";
    return parseFloat(amount).toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatPhoneNumber = (value) => {
    // ลบตัวอักษรที่ไม่ใช่ตัวเลขออก
    const digits = value.replace(/\D/g, "");
    // จำกัดความยาวไม่เกิน 10 หลัก (เบอร์โทรไทย)
    const limitedDigits = digits.slice(0, 10);

    // จัดรูปแบบเบอร์โทรไทย: 0XX-XXX-XXXX
    if (limitedDigits.length) {
      if (limitedDigits.length <= 3) return limitedDigits;
      if (limitedDigits.length <= 6)
        return `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3)}`;
      return `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(
        3,
        6
      )}-${limitedDigits.slice(6, 10)}`;
    }

    return limitedDigits;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };

  useEffect(() => {
    const fetchUser = async () => {
      const users = await getUsers();
      if (users.length > 0 && !formData.salesName) {
        setFormData((prev) => ({
          ...prev,
          salesName: users[0].username,
        }));
      }
    };

    fetchUser();
  }, []);

  if (section === "customer") {
    return (
      <>
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1 after:content-['*'] after:ml-0.5 after:text-red-500">
            Customer Name
          </label>
          <div className="relative">
            <input
              type="text"
              className="w-full border border-gray-400 rounded-md p-2"
              value={formData.customer}
              onChange={(e) => {
                setFormData({ ...formData, customer: e.target.value });
                handleSearchCustomer(e.target.value);
              }}
              required
            />
            {showResults && searchResults.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border">
                <ul>
                  {searchResults.map((customer) => (
                    <li
                      key={customer.id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => selectCustomer(customer)}
                    >
                      {customer.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="mb-2">
          <label className="block text-sm font-medium mb-1 after:content-['*'] after:ml-0.5 after:text-red-500">
            Contact Details
          </label>
          <textarea
            className="w-full border border-gray-400 rounded-md p-2 h-24"
            placeholder="ที่อยู่และข้อมูลติดต่อ"
            value={formData.contactDetails}
            onChange={(e) =>
              setFormData({ ...formData, contactDetails: e.target.value })
            }
            required
          ></textarea>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1">
              Phone Number
            </label>
            <input
              type="text"
              className="w-full border border-gray-400 rounded-md p-2"
              placeholder="เบอร์โทรศัพท์"
              value={formData.phone}
              onChange={handlePhoneChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              ID/Passport
            </label>
            <input
              type="text"
              className="w-full border border-gray-400 rounded-md p-2"
              placeholder="เลขประจำตัว/พาสปอร์ต"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
            />
          </div>
        </div>
      </>
    );
  }

  if (section === "price") {
    const calculateDueDate = (baseDate, creditDays) => {
      if (!baseDate) return "";
      const date = new Date(baseDate);
      date.setDate(date.getDate() + parseInt(creditDays || 0, 10));
      return date.toISOString().split("T")[0];
    };

    const calculateCreditDays = (baseDate, dueDate) => {
      if (!baseDate || !dueDate) return "0";
      const d1 = new Date(baseDate);
      const d2 = new Date(dueDate);
      const diffTime = d2 - d1;
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      return diffDays.toString();
    };

    return (
      <>
        <div className="bg-blue-50 p-4 rounded-md mb-2">
          <div className="text-sm text-gray-600 mb-1">ราคารวมทั้งสิ้น</div>
          <div className="text-2xl font-bold mb-1 text-blue-600">
            {formatCurrencyLocal(totalAmount)}
          </div>
          <div className="text-xs text-gray-500">
            ยอดก่อนภาษี: {formatCurrencyLocal(subtotalAmount)} | ภาษี{" "}
            {vatPercent}%:{" "}
            {formatCurrencyLocal((subtotalAmount * vatPercent) / 100)}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 after:content-['*'] after:ml-0.5 after:text-red-500">
              วันที่:
            </label>
            <input
              type="date"
              className="w-full border border-gray-400 rounded-md p-2"
              value={formData.date || ""}
              onChange={(e) => {
                const newDate = e.target.value;
                const newDueDate = calculateDueDate(
                  newDate,
                  formData.creditDays
                );
                setFormData({
                  ...formData,
                  date: newDate,
                  dueDate: newDueDate,
                });
              }}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 after:content-['*'] after:ml-0.5 after:text-red-500">
              เครดิต (วัน):
            </label>
            <input
              type="number"
              className="w-full border border-gray-400 rounded-md p-2"
              value={formData.creditDays || "0"}
              onChange={(e) => {
                const credit = e.target.value;
                const newDueDate = calculateDueDate(formData.date, credit);
                setFormData({
                  ...formData,
                  creditDays: credit,
                  dueDate: newDueDate,
                });
              }}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block font-medium mb-1 after:content-['*'] after:ml-0.5 after:text-red-500">
              วันครบกำหนด:
            </label>
            <input
              type="date"
              className="w-full border border-gray-400 rounded-md p-2"
              value={formData.dueDate || ""}
              onChange={(e) => {
                const newDueDate = e.target.value;
                const newCreditDays = calculateCreditDays(
                  formData.date,
                  newDueDate
                );
                setFormData({
                  ...formData,
                  dueDate: newDueDate,
                  creditDays: newCreditDays,
                });
              }}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 after:content-['*'] after:ml-0.5 after:text-red-500">
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
              required
            />
          </div>
        </div>
      </>
    );
  }

  return null;
};

export default SaleHeader;
