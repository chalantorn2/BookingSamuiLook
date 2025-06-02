import React, { useState } from "react";
import { Printer, X, AlertTriangle } from "lucide-react";

const PrintConfirmModal = ({ isOpen, onClose, onConfirm, loading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 modal-backdrop bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">
              ยืนยันการพิมพ์เอกสาร
            </h3>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-500">
            คุณต้องการพิมพ์เอกสารนี้หรือไม่? การพิมพ์จะถือเป็นการออกเลข PO
            Number
          </p>
          <p className="text-sm text-gray-500 mt-2"></p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            onClick={onClose}
            disabled={loading}
          >
            <X size={16} className="mr-1 inline" />
            ยกเลิก
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                กำลังสร้าง PO...
              </div>
            ) : (
              <>
                <Printer size={16} className="mr-1 inline" />
                ยืนยันและพิมพ์
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintConfirmModal;
