import React from "react";
import SaleStyles from "../common/SaleStyles";

const SupplierSection = ({ formData, setFormData }) => {
  // ฟังก์ชันจัดการการเปลี่ยนแปลงรหัสสายการบิน
  const handleSupplierCodeChange = (value) => {
    // อนุญาตเฉพาะตัวอักษร 2 ตัว
    const cleanValue = value
      .replace(/[^A-Za-z0-9]/g, "")
      .substring(0, 3)
      .toUpperCase();

    // อัปเดท formData
    setFormData((prev) => ({
      ...prev,
      supplier: cleanValue,
    }));

    // ถ้าลบรหัสออกหมด ให้ clear supplier info
    if (cleanValue === "") {
      setFormData((prev) => ({
        ...prev,
        supplier: "",
        supplierName: "",
        supplierId: null,
        supplierNumericCode: "",
      }));
    }
    // ถ้าพิมพ์ครบ 2 ตัว ให้ค้นหา supplier
    else if (cleanValue.length >= 2) {
      // ส่งข้อมูลให้ parent component ค้นหา
      setFormData((prev) => ({
        ...prev,
        searchSupplierCode: cleanValue, // signal ให้ parent ค้นหา
      }));
    }
  };

  return (
    <div className="col-span-5 self-start">
      <section className={SaleStyles.subsection.container}>
        <div className={SaleStyles.subsection.header}>
          <h2 className={SaleStyles.subsection.title}>ข้อมูลซัพพลายเออร์</h2>
        </div>
        <div className={SaleStyles.subsection.content}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            {/* สายการบิน */}
            <div className="col-span-1">
              <label className={SaleStyles.form.label}>สายการบิน</label>
              <input
                type="text"
                className={SaleStyles.form.input}
                value={formData.supplier || ""}
                onChange={(e) => handleSupplierCodeChange(e.target.value)}
                maxLength={3}
              />
            </div>

            <div className="col-span-4">
              <label className={SaleStyles.form.label}>ชื่อเต็มสายการบิน</label>
              <input
                type="text"
                className={SaleStyles.form.inputDisabled}
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
        </div>
      </section>
    </div>
  );
};

export default SupplierSection;
