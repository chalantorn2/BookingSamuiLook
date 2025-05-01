import React from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import SaleStyles, { combineClasses } from "../common/SaleStyles";

const PassengerSection = ({ passengers, setPassengers }) => {
  const addPassenger = () => {
    setPassengers([
      ...passengers,
      { id: passengers.length + 1, name: "", age: "", ticketNo: "" },
    ]);
  };

  const removePassenger = (id) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter((p) => p.id !== id));
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
              className={combineClasses("col-span-14", SaleStyles.spacing.ml4)}
            >
              ชื่อผู้โดยสาร
            </div>
            <div className="col-span-2 text-center">อายุ</div>
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
                <input type="text" className={SaleStyles.form.input} />
              </div>
              <div className="col-span-2">
                <input
                  type="text"
                  className={combineClasses(
                    SaleStyles.form.input,
                    "text-center"
                  )}
                />
              </div>
              <div className="col-span-3">
                <input
                  type="text"
                  className={combineClasses(
                    SaleStyles.form.input,
                    "text-center"
                  )}
                />
              </div>
              <div className="col-span-6">
                <input type="text" className={SaleStyles.form.input} />
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
