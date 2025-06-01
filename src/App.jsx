import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Overview from "./pages/Overview";
import SaleModule from "./pages/Sales";
import DocumentsModule from "./pages/Documents";
import ViewModule from "./pages/View";
import Information from "./pages/Information";
import UserManagement from "./pages/UserManagement";
import Login from "./pages/Login";
import ActivityLog from "./pages/Admin/ActivityLog";
import PrivateRoute from "./pages/Login/PrivateRoute";
import { AuthProvider } from "./pages/Login/AuthContext";
import { AlertDialogProvider } from "./contexts/AlertDialogContext";

const App = () => {
  const [collapsed, setCollapsed] = useState(false);

  // Global Handler สำหรับแปลงข้อมูลเป็นตัวใหญ่
  useEffect(() => {
    // ฟิลด์ที่ไม่ต้องการให้เป็นตัวใหญ่
    const excludeFields = [
      "email",
      "password",
      "confirmPassword",
      "phone",
      "contactDetails",
      "address",
      "remarks",
    ];

    const handleInputChange = (event) => {
      const input = event.target;

      // ตรวจสอบว่าเป็น input หรือ textarea เท่านั้น (ข้าม select)
      if (!["INPUT", "TEXTAREA"].includes(input.tagName)) return;

      // ตรวจสอบ type ของ input
      if (
        ["email", "password", "tel", "number", "date", "time"].includes(
          input.type
        )
      )
        return;

      // ตรวจสอบ name หรือ class ที่ไม่ต้องการ
      const inputName = input.name || "";
      const inputClass = input.className || "";

      // ข้ามฟิลด์ที่ไม่ต้องการแปลง
      if (
        excludeFields.some(
          (field) =>
            inputName.toLowerCase().includes(field.toLowerCase()) ||
            inputClass.toLowerCase().includes(field.toLowerCase())
        )
      )
        return;

      // ข้ามถ้ามี class ที่บอกว่าไม่ต้องแปลง
      if (
        inputClass.includes("no-uppercase") ||
        inputClass.includes("inputNoUppercase")
      )
        return;

      // แปลงเป็นตัวใหญ่
      const cursorPosition = input.selectionStart;
      const uppercaseValue = input.value.toUpperCase();

      if (input.value !== uppercaseValue) {
        input.value = uppercaseValue;

        // ตรวจสอบว่า element รองรับ setSelectionRange
        if (typeof input.setSelectionRange === "function") {
          input.setSelectionRange(cursorPosition, cursorPosition);
        }

        // สร้าง event ใหม่เพื่อให้ React รับรู้การเปลี่ยนแปลง
        const event = new Event("input", { bubbles: true });
        input.dispatchEvent(event);
      }
    };

    // เพิ่ม event listener
    document.addEventListener("input", handleInputChange);

    // ทำความสะอาดเมื่อ component unmount
    return () => {
      document.removeEventListener("input", handleInputChange);
    };
  }, []);

  return (
    <AuthProvider>
      <AlertDialogProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes */}
            <Route element={<PrivateRoute />}>
              <Route
                path="*"
                element={
                  <div className="flex h-screen bg-gray-100">
                    <Sidebar
                      collapsed={collapsed}
                      setCollapsed={setCollapsed}
                    />
                    <div
                      className={`transition-all duration-300 flex-1 ${
                        collapsed ? "ml-16" : "ml-64"
                      } overflow-auto`}
                    >
                      <Routes>
                        <Route path="/" element={<Overview />} />
                        <Route path="/overview" element={<Overview />} />
                        <Route
                          path="/sale/ticket"
                          element={<SaleModule activeSubmenu="1.1" />}
                        />
                        <Route
                          path="/sale/deposit"
                          element={<SaleModule activeSubmenu="1.2" />}
                        />
                        <Route
                          path="/sale/voucher"
                          element={<SaleModule activeSubmenu="1.3" />}
                        />
                        <Route
                          path="/sale/other"
                          element={<SaleModule activeSubmenu="1.4" />}
                        />
                        <Route
                          path="/view/flight-tickets"
                          element={<ViewModule activeSubmenu="2.1" />}
                        />
                        <Route
                          path="/view/bus"
                          element={<ViewModule activeSubmenu="2.2" />}
                        />
                        <Route
                          path="/view/boat"
                          element={<ViewModule activeSubmenu="2.3" />}
                        />
                        <Route
                          path="/view/tour"
                          element={<ViewModule activeSubmenu="2.4" />}
                        />
                        <Route
                          path="/view/travel-insurance"
                          element={<ViewModule activeSubmenu="2.5" />}
                        />
                        <Route
                          path="/view/hotel"
                          element={<ViewModule activeSubmenu="2.6" />}
                        />
                        <Route
                          path="/view/train"
                          element={<ViewModule activeSubmenu="2.7" />}
                        />
                        <Route
                          path="/view/visa"
                          element={<ViewModule activeSubmenu="2.8" />}
                        />
                        <Route
                          path="/view/other-services"
                          element={<ViewModule activeSubmenu="2.9" />}
                        />
                        <Route
                          path="/documents/invoice-list"
                          element={<DocumentsModule activeSubmenu="6.1" />}
                        />
                        <Route
                          path="/documents/receipt-list"
                          element={<DocumentsModule activeSubmenu="6.2" />}
                        />
                        <Route
                          path="/documents/deposit-list"
                          element={<DocumentsModule activeSubmenu="6.3" />}
                        />
                        <Route
                          path="/documents/voucher-list"
                          element={<DocumentsModule activeSubmenu="6.4" />}
                        />
                        <Route path="/information" element={<Information />} />

                        {/* Admin-only routes */}
                        <Route element={<PrivateRoute requiredRole="admin" />}>
                          <Route
                            path="/user-management"
                            element={<UserManagement />}
                          />
                          <Route
                            path="/admin/activity-log"
                            element={<ActivityLog />}
                          />
                        </Route>

                        <Route
                          path="/search"
                          element={
                            <div className="p-6">
                              <h1 className="text-2xl font-bold mb-4">
                                Search Module
                              </h1>
                              <p>ค้นหาข้อมูลตามเงื่อนไขต่างๆ</p>
                            </div>
                          }
                        />
                        <Route
                          path="/reports"
                          element={
                            <div className="p-6">
                              <h1 className="text-2xl font-bold mb-4">
                                Reports Module
                              </h1>
                              <p>รายงานต่างๆ ของระบบ</p>
                            </div>
                          }
                        />
                        <Route
                          path="/refund"
                          element={
                            <div className="p-6">
                              <h1 className="text-2xl font-bold mb-4">
                                Refund Module
                              </h1>
                              <p>จัดการการคืนเงิน</p>
                            </div>
                          }
                        />
                      </Routes>
                    </div>
                  </div>
                }
              />
            </Route>
          </Routes>
        </Router>
      </AlertDialogProvider>
    </AuthProvider>
  );
};

export default App;
