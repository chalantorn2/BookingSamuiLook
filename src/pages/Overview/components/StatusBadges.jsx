import React from "react";
import {
  Activity,
  Plane,
  Ship,
  Bus,
  Hotel,
  Package,
  Database,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { statusMap, serviceTypes } from "../hooks/useOverviewData";

export const StatusBadge = ({ status }) => {
  const statusInfo = statusMap[status] || { label: status, color: "gray" };

  const colorClasses = {
    green: "bg-green-100 text-green-800",
    yellow: "bg-yellow-100 text-yellow-800",
    red: "bg-red-100 text-red-800",
    gray: "bg-gray-100 text-gray-800",
  };

  const getIcon = () => {
    switch (status) {
      case "invoiced":
        return <CheckCircle size={14} className="mr-1" />;
      case "not_invoiced":
        return <Clock size={14} className="mr-1" />;
      case "cancelled":
        return <XCircle size={14} className="mr-1" />;
      default:
        return null;
    }
  };

  return (
    <span
      className={`px-2 py-1 ${
        colorClasses[statusInfo.color]
      } rounded-full text-xs font-medium flex items-center justify-center`}
    >
      {getIcon()}
      {statusInfo.label}
    </span>
  );
};

export const ServiceTypeBadge = ({ type }) => {
  const service = serviceTypes.find((s) => s.id === type) || {
    name: type,
    icon: "AlertCircle",
  };

  const colorMap = {
    flight: "bg-blue-100 text-blue-800",
    boat: "bg-cyan-100 text-cyan-800",
    bus: "bg-green-100 text-green-800",
    hotel: "bg-yellow-100 text-yellow-800",
    tour: "bg-indigo-100 text-indigo-800",
    deposit: "bg-purple-100 text-purple-800",
    voucher: "bg-teal-100 text-teal-800",
    other: "bg-orange-100 text-orange-800",
    all: "bg-gray-100 text-gray-800",
  };

  const getIcon = (iconName, size = 16) => {
    switch (iconName) {
      case "Activity":
        return <Activity size={size} className="mr-1" />;
      case "Plane":
        return <Plane size={size} className="mr-1" />;
      case "Ship":
        return <Ship size={size} className="mr-1" />;
      case "Bus":
        return <Bus size={size} className="mr-1" />;
      case "Hotel":
        return <Hotel size={size} className="mr-1" />;
      case "Package":
        return <Package size={size} className="mr-1" />;
      case "Database":
        return <Database size={size} className="mr-1" />;
      case "FileText":
        return <FileText size={size} className="mr-1" />;
      case "AlertCircle":
      default:
        return <AlertCircle size={size} className="mr-1" />;
    }
  };

  return (
    <span
      className={`px-2 py-1 ${
        colorMap[type] || colorMap.other
      } rounded-full text-xs font-medium flex items-center`}
    >
      {getIcon(service.icon, 14)}
      {service.name}
    </span>
  );
};
