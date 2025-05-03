import React, { useState, useEffect } from "react";
import SaleStyles from "../common/SaleStyles";
import { getSuppliers } from "../../../services/supplierService";
import { supabase } from "../../../services/supabase";

const SupplierSection = ({ formData, setFormData }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSuppliers = async () => {
      setLoading(true);
      setError(null);
      try {
        // แก้ไขให้ดึงข้อมูลจากตาราง information โดยกรอง category เป็น 'airline'
        const { data, error } = await supabase
          .from("information")
          .select("*")
          .eq("category", "airline")
          .eq("active", true);

        if (error) throw error;
        setSuppliers(data || []);
      } catch (err) {
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูลสายการบิน");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  return (
    <div className="col-span-5 self-start">
      <section className={SaleStyles.subsection.container}>
        <div className={SaleStyles.subsection.header}>
          <h2 className={SaleStyles.subsection.title}>ข้อมูลซัพพลายเออร์</h2>
        </div>
        <div className={SaleStyles.subsection.content}>
          {loading ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-4 border-solid border-blue-500 border-r-transparent"></div>
              <p className="mt-2 text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <div>
                <label className={SaleStyles.form.label}>สายการบิน</label>
                <select
                  className={SaleStyles.form.select}
                  value={formData.supplier || ""}
                  onChange={(e) => {
                    const selectedCode = e.target.value;
                    const selectedSupplier = suppliers.find(
                      (s) => s.code === selectedCode
                    );

                    setFormData({
                      ...formData,
                      supplier: selectedCode,
                      supplierName: selectedSupplier?.name || "",
                      supplierId: selectedSupplier?.id || null, // เก็บ ID ของ information ไว้เพื่อใช้ตอนบันทึก
                    });
                  }}
                >
                  <option value="">เลือก</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.code}>
                      {supplier.code}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-3">
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
              <div className="col-span-4">
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
