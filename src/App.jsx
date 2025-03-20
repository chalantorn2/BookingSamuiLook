// ปรับปรุงไฟล์ App.jsx

import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import SaleModule from "./components/modules/Sale/SaleModule";
import DocumentsModule from "./components/modules/Documents/DocumentsModule";
import ViewModule from "./components/modules/View/ViewModule";
import Information from "./components/modules/Information/Information";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import RegisterSuccess from "./components/auth/RegisterSuccess";

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeModule, setActiveModule] = useState("sale");
  const [activeSubmenu, setActiveSubmenu] = useState("1.1");

  const renderContent = () => {
    switch (activeModule) {
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
