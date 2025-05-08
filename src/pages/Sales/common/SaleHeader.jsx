import React, { useState, useEffect, useCallback } from "react";
import { FiX } from "react-icons/fi";
import { getCustomers } from "../../../services/customerService";
import { getUsers } from "../../../services/userService";
import SaleStyles from "../common/SaleStyles";
import { debounce } from "lodash";

const SaleHeader = ({
  formData,
  setFormData,
  section,
  selectedCustomer,
  setSelectedCustomer,
  totalAmount = 0,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const today = new Date().toISOString().split("T")[0];

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (term) => {
      if (term.length >= 1) {
        setIsLoading(true);
        setError(null);
        try {
          const results = await getCustomers(term, 5);
          setSearchResults(results);
          setShowResults(true);
        } catch (err) {
          setError("ไม่สามารถค้นหาลูกค้าได้ กรุณาลองใหม่");
        } finally {
          setIsLoading(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300),
    []
  );

  const handleSearchCustomer = (term) => {
    setSearchTerm(term);
    debouncedSearch(term);
  };

  const selectCustomer = (customer) => {
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
    setSearchTerm("");
    setShowResults(false);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setShowResults(false);
    setSearchResults([]);
    setSelectedCustomer(null);
    setFormData({
      ...formData,
      customer: "",
      contactDetails: "",
      phone: "",
      id: "",
    });
  };

  const formatCurrencyLocal = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return "0.00";
    return parseFloat(amount).toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, "");
    const limitedDigits = digits.slice(0, 10);
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
          <label className={SaleStyles.form.labelRequired}>Customer Name</label>
          <div className="relative">
            <input
              type="text"
              className={SaleStyles.form.input}
              value={formData.customer}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ ...formData, customer: value });
                handleSearchCustomer(value);
              }}
              required
              placeholder="ชื่อลูกค้า"
            />
            {formData.customer && (
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={clearSearch}
              >
                <FiX className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
            {showResults && (
              <div className="absolute z-20 mt-1 w-full bg-white shadow-lg rounded-md border max-h-60 overflow-y-auto">
                {isLoading ? (
                  <div className="px-4 py-2 text-gray-500">กำลังค้นหา...</div>
                ) : error ? (
                  <div className="px-4 py-2 text-red-500">{error}</div>
                ) : searchResults.length > 0 ? (
                  <ul>
                    {searchResults.map((customer) => (
                      <li
                        key={customer.id}
                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex flex-col"
                        onClick={() => selectCustomer(customer)}
                      >
                        <span className="font-medium">{customer.name}</span>
                        <span className="text-sm text-gray-500">
                          {customer.address || "ไม่มีที่อยู่"}
                        </span>
                        {customer.phone && (
                          <span className="text-sm text-gray-500">
                            โทร: {customer.phone}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-2 text-gray-500">
                    ไม่พบลูกค้า "{searchTerm}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mb-2">
          <label className={SaleStyles.form.labelRequired}>
            Contact Details
          </label>
          <textarea
            className={SaleStyles.form.input}
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
            <label className={SaleStyles.form.label}>Phone Number</label>
            <input
              type="text"
              className={SaleStyles.form.inputNoUppercase}
              placeholder="เบอร์โทรศัพท์"
              value={formData.phone}
              onChange={handlePhoneChange}
            />
          </div>
          <div>
            <label className={SaleStyles.form.label}>ID/Passport</label>
            <input
              type="text"
              className={SaleStyles.form.input}
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
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={SaleStyles.form.labelRequired}>วันที่:</label>
            <input
              type="date"
              className={SaleStyles.form.dateInput}
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
            <label className={SaleStyles.form.labelRequired}>
              เครดิต (วัน):
            </label>
            <input
              type="number"
              className={SaleStyles.form.input}
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
            <label className={SaleStyles.form.labelRequired}>
              วันครบกำหนด:
            </label>
            <input
              type="date"
              className={SaleStyles.form.dateInput}
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
            <label className={SaleStyles.form.labelRequired}>
              ชื่อผู้บันทึก:
            </label>
            <input
              type="text"
              className={SaleStyles.form.input}
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
