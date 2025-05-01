import React from "react";
import SaleStyles from "../common/SaleStyles";

const SupplierSection = ({ formData, setFormData }) => {
  return (
    <div className="col-span-5 self-start">
      <section className={SaleStyles.subsection.container}>
        <div className={SaleStyles.subsection.header}>
          <h2 className={SaleStyles.subsection.title}>ข้อมูลซัพพลายเออร์</h2>
        </div>
        <div className={SaleStyles.subsection.content}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div>
              <label className={SaleStyles.form.label}>สายการบิน</label>
              <select
                className={SaleStyles.form.select}
                value={formData.supplier}
                onChange={(e) => {
                  const selectedCode = e.target.value;
                  const airlineMapping = {
                    TG: "THAI AIRWAYS ",
                    FD: "AIR ASIA",
                    PG: "BANGKOK AIRWAYS",
                    "": "",
                  };
                  const fullName = airlineMapping[selectedCode] || "";
                  setFormData({
                    ...formData,
                    supplier: selectedCode,
                    supplierName: fullName,
                  });
                }}
              >
                <option value="">เลือก</option>
                <option value="TG">TG</option>
                <option value="FD">FD</option>
                <option value="PG">PG</option>
              </select>
            </div>
            <div className="col-span-3">
              <label className={SaleStyles.form.label}>ชื่อเต็มสายการบิน</label>
              <input
                type="text"
                className={SaleStyles.form.inputDisabled}
                placeholder="ชื่อสายการบิน"
                disabled
                value={formData.supplierName}
              />
            </div>
            <div className="col-span-4">
              <label className={SaleStyles.form.label}>Code</label>
              <input
                type="text"
                className={SaleStyles.form.input}
                placeholder=""
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SupplierSection;
