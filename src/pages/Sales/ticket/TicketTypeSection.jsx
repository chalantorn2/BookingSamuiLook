import React from "react";
import SaleStyles, { combineClasses } from "../common/SaleStyles";

const TicketTypeSection = ({ formData, setFormData }) => {
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
            <div className={SaleStyles.form.radioContainer}>
              <input
                type="radio"
                id="bsp"
                name="ticketType"
                value="bsp"
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
                className={SaleStyles.form.radio}
              />
              <label htmlFor="bsp">BSP</label>
            </div>
            <div className={SaleStyles.form.radioContainer}>
              <input
                type="radio"
                id="airline"
                name="ticketType"
                value="airline"
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
                className={SaleStyles.form.radio}
              />
              <label htmlFor="airline">AIRLINE</label>
            </div>
            <div className={SaleStyles.form.radioContainer}>
              <input
                type="radio"
                id="web"
                name="ticketType"
                value="web"
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
                className={SaleStyles.form.radio}
              />
              <label htmlFor="web">WEB</label>
            </div>
          </div>

          {/* แถวที่ 2: TG, B2B, OTHER */}
          <div className="grid grid-cols-3 gap-2">
            <div className={SaleStyles.form.radioContainer}>
              <input
                type="radio"
                id="tg"
                name="ticketType"
                value="tg"
                checked={formData.ticketType === "tg"}
                onChange={() =>
                  setFormData({
                    ...formData,
                    ticketType: "tg",
                    b2bDetails: "",
                    otherDetails: "",
                  })
                }
                className={SaleStyles.form.radio}
              />
              <label htmlFor="tg" className={SaleStyles.spacing.mr2}>
                TG
              </label>
            </div>
            <div className={SaleStyles.form.radioContainer}>
              <input
                type="radio"
                id="b2b"
                name="ticketType"
                value="b2b"
                checked={formData.ticketType === "b2b"}
                onChange={() =>
                  setFormData({
                    ...formData,
                    ticketType: "b2b",
                    otherDetails: "",
                    tgDetails: "",
                  })
                }
                className={SaleStyles.form.radio}
              />
              <label htmlFor="b2b" className={SaleStyles.spacing.mr2}>
                B2B
              </label>
            </div>
            <div className={SaleStyles.form.radioContainer}>
              <input
                type="radio"
                id="other"
                name="ticketType"
                value="other"
                checked={formData.ticketType === "other"}
                onChange={() =>
                  setFormData({
                    ...formData,
                    ticketType: "other",
                    b2bDetails: "",
                    tgDetails: "",
                  })
                }
                className={SaleStyles.form.radio}
              />
              <label htmlFor="other" className={SaleStyles.spacing.mr2}>
                OTHER
              </label>
            </div>
          </div>

          {/* Input ที่ขึ้นบรรทัดใหม่เมื่อถูกเลือก */}
          {formData.ticketType === "tg" && (
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
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tgDetails: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}
          {formData.ticketType === "b2b" && (
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
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      b2bDetails: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}
          {formData.ticketType === "other" && (
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
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      otherDetails: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TicketTypeSection;
