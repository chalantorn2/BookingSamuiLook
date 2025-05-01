import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Overview from "./pages/Overview";
import SaleModule from "./pages/Sales";
import DocumentsModule from "./pages/Documents";
import ViewModule from "./pages/View";
import Information from "./pages/Information";
import UserManagement from "./pages/UserManagement";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import RegisterSuccess from "./components/auth/RegisterSuccess";
import ActivityLog from "./pages/Admin/ActivityLog";

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeModule, setActiveModule] = useState("overview");
  const [activeSubmenu, setActiveSubmenu] = useState("0");

  const renderContent = () => {
    switch (activeModule) {
      case "overview":
        return <Overview />;
      case "sale":
        return <SaleModule activeSubmenu={activeSubmenu} />;
      case "view":
        return <ViewModule activeSubmenu={activeSubmenu} />;
      case "documents":
        return <DocumentsModule activeSubmenu={activeSubmenu} />;
      case "information":
        return <Information />;
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
      case "settings":
        // ตรวจสอบ submenu ของ settings - ในที่นี้มีแค่ User Management
        return <UserManagement />;
      default:
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">
              หน้าหลัก SamuiLookBooking
            </h1>
          </div>
        );
      case "admin":
        // ตรวจสอบ submenu ของ admin
        if (activeSubmenu === "7.1") {
          return <ActivityLog />;
        }
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Admin Module</h1>
            <p>เลือกเมนูย่อยเพื่อจัดการระบบ</p>
          </div>
        );
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-success" element={<RegisterSuccess />} />
        <Route
          path="/*"
          element={
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
                  collapsed ? "ml-16" : "ml-64"
                } overflow-auto`}
              >
                {renderContent()}
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
