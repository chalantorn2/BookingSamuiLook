import React, { useState, useEffect, useRef } from "react";
import SaleStyles, { combineClasses } from "../common/SaleStyles";
import { getSuppliers } from "../../../services/supplierService";
import { supabase } from "../../../services/supabase";
import { FiSearch, FiChevronDown, FiX } from "react-icons/fi";

const SupplierSection = ({ formData, setFormData }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    const fetchSuppliers = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("information")
          .select("*")
          .eq("category", "airline")
          .eq("active", true);

        if (error) throw error;
        setSuppliers(data || []);
        setFilteredSuppliers(data || []);
      } catch (err) {
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูลสายการบิน");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  // Initialize search terms from formData on first load
  useEffect(() => {
    if (isInitialLoad.current && formData.supplierId) {
      setSearchTerm(formData.supplier || "");
      isInitialLoad.current = false;
    }
  }, [formData.supplierId]);

  useEffect(() => {
    console.log("FormData changed:", {
      supplier: formData.supplier,
      supplierName: formData.supplierName,
      supplierId: formData.supplierId,
      supplierNumericCode: formData.supplierNumericCode,
    });
  }, [
    formData.supplier,
    formData.supplierName,
    formData.supplierId,
    formData.supplierNumericCode,
  ]);

  // ฟังก์ชันสำหรับกรองซัพพลายเออร์ตามคำค้นหา
  const handleSearch = (term) => {
    setSearchTerm(term);

    // เพิ่มบรรทัดนี้เพื่ออัปเดต formData ทันที
    setFormData((prev) => ({
      ...prev,
      supplier: term,
      // ถ้าไม่ได้เลือกจาก dropdown ให้เคลียร์ name และ id
      supplierName: term === prev.supplier ? prev.supplierName : "",
      supplierId: term === prev.supplier ? prev.supplierId : null,
    }));

    if (term === "") {
      setFilteredSuppliers(suppliers);
      return;
    }

    const filtered = suppliers.filter(
      (supplier) =>
        supplier.code.toLowerCase().includes(term.toLowerCase()) ||
        supplier.name.toLowerCase().includes(term.toLowerCase())
    );

    setFilteredSuppliers(filtered);
  };

  // จัดการคลิกภายนอก dropdown เพื่อปิด dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectSupplier = (supplier) => {
    console.log("Selecting supplier:", supplier);
    isInitialLoad.current = false;
    const newFormData = {
      ...formData,
      supplier: supplier.code,
      supplierName: supplier.name,
      supplierId: supplier.id,
      supplierNumericCode: supplier.numeric_code || "",
    };
    console.log("Setting formData to:", newFormData);
    setFormData(newFormData);
    setSearchTerm(supplier.code);
    setShowDropdown(false);
  };

  // เคลียร์การเลือก
  const clearSelection = () => {
    setFormData({
      ...formData,
      supplier: "",
      supplierName: "",
      supplierId: null,
      supplierNumericCode: "",
    });
    setSearchTerm("");
    setShowDropdown(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="col-span-5 self-start">
      <section className={SaleStyles.subsection.container}>
        <div className={SaleStyles.subsection.header}>
          <h2 className={SaleStyles.subsection.title}>ข้อมูลซัพพลายเออร์</h2>
        </div>
        <div className={SaleStyles.subsection.content}>
          {loading ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-4  border-solid border-blue-500 border-r-transparent"></div>
              <p className="mt-2 text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              {/* สายการบิน */}
              <div className="relative col-span-1 ">
                <label className={SaleStyles.form.label}>สายการบิน</label>
                <div className="relative ">
                  <input
                    ref={inputRef}
                    type="text"
                    className={combineClasses(
                      SaleStyles.form.input,
                      "text-center"
                    )}
                    value={searchTerm}
                    onChange={(e) => {
                      handleSearch(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 ">
                    {formData.supplier && (
                      <button
                        type="button"
                        onClick={clearSelection}
                        className="text-gray-400 hover:text-gray-600 "
                      >
                        {/* <FiX size={18} /> */}
                      </button>
                    )}
                  </div>
                </div>

                {showDropdown && (
                  <div
                    ref={dropdownRef}
                    className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300 max-h-60 overflow-y-auto"
                  >
                    {filteredSuppliers.length === 0 ? (
                      <div className="px-4 py-2 text-gray-500">
                        ไม่พบสายการบิน
                      </div>
                    ) : (
                      filteredSuppliers.map((supplier) => (
                        <div
                          key={supplier.id}
                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center"
                          onClick={() => selectSupplier(supplier)}
                        >
                          <span className="font-medium">{supplier.code}</span>
                          {supplier.numeric_code && (
                            <span className="ml-2 text-gray-600">
                              ({supplier.numeric_code})
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="col-span-4">
                <label className={SaleStyles.form.label}>
                  ชื่อเต็มสายการบิน
                </label>
                <input
                  type="text"
                  className={SaleStyles.form.inputDisabled}
                  placeholder="ชื่อสายการบิน"
                  disabled
                  value={formData.supplierName || ""}
                />
              </div>

              <div className="col-span-5">
                <label className={SaleStyles.form.label}>Code</label>
                <input
                  type="text"
                  className={SaleStyles.form.input}
                  placeholder=""
                  value={formData.code || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                />
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default SupplierSection;
