import React, { useRef, useState, useEffect } from "react";
import {
  X,
  Printer,
  AlertTriangle,
  Loader2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import logo from "../../../assets/logo-print.png";
import { getInvoiceData, formatCurrency } from "./documentDataMapper";

const PrintInvoice = ({ isOpen, onClose, ticketId, onPOGenerated }) => {
  const printRef = useRef();
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [zoomLevel, setZoomLevel] = useState("fitToWidth");
  const [currentViewPage, setCurrentViewPage] = useState(1);
  const PASSENGERS_PER_PAGE = 20; // 🔧 แก้ไขตัวเลขนี้เพื่อเปลี่ยนจำนวนผู้โดยสารต่อหน้า

  useEffect(() => {
    if (isOpen && ticketId) {
      fetchInvoiceData();
    }
  }, [isOpen, ticketId]);

  const fetchInvoiceData = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getInvoiceData(ticketId);
      if (result.success) {
        setInvoiceData(result.data);
        if (onPOGenerated && result.data.poResult) {
          onPOGenerated();
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (event) => {
      if (!isOpen) return;

      if (event.key === "Escape") {
        onClose();
      } else if (event.ctrlKey && event.key === "p") {
        event.preventDefault();
        handlePrint();
      }
    };

    document.addEventListener("keydown", handleKeyboard);
    return () => document.removeEventListener("keydown", handleKeyboard);
  }, [isOpen, onClose]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handlePrint = () => {
    if (!invoiceData) {
      alert("ไม่สามารถพิมพ์ได้: ข้อมูลเอกสารยังไม่พร้อม");
      return;
    }

    // สร้าง iframe ซ่อนสำหรับพิมพ์
    const printFrame = document.createElement("iframe");
    printFrame.style.position = "absolute";
    printFrame.style.top = "-9999px";
    printFrame.style.left = "-9999px";
    printFrame.style.width = "210mm";
    printFrame.style.height = "297mm";
    printFrame.style.border = "none";

    document.body.appendChild(printFrame);

    const frameDoc =
      printFrame.contentDocument || printFrame.contentWindow.document;
    const printContent = printRef.current.innerHTML;

    frameDoc.open();
    frameDoc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice ${invoiceData.invoice.poNumber}</title>
        <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
          @page {
            size: A4;
            margin: 15mm;
          }
          
          * {
            font-family: 'Prompt', sans-serif !important;
            box-sizing: border-box;
          }
          
          body {
            margin: 0;
            padding: 0;
            color: #333;
            line-height: 1.3;
            font-size: 12px;
          }
          
          /* 🔥 Page Break สำหรับการพิมพ์ */
          .page-break {
            page-break-before: always !important;
            break-before: page !important;
          }
          
          .print-page {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          ${getDocumentStyles()}
        </style>
      </head>
      <body>
        ${printContent}
      </body>
    </html>
  `);
    frameDoc.close();

    // รอให้โหลดเสร็จแล้วค่อยพิมพ์
    setTimeout(() => {
      try {
        printFrame.contentWindow.focus();
        printFrame.contentWindow.print();
      } catch (error) {
        console.error("Print error:", error);
        alert("เกิดข้อผิดพลาดในการพิมพ์");
      }

      // ลบ iframe หลังพิมพ์
      setTimeout(() => {
        document.body.removeChild(printFrame);
      }, 1000);
    }, 500);
  };

  const getDocumentStyles = () => {
    return `
      .print-header {
        display: flex;
        justify-content: space-between;
        align-items: stretch;
        margin-bottom: 24px;
        min-height: 100px;
      }

      .print-company-info {
        display: flex;
        align-items: flex-start;
        border-bottom: 4px solid #881f7e;
        padding-bottom: 8px;
        flex: 1;
        box-sizing: border-box;
      }

      .print-company-logo {
        width: 110px;
        height: auto;
        margin-right: 16px;
      }

      .print-company-title {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 4px;
      }

      .print-company-text {
        font-size: 12px;
        margin: 2px 0;
      }

      .print-document-title {
        width: 256px;
        background-color: #f4bb19 !important;
        padding: 10px;
        text-align: center;
        border-bottom: 4px solid #fbe73a !important;
        display: flex;
        flex-direction: column;
        justify-content: center;
        box-sizing: border-box;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .print-document-title-text {
        font-size: 20px;
        font-weight: bold;
        color: white !important;
        margin: 0;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .print-info-section {
        margin: 20px 0;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        padding: 12px;
        display: grid;
        grid-template-columns: 3fr 2fr;
        gap: 16px;
      }

      .print-info-row {
        display: grid;
        grid-template-columns: 120px 1fr;
        gap: 6px;
        margin-bottom: 6px;
        font-size: 12px;
        align-items: start;
      }

      .print-info-label {
        font-weight: bold;
      }

      .print-info-value {
        word-break: break-word;
      }

      .print-address div {
        margin: 1px 0;
      }

      .print-items-table {
        margin: 18px 0;
      }

      .print-table {
        width: 100%;
        border-collapse: collapse;
        border-top: 2px solid #000;
        border-bottom: 2px solid #000;
      }

      .print-table th {
        background-color: #e5e7eb !important;
        border-top: 2px solid #000;
        border-bottom: 2px solid #000;
        font-weight: bold;
        text-align: center;
        padding: 6px 4px;
        font-size: 12px;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .print-th-detail { width: 50%; }
      .print-th-quantity { width: 10%; border-left: 1px solid #000; }
      .print-th-price { width: 20%; border-left: 1px solid #000; }
      .print-th-total { width: 20%; border-left: 1px solid #000; }

      .print-table td {
        padding: 4px;
        font-size: 12px;
        vertical-align: top;
      }

      .print-td-quantity {
        text-align: center;
        border-left: 1px solid #000;
      }

      .print-td-price {
        text-align: right;
        border-left: 1px solid #000;
      }

      .print-td-total {
        text-align: right;
        border-left: 1px solid #000;
      }

      .print-section-header {
        font-weight: bold;
        background-color: transparent;
      }

      .print-section-item {
        padding-left: 40px;
      }

      .print-summary-row {
        border-top: 2px solid #000;
      }

      .print-summary-label {
        font-weight: bold;
      }

      .print-summary-value {
        font-weight: bold;
      }

      .print-total-row {
        background-color: #e5e7eb !important;
        border-top: 2px solid #000;
        border-bottom: 2px solid #000;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .print-bottom-section {
        display: flex;
        justify-content: space-between;
        margin-top: 32px;
        gap: 24px;
      }

      .print-payment-info {
        flex: 1;
      }

      .print-payment-title {
        font-weight: bold;
        font-size: 13px;
        margin-bottom: 8px;
      }

      .print-payment-item {
        font-size: 12px;
        margin: 3px 0;
      }

      .print-signatures {
        display: flex;
        gap: 32px;
      }

      .print-signature {
        text-align: center;
        font-size: 12px;
        min-width: 120px;
      }

      .print-signature-title {
        font-weight: bold;
        margin-bottom: 8px;
      }

      .print-signature-area {
        border-bottom: 1px solid #6b7280;
        height: 50px;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .print-signature-logo {
        width: 40px;
        height: auto;
        opacity: 0.7;
      }

      .print-footer {
        margin-top: 32px;
        text-align: right;
        font-size: 12px;
        color: #6b7280;
      }
    `;
  };

  const getZoomScale = () => {
    switch (zoomLevel) {
      case "fitToWidth":
        return 0.85; // Fit to screen width
      case "100%":
        return 1.0;
      case "125%":
        return 1.25;
      case "150%":
        return 1.5;
      case "200%":
        return 2.0;
      default:
        return 0.85;
    }
  };

  const zoomOptions = [
    { value: "fitToWidth", label: "Fit to Width" },
    { value: "100%", label: "100%" },
    { value: "125%", label: "125%" },
    { value: "150%", label: "150%" },
    { value: "200%", label: "200%" },
  ];

  const calculatePages = () => {
    if (!invoiceData?.passengers?.length) {
      return { totalPages: 1, passengerPages: [[]] };
    }

    const totalPassengers = invoiceData.passengers.length;

    // คำนวณจำนวนหน้า
    const totalPages =
      totalPassengers <= PASSENGERS_PER_PAGE
        ? 1
        : Math.ceil(totalPassengers / PASSENGERS_PER_PAGE);

    // แบ่งผู้โดยสารเป็นหน้าๆ
    const passengerPages = [];
    for (let i = 0; i < totalPassengers; i += PASSENGERS_PER_PAGE) {
      passengerPages.push(
        invoiceData.passengers.slice(i, i + PASSENGERS_PER_PAGE)
      );
    }

    return { totalPages, passengerPages };
  };

  const scrollToPage = (pageNumber) => {
    const pageElement = document.getElementById(`page-${pageNumber}`);
    if (pageElement) {
      pageElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
      setCurrentViewPage(pageNumber);
    }
  };

  const goToNextPage = () => {
    const { totalPages } = calculatePages();
    if (currentViewPage < totalPages) {
      scrollToPage(currentViewPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentViewPage > 1) {
      scrollToPage(currentViewPage - 1);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const { totalPages } = calculatePages();
      const container = document.querySelector(".print-viewer-content");
      if (!container) return;

      let currentPage = 1;
      for (let i = 1; i <= totalPages; i++) {
        const pageElement = document.getElementById(`page-${i}`);
        if (pageElement) {
          const rect = pageElement.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();

          // ถ้า top ของหน้าอยู่ในครึ่งบนของ viewport
          if (rect.top <= containerRect.top + containerRect.height / 2) {
            currentPage = i;
          }
        }
      }
      setCurrentViewPage(currentPage);
    };

    const container = document.querySelector(".print-viewer-content");
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Keyboard shortcuts with navigation
  useEffect(() => {
    const handleKeyboard = (event) => {
      if (!isOpen) return;

      if (event.key === "Escape") {
        onClose();
      } else if (event.ctrlKey && event.key === "p") {
        event.preventDefault();
        handlePrint();
      }
      // Navigation shortcuts
      else if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        goToPrevPage();
      } else if (event.key === "ArrowRight" || event.key === "PageDown") {
        event.preventDefault();
        goToNextPage();
      } else if (event.key === "Home") {
        event.preventDefault();
        scrollToPage(1);
      } else if (event.key === "End") {
        event.preventDefault();
        const { totalPages } = calculatePages();
        scrollToPage(totalPages);
      }
    };

    document.addEventListener("keydown", handleKeyboard);
    return () => document.removeEventListener("keydown", handleKeyboard);
  }, [isOpen, onClose, currentViewPage]);

  const renderPageThumbnails = () => {
    const { totalPages } = calculatePages();

    return totalPages > 3 ? (
      <div className="print-viewer-thumbnails">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            className={`print-viewer-thumbnail ${
              currentViewPage === i + 1 ? "active" : ""
            }`}
            onClick={() => scrollToPage(i + 1)}
            title={`ไปหน้า ${i + 1}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    ) : null;
  };

  // ฟังก์ชันสร้าง Header + Customer Info (ใช้ซ้ำได้)
  const renderPageHeader = () => (
    <>
      {/* Header */}
      <div className="print-header">
        <div className="print-company-info">
          <img src={logo} alt="Company Logo" className="print-company-logo" />
          <div className="print-company-details">
            <div className="print-company-title">บริษัท สมุย ลุค จำกัด</div>
            <div className="print-company-text">
              63/27 ม.3 ต.บ่อผุด อ.เกาะสมุย จ.สุราษฎร์ธานี 84320
            </div>
            <div className="print-company-text">
              โทร 077-950550 email :samuilook@yahoo.com
            </div>
            <div className="print-company-text">
              เลขประจำตัวผู้เสียภาษี 0845545002700
            </div>
          </div>
        </div>
        <div className="print-document-title">
          <div className="print-document-title-text">ใบแจ้งหนี้</div>
          <div className="print-document-title-text">Invoice</div>
        </div>
      </div>

      {/* Customer & Invoice Info */}
      <div className="print-info-section">
        <div className="print-info-customer">
          <div className="print-info-row">
            <span className="print-info-label">ลูกค้า:</span>
            <span className="print-info-value">
              {invoiceData.customer.name}
            </span>
          </div>
          <div className="print-info-row">
            <span className="print-info-label">ที่อยู่:</span>
            <div className="print-info-value print-address">
              {invoiceData.customer.address &&
                invoiceData.customer.address
                  .split("\n")
                  .map((line, index) => <div key={index}>{line}</div>)}
            </div>
          </div>
          <div className="print-info-row">
            <span className="print-info-label">เบอร์โทร:</span>
            <span className="print-info-value">
              {invoiceData.customer.phone}
            </span>
          </div>
          <div className="print-info-row">
            <span className="print-info-label">เลขประจำตัวผู้เสียภาษี:</span>
            <span className="print-info-value">
              {invoiceData.customer.taxId} <strong>สาขา:</strong>{" "}
              {invoiceData.customer.branch || "Head Office"}
            </span>
          </div>
        </div>
        <div className="print-info-invoice">
          <div className="print-info-row">
            <span className="print-info-label">เลขที่:</span>
            <span className="print-info-value">
              {invoiceData.invoice.poNumber}
            </span>
          </div>
          <div className="print-info-row">
            <span className="print-info-label">วันที่:</span>
            <span className="print-info-value">{invoiceData.invoice.date}</span>
          </div>
          <div className="print-info-row">
            <span className="print-info-label">วันที่ครบกำหนด:</span>
            <span className="print-info-value">
              {invoiceData.invoice.dueDate}
            </span>
          </div>
          <div className="print-info-row">
            <span className="print-info-label">Sale /Staff:</span>
            <span className="print-info-value">
              {invoiceData.invoice.salesPerson}
            </span>
          </div>
        </div>
      </div>
    </>
  );

  // 👥 ฟังก์ชันสร้างตารางผู้โดยสาร (รับ passengers และ pageNumber)
  const renderPassengerTable = (
    passengers,
    pageNumber,
    totalPages,
    isLastPage = false
  ) => (
    <div className="print-items-table">
      <table className="print-table">
        <thead>
          <tr>
            <th className="print-th-detail">รายละเอียด</th>
            <th className="print-th-quantity">จำนวน</th>
            <th className="print-th-price">ราคาต่อหน่วย</th>
            <th className="print-th-total">รวมเป็นเงิน</th>
          </tr>
        </thead>
        <tbody>
          {/* NAME Section */}
          <tr>
            <td className="print-section-header">NAME /ชื่อผู้โดยสาร</td>
            <td className="print-td-quantity"></td>
            <td className="print-td-price"></td>
            <td className="print-td-total"></td>
          </tr>
          {passengers.map((passenger, index) => (
            <tr key={`passenger-${pageNumber}-${index}`}>
              <td className="print-section-item">{passenger.display}</td>
              <td className="print-td-quantity"></td>
              <td className="print-td-price"></td>
              <td className="print-td-total"></td>
            </tr>
          ))}

          {/* เฉพาะหน้าสุดท้าย: แสดงเที่ยวบิน, ราคา, summary */}
          {isLastPage && (
            <>
              {/* AIR TICKET Section */}
              <tr>
                <td className="print-section-header">
                  AIR TICKET /ตั๋วเครื่องบิน
                </td>
                <td className="print-td-quantity"></td>
                <td className="print-td-price"></td>
                <td className="print-td-total"></td>
              </tr>
              {invoiceData.flights.map((flight, index) => (
                <tr key={`flight-${index}`}>
                  <td className="print-section-item">{flight.display}</td>
                  <td className="print-td-quantity"></td>
                  <td className="print-td-price"></td>
                  <td className="print-td-total"></td>
                </tr>
              ))}
              {invoiceData.passengerTypes.map((type, index) => (
                <tr key={`type-${index}`}>
                  <td className="print-section-item">{type.type}</td>
                  <td className="print-td-quantity">{type.quantity}</td>
                  <td className="print-td-price">
                    {formatCurrency(type.unitPrice)}.-
                  </td>
                  <td className="print-td-total">
                    {formatCurrency(type.amount)}.-
                  </td>
                </tr>
              ))}

              {/* Other Section */}
              {invoiceData.extras.length > 0 && (
                <>
                  <tr>
                    <td className="print-section-header">Other</td>
                    <td className="print-td-quantity"></td>
                    <td className="print-td-price"></td>
                    <td className="print-td-total"></td>
                  </tr>
                  {invoiceData.extras.map((extra, index) => (
                    <tr key={`extra-${index}`}>
                      <td className="print-section-item">
                        {extra.description}
                      </td>
                      <td className="print-td-quantity">{extra.quantity}</td>
                      <td className="print-td-price">
                        {formatCurrency(extra.unitPrice)}.-
                      </td>
                      <td className="print-td-total">
                        {formatCurrency(extra.amount)}.-
                      </td>
                    </tr>
                  ))}
                </>
              )}

              {/* Summary */}
              <tr className="print-summary-row">
                <td colSpan="2" className="print-section-header">
                  Remark
                </td>
                <td className="print-td-price print-summary-label">
                  ราคารวมสินค้า (บาท)
                </td>
                <td className="print-td-total print-summary-value">
                  {formatCurrency(invoiceData.summary.subtotal)}.-
                </td>
              </tr>
              <tr className="print-summary-row">
                <td colSpan="2"></td>
                <td className="print-td-price print-summary-label">
                  ภาษีมูลค่าเพิ่ม {invoiceData.summary.vatPercent}%
                </td>
                <td className="print-td-total print-summary-value">
                  {formatCurrency(invoiceData.summary.vat)}.-
                </td>
              </tr>
              <tr className="print-total-row">
                <td colSpan="2"></td>
                <td className="print-td-price print-summary-label">
                  จำนวนเงินรวมทั้งสิ้น (บาท)
                </td>
                <td className="print-td-total print-summary-value">
                  {formatCurrency(invoiceData.summary.total)}.-
                </td>
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  );

  // 📄 ฟังก์ชันสร้าง Footer (รับหมายเลขหน้า)
  const renderPageFooter = (pageNumber, totalPages, isLastPage = false) => (
    <>
      {/* Payment Info & Signatures - เฉพาะหน้าสุดท้าย */}
      {isLastPage && (
        <div className="print-bottom-section">
          <div className="print-payment-info">
            <div className="print-payment-title">ข้อมูลการชำระเงิน</div>
            <div className="print-payment-item">
              - ชื่อบัญชี คิมเบอร์ลี่ เหงียน
            </div>
            <div className="print-payment-item">
              - ธนาคาร Larana เลขที่บัญชี 0123456789
            </div>
            <div className="print-payment-item">
              - ชื่อบัญชี คิมเบอร์ลี่ เหงียน
            </div>
            <div className="print-payment-item">
              - ธนาคาร Borcelle เลขที่บัญชี 0123456789
            </div>
          </div>
          <div className="print-signatures">
            <div className="print-signature">
              <div className="print-signature-title">อนุมัติโดย</div>
              <div className="print-signature-area">
                <img
                  src={logo}
                  alt="Approved Signature"
                  className="print-signature-logo"
                />
              </div>
              <div className="print-signature-date">
                วันที่: {new Date().toLocaleDateString("th-TH")}
              </div>
            </div>
            <div className="print-signature">
              <div className="print-signature-title">ผู้ว่าจ้าง</div>
              <div className="print-signature-area"></div>
              <div className="print-signature-date">
                วันที่: {new Date().toLocaleDateString("th-TH")}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page Footer */}
      <div className="print-footer">
        หน้า {pageNumber}/{totalPages}
      </div>
    </>
  );

  if (!isOpen) return null;

  const scale = getZoomScale();

  if (loading) {
    return (
      <div className="print-viewer-fullscreen">
        <div className="print-viewer-toolbar">
          <div className="print-viewer-title">กำลังเตรียมเอกสาร...</div>
          <button
            className="print-viewer-btn print-viewer-btn-secondary"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
        <div className="print-viewer-content">
          <div className="print-viewer-loading">
            <Loader2 size={48} className="print-viewer-spinner" />
            <span>กำลังสร้าง PO Number และเตรียมข้อมูล...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="print-viewer-fullscreen">
        <div className="print-viewer-toolbar">
          <div className="print-viewer-title">เกิดข้อผิดพลาด</div>
          <button
            className="print-viewer-btn print-viewer-btn-secondary"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
        <div className="print-viewer-content">
          <div className="print-viewer-error">
            <AlertTriangle size={40} />
            <h3>ไม่สามารถเตรียมเอกสารได้</h3>
            <p>{error}</p>
            <button
              className="print-viewer-btn print-viewer-btn-primary"
              onClick={onClose}
            >
              ตกลง
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!invoiceData) return null;

  const { totalPages, passengerPages } = calculatePages();

  return (
    <div className="print-viewer-fullscreen">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="text-lg font-semibold text-gray-800">
          {invoiceData.invoice.poNumber} - {invoiceData.customer.name}
        </div>

        <div className="flex items-center gap-4">
          {/* Page Navigation */}
          {(() => {
            const { totalPages } = calculatePages();
            return totalPages > 1 ? (
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                <button
                  className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  onClick={goToPrevPage}
                  disabled={currentViewPage === 1}
                  title="หน้าก่อนหน้า"
                >
                  <ChevronLeft size={16} />
                </button>

                {/* Page Selector Dropdown */}
                <select
                  className="text-sm font-medium text-gray-700 bg-transparent border-0 focus:outline-none cursor-pointer px-2 py-1 rounded hover:bg-gray-100"
                  value={currentViewPage}
                  onChange={(e) => scrollToPage(parseInt(e.target.value))}
                  title="เลือกหน้า"
                >
                  {Array.from({ length: totalPages }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      หน้า {i + 1} / {totalPages}
                    </option>
                  ))}
                </select>

                <button
                  className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  onClick={goToNextPage}
                  disabled={currentViewPage === totalPages}
                  title="หน้าถัดไป"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            ) : null;
          })()}

          {/* Zoom Controls */}
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-1">
            <button
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-white rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              onClick={() => {
                const currentIndex = zoomOptions.findIndex(
                  (opt) => opt.value === zoomLevel
                );
                if (currentIndex > 0) {
                  setZoomLevel(zoomOptions[currentIndex - 1].value);
                }
              }}
              disabled={zoomLevel === zoomOptions[0].value}
              title="ซูมออก"
            >
              <ZoomOut size={16} />
            </button>

            <select
              className="mx-1 px-3 py-1.5 text-sm bg-transparent border-0 focus:outline-none text-gray-700 font-medium min-w-[120px] text-center"
              value={zoomLevel}
              onChange={(e) => setZoomLevel(e.target.value)}
              title="ระดับการซูม"
            >
              {zoomOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-white rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              onClick={() => {
                const currentIndex = zoomOptions.findIndex(
                  (opt) => opt.value === zoomLevel
                );
                if (currentIndex < zoomOptions.length - 1) {
                  setZoomLevel(zoomOptions[currentIndex + 1].value);
                }
              }}
              disabled={zoomLevel === zoomOptions[zoomOptions.length - 1].value}
              title="ซูมเข้า"
            >
              <ZoomIn size={16} />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              onClick={handlePrint}
              title="พิมพ์ (Ctrl+P)"
            >
              <Printer size={16} />
              พิมพ์
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              onClick={onClose}
              title="ปิด (Esc)"
            >
              <X size={16} />
              ปิด
            </button>
          </div>
        </div>
      </div>

      {/* Document Container */}
      <div className="print-viewer-content">
        <div className="print-viewer-document-container">
          <div
            className="print-viewer-paper"
            style={{ transform: `scale(${scale})` }}
          >
            {/* 📚 Multiple Pages */}
            <div className="print-document" ref={printRef}>
              {passengerPages.map((passengers, pageIndex) => {
                const pageNumber = pageIndex + 1;
                const isLastPage = pageNumber === totalPages;

                return (
                  <div
                    key={`page-${pageNumber}`}
                    id={`page-${pageNumber}`}
                    className={`print-page ${
                      pageNumber > 1 ? "page-break" : ""
                    }`}
                  >
                    {/* Header + Customer Info */}
                    {renderPageHeader()}

                    {/* Passenger Table */}
                    {renderPassengerTable(
                      passengers,
                      pageNumber,
                      totalPages,
                      isLastPage
                    )}

                    {/* Footer */}
                    {renderPageFooter(pageNumber, totalPages, isLastPage)}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Viewer Styles */
        .print-viewer-fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #f5f5f5;
          z-index: 50;
          display: flex;
          flex-direction: column;
          font-family: "Prompt", sans-serif;
        }

        .print-viewer-toolbar {
          background: white;
          border-bottom: 1px solid #e5e7eb;
          padding: 12px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-shrink: 0;
        }

        .print-viewer-title {
          font-size: 18px;
          font-weight: 600;
          color: #374151;
        }

        .print-viewer-controls {
          display: flex;
          align-items: center;
          gap: 16px; /* เพิ่ม gap */
          flex-wrap: wrap; /* รองรับหน้าจอเล็ก */
        }

        .print-viewer-zoom-controls {
          display: flex;
          align-items: center;
          gap: 2px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 2px;
          background: white;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }

        .print-viewer-zoom-select {
          border: none;
          background: transparent;
          padding: 6px 12px;
          font-size: 13px;
          min-width: 110px;
          text-align: center;
          outline: none;
          font-family: "Prompt", sans-serif;
          color: #374151;
        }

        .print-viewer-zoom-select:hover {
          background: #f9fafb;
          border-radius: 4px;
        }

        /* Action Buttons */
        .print-viewer-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-left: auto; /* ดันไปขวาสุด */
        }

        /* Button Styles */
        .print-viewer-btn {
          padding: 8px 12px;
          border-radius: 6px;
          border: none;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
          font-family: "Prompt", sans-serif;
          white-space: nowrap;
        }

        .print-viewer-btn-icon {
          padding: 6px;
          background: transparent;
          color: #6b7280;
          border-radius: 4px;
        }

        .print-viewer-btn-icon:hover:not(:disabled) {
          background: #f3f4f6;
          color: #374151;
        }

        .print-viewer-btn-icon:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .print-viewer-btn-primary {
          background: #2563eb;
          color: white;
          font-weight: 600;
        }

        .print-viewer-btn-primary:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
        }

        .print-viewer-btn-secondary {
          background: #f8fafc;
          color: #64748b;
          border: 1px solid #e2e8f0;
        }

        .print-viewer-btn-secondary:hover {
          background: #f1f5f9;
          color: #475569;
        }

        .print-viewer-zoom-select {
          border: none;
          background: transparent;
          padding: 4px 8px;
          font-size: 14px;
          min-width: 120px;
          text-align: center;
          outline: none;
          font-family: "Prompt", sans-serif;
        }

        .print-viewer-content {
          flex: 1;
          overflow: auto;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 24px;
        }

        .print-viewer-document-container {
          background: #f5f5f5;
          padding: 20px;
          border-radius: 8px;
          max-width: none;
          width: auto;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .print-viewer-paper {
          width: auto;
          min-height: auto;
          background: transparent;
          box-shadow: none;
          border-radius: 0;
          transform-origin: top center;
          transition: transform 0.3s ease;
          margin: 0;
        }

        /* 📄 A4 Page Styles */
        .print-page {
          width: 210mm;
          height: 297mm;
          position: relative;
          background: white;
          margin: 0 auto 20px auto;
          padding: 15mm;
          box-sizing: border-box;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
          border: 1px solid #e5e7eb;
          overflow: hidden;
        }

        .page-break {
          /* ไม่ต้องมี CSS พิเศษ */
        }

        .print-page-content {
          width: 100%;
          height: 100%;
          overflow: hidden;
          position: relative;
        }

        .print-page.content-overflow::after {
          content: "⚠️ เนื้อหาเกินหน้า";
          position: absolute;
          bottom: 5mm;
          right: 5mm;
          background: #fee2e2;
          color: #dc2626;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: bold;
        }

        .print-viewer-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 60px;
          color: #6b7280;
        }

        .print-viewer-spinner {
          animation: spin 1s linear infinite;
        }

        .print-viewer-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 60px;
          text-align: center;
        }

        .print-viewer-error h3 {
          margin: 0;
          color: #dc2626;
          font-size: 18px;
        }

        .print-viewer-error p {
          margin: 0;
          color: #6b7280;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        /* Document Styles */
        .print-document {
          font-family: "Prompt", sans-serif;
          color: #333;
          line-height: 1.3;
          padding: 0;
          box-sizing: border-box;
          width: auto;
          background: transparent;
        }

        .print-header {
          display: flex;
          justify-content: space-between;
          align-items: stretch;
          margin-bottom: 24px;
          min-height: 100px;
        }

        .print-company-info {
          display: flex;
          align-items: flex-start;
          border-bottom: 4px solid #881f7e;
          padding-bottom: 8px;
          flex: 1;

          box-sizing: border-box;
        }

        .print-company-logo {
          width: 110px;
          height: auto;
          margin-right: 16px;
        }

        .print-company-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 4px;
        }

        .print-company-text {
          font-size: 12px;
          margin: 2px 0;
        }

        .print-document-title {
          width: 256px;
          background-color: #f4bb19;
          padding: 10px;
          text-align: center;
          border-bottom: 4px solid #fbe73a;
          display: flex;
          flex-direction: column;
          justify-content: center;
          box-sizing: border-box;
        }

        .print-document-title-text {
          font-size: 20px;
          font-weight: bold;
          color: white;
          margin: 0;
        }

        .print-info-section {
          margin: 20px 0;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 12px;
          display: grid;
          grid-template-columns: 3fr 2fr;
          gap: 16px;
        }

        .print-info-row {
          display: grid;
          grid-template-columns: 120px 1fr;
          gap: 6px;
          margin-bottom: 6px;
          font-size: 12px;
          align-items: start;
        }

        .print-info-label {
          font-weight: bold;
        }

        .print-info-value {
          word-break: break-word;
        }

        .print-address div {
          margin: 1px 0;
        }

        .print-items-table {
          margin: 18px 0;
        }

        .print-table {
          width: 100%;
          border-collapse: collapse;
          border-top: 2px solid #000;
          border-bottom: 2px solid #000;
        }

        .print-table th {
          background-color: #e5e7eb;
          border-top: 2px solid #000;
          border-bottom: 2px solid #000;
          font-weight: bold;
          text-align: center;
          padding: 6px 4px;
          font-size: 12px;
        }

        .print-th-detail {
          width: 50%;
        }
        .print-th-quantity {
          width: 10%;
          border-left: 1px solid #000;
        }
        .print-th-price {
          width: 20%;
          border-left: 1px solid #000;
        }
        .print-th-total {
          width: 20%;
          border-left: 1px solid #000;
        }

        .print-table td {
          padding: 4px;
          font-size: 12px;
          vertical-align: top;
        }

        .print-td-quantity {
          text-align: center;
          border-left: 1px solid #000;
        }

        .print-td-price {
          text-align: right;
          border-left: 1px solid #000;
        }

        .print-td-total {
          text-align: right;
          border-left: 1px solid #000;
        }

        .print-section-header {
          font-weight: bold;
          padding: 4px;
        }

        .print-section-item {
          padding-left: 40px !important;
        }

        .print-summary-row {
          border-top: 2px solid #000;
        }

        .print-summary-label {
          font-weight: bold;
        }

        .print-summary-value {
          font-weight: bold;
        }

        .print-total-row {
          background-color: #e5e7eb;
          border-top: 2px solid #000;
          border-bottom: 2px solid #000;
        }

        .print-bottom-section {
          display: flex;
          justify-content: space-between;
          margin-top: 32px;
          gap: 24px;
        }

        .print-payment-info {
          flex: 1;
        }

        .print-payment-title {
          font-weight: bold;
          font-size: 13px;
          margin-bottom: 8px;
        }

        .print-payment-item {
          font-size: 12px;
          margin: 3px 0;
        }

        .print-signatures {
          display: flex;
          gap: 32px;
        }

        .print-signature {
          text-align: center;
          font-size: 12px;
          min-width: 120px;
        }

        .print-signature-title {
          font-weight: bold;
          margin-bottom: 8px;
        }

        .print-signature-area {
          border-bottom: 1px solid #6b7280;
          height: 50px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .print-signature-logo {
          width: 40px;
          height: auto;
          opacity: 0.7;
        }

        .print-footer {
          margin-top: 32px;
          text-align: right;
          font-size: 12px;
          color: #6b7280;
        }

        /* Responsive สำหรับหน้าจอเล็ก */
        @media (max-width: 768px) {
          .print-page {
            width: 190mm;
            height: 268mm;
          }

          .print-viewer-document-container {
            padding: 10px;
          }
        }

        @media (max-width: 480px) {
          .print-page {
            width: 170mm;
            height: 240mm;
          }

          .print-viewer-document-container {
            padding: 5px;
          }
        }

        /* Print Styles */
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }

          body * {
            visibility: hidden;
          }

          .print-document {
            visibility: visible !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            transform: none !important;
            background: white !important;
          }

          .print-document * {
            visibility: visible !important;
          }

          .print-page {
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            overflow: visible !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          .print-page:not(:first-child) {
            page-break-before: always !important;
            break-before: page !important;
          }

          .print-viewer-document-container {
            background: white !important;
            padding: 0 !important;
          }

          .print-viewer-toolbar,
          .print-viewer-controls {
            display: none !important;
          }

          .print-document-title {
            background-color: #f4bb19 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .print-document-title-text {
            color: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .print-company-info {
            border-bottom: 4px solid #881f7e !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .print-table th {
            background-color: #e5e7eb !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .print-total-row {
            background-color: #e5e7eb !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-viewer-page-nav {
            display: flex;
            align-items: center;
            gap: 6px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            padding: 4px;
            background: white;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          }

          .print-viewer-page-info {
            font-size: 13px;
            font-weight: 500;
            color: #374151;
            padding: 4px 8px;
            white-space: nowrap;
            font-family: "Prompt", sans-serif;
            min-width: 80px;
            text-align: center;
          }

          .print-viewer-page-select {
            border: 1px solid #d1d5db;
            background: white;
            padding: 4px 8px;
            font-size: 12px;
            color: #6b7280;
            cursor: pointer;
            outline: none;
            border-radius: 4px;
            font-family: "Prompt", sans-serif;
            margin-left: 4px;
          }

          .print-viewer-page-select:hover {
            background: #f9fafb;
          }

          .print-viewer-page-select:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 1px #3b82f6;
          }

          /* เพิ่ม smooth scroll behavior */
          .print-viewer-content {
            scroll-behavior: smooth;
          }

          /* Page indicator active state */
          .print-page.active-page {
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
              0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 2px #3b82f6;
          }

          /* Thumbnails */
          .print-viewer-thumbnails {
            position: fixed;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
            display: flex;
            flex-direction: column;
            gap: 4px;
            z-index: 60;
          }

          .print-viewer-thumbnail {
            width: 40px;
            height: 56px;
            border: 2px solid #d1d5db;
            border-radius: 4px;
            background: white;
            color: #6b7280;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .print-viewer-thumbnail:hover {
            border-color: #3b82f6;
            background: #eff6ff;
          }

          .print-viewer-thumbnail.active {
            border-color: #3b82f6;
            background: #3b82f6;
            color: white;
          }
        }
      `}</style>
    </div>
  );
};

export default PrintInvoice;
