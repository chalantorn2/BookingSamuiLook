import React, { useEffect } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import SaleStyles, { combineClasses } from "../common/SaleStyles";

const PassengerSection = ({
  passengers,
  setPassengers,
  updatePricing,
  pricing,
}) => {
  // เพิ่มประเภทผู้โดยสาร
  const passengerTypes = [
    { value: "ADL", label: "ผู้ใหญ่ (ADL)", priceField: "adult" },
    { value: "CHD", label: "เด็ก (CHD)", priceField: "child" },
    { value: "INF", label: "ทารก (INF)", priceField: "infant" },
  ];

  // ฟังก์ชันอัพเดทจำนวนผู้โดยสารแต่ละประเภท
  const updatePassengerCount = (passengersList) => {
    // นับจำนวนผู้โดยสารแต่ละประเภท
    const adultCount = passengersList.filter((p) => p.type === "ADL").length;
    const childCount = passengersList.filter((p) => p.type === "CHD").length;
    const infantCount = passengersList.filter((p) => p.type === "INF").length;

    console.log("PassengerSection: Updating counts:", {
      adultCount,
      childCount,
      infantCount,
    });

    // คำนวณยอดรวมแต่ละประเภท (ใช้ราคาที่มีอยู่เดิม)
    const adultSale = pricing?.adult?.sale || 0;
    const childSale = pricing?.child?.sale || 0;
    const infantSale = pricing?.infant?.sale || 0;

    const adultTotal = adultCount * parseFloat(adultSale);
    const childTotal = childCount * parseFloat(childSale);
    const infantTotal = infantCount * parseFloat(infantSale);

    // อัพเดทค่า pax และ total ใน pricing
    updatePricing("adult", "pax", adultCount, adultTotal);
    updatePricing("child", "pax", childCount, childTotal);
    updatePricing("infant", "pax", infantCount, infantTotal);
  };

  // เพิ่ม useEffect เพื่อให้ทำงานตอนโหลดคอมโพเนนต์และเมื่อ passengers หรือ pricing เปลี่ยนแปลง
  useEffect(() => {
    updatePassengerCount(passengers);
  }, []);

  // เพิ่ม useEffect ที่ทำงานเมื่อ pricing เปลี่ยนแปลง
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
      type: "ADL", // ค่าเริ่มต้นเป็น ADL
      ticketNumber: "",
    };

    const updatedPassengers = [...passengers, newPassenger];
    setPassengers(updatedPassengers);

    // อัพเดทจำนวน Pax ในส่วนของ pricing
    updatePassengerCount(updatedPassengers);
  };

  const removePassenger = (id) => {
    if (passengers.length > 1) {
      const updatedPassengers = passengers.filter((p) => p.id !== id);
      setPassengers(updatedPassengers);

      // อัพเดทจำนวน Pax เมื่อลบผู้โดยสาร
      updatePassengerCount(updatedPassengers);
    }
  };

  // ฟังก์ชันเมื่อเปลี่ยนประเภทผู้โดยสาร
  const handleTypeChange = (index, newType) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index].type = newType;
    setPassengers(updatedPassengers);

    // อัพเดทจำนวน Pax เมื่อเปลี่ยนประเภทผู้โดยสาร
    setTimeout(() => {
      updatePassengerCount(updatedPassengers);
    }, 0);
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
              className={combineClasses("col-span-14", SaleStyles.spacing.ml4)}
            >
              ชื่อผู้โดยสาร
            </div>
            <div className="col-span-2 text-center">ประเภท</div>
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
              <div className="flex col-span-14">
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
              <div className="col-span-2">
                <select
                  className={combineClasses(
                    SaleStyles.form.select,
                    "text-center w-full px-0 passenger-type-select"
                  )}
                  value={passenger.type || "ADL"}
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
                <input
                  type="text"
                  className={combineClasses(
                    SaleStyles.form.input,
                    "text-center"
                  )}
                  value={passenger.ticketNumber || ""}
                  onChange={(e) => {
                    const updatedPassengers = [...passengers];
                    updatedPassengers[index].ticketNumber = e.target.value;
                    setPassengers(updatedPassengers);
                  }}
                />
              </div>
              <div className="col-span-6">
                <input
                  type="text"
                  className={SaleStyles.form.input}
                  value={passenger.additionalInfo || ""}
                  onChange={(e) => {
                    const updatedPassengers = [...passengers];
                    updatedPassengers[index].additionalInfo = e.target.value;
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
