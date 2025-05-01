import React from "react";
import SaleStyles, { combineClasses } from "../common/SaleStyles";

const TicketTypeSection = ({ formData, setFormData }) => {
  return (
    <section
      className={combineClasses(
        SaleStyles.subsection.container,
        "col-span-2 self-start"
      )}
    >
      <div className={SaleStyles.subsection.header}>
        <h2 className={SaleStyles.subsection.title}>ประเภทตั๋ว</h2>
      </div>
      <div className={SaleStyles.subsection.content}>
        <div className="grid grid-cols-2 gap-2">
          {["BSP", "AIRLINE", "DOM", "WEB"].map((type) => (
            <div key={type} className={SaleStyles.form.radioContainer}>
              <input
                type="radio"
                id={type.toLowerCase()}
                name="ticketType"
                value={type.toLowerCase()}
                checked={formData.ticketType === type.toLowerCase()}
                onChange={() =>
                  setFormData({
                    ...formData,
                    ticketType: type.toLowerCase(),
                  })
                }
                className={SaleStyles.form.radio}
              />
              <label htmlFor={type.toLowerCase()}>{type}</label>
            </div>
          ))}
          <div
            className={combineClasses(
              SaleStyles.form.radioContainer,
              "col-span-2"
            )}
          >
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
                })
              }
              className={SaleStyles.form.radio}
            />
            <label htmlFor="b2b" className={SaleStyles.spacing.mr2}>
              B2B
            </label>
            <input
              type="text"
              className={combineClasses(SaleStyles.form.input, "flex-1 w-full")}
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
          <div
            className={combineClasses(
              SaleStyles.form.radioContainer,
              "col-span-2"
            )}
          >
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
                })
              }
              className={SaleStyles.form.radio}
            />
            <label htmlFor="other" className={SaleStyles.spacing.mr2}>
              OTHER
            </label>
            <input
              type="text"
              className={combineClasses(SaleStyles.form.input, "flex-1 w-full")}
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
      </div>
    </section>
  );
};

export default TicketTypeSection;
