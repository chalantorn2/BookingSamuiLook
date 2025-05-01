import React from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import SaleStyles, { combineClasses } from "../common/SaleStyles";

const RouteSection = ({ routes, setRoutes }) => {
  const addRoute = () => {
    setRoutes([
      ...routes,
      {
        id: routes.length + 1,
        date: "",
        airline: "",
        flight: "",
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

  return (
    <section
      className={combineClasses(SaleStyles.subsection.container, "col-span-8")}
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
            <div className="grid grid-cols-2 md:grid-cols-8 gap-3">
              {[
                { label: "สายการบิน", key: "airline" },
                { label: "เที่ยวบิน", key: "flight" },
                { label: "RBD", key: "rbd" },
                { label: "วันที่", key: "date" },
                { label: "ต้นทาง", key: "origin" },
                { label: "ปลายทาง", key: "destination" },
                { label: "เวลาออก", key: "departure" },
                { label: "เวลาถึง", key: "arrival" },
              ].map((field) => (
                <div key={field.key} className="col-span-1">
                  <label
                    className={combineClasses(SaleStyles.form.label, "text-xs")}
                  >
                    {field.label}
                  </label>
                  <input type="text" className={SaleStyles.form.input} />
                </div>
              ))}
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
