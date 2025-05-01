import React from "react";

/**
 * PricingTable Component - ใช้สำหรับแสดงและจัดการตารางราคาในหน้าต่างๆ
 *
 * @param {Object} props - Properties ของ component
 * @param {Object} props.pricing - Object ที่เก็บข้อมูลราคา (adult, child, infant)
 * @param {Function} props.updatePricing - Function สำหรับอัพเดทราคา
 * @param {string} props.title - หัวข้อของตาราง (optional)
 * @param {Object} props.config - การตั้งค่าเพิ่มเติม (optional)
 * @param {boolean} props.config.showHeaders - แสดงหัวข้อคอลัมน์หรือไม่ (default: true)
 * @param {boolean} props.config.showBorder - แสดงเส้นขอบหรือไม่ (default: true)
 * @param {boolean} props.config.showTotal - แสดงยอดรวมหรือไม่ (default: true)
 * @param {boolean} props.config.enableEdit - สามารถแก้ไขได้หรือไม่ (default: true)
 * @returns {JSX.Element}
 */
const PricingTable = ({
  pricing = {
    adult: { net: "", sale: "", pax: 1, total: 0 },
    child: { net: "", sale: "", pax: 0, total: 0 },
    infant: { net: "", sale: "", pax: 0, total: 0 },
  },
  updatePricing,
  title = "",
  config = {
    showHeaders: true,
    showBorder: true,
    showTotal: true,
    enableEdit: true,
  },
}) => {
  // ฟังก์ชันคำนวณราคารวมต่อรายการ
  const calculateItemTotal = (price, quantity) => {
    const numPrice = parseFloat(price) || 0;
    const numQuantity = parseFloat(quantity) || 0;
    return (numPrice * numQuantity).toFixed(2);
  };

  // ฟังก์ชันอัพเดทข้อมูลราคา
  const handleUpdatePricing = (category, field, value) => {
    // ถ้าไม่มี updatePricing function ที่ส่งมา ให้ return ออกไป
    if (!updatePricing) return;

    let newTotal = pricing[category].total;

    // คำนวณ total ใหม่
    if (field === "pax") {
      newTotal = calculateItemTotal(pricing[category].sale, value);
    } else if (field === "sale") {
      newTotal = calculateItemTotal(value, pricing[category].pax);
    }

    // เรียกใช้ updatePricing function ที่ส่งมาจาก parent component
    updatePricing(category, field, value, newTotal);
  };

  // คำนวณยอดรวมทั้งหมด
  const calculateTotal = () => {
    const adultTotal = parseFloat(pricing.adult?.total || 0);
    const childTotal = parseFloat(pricing.child?.total || 0);
    const infantTotal = parseFloat(pricing.infant?.total || 0);

    return (adultTotal + childTotal + infantTotal).toFixed(2);
  };

  // แปลง string เป็น number สำหรับการแสดงผล
  const formatNumber = (value) => {
    if (!value) return "";
    return parseFloat(value).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className={`${config.showBorder ? "rounded-lg" : ""}`}>
      {title && (
        <div className="bg-blue-100 text-blue-600 p-3">
          <h2 className="font-semibold">{title}</h2>
        </div>
      )}
      <div className="mb-2">
        {config.showHeaders && (
          <div className="bg-blue-100 text-blue-600 p-2 rounded-t-lg grid grid-cols-12 text-center font-medium">
            <div className="col-span-1"></div>
            <div className="col-span-3">Net</div>
            <div className="col-span-3">Sale</div>
            <div className="col-span-1">Pax</div>
            <div className="col-span-4">Total</div>
          </div>
        )}

        {/* Adult Row */}
        <div className="grid grid-cols-12 gap-2 pt-2 p-1 pl-3 items-center bg-white">
          <div className="col-span-1">
            <span className="text-right col-span-1 font-medium">Adult</span>
          </div>
          <div className="col-span-3">
            <input
              type="text"
              min="0"
              step="1"
              className="w-full border text-right border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
              value={pricing.adult?.net || ""}
              onChange={(e) =>
                handleUpdatePricing("adult", "net", e.target.value)
              }
              disabled={!config.enableEdit}
            />
          </div>
          <div className="col-span-3">
            <input
              type="text"
              min="0"
              step="1"
              className="w-full border border-gray-400 text-right rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
              value={pricing.adult?.sale || ""}
              onChange={(e) =>
                handleUpdatePricing("adult", "sale", e.target.value)
              }
              disabled={!config.enableEdit}
            />
          </div>
          <div className="col-span-1">
            <input
              type="number"
              min="0"
              className="w-full border border-gray-400 text-center rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
              value={pricing.adult?.pax || ""}
              onChange={(e) =>
                handleUpdatePricing("adult", "pax", e.target.value)
              }
              disabled={!config.enableEdit}
            />
          </div>
          <div className="col-span-4">
            <input
              type="text"
              className="w-full border border-gray-400 text-right rounded-md p-2 bg-gray-100"
              placeholder="0"
              value={formatNumber(pricing.adult?.total)}
              disabled
            />
          </div>
        </div>

        {/* Child Row */}
        <div className="grid grid-cols-12 gap-2 pt-2 p-1 pl-3 items-center bg-white">
          <div className="col-span-1">
            <span className="text-right col-span-1 font-medium">Child</span>
          </div>
          <div className="col-span-3">
            <input
              type="text"
              min="0"
              step="1"
              className="w-full border text-right border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
              value={pricing.child?.net || ""}
              onChange={(e) =>
                handleUpdatePricing("child", "net", e.target.value)
              }
              disabled={!config.enableEdit}
            />
          </div>
          <div className="col-span-3">
            <input
              type="text"
              min="0"
              step="1"
              className="w-full border border-gray-400 text-right rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
              value={pricing.child?.sale || ""}
              onChange={(e) =>
                handleUpdatePricing("child", "sale", e.target.value)
              }
              disabled={!config.enableEdit}
            />
          </div>
          <div className="col-span-1">
            <input
              type="number"
              min="0"
              className="w-full border border-gray-400 text-center rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
              value={pricing.child?.pax || ""}
              onChange={(e) =>
                handleUpdatePricing("child", "pax", e.target.value)
              }
              disabled={!config.enableEdit}
            />
          </div>
          <div className="col-span-4">
            <input
              type="text"
              className="w-full border border-gray-400 text-right rounded-md p-2 bg-gray-100"
              placeholder="0"
              value={formatNumber(pricing.child?.total)}
              disabled
            />
          </div>
        </div>

        {/* Infant Row */}
        <div className="grid grid-cols-12 gap-2 pt-2 p-1 pl-3 items-center bg-white">
          <div className="col-span-1">
            <span className="text-right col-span-1 font-medium">Infant</span>
          </div>
          <div className="col-span-3">
            <input
              type="text"
              min="0"
              step="1"
              className="w-full border text-right border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
              value={pricing.infant?.net || ""}
              onChange={(e) =>
                handleUpdatePricing("infant", "net", e.target.value)
              }
              disabled={!config.enableEdit}
            />
          </div>
          <div className="col-span-3">
            <input
              type="text"
              min="0"
              step="1"
              className="w-full border border-gray-400 text-right rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
              value={pricing.infant?.sale || ""}
              onChange={(e) =>
                handleUpdatePricing("infant", "sale", e.target.value)
              }
              disabled={!config.enableEdit}
            />
          </div>
          <div className="col-span-1">
            <input
              type="number"
              min="0"
              className="w-full border border-gray-400 text-center rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
              value={pricing.infant?.pax || ""}
              onChange={(e) =>
                handleUpdatePricing("infant", "pax", e.target.value)
              }
              disabled={!config.enableEdit}
            />
          </div>
          <div className="col-span-4">
            <input
              type="text"
              className="w-full border border-gray-400 text-right rounded-md p-2 bg-gray-100"
              placeholder="0"
              value={formatNumber(pricing.infant?.total)}
              disabled
            />
          </div>
        </div>

        {/* Summary Total (optional) */}
        {/* {config.showTotal && (
          <div className="grid grid-cols-12 gap-2 pt-2 p-1 pl-3 items-center bg-white border-t border-gray-200 mt-2">
            <div className="col-span-8 text-right font-semibold">
              รวมทั้งสิ้น:
            </div>
            <div className="col-span-4">
              <input
                type="text"
                className="w-full border border-gray-400 text-right rounded-md p-2 bg-blue-50 font-bold text-blue-600"
                value={formatNumber(calculateTotal())}
                disabled
              />
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default PricingTable;
