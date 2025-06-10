import React, { useState, useEffect, useCallback, useRef } from "react";
import { FiX } from "react-icons/fi";
import { FaCalendarAlt } from "react-icons/fa";
import { getCustomers } from "../../../services/customerService";
import SaleStyles from "../common/SaleStyles";
import { useAuth } from "../../../pages/Login/AuthContext";
import { debounce } from "lodash";
import { formatCustomerAddress } from "../../../utils/helpers";

let instanceCount = 0;

const SaleHeader = ({
  formData,
  setFormData,
  selectedCustomer,
  setSelectedCustomer,
  totalAmount = 0,
  subtotalAmount = 0,
  vatAmount = 0,
  section,
  globalEditMode,
  setGlobalEditMode,
  readOnly = false,
}) => {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dueDateError, setDueDateError] = useState("");
  const [tempDueDate, setTempDueDate] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const textareaRef = useRef(null);
  const isMountedRef = useRef(false);

  useEffect(() => {
    instanceCount += 1;
    isMountedRef.current = true;

    if (instanceCount > 1) {
      console.warn(
        `SaleHeader is rendered ${instanceCount} times. This may cause UI duplication if not intended.`
      );
    }

    return () => {
      instanceCount -= 1;
      isMountedRef.current = false;
    };
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const parseDate = (dateString) => {
    if (!dateString) return "";
    const [day, month, year] = dateString.split("/");
    return `${year}-${month}-${day}`;
  };

  const validateDate = (dateString) => {
    if (!dateString) return "กรุณาป้อนวันที่";
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!regex.test(dateString))
      return "รูปแบบวันที่ไม่ถูกต้อง (ต้องเป็น DD/MM/YYYY)";
    const [day, month, year] = dateString.split("/").map(Number);
    const date = new Date(year, month - 1, day);
    if (
      date.getDate() !== day ||
      date.getMonth() + 1 !== month ||
      date.getFullYear() !== year
    ) {
      return "วันที่ไม่ถูกต้อง";
    }
    return "";
  };

  const debouncedSearch = useCallback(
    debounce(async (term) => {
      if (term.length >= 1) {
        setIsLoading(true);
        setError(null);
        try {
          const results = await getCustomers(term, 5);
          setSearchResults(results);
          setShowResults(results.length > 0);
        } catch (err) {
          setError("ไม่สามารถค้นหาลูกค้าได้ กรุณาลองใหม่");
          setShowResults(false);
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
    const creditDays = customer.credit_days?.toString() || "0";
    const dueDate = calculateDueDate(today, creditDays);

    setFormData({
      ...formData,
      customer: customer.name,
      customerCode: customer.code || "",
      contactDetails: formatCustomerAddress(customer),
      phone: customer.phone || "",
      id: customer.id_number || "",
      date: today,
      dueDate: dueDate,
      creditDays: creditDays,
      branchType: customer.branch_type || "Head Office",
      branchNumber: customer.branch_number || "",
      salesName: currentUser?.fullname || formData.salesName,
    });
    setSearchTerm("");
    setShowResults(false);
    setTempDueDate(formatDate(dueDate));
    setGlobalEditMode(false);
  };

  const clearSearch = (e) => {
    e.preventDefault();
    setSearchTerm("");
    setShowResults(false);
    setSearchResults([]);
    setSelectedCustomer(null);

    setFormData({
      ...formData,
      customer: "",
      customerCode: "",
      contactDetails: "",
      phone: "",
      id: "",
      branchType: "Head Office",
      branchNumber: "",
      dueDate: today,
      creditDays: "0",
      salesName: currentUser?.fullname || "",
    });
    setTempDueDate(formatDate(today));
    setGlobalEditMode(true);
  };

  const handleCustomerCodeChange = (e) => {
    if (!globalEditMode) return;
    const value = e.target.value.toUpperCase().substring(0, 5);
    setFormData({ ...formData, customerCode: value });
  };

  const calculateDueDate = (baseDate, creditDays) => {
    if (!baseDate) return today;
    const date = new Date(baseDate);
    const days = parseInt(creditDays, 10) || 0;
    date.setDate(date.getDate() + days);
    return date.toISOString().split("T")[0];
  };

  const calculateCreditDays = (baseDate, dueDate) => {
    if (!baseDate || !dueDate) return "0";
    const d1 = new Date(baseDate);
    const d2 = new Date(dueDate);
    const diffTime = d2 - d1;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays).toString();
  };

  const formatCurrencyLocal = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return "0.00";
    return parseFloat(amount).toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleCustomerNameChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, customer: value });
    if (!globalEditMode && value.length > 1) {
      handleSearchCustomer(value);
    }
  };

  const handleContactDetailsChange = (e) => {
    if (!globalEditMode) return;
    setFormData({ ...formData, contactDetails: e.target.value });
  };

  const handlePhoneChange = (e) => {
    if (!globalEditMode) return;
    setFormData({ ...formData, phone: e.target.value });
  };

  const handleIdNumberChange = (e) => {
    if (!globalEditMode) return;
    setFormData({ ...formData, id: e.target.value });
  };

  const handleBranchTypeChange = (e) => {
    const newBranchType = e.target.value;
    console.log("Branch type changed to:", newBranchType);
    setFormData({
      ...formData,
      branchType: newBranchType,
      branchNumber: newBranchType !== "Branch" ? "" : formData.branchNumber,
    });
  };

  const handleBranchNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").substring(0, 3);
    console.log("Branch number changed to:", value);
    setFormData({
      ...formData,
      branchNumber: value,
    });
  };

  const handleDueDateChange = (e) => {
    if (!globalEditMode) return;
    const value = e.target.value;
    setTempDueDate(value);
    const error = validateDate(value);
    if (!error) {
      const newDueDate = parseDate(value);
      const newCreditDays = calculateCreditDays(formData.date, newDueDate);
      setFormData({
        ...formData,
        dueDate: newDueDate,
        creditDays: newCreditDays,
      });
      setDueDateError("");
    } else {
      setDueDateError(error);
    }
  };

  const handleDueDateBlur = () => {
    if (!globalEditMode) return;
    const error = validateDate(tempDueDate);
    if (error) {
      setTempDueDate(formatDate(formData.dueDate || today));
      setDueDateError(error);
    } else {
      const newDueDate = parseDate(tempDueDate);
      const newCreditDays = calculateCreditDays(formData.date, newDueDate);
      setFormData({
        ...formData,
        dueDate: newDueDate,
        creditDays: newCreditDays,
      });
      setDueDateError("");
    }
  };

  const handleCreditDaysChange = (e) => {
    if (!globalEditMode) return;
    const credit = e.target.value;
    const newDueDate = calculateDueDate(formData.date, credit);
    setFormData({
      ...formData,
      creditDays: credit,
      dueDate: newDueDate,
    });
    setTempDueDate(formatDate(newDueDate));
    setDueDateError("");
  };

  const handleSalesNameChange = (e) => {
    if (!globalEditMode) return;
    setFormData({ ...formData, salesName: e.target.value });
  };

  const toggleEditMode = () => {
    console.log("Toggling edit mode, current globalEditMode:", globalEditMode);
    if (!globalEditMode) {
      setShowResults(true);
      if (formData.customer && formData.customer.length > 1) {
        handleSearchCustomer(formData.customer);
      }
    } else {
      setShowResults(false);
      setSelectedCustomer(null);
      setFormData({
        ...formData,
        customer: "",
        customerCode: "",
        contactDetails: "",
        phone: "",
        id: "",
        branchType: "Head Office",
        branchNumber: "",
        dueDate: today,
        creditDays: "0",
        salesName: currentUser?.fullname || "",
      });
      setTempDueDate(formatDate(today));
    }
    setGlobalEditMode(!globalEditMode);
  };

  const createCustomerFromSaleHeader = async (customerData) => {
    try {
      const payload = {
        name: customerData.customer,
        code: customerData.customerCode || null,
        email: null, // SaleHeader ไม่มีช่อง email
        address_line1: customerData.contactDetails || null, // เก็บใน address_line1
        address_line2: null,
        address_line3: null,
        id_number: customerData.id || null,
        phone: customerData.phone || null,
        credit_days: parseInt(customerData.creditDays) || 0,
        branch_type: customerData.branchType || "Head Office",
        branch_number: customerData.branchNumber || null,
        active: true,
      };

      const { data, error } = await supabase
        .from("customers")
        .insert(payload)
        .select();

      if (error) throw error;
      return { success: true, customerId: data[0].id };
    } catch (error) {
      console.error("Error creating customer from SaleHeader:", error);
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    if (currentUser?.fullname && !formData.salesName) {
      setFormData((prev) => ({ ...prev, salesName: currentUser.fullname }));
    }
    if (!formData.date) {
      setFormData((prev) => ({
        ...prev,
        date: today,
        dueDate: today,
        creditDays: "0",
      }));
      setTempDueDate(formatDate(today));
    }
  }, [currentUser, formData.salesName, formData.date, setFormData, today]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [formData.contactDetails]);

  if (section === "customer") {
    return (
      <div className="space-y-4">
        <div>
          {!readOnly && ( // เพิ่มเงื่อนไขนี้
            <div className="flex justify-between">
              <label className={SaleStyles.form.labelRequired}>
                Customer Name
              </label>
              <button
                type="button"
                className="px-2 text-xs text-blue-600 hover:text-blue-800"
                onClick={toggleEditMode}
              >
                {globalEditMode ? "ค้นหาลูกค้าที่มีอยู่" : "กรอกข้อมูลเอง"}
              </button>
            </div>
          )}{" "}
          {/* ปิดเงื่อนไข */}
          {readOnly && ( // เพิ่มกรณี readOnly
            <label className={SaleStyles.form.labelRequired}>
              Customer Name
            </label>
          )}
          <div className="relative">
            <input
              type="text"
              className={SaleStyles.form.input}
              value={formData.customer}
              onChange={handleCustomerNameChange}
              required
              placeholder="ชื่อลูกค้า"
              disabled={readOnly || false}
            />
            {formData.customer && !readOnly && (
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={clearSearch}
              >
                <FiX className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
            {!readOnly && showResults && searchResults.length > 0 && (
              <div className="absolute z-20 mt-1 w-full bg-white shadow-lg rounded-md border max-h-60 overflow-y-auto information-dropdown">
                {isLoading ? (
                  <div className="px-4 py-2 text-gray-500">กำลังค้นหา...</div>
                ) : error ? (
                  <div className="px-4 py-2 text-red-500">{error}</div>
                ) : (
                  <ul>
                    {searchResults.map((customer) => (
                      <li
                        key={customer.id}
                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex flex-col"
                        onClick={() => selectCustomer(customer)}
                      >
                        <span className="font-medium">
                          {customer.name}{" "}
                          {customer.code ? `[${customer.code}] ` : ""}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatCustomerAddress(customer) || "ไม่มีที่อยู่"}
                        </span>
                        {customer.phone && (
                          <span className="text-sm text-gray-500">
                            โทร: {customer.phone}
                          </span>
                        )}
                        {customer.email /* เพิ่มการแสดง email */ && (
                          <span className="text-sm text-gray-500">
                            อีเมล: {customer.email}
                          </span>
                        )}
                        {customer.credit_days > 0 && (
                          <span className="text-sm text-blue-500">
                            เครดิต: {customer.credit_days} วัน
                          </span>
                        )}
                        {customer.branch_type === "Branch" &&
                          customer.branch_number && (
                            <span className="text-sm text-purple-500">
                              {customer.branch_type} {customer.branch_number}
                            </span>
                          )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-5 gap-2">
          <div className="col-span-3">
            <label className={SaleStyles.form.labelRequired}>Address</label>
            <textarea
              ref={textareaRef}
              className={`${SaleStyles.form.input} ${
                !globalEditMode ? "bg-gray-100" : ""
              } resize-none`}
              value={formData.contactDetails}
              onChange={handleContactDetailsChange}
              required
              disabled={readOnly || !globalEditMode}
              style={{
                minHeight: "38px",
                height: "auto",
                lineHeight: "1.2",
                overflow: "hidden",
              }}
            ></textarea>
          </div>
          <div className="col-span-2">
            <label className={SaleStyles.form.label}>Phone Number</label>
            <input
              type="text"
              className={`${SaleStyles.form.inputNoUppercase} ${
                !globalEditMode ? "bg-gray-100" : ""
              }`}
              value={formData.phone}
              onChange={handlePhoneChange}
              disabled={readOnly || !globalEditMode}
            />
          </div>
          {/* <div className="col-span-1">
            <label className={SaleStyles.form.label}>Customer Code</label>
            <input
              type="text"
              className={`${SaleStyles.form.input} ${
                !globalEditMode ? "bg-gray-100" : ""
              }`}
              value={formData.customerCode}
              onChange={handleCustomerCodeChange}
              maxLength={5}
              disabled={readOnly || !globalEditMode}
            />
          </div> */}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className={SaleStyles.form.label}>Tax ID Number</label>
            <input
              type="text"
              className={`${SaleStyles.form.input} ${
                !globalEditMode ? "bg-gray-100" : ""
              }`}
              value={formData.id}
              onChange={handleIdNumberChange}
              disabled={readOnly || !globalEditMode}
            />
          </div>
          <div>
            <label className={SaleStyles.form.label}>Branch type</label>
            <select
              className={`${SaleStyles.form.select} ${
                !globalEditMode ? "bg-gray-100" : ""
              }`}
              value={formData.branchType || "Head Office"}
              onChange={handleBranchTypeChange}
              disabled={readOnly || !globalEditMode}
            >
              <option value="Head Office">Head Office</option>
              <option value="Branch">Branch</option>
            </select>
          </div>
          <div>
            <label className={SaleStyles.form.label}>Branch number</label>
            <input
              type="text"
              className={`${SaleStyles.form.input} ${
                !globalEditMode || formData.branchType !== "Branch"
                  ? "bg-gray-100"
                  : ""
              }`}
              value={formData.branchNumber || ""}
              onChange={handleBranchNumberChange}
              maxLength={3}
              disabled={
                readOnly || !globalEditMode || formData.branchType !== "Branch"
              }
            />
          </div>
        </div>
      </div>
    );
  }

  if (section === "price") {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 p-3 rounded-md">
          <div className="text-sm text-gray-600">ราคารวมทั้งสิ้น</div>
          <div className="text-xl font-bold text-blue-600">
            {formatCurrencyLocal(totalAmount)}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <label className={SaleStyles.form.labelRequired}>วันที่:</label>
            <input
              type="text"
              className={`${SaleStyles.form.input} pr-10`}
              value={
                formData.date ? formatDate(formData.date) : formatDate(today)
              }
              readOnly
              placeholder="วัน/เดือน/ปี (เช่น 09/05/2025)"
              required
            />
            <FaCalendarAlt className="absolute right-3 top-9 text-gray-400" />
          </div>
          <div>
            <label className={SaleStyles.form.labelRequired}>
              เครดิต (วัน):
            </label>
            <input
              type="number"
              className={`${SaleStyles.form.input} ${
                !globalEditMode ? "bg-gray-100" : ""
              }`}
              value={formData.creditDays}
              onChange={handleCreditDaysChange}
              placeholder="0"
              required
              min="0"
              disabled={readOnly || !globalEditMode}
            />
          </div>
          <div className="relative">
            <label className={SaleStyles.form.labelRequired}>
              วันครบกำหนด:
            </label>
            <div className="relative">
              <input
                type="text"
                className={`${SaleStyles.form.input} ${
                  dueDateError ? "border-red-500" : ""
                } ${!globalEditMode ? "bg-gray-100" : ""} pr-10`}
                value={tempDueDate || formatDate(formData.dueDate || today)}
                onChange={handleDueDateChange}
                onBlur={handleDueDateBlur}
                placeholder="วัน/เดือน/ปี (เช่น 09/05/2025)"
                required
                disabled={readOnly || !globalEditMode}
              />
              <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            {dueDateError && (
              <div className="text-red-500 text-sm mt-1">{dueDateError}</div>
            )}
          </div>
          <div>
            <label className={SaleStyles.form.labelRequired}>
              ชื่อผู้บันทึก:
            </label>
            <input
              type="text"
              className={`${SaleStyles.form.input} ${
                !globalEditMode ? "bg-gray-100" : ""
              }`}
              placeholder="ชื่อผู้บันทึก"
              value={formData.salesName || currentUser?.fullname || ""}
              onChange={handleSalesNameChange}
              required
              disabled={readOnly || !globalEditMode || !!currentUser?.fullname}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className={SaleStyles.form.labelRequired}>Customer Name</label>
        <div className="relative">
          <input
            type="text"
            className={SaleStyles.form.input}
            value={formData.customer}
            onChange={handleCustomerNameChange}
            required
            placeholder="ชื่อลูกค้า"
            disabled={readOnly || false}
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
          {showResults && searchResults.length > 0 && (
            <div className="absolute z-20 mt-1 w-full bg-white shadow-lg rounded-md border max-h-60 overflow-y-auto information-dropdown">
              {isLoading ? (
                <div className="px-4 py-2 text-gray-500">กำลังค้นหา...</div>
              ) : error ? (
                <div className="px-4 py-2 text-red-500">{error}</div>
              ) : (
                <ul>
                  {searchResults.map((customer) => (
                    <li
                      key={customer.id}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex flex-col"
                      onClick={() => selectCustomer(customer)}
                    >
                      <span className="font-medium">
                        {customer.code ? `[${customer.code}] ` : ""}
                        {customer.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {customer.address || "ไม่มีที่อยู่"}
                      </span>
                      {customer.phone && (
                        <span className="text-sm text-gray-500">
                          โทร: {customer.phone}
                        </span>
                      )}
                      {customer.credit_days > 0 && (
                        <span className="text-sm text-blue-500">
                          เครดิต: {customer.credit_days} วัน
                        </span>
                      )}
                      {customer.branch_type === "Branch" &&
                        customer.branch_number && (
                          <span className="text-sm text-purple-500">
                            {customer.branch_type} {customer.branch_number}
                          </span>
                        )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <div className="mt-1 text-right">
            <button
              type="button"
              className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800"
              onClick={toggleEditMode}
            >
              {globalEditMode ? "ค้นหาลูกค้าที่มีอยู่" : "กรอกข้อมูลเอง"}
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={SaleStyles.form.labelRequired}>Address</label>
          <textarea
            ref={textareaRef}
            className={`${SaleStyles.form.input} ${
              !globalEditMode ? "bg-gray-100" : ""
            } resize-none`}
            placeholder="ที่อยู่"
            value={formData.contactDetails}
            onChange={handleContactDetailsChange}
            required
            disabled={readOnly || !globalEditMode}
            style={{
              minHeight: "38px",
              height: "auto",
              lineHeight: "1.2",
              overflow: "hidden",
            }}
          ></textarea>
        </div>
        <div>
          <label className={SaleStyles.form.label}>Phone Number</label>
          <input
            type="text"
            className={`${SaleStyles.form.inputNoUppercase} ${
              !globalEditMode ? "bg-gray-100" : ""
            }`}
            value={formData.phone}
            onChange={(e) => {
              if (!globalEditMode) return;
              // อนุญาต: ตัวเลข, เครื่องหมาย -, (, ), +, space
              const value = e.target.value.replace(/[^0-9\-\(\)\+\s]/g, "");
              setFormData({ ...formData, phone: value });
            }}
            disabled={readOnly || !globalEditMode}
            placeholder="เบอร์โทรศัพท์"
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className={SaleStyles.form.label}>Tax ID Number</label>
          <input
            type="text"
            className={`${SaleStyles.form.input} ${
              !globalEditMode ? "bg-gray-100" : ""
            }`}
            placeholder="เลขผู้เสียภาษี"
            value={formData.id}
            onChange={handleIdNumberChange}
            disabled={readOnly || !globalEditMode}
          />
        </div>
        <div>
          <label className={SaleStyles.form.label}>Branch type</label>
          <select
            className={`${SaleStyles.form.select} ${
              !globalEditMode ? "bg-gray-100" : ""
            }`}
            value={formData.branchType || "Head Office"}
            onChange={handleBranchTypeChange}
            disabled={readOnly || !globalEditMode}
          >
            <option value="Head Office">Head Office</option>
            <option value="Branch">Branch</option>
          </select>
        </div>
        <div>
          <label className={SaleStyles.form.label}>Branch number</label>
          <input
            type="text"
            className={`${SaleStyles.form.input} ${
              !globalEditMode || formData.branchType !== "Branch"
                ? "bg-gray-100"
                : ""
            }`}
            value={formData.branchNumber || ""}
            onChange={handleBranchNumberChange}
            maxLength={3}
            disabled={
              readOnly || !globalEditMode || formData.branchType !== "Branch"
            }
          />
        </div>
      </div>
      <div className="bg-blue-50 p-3 rounded-md">
        <div className="text-sm text-gray-600">ราคารวมทั้งสิ้น</div>
        <div className="text-xl font-bold text-blue-600">
          {formatCurrencyLocal(totalAmount)}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <label className={SaleStyles.form.labelRequired}>วันที่:</label>
          <input
            type="text"
            className={`${SaleStyles.form.input} pr-10`}
            value={
              formData.date ? formatDate(formData.date) : formatDate(today)
            }
            readOnly
            placeholder="วัน/เดือน/ปี (เช่น 09/05/2025)"
            required
          />
          <FaCalendarAlt className="absolute right-3 top-9 text-gray-400" />
        </div>
        <div>
          <label className={SaleStyles.form.labelRequired}>เครดิต (วัน):</label>
          <input
            type="number"
            className={`${SaleStyles.form.input} ${
              !globalEditMode ? "bg-gray-100" : ""
            }`}
            value={formData.creditDays || "0"}
            onChange={handleCreditDaysChange}
            placeholder="0"
            required
            min="0"
            disabled={readOnly || !globalEditMode}
          />
        </div>
        <div className="relative">
          <label className={SaleStyles.form.labelRequired}>วันครบกำหนด:</label>
          <div className="relative">
            <input
              type="text"
              className={`${SaleStyles.form.input} ${
                dueDateError ? "border-red-500" : ""
              } ${!globalEditMode ? "bg-gray-100" : ""} pr-10`}
              value={tempDueDate || formatDate(formData.dueDate || today)}
              onChange={handleDueDateChange}
              onBlur={handleDueDateBlur}
              placeholder="วัน/เดือน/ปี (เช่น 09/05/2025)"
              required
              disabled={readOnly || !globalEditMode}
            />
            <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          {dueDateError && (
            <div className="text-red-500 text-sm mt-1">{dueDateError}</div>
          )}
        </div>
        <div>
          <label className={SaleStyles.form.labelRequired}>
            ชื่อผู้บันทึก:
          </label>
          <input
            type="text"
            className={`${SaleStyles.form.input} ${
              !globalEditMode ? "bg-gray-100" : ""
            }`}
            placeholder="ชื่อผู้บันทึก"
            value={formData.salesName || currentUser?.fullname || ""}
            onChange={handleSalesNameChange}
            required
            disabled={readOnly || !globalEditMode || !!currentUser?.fullname}
          />
        </div>
      </div>
    </div>
  );
};

export default SaleHeader;
