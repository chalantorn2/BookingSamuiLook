import React, { useEffect } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import SaleStyles, { combineClasses } from "../common/SaleStyles";

const PassengerSection = ({
  passengers,
  setPassengers,
  updatePricing,
  pricing,
  formData,
  setFormData,
}) => {
  // เพิ่มประเภทผู้โดยสาร
  const passengerTypes = [
    { value: "ADT", label: "ผู้ใหญ่ (ADT)", priceField: "adult" },
    { value: "CHD", label: "เด็ก (CHD)", priceField: "child" },
    { value: "INF", label: "ทารก (INF)", priceField: "infant" },
  ];

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
      ticketNumber: formData.supplierNumericCode || "", // ใช้เลขจาก supplier
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

  // ฟังก์ชันจัดการการเปลี่ยนแปลงเลขที่ตั๋ว
  const handleTicketNumberChange = (value) => {
    // อนุญาตเฉพาะตัวเลข 3 หลัก
    const cleanValue = value.replace(/\D/g, "").substring(0, 3);

    // อัปเดทเลขที่ตั๋วในทุกแถว
    const updatedPassengers = passengers.map((passenger) => ({
      ...passenger,
      ticketNumber: cleanValue,
    }));
    setPassengers(updatedPassengers);

    // อัปเดท formData
    setFormData((prev) => ({
      ...prev,
      supplierNumericCode: cleanValue,
    }));

    // ถ้าลบเลขออกหมด ให้ clear supplier info
    if (cleanValue === "") {
      setFormData((prev) => ({
        ...prev,
        supplier: "",
        supplierName: "",
        supplierId: null,
        supplierNumericCode: "",
      }));
    }
    // ถ้าพิมพ์ครบ 3 หลัก ให้ค้นหา supplier
    else if (cleanValue.length === 3) {
      // ส่งข้อมูลให้ parent component ค้นหา
      if (setFormData) {
        setFormData((prev) => ({
          ...prev,
          searchTicketNumber: cleanValue, // signal ให้ parent ค้นหา
        }));
      }
    }
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
                  // แถวแรก: input สำหรับพิมพ์เลขที่ตั๋ว
                  <input
                    type="text"
                    className={combineClasses(
                      SaleStyles.form.input,
                      "text-center"
                    )}
                    value={passenger.ticketNumber || ""}
                    onChange={(e) => handleTicketNumberChange(e.target.value)}
                    maxLength={3}
                  />
                ) : (
                  // แถวอื่นๆ: แสดงค่า readonly
                  <input
                    type="text"
                    className={combineClasses(
                      SaleStyles.form.inputDisabled,
                      "text-center"
                    )}
                    value={passenger.ticketNumber || ""}
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
