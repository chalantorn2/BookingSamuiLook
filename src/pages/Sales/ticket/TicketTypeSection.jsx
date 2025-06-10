import React from "react";
import SaleStyles, { combineClasses } from "../common/SaleStyles";

const TicketTypeSection = ({ formData, setFormData, readOnly = false }) => {
  // เพิ่มการล็อกเพื่อดูการเปลี่ยนแปลงค่า
  console.log("Current ticketType:", formData.ticketType);
  console.log("Current details:", {
    b2bDetails: formData.b2bDetails,
    otherDetails: formData.otherDetails,
    tgDetails: formData.tgDetails,
  });

  const RadioButton = ({ id, value, label, checked, onChange }) => {
    if (readOnly) {
      // ReadOnly mode - ใช้ div แทน radio ที่ชัดเจน
      return (
        <div className={SaleStyles.form.radioContainer}>
          <div
            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-2 ${
              checked
                ? "border-blue-500 bg-blue-500"
                : "border-gray-400 bg-white"
            }`}
          >
            {checked && <div className="w-2 h-2 rounded-full bg-white"></div>}
          </div>
          <label className="text-sm">{label}</label>
        </div>
      );
    }

    // Edit mode - radio ปกติ
    return (
      <div className={SaleStyles.form.radioContainer}>
        <input
          type="radio"
          id={id}
          name="ticketType"
          value={value}
          checked={checked}
          onChange={onChange}
          className={SaleStyles.form.radio}
        />
        <label htmlFor={id}>{label}</label>
      </div>
    );
  };

  return (
    <section
      className={combineClasses(
        SaleStyles.subsection.container,
        "col-span-3 self-start"
      )}
    >
      <div className={SaleStyles.subsection.header}>
        <h2 className={SaleStyles.subsection.title}>ประเภทตั๋ว</h2>
      </div>
      <div className={SaleStyles.subsection.content}>
        <div className="flex flex-col gap-2">
          {/* แถวที่ 1: BSP, AIRLINE, WEB */}
          <div className="grid grid-cols-3 gap-2">
            <RadioButton
              id="bsp"
              value="bsp"
              label="BSP"
              checked={formData.ticketType === "bsp"}
              onChange={() =>
                setFormData({
                  ...formData,
                  ticketType: "bsp",
                  b2bDetails: "",
                  otherDetails: "",
                  tgDetails: "",
                })
              }
            />
            <RadioButton
              id="airline"
              value="airline"
              label="AIRLINE"
              checked={formData.ticketType === "airline"}
              onChange={() =>
                setFormData({
                  ...formData,
                  ticketType: "airline",
                  b2bDetails: "",
                  otherDetails: "",
                  tgDetails: "",
                })
              }
            />
            <RadioButton
              id="web"
              value="web"
              label="WEB"
              checked={formData.ticketType === "web"}
              onChange={() =>
                setFormData({
                  ...formData,
                  ticketType: "web",
                  b2bDetails: "",
                  otherDetails: "",
                  tgDetails: "",
                })
              }
            />
          </div>

          {/* แถวที่ 2: TG, B2B, OTHER */}
          <div className="grid grid-cols-3 gap-2">
            <RadioButton
              id="tg"
              value="tg"
              label="TG"
              checked={formData.ticketType === "tg"}
              onChange={() =>
                setFormData({
                  ...formData,
                  ticketType: "tg",
                  b2bDetails: "",
                  otherDetails: "",
                })
              }
            />
            <RadioButton
              id="b2b"
              value="b2b"
              label="B2B"
              checked={formData.ticketType === "b2b"}
              onChange={() =>
                setFormData({
                  ...formData,
                  ticketType: "b2b",
                  otherDetails: "",
                  tgDetails: "",
                })
              }
            />
            <RadioButton
              id="other"
              value="other"
              label="OTHER"
              checked={formData.ticketType === "other"}
              onChange={() =>
                setFormData({
                  ...formData,
                  ticketType: "other",
                  b2bDetails: "",
                  tgDetails: "",
                })
              }
            />
          </div>

          {/* Input ที่ขึ้นบรรทัดใหม่เมื่อถูกเลือก - ซ่อนใน readOnly mode */}
          {!readOnly && formData.ticketType === "tg" && (
            <div className="grid grid-cols-3 gap-2">
              <div
                className={combineClasses(
                  SaleStyles.form.radioContainer,
                  "col-span-3 flex"
                )}
              >
                <input
                  type="text"
                  className={combineClasses(
                    SaleStyles.form.input,
                    "flex-1 w-full"
                  )}
                  disabled={formData.ticketType !== "tg"}
                  value={formData.tgDetails || ""}
                  onChange={(e) => {
                    console.log("Updating tgDetails to:", e.target.value);
                    setFormData({
                      ...formData,
                      tgDetails: e.target.value,
                    });
                  }}
                  placeholder="รายละเอียด TG"
                />
              </div>
            </div>
          )}
          {!readOnly && formData.ticketType === "ประเภทตั๋ว" && (
            <div className="grid grid-cols-3 gap-2">
              <div
                className={combineClasses(
                  SaleStyles.form.radioContainer,
                  "col-span-3 flex"
                )}
              >
                <input
                  type="text"
                  className={combineClasses(
                    SaleStyles.form.input,
                    "flex-1 w-full"
                  )}
                  disabled={formData.ticketType !== "b2b"}
                  value={formData.b2bDetails || ""}
                  onChange={(e) => {
                    console.log("Updating b2bDetails to:", e.target.value);
                    setFormData({
                      ...formData,
                      b2bDetails: e.target.value,
                    });
                  }}
                  placeholder="รายละเอียด B2B"
                />
              </div>
            </div>
          )}
          {!readOnly && formData.ticketType === "other" && (
            <div className="grid grid-cols-3 gap-2">
              <div
                className={combineClasses(
                  SaleStyles.form.radioContainer,
                  "col-span-3 flex"
                )}
              >
                <input
                  type="text"
                  className={combineClasses(
                    SaleStyles.form.input,
                    "flex-1 w-full"
                  )}
                  disabled={formData.ticketType !== "other"}
                  value={formData.otherDetails || ""}
                  onChange={(e) => {
                    console.log("Updating otherDetails to:", e.target.value);
                    setFormData({
                      ...formData,
                      otherDetails: e.target.value,
                    });
                  }}
                  placeholder="รายละเอียดประเภทอื่นๆ"
                />
              </div>
            </div>
          )}

          {/* แสดงรายละเอียดใน readOnly mode */}
          {readOnly &&
            (formData.b2bDetails ||
              formData.otherDetails ||
              formData.tgDetails) && (
              <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-300 text-sm">
                <span className="text-gray-600">รายละเอียด: </span>
                <span className="font-medium">
                  {formData.b2bDetails ||
                    formData.otherDetails ||
                    formData.tgDetails}
                </span>
              </div>
            )}
        </div>
      </div>
    </section>
  );
};

export default TicketTypeSection;
