import React from "react";
import PrintInvoice from "./PrintInvoice";

/**
 * Main wrapper component สำหรับการพิมพ์เอกสารทุกประเภท
 * รองรับ Invoice, Receipt, Voucher, Deposit
 */
const PrintDocument = ({
  isOpen,
  onClose,
  documentType,
  ticketId,
  onPOGenerated,
}) => {
  // เลือก component ตาม documentType
  const renderDocument = () => {
    switch (documentType) {
      case "invoice":
        return (
          <PrintInvoice
            isOpen={isOpen}
            onClose={onClose}
            ticketId={ticketId}
            onPOGenerated={onPOGenerated}
          />
        );

      case "receipt":
        // TODO: สร้าง PrintReceipt component ในอนาคต
        console.warn("PrintReceipt component not implemented yet");
        return null;

      case "voucher":
        // TODO: สร้าง PrintVoucher component ในอนาคต
        console.warn("PrintVoucher component not implemented yet");
        return null;

      case "deposit":
        // TODO: สร้าง PrintDeposit component ในอนาคต
        console.warn("PrintDeposit component not implemented yet");
        return null;

      default:
        console.error(`Unknown document type: ${documentType}`);
        return null;
    }
  };

  return renderDocument();
};

export default PrintDocument;
