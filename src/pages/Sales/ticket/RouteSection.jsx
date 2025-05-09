import React from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import SaleStyles, { combineClasses } from "../common/SaleStyles";

const RouteSection = ({ routes, setRoutes, supplierCode }) => {
  const addRoute = () => {
    setRoutes([
      ...routes,
      {
        id: routes.length + 1,
        date: "",
        flight: "",
        rbd: "",
        origin: "",
        destination: "",
        departure: "",
        arrival: "",
      },
    ]);
  };

  const removeRoute = (id) => {
    if (routes.length > 1) {
      setRoutes(routes.filter((r) => r.id !== id));
    }
  };

  const formatTime = (value) => {
    // Allow complete deletion
    if (!value) return "";
    // Allow only digits, colon, and dot
    return value.replace(/[^0-9:.]/g, "");
  };

  return (
    <section
      className={combineClasses(SaleStyles.subsection.container, "col-span-7")}
    >
      <div className={SaleStyles.subsection.header}>
        <h2 className={SaleStyles.subsection.title}>
          เส้นทางการเดินทาง (ทั้งหมด {routes.length} เส้นทาง)
        </h2>
      </div>
      <div className={SaleStyles.subsection.content}>
        {routes.map((route, index) => (
          <div
            key={route.id}
            className={combineClasses(
              "mb-2 border border-gray-400 rounded-md p-3 bg-gray-50"
            )}
          >
            <div
              className={combineClasses(
                SaleStyles.grid.spaceBetween,
                SaleStyles.spacing.mb2
              )}
            >
              <h3 className="font-medium text-sm">เส้นทางที่ {index + 1}</h3>
              <button
                type="button"
                onClick={() => removeRoute(route.id)}
                className={SaleStyles.button.actionButton}
                disabled={routes.length === 1}
              >
                <FiTrash2 size={18} />
              </button>
            </div>
            <div className="grid grid-cols-28 gap-3">
              {/* เที่ยวบิน: ให้มีพื้นที่มากขึ้น (6 ส่วน) */}
              <div className="col-span-6">
                <label className="text-xs text-center block mb-1">
                  เที่ยวบิน
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-400 rounded-md p-2 text-center focus:ring-blue-500 focus:border-blue-500 text-transform uppercase"
                  value={
                    supplierCode
                      ? `${supplierCode}${route.flight || ""}`
                      : route.flight || ""
                  }
                  onChange={(e) => {
                    const updatedRoutes = [...routes];
                    if (supplierCode) {
                      updatedRoutes[index].flight = e.target.value.replace(
                        supplierCode,
                        ""
                      );
                    } else {
                      updatedRoutes[index].flight =
                        e.target.value.toUpperCase();
                    }
                    setRoutes(updatedRoutes);
                  }}
                />
              </div>

              {/* RBD: ให้เล็กที่สุด (2 ส่วน) */}
              <div className="col-span-2">
                <label className="text-xs text-center block mb-1">RBD</label>
                <input
                  type="text"
                  className="w-full border border-gray-400 rounded-md p-2 text-center focus:ring-blue-500 focus:border-blue-500 text-transform uppercase"
                  value={route.rbd || ""}
                  onChange={(e) => {
                    const updatedRoutes = [...routes];
                    updatedRoutes[index].rbd = e.target.value
                      .toUpperCase()
                      .substring(0, 1);
                    setRoutes(updatedRoutes);
                  }}
                  maxLength={1}
                />
              </div>

              {/* วันที่: ให้มีพื้นที่ปกติ (4 ส่วน) */}
              <div className="col-span-4">
                <label className="text-xs text-center block mb-1">วันที่</label>
                <input
                  type="text"
                  className="w-full border border-gray-400 rounded-md p-2 text-center focus:ring-blue-500 focus:border-blue-500 text-transform uppercase"
                  value={route.date || ""}
                  onChange={(e) => {
                    const updatedRoutes = [...routes];
                    updatedRoutes[index].date = e.target.value.toUpperCase();
                    setRoutes(updatedRoutes);
                  }}
                />
              </div>

              {/* ต้นทาง: ให้มีพื้นที่ปกติ (3 ส่วน) */}
              <div className="col-span-4">
                <label className="text-xs text-center block mb-1">ต้นทาง</label>
                <input
                  type="text"
                  className="w-full border border-gray-400 rounded-md p-2 text-center focus:ring-blue-500 focus:border-blue-500 text-transform uppercase"
                  value={route.origin || ""}
                  onChange={(e) => {
                    const updatedRoutes = [...routes];
                    updatedRoutes[index].origin = e.target.value.toUpperCase();
                    setRoutes(updatedRoutes);
                  }}
                />
              </div>

              {/* ปลายทาง: ให้มีพื้นที่ปกติ (3 ส่วน) */}
              <div className="col-span-4">
                <label className="text-xs text-center block mb-1">
                  ปลายทาง
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-400 rounded-md p-2 text-center focus:ring-blue-500 focus:border-blue-500 text-transform uppercase"
                  value={route.destination || ""}
                  onChange={(e) => {
                    const updatedRoutes = [...routes];
                    updatedRoutes[index].destination =
                      e.target.value.toUpperCase();
                    setRoutes(updatedRoutes);
                  }}
                />
              </div>

              {/* เวลาออก: ให้มีพื้นที่ปกติ (3 ส่วน) */}
              <div className="col-span-4">
                <label className="text-xs text-center block mb-1">
                  เวลาออก
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-400 rounded-md p-2 text-center focus:ring-blue-500 focus:border-blue-500"
                  value={route.departure || ""}
                  onChange={(e) => {
                    const updatedRoutes = [...routes];
                    updatedRoutes[index].departure = formatTime(e.target.value);
                    setRoutes(updatedRoutes);
                  }}
                  pattern="^([0-1]?[0-9]|2[0-3])[:.][0-5][0-9]$"
                />
              </div>

              {/* เวลาถึง: ให้มีพื้นที่ปกติ (3 ส่วน) */}
              <div className="col-span-4">
                <label className="text-xs text-center block mb-1">
                  เวลาถึง
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-400 rounded-md p-2 text-center focus:ring-blue-500 focus:border-blue-500"
                  value={route.arrival || ""}
                  onChange={(e) => {
                    const updatedRoutes = [...routes];
                    updatedRoutes[index].arrival = formatTime(e.target.value);
                    setRoutes(updatedRoutes);
                  }}
                  pattern="^([0-1]?[0-9]|2[0-3])[:.][0-5][0-9]$"
                />
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addRoute}
          className={combineClasses(
            SaleStyles.button.primary,
            SaleStyles.spacing.mt1
          )}
        >
          <FiPlus className={SaleStyles.button.icon} /> เพิ่มเส้นทาง
        </button>
      </div>
    </section>
  );
};

export default RouteSection;
