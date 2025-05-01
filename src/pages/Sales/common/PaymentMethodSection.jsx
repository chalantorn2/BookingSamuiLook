import React from "react";

/**
 * คอมโพเนนต์ PaymentMethodSection สำหรับแสดงส่วนการชำระเงิน
 * @param {object} props - คุณสมบัติของคอมโพเนนต์
 * @param {string} props.title - หัวข้อของส่วนการชำระเงิน
 * @param {string} props.sectionType - ประเภทของส่วน (company หรือ customer)
 * @param {array} props.options - อาร์เรย์ของตัวเลือกการชำระเงิน แต่ละรายการประกอบด้วย id, value, label
 * @param {object} props.formData - ข้อมูลฟอร์มจาก state
 * @param {function} props.setFormData - ฟังก์ชันสำหรับอัพเดทข้อมูลฟอร์ม
 * @param {string} props.fieldName - ชื่อฟิลด์ใน formData สำหรับเก็บค่าที่เลือก
 * @param {string} props.detailsFieldName - ชื่อฟิลด์ใน formData สำหรับเก็บรายละเอียดเพิ่มเติม
 * @param {boolean} props.showDetailInput - แสดงช่องกรอกรายละเอียดเพิ่มเติมหรือไม่
 * @param {string} props.detailPlaceholder - ข้อความ placeholder สำหรับช่องกรอกรายละเอียด
 */
const PaymentMethodSection = ({
  title,
  sectionType,
  options,
  formData,
  setFormData,
  fieldName = "paymentMethod",
  detailsFieldName = "paymentDetails",
  showDetailInput = true,
  detailPlaceholder = "รายละเอียดการชำระเงิน",
  className,
}) => {
  // ดึงค่าที่เลือกไว้จาก formData
  const selectedValue = formData[fieldName];

  // สร้างชื่อฟิลด์สำหรับเก็บรายละเอียด ถ้ามี sectionType ให้เพิ่มไปด้วย
  const detailsField = sectionType
    ? `${sectionType}${
        detailsFieldName.charAt(0).toUpperCase() + detailsFieldName.slice(1)
      }`
    : detailsFieldName;

  // จัดการเมื่อเลือกวิธีการชำระเงิน
  const handlePaymentMethodChange = (method) => {
    setFormData({
      ...formData,
      [fieldName]: method,
    });
  };

  // จัดการเมื่อกรอกรายละเอียดเพิ่มเติม
  const handleDetailsChange = (e) => {
    setFormData({
      ...formData,
      [detailsField]: e.target.value,
    });
  };

  return (
    <div className={`bg-gray-50 p-4 rounded-md ${className || ""}`}>
      <h3 className="font-semibold mb-3 text-blue-600 text-lg">{title}</h3>
      <div className="space-y-3">
        {options.map(({ id, value, label, showInput = true }) => (
          <div key={id} className="flex items-center">
            <div className="flex items-center mt-1">
              <input
                type="radio"
                id={id}
                name={`${fieldName}_${sectionType || "default"}`}
                value={value}
                checked={selectedValue === value}
                onChange={() => handlePaymentMethodChange(value)}
                className="mr-2 focus:ring-blue-500"
              />
              <label htmlFor={id} className="text-sm">
                {label}
              </label>
            </div>

            {showDetailInput && showInput && selectedValue === value && (
              <input
                type="text"
                className="flex-1 ml-2 border border-gray-400 text-sm rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={detailPlaceholder}
                value={formData[detailsField] || ""}
                onChange={handleDetailsChange}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethodSection;
