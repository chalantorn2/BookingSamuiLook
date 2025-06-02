import React from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import SaleStyles, { combineClasses } from "../common/SaleStyles";
import { formatNumber, parseInput } from "../common/FormatNumber";

const ExtrasSection = ({ extras, setExtras }) => {
  const addExtra = () => {
    setExtras([
      ...extras,
      {
        id: extras.length + 1,
        description: "",
        net_price: "",
        sale_price: "",
        quantity: 1,
        total_amount: "",
      },
    ]);
  };

  const removeExtra = (id) => {
    if (extras.length > 1) {
      setExtras(extras.filter((e) => e.id !== id));
    }
  };

  // ฟังก์ชันคำนวณราคารวม (ไม่มีทศนิยม)
  const calculateItemTotal = (price, quantity) => {
    const numPrice = parseInt(price) || 0;
    const numQuantity = parseInt(quantity) || 0;
    return (numPrice * numQuantity).toString();
  };

  return (
    <div
      className={combineClasses(
        SaleStyles.section.container,
        SaleStyles.spacing.my4
      )}
    >
      <section className={SaleStyles.subsection.container}>
        <div className={SaleStyles.section.headerWrapper2}>
          <h2 className={SaleStyles.section.headerTitle}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
            </svg>
            รายการเพิ่มเติม (ทั้งหมด {extras.length} รายการ)
          </h2>
        </div>
        <div className={SaleStyles.subsection.content}>
          <div
            className={combineClasses(
              "grid grid-cols-20 gap-3 text-center font-medium text-sm",
              SaleStyles.spacing.mb2,
              SaleStyles.spacing.mx2
            )}
          >
            <div
              className={combineClasses("col-span-8", SaleStyles.spacing.ml4)}
            >
              รายละเอียด
            </div>
            <div className="col-span-3">ราคาต้นทุน</div>
            <div className="col-span-3">ราคาขาย</div>
            <div className="col-span-1">จำนวน</div>
            <div className="col-span-4">รวม</div>
          </div>
          {extras.map((item, index) => (
            <div
              key={item.id}
              className={combineClasses(
                "grid grid-cols-20 gap-3",
                SaleStyles.spacing.mb2
              )}
            >
              <div className="flex col-span-8">
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
                  value={item.description || ""}
                  onChange={(e) => {
                    const updatedExtras = [...extras];
                    updatedExtras[index].description = e.target.value;
                    setExtras(updatedExtras);
                  }}
                />
              </div>
              <div className="col-span-3">
                <input
                  type="text"
                  className={combineClasses(
                    SaleStyles.form.input,
                    "text-end appearance-none"
                  )}
                  placeholder="0"
                  value={formatNumber(item.net_price) || ""}
                  onChange={(e) => {
                    const updatedExtras = [...extras];
                    updatedExtras[index].net_price = parseInput(e.target.value);
                    setExtras(updatedExtras);
                  }}
                />
              </div>
              <div className="col-span-3">
                <input
                  type="text"
                  className={combineClasses(SaleStyles.form.input, "text-end")}
                  placeholder="0"
                  value={formatNumber(item.sale_price) || ""}
                  onChange={(e) => {
                    const updatedExtras = [...extras];
                    updatedExtras[index].sale_price = parseInput(
                      e.target.value
                    );

                    // คำนวณยอดรวมใหม่
                    const salePrice =
                      parseInt(updatedExtras[index].sale_price) || 0;
                    const quantity = parseInt(updatedExtras[index].quantity);
                    updatedExtras[index].total_amount = calculateItemTotal(
                      salePrice,
                      quantity
                    );

                    setExtras(updatedExtras);
                  }}
                />
              </div>
              <div className="col-span-1">
                <input
                  type="number"
                  min="1"
                  className={combineClasses(
                    SaleStyles.form.input,
                    "text-center"
                  )}
                  placeholder="1"
                  value={item.quantity}
                  onChange={(e) => {
                    const updatedExtras = [...extras];
                    updatedExtras[index].quantity = e.target.value;

                    // คำนวณยอดรวมใหม่
                    const salePrice =
                      parseInt(updatedExtras[index].sale_price) || 0;
                    const quantity = parseInt(e.target.value);
                    updatedExtras[index].total_amount = calculateItemTotal(
                      salePrice,
                      quantity
                    );

                    setExtras(updatedExtras);
                  }}
                />
              </div>
              <div className="col-span-4 flex items-center">
                <input
                  type="text"
                  className={combineClasses(
                    SaleStyles.form.inputDisabled,
                    "text-end"
                  )}
                  placeholder="0"
                  value={formatNumber(item.total_amount) || "0"}
                  disabled
                />
              </div>
              <div className="col-span-1 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removeExtra(item.id)}
                  className={SaleStyles.button.actionButton}
                  disabled={extras.length === 1}
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addExtra}
            className={combineClasses(
              SaleStyles.button.primary,
              SaleStyles.spacing.mt2,
              SaleStyles.spacing.ml4
            )}
          >
            <FiPlus className={SaleStyles.button.icon} /> เพิ่มรายการ
          </button>
        </div>
      </section>
    </div>
  );
};

export default ExtrasSection;
