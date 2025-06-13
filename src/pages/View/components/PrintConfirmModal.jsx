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

        <div className="flex justify-end mt-6 space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
            disabled={loading}
          >
            ยกเลิก
          </button>

          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            disabled={loading}
          >
            <Printer size={16} className="mr-2" />
            {loading ? "กำลังสร้าง PO..." : "พิมพ์เอกสาร"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintConfirmModal;
