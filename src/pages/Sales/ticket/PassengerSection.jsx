import React, { useEffect, useState, useRef } from "react";
import { FiPlus, FiTrash2, FiX } from "react-icons/fi";
import SaleStyles, { combineClasses } from "../common/SaleStyles";
import { supabase } from "../../../services/supabase";

const PassengerSection = ({
  passengers,
  setPassengers,
  updatePricing,
  pricing,
  formData,
  setFormData,
}) => {
  // States for ticket number dropdown
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // เพิ่มประเภทผู้โดยสาร
  const passengerTypes = [
    { value: "ADT", label: "ผู้ใหญ่ (ADT)", priceField: "adult" },
    { value: "CHD", label: "เด็ก (CHD)", priceField: "child" },
    { value: "INF", label: "ทารก (INF)", priceField: "infant" },
  ];

  // Load suppliers data
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

  // Initialize search term from formData
  useEffect(() => {
    if (formData.supplierNumericCode) {
      setSearchTerm(formData.supplierNumericCode);
    }
  }, [formData.supplierNumericCode]);

  // ฟังก์ชันอัพเดทจำนวนผู้โดยสารแต่ละประเภท
  const updatePassengerCount = (passengersList) => {
    const adultCount = passengersList.filter((p) => p.type === "ADT").length;
    const childCount = passengersList.filter((p) => p.type === "CHD").length;
    const infantCount = passengersList.filter((p) => p.type === "INF").length;

    console.log("PassengerSection: Updating counts:", {
      adultCount,
      childCount,
      infantCount,
    });

    const adultSale = pricing?.adult?.sale || 0;
    const childSale = pricing?.child?.sale || 0;
    const infantSale = pricing?.infant?.sale || 0;

    const adultTotal = adultCount * parseFloat(adultSale);
    const childTotal = childCount * parseFloat(childSale);
    const infantTotal = infantCount * parseFloat(infantSale);

    updatePricing("adult", "pax", adultCount, adultTotal);
    updatePricing("child", "pax", childCount, childTotal);
    updatePricing("infant", "pax", infantCount, infantTotal);
  };

  // Handle search for ticket number (numeric code)
  const handleSearch = (term) => {
    setSearchTerm(term);

    if (term === "") {
      setFilteredSuppliers(suppliers);
      return;
    }

    const filtered = suppliers.filter(
      (supplier) =>
        supplier.numeric_code && supplier.numeric_code.includes(term)
    );

    setFilteredSuppliers(filtered);
  };

  // Select supplier and update ticket numbers for all passengers
  const selectSupplier = (supplier) => {
    console.log("Selecting supplier:", supplier);

    // Update formData for supplier section sync
    setFormData((prev) => ({
      ...prev,
      supplier: supplier.code,
      supplierName: supplier.name,
      supplierId: supplier.id,
      supplierNumericCode: supplier.numeric_code || "",
    }));

    // Update all passengers' ticket numbers
    const updatedPassengers = passengers.map((passenger) => ({
      ...passenger,
      ticketNumber: supplier.numeric_code || "",
    }));

    setPassengers(updatedPassengers);
    setSearchTerm(supplier.numeric_code || "");
    setShowDropdown(false);
  };

  // Clear selection
  const clearSelection = () => {
    setFormData((prev) => ({
      ...prev,
      supplier: "",
      supplierName: "",
      supplierId: null,
      supplierNumericCode: "",
    }));

    const updatedPassengers = passengers.map((passenger) => ({
      ...passenger,
      ticketNumber: "",
    }));

    setPassengers(updatedPassengers);
    setSearchTerm("");
    setShowDropdown(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle click outside dropdown
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

  useEffect(() => {
    updatePassengerCount(passengers);
  }, []);

  useEffect(() => {
    console.log("Pricing changed:", pricing);
    if (pricing) {
      updatePassengerCount(passengers);
    }
  }, [pricing.adult?.sale, pricing.child?.sale, pricing.infant?.sale]);

  const addPassenger = () => {
    const newPassenger = {
      id: passengers.length + 1,
      name: "",
      type: "ADT",
      ticketNumber: searchTerm || "", // Use current ticket number
      ticketCode: "",
    };

    const updatedPassengers = [...passengers, newPassenger];
    setPassengers(updatedPassengers);
    updatePassengerCount(updatedPassengers);
  };

  const removePassenger = (id) => {
    if (passengers.length > 1) {
      const updatedPassengers = passengers.filter((p) => p.id !== id);
      setPassengers(updatedPassengers);
      updatePassengerCount(updatedPassengers);
    }
  };

  const handleTypeChange = (index, newType) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index].type = newType;
    setPassengers(updatedPassengers);

    setTimeout(() => {
      updatePassengerCount(updatedPassengers);
    }, 0);
  };

  const handleTicketNumberChange = (value) => {
    // Allow only 3 digits
    const cleanValue = value.replace(/\D/g, "").substring(0, 3);
    handleSearch(cleanValue);
    setShowDropdown(true);
  };

  return (
    <div className="col-span-10">
      <section className={SaleStyles.subsection.container}>
        <div className={SaleStyles.subsection.header}>
          <h2 className={SaleStyles.subsection.title}>
            ข้อมูลผู้โดยสาร (ทั้งหมด {passengers.length} คน)
          </h2>
        </div>
        <div className={SaleStyles.subsection.content}>
          <div
            className={combineClasses(
              "grid grid-cols-26 gap-2 font-medium text-sm",
              SaleStyles.spacing.mb2,
              SaleStyles.spacing.mx2
            )}
          >
            <div
              className={combineClasses("col-span-13", SaleStyles.spacing.ml4)}
            >
              ชื่อผู้โดยสาร
            </div>
            <div className="col-span-3 text-center">ประเภท</div>
            <div className="col-span-3 text-center">เลขที่ตั๋ว</div>
          </div>
          {passengers.map((passenger, index) => (
            <div
              key={passenger.id}
              className={combineClasses(
                "grid grid-cols-26 gap-2",
                SaleStyles.spacing.mb2
              )}
            >
              <div className="flex col-span-13">
                <div
                  className={combineClasses(
                    "w-[16px] flex items-center justify-center",
                    SaleStyles.spacing.mr2
                  )}
                >
                  <span className="font-medium">{index + 1}</span>
                </div>
                <input
                  type="text"
                  className={SaleStyles.form.input}
                  value={passenger.name || ""}
                  onChange={(e) => {
                    const updatedPassengers = [...passengers];
                    updatedPassengers[index].name = e.target.value;
                    setPassengers(updatedPassengers);
                  }}
                />
              </div>
              <div className="col-span-3">
                <select
                  className={combineClasses(
                    SaleStyles.form.select,
                    "text-center w-full px-0 passenger-type-select"
                  )}
                  value={passenger.type || "ADT"}
                  onChange={(e) => handleTypeChange(index, e.target.value)}
                >
                  {passengerTypes.map((type) => (
                    <option
                      key={type.value}
                      value={type.value}
                      className="text-center"
                    >
                      {type.value}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-3">
                {index === 0 ? (
                  // First row: dropdown for ticket number selection
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="text"
                      className={combineClasses(
                        SaleStyles.form.input,
                        "text-center"
                      )}
                      value={searchTerm}
                      onChange={(e) => handleTicketNumberChange(e.target.value)}
                      onFocus={() => setShowDropdown(true)}
                      maxLength={3}
                      placeholder="000"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      {searchTerm && (
                        <button
                          type="button"
                          onClick={clearSelection}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {/* <FiX size={18} /> */}
                        </button>
                      )}
                    </div>

                    {showDropdown && (
                      <div
                        ref={dropdownRef}
                        className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300 max-h-60 overflow-y-auto"
                      >
                        {loading ? (
                          <div className="px-4 py-2 text-gray-500">
                            กำลังโหลด...
                          </div>
                        ) : error ? (
                          <div className="px-4 py-2 text-red-500">{error}</div>
                        ) : filteredSuppliers.length === 0 ? (
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
                              <span className="font-medium">
                                {supplier.numeric_code || "-"}
                              </span>
                              <span className="ml-2 text-gray-600">
                                ({supplier.code})
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  // Other rows: readonly display
                  <input
                    type="text"
                    className={combineClasses(
                      SaleStyles.form.inputDisabled,
                      "text-center"
                    )}
                    value={searchTerm || ""}
                    readOnly
                  />
                )}
              </div>
              <div className="col-span-6">
                <input
                  type="text"
                  className={SaleStyles.form.input}
                  value={passenger.ticketCode || ""}
                  onChange={(e) => {
                    const updatedPassengers = [...passengers];
                    updatedPassengers[index].ticketCode = e.target.value;
                    setPassengers(updatedPassengers);
                  }}
                />
              </div>
              <div className="col-span-1 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removePassenger(passenger.id)}
                  className={SaleStyles.button.actionButton}
                  disabled={passengers.length === 1}
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addPassenger}
            className={combineClasses(
              SaleStyles.button.primary,
              SaleStyles.spacing.mt2,
              SaleStyles.spacing.ml4
            )}
          >
            <FiPlus className={SaleStyles.button.icon} /> เพิ่มผู้โดยสาร
          </button>
        </div>
      </section>
    </div>
  );
};

export default PassengerSection;
