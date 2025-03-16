import React, { useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import SaleModule from "./components/modules/Sale/SaleModule";
import DocumentsModule from "./components/modules/Documents/DocumentsModule";

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeModule, setActiveModule] = useState("sale");
  const [activeSubmenu, setActiveSubmenu] = useState("1.1"); // เพิ่มส่วนนี้เพื่อติดตามเมนูย่อยที่กำลังใช้งาน

  const renderContent = () => {
    switch (activeModule) {
      case "sale":
        return <SaleModule activeSubmenu={activeSubmenu} />;
      case "documents":
        return <DocumentsModule activeSubmenu={activeSubmenu} />;
      case "search":
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Search Module</h1>
            <p>ค้นหาข้อมูลตามเงื่อนไขต่างๆ</p>
          </div>
        );
      case "reports":
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Reports Module</h1>
            <p>รายงานต่างๆ ของระบบ</p>
          </div>
        );
      case "refund":
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Refund Module</h1>
            <p>จัดการการคืนเงิน</p>
          </div>
        );
      case "information":
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Information Module</h1>
            <p>ข้อมูล Supplier, Customer, Type</p>
          </div>
        );
      case "settings":
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Settings Module</h1>
            <p>ตั้งค่าระบบต่างๆ</p>
          </div>
        );
      case "profile":
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">User Profile</h1>
            <p>จัดการข้อมูลส่วนตัว</p>
          </div>
        );
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
