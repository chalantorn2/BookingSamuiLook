import React, { useState } from "react";
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
