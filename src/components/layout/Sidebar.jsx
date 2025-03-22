import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  FileText,
  RefreshCcw,
  Database,
  File,
  Settings,
  ChevronsRight,
  ChevronsLeft,
  ChevronRight,
  Search,
  BarChart,
  LogOut,
  Eye,
  User,
} from "lucide-react";
import logoImage from "../../assets/Logo.png";

const Sidebar = ({
  collapsed,
  setCollapsed,
  setActiveModule,
  activeModule,
  setActiveSubmenu,
  activeSubmenu,
}) => {
  const [activeMenu, setActiveMenu] = useState(null);

  // Update active menu when active module changes
  useEffect(() => {
    if (activeModule === "sale") {
      setActiveMenu(1);
    } else if (activeModule === "view") {
      setActiveMenu(2);
    } else if (activeModule === "reports") {
      setActiveMenu(3);
    } else if (activeModule === "refund") {
      setActiveMenu(4);
    } else if (activeModule === "information") {
      setActiveMenu(5);
    } else if (activeModule === "documents") {
      setActiveMenu(6);
    } else if (activeModule === "settings") {
      setActiveMenu(7);
    }
  }, [activeModule]);

  // Reorganized menu structure with improved UX
  const menuData = [
    {
      id: 1,
      title: "Sales",
      icon: <ShoppingCart size={18} />,
      module: "sale",
      submenu: [
        { id: "1.1", title: "Sale Ticket" },
        { id: "1.2", title: "Sale Deposit" },
        { id: "1.3", title: "Sale Voucher" },
        { id: "1.4", title: "Sale Other" },
      ],
    },
    {
      id: 2,
      title: "View",
      icon: <Eye size={18} />,
      module: "view",
      submenu: [
        { id: "2.1", title: "Flight Tickets" },
        { id: "2.2", title: "Bus" },
        { id: "2.3", title: "Boat" },
        { id: "2.4", title: "Tour" },
        { id: "2.5", title: "Travel Insurance" },
        { id: "2.6", title: "Hotel" },
        { id: "2.7", title: "Train" },
        { id: "2.8", title: "Visa" },
        { id: "2.9", title: "Other Services" },
      ],
    },
    {
      id: 3,
      title: "Reports",
      icon: <BarChart size={18} />,
      module: "reports",
      disabled: true,
      submenu: [],
    },
    {
      id: 4,
      title: "Refund",
      icon: <RefreshCcw size={18} />,
      module: "refund",
      disabled: true,
      submenu: [
        { id: "4.1", title: "Create Refund" },
        { id: "4.2", title: "Refund Report" },
      ],
    },
    {
      id: 5,
      title: "Information",
      icon: <Database size={18} />,
      module: "information",
      submenu: [],
    },
    {
      id: 6,
      title: "Documents",
      icon: <File size={18} />,
      module: "documents",
      submenu: [
        { id: "6.1", title: "Invoice List" },
        { id: "6.2", title: "Receipt List" },
        { id: "6.3", title: "Deposit List" },
        { id: "6.4", title: "Voucher List" },
      ],
    },
  ];

  const toggleMenu = (menuId, module) => {
    if (activeMenu === menuId) {
      setActiveMenu(null);
    } else {
      setActiveMenu(menuId);
      setActiveModule(module);
    }
  };

  const handleSubmenuClick = (submenuId) => {
    setActiveSubmenu(submenuId);
  };

  const handleLogout = () => {
    // Logout functionality would go here
    console.log("Logging out...");
    window.location.href = "/login";
  };

  const handleSettings = () => {
    setActiveModule("settings");
    setActiveSubmenu("7.1"); // User Management submenu
  };

  return (
    <div
      className={`h-screen fixed top-0 left-0 bg-white shadow-lg flex flex-col transition-all duration-300 ease-in-out z-10 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Logo Section */}
      <div className="flex items-center p-4 border-b border-gray-100">
        {!collapsed && (
          <div className="flex items-center">
            <img
              src={logoImage}
              alt="SamuiLookBooking"
              className="w-8 h-8 object-contain"
            />
            <div className="ml-3 font-semibold text-gray-800 transition-opacity duration-300">
              SamuiLookBooking
            </div>
          </div>
        )}
        <button
          className={`${
            collapsed ? "mx-auto" : "ml-auto"
          } bg-transparent border-0 cursor-pointer text-gray-500 hover:text-gray-700 focus:outline-none transition-transform duration-300 hover:scale-110`}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
        </button>
      </div>

      {/* Menu Section */}
      <div className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-gray-200">
        {/* Main menu items */}
        {menuData.map((menu) => (
          <div key={menu.id} className="mb-1 px-3">
            <div
              className={`flex items-center px-3 py-2 cursor-pointer rounded-md transition-all duration-200 group ${
                menu.disabled ? "opacity-50 cursor-not-allowed" : ""
              } ${
                activeMenu === menu.id
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() =>
                menu.disabled ? null : toggleMenu(menu.id, menu.module)
              }
            >
              <span
                className={`${
                  activeMenu === menu.id ? "text-blue-500" : "text-gray-500"
                } transition-transform duration-200 ${
                  activeMenu === menu.id ? "scale-110" : ""
                }`}
              >
                {menu.icon}
              </span>
              {!collapsed && (
                <>
                  <span className="flex-1 ml-3 text-sm font-medium">
                    {menu.title}
                  </span>
                  {menu.submenu && menu.submenu.length > 0 && (
                    <span
                      className={`text-gray-400 transition-transform duration-300 ease-in-out ${
                        activeMenu === menu.id ? "rotate-90" : ""
                      }`}
                    >
                      <ChevronRight size={14} />
                    </span>
                  )}
                </>
              )}
              {collapsed &&
                menu.submenu &&
                menu.submenu.length > 0 &&
                !menu.disabled && (
                  <div className="absolute left-full ml-2 bg-white rounded-md shadow-lg p-2 w-48 z-10 hidden group-hover:block opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
                    <div className="text-sm font-medium text-gray-800 mb-2">
                      {menu.title}
                    </div>
                    {menu.submenu.map((submenu) => (
                      <div
                        key={submenu.id}
                        className="py-1 px-2 text-sm cursor-pointer rounded-md hover:bg-gray-50 text-gray-600 transition-colors duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSubmenuClick(submenu.id);
                        }}
                      >
                        {submenu.title}
                      </div>
                    ))}
                  </div>
                )}
            </div>

            {/* Submenu items with animation */}
            {!collapsed &&
              activeMenu === menu.id &&
              menu.submenu &&
              menu.submenu.length > 0 && (
                <div
                  className="pl-9 pr-3 mt-1 mb-2 overflow-hidden transition-all duration-300 ease-in-out"
                  style={{
                    maxHeight: "500px", // A large enough value to accommodate all items
                    animation: "slideDown 0.3s ease-in-out",
                  }}
                >
                  {menu.submenu.map((submenu, index) => (
                    <div
                      key={submenu.id}
                      className={`py-2 px-2 text-xs cursor-pointer rounded-md transition-all duration-200 ease-in-out ${
                        activeSubmenu === submenu.id
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                      onClick={() => handleSubmenuClick(submenu.id)}
                      style={{
                        animationDelay: `${index * 0.05}s`,
                        animation: "fadeInLeft 0.2s ease-in-out forwards",
                        opacity: 0,
                        transform: "translateX(-10px)",
                      }}
                    >
                      {submenu.title}
                    </div>
                  ))}
                </div>
              )}
          </div>
        ))}
      </div>

      {/* User Profile Section */}
      <div className="px-3 pt-1 pb-3 border-t border-gray-100">
        {/* Current User Info */}
        {!collapsed ? (
          <div className="bg-blue-50 rounded-md p-3 mb-3 flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-2 flex-shrink-0">
              <span className="text-sm font-medium">ชม</span>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-blue-700 truncate">
                นายชลันธร มานพ
              </div>
              <div className="text-xs text-blue-600">Admin</div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
              <span className="text-sm font-medium">ชม</span>
            </div>
          </div>
        )}

        {/* Settings Button */}
        <div
          className="flex items-center px-3 py-2 mb-2 cursor-pointer rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          onClick={handleSettings}
        >
          <span
            className={`${
              activeModule === "settings" ? "text-blue-500" : "text-gray-500"
            } transition-transform duration-200 ${
              activeModule === "settings" ? "scale-110" : ""
            }`}
          >
            <Settings size={18} />
          </span>
          {!collapsed && (
            <span className="ml-3 text-sm font-medium">User Management</span>
          )}
        </div>

        {/* Login Button */}
        <div
          className="flex items-center px-3 py-2 mb-2 cursor-pointer rounded-md text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 ease-in-out"
          onClick={() => (window.location.href = "/login")}
        >
          <span className="text-gray-500 transition-transform duration-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
              <polyline points="10 17 15 12 10 7"></polyline>
              <line x1="15" y1="12" x2="3" y2="12"></line>
            </svg>
          </span>
          {!collapsed && (
            <span className="ml-3 text-sm font-medium">Login</span>
          )}
        </div>

        {/* Logout Button */}
        <div
          className="flex items-center px-3 py-2 cursor-pointer rounded-md text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 ease-in-out"
          onClick={handleLogout}
        >
          <span className="text-gray-500 transition-transform duration-200">
            <LogOut size={18} />
          </span>
          {!collapsed && (
            <span className="ml-3 text-sm font-medium">Logout</span>
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            max-height: 0;
          }
          to {
            max-height: 500px;
          }
        }

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
