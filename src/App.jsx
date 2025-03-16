import React, { useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import SaleModule from "./components/modules/Sale/SaleModule";

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeModule, setActiveModule] = useState("sale");
  const [activeSubmenu, setActiveSubmenu] = useState("1.1"); // เพิ่มส่วนนี้เพื่อติดตามเมนูย่อยที่กำลังใช้งาน

  const renderContent = () => {
    switch (activeModule) {
      case "sale":
        return <SaleModule activeSubmenu={activeSubmenu} />;
      // กรณีอื่นๆ สามารถเพิ่มเติมได้ในอนาคต
      default:
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">
              หน้าหลัก SamuiLookBooking
            </h1>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        setActiveModule={setActiveModule}
        activeModule={activeModule}
        setActiveSubmenu={setActiveSubmenu}
        activeSubmenu={activeSubmenu}
      />
      <div
        className={`transition-all duration-300 flex-1 ${
          collapsed ? "ml-16" : "ml-72"
        } overflow-auto`}
      >
        {renderContent()}
      </div>
    </div>
  );
};

export default App;
