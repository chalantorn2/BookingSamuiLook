import React, { useRef, useState, useEffect } from "react";
import { X, Printer, AlertTriangle, Loader2 } from "lucide-react";
import logo from "../../../assets/logo-print.png";
import { getInvoiceData, formatCurrency } from "./documentDataMapper";

const PrintInvoice = ({ isOpen, onClose, ticketId, onPOGenerated }) => {
  const printRef = useRef();
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handlePrint = () => {
    if (!printRef.current || !invoiceData) {
      console.error("No content to print or data not loaded");
      alert("ไม่สามารถพิมพ์ได้: ข้อมูลเอกสารยังไม่พร้อม");
      return;
    }

    const printContent = printRef.current;

    const printFrame = document.createElement("iframe");
    printFrame.style.position = "absolute";
    printFrame.style.top = "-9999px";
    printFrame.style.left = "-9999px";
    printFrame.style.width = "210mm";
    printFrame.style.height = "297mm";
    document.body.appendChild(printFrame);

    const frameDoc =
      printFrame.contentDocument || printFrame.contentWindow.document;

    frameDoc.open();
    frameDoc.write(`
    <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
          * {
            font-family: 'Prompt', sans-serif !important;
          }
          
          body {
            font-family: 'Prompt', sans-serif !important;
            color: #000;
            line-height: 1.4;
            background: white;
            font-size: 12px;
            margin: 0;
            padding: 4mm;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .print-document {
            font-family: 'Prompt', sans-serif !important;
            color: #333;
            line-height: 1.3;
            max-width: 210mm;
            margin: 0 auto;
            background: white;
          }
          
   .print-header {
    display: flex;
    justify-content: space-between;
    align-items: stretch !important; /* เปลี่ยนเป็น stretch */
    padding-bottom: 0px !important; /* ลบ padding */
    margin-bottom: 12px;
    min-height: 100px !important; /* กำหนดความสูงขั้นต่ำ */
  }

          
           .print-company-info {
    display: flex;
    align-items: flex-start;
    border-bottom: 4px solid #881f7e !important;
    padding-bottom: 8px;
    width: calc(100% - 256px);
    flex: 1;
    min-height: 100px !important;
    box-sizing: border-box;
  }
          
          .print-company-logo {
            width: 110px;
            height: auto;
            margin-right: 16px;
          }
          
          .print-company-details h1 {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 4px;
            font-family: 'Prompt', sans-serif !important;
          }
          
          .print-company-details p {
            font-size: 12px;
            margin: 2px 0;
            font-family: 'Prompt', sans-serif !important;
          }
          
        .print-document-title {
    width: 256px;
    background-color: #f4bb19 !important;
    padding: 10px;
    text-align: center;
    border-bottom: 4px solid #fbe73a !important;
    min-height: 100px !important;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
          
          .print-document-title h2 {
            font-size: 20px;
            font-weight: bold;
            color: white !important;
            margin: 0;
            font-family: 'Prompt', sans-serif !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
         .print-info-section {
  margin: 8px 0; // ลดจาก 20px 0
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 10px; // ลดจาก 18px
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px; // ลดจาก 18px
}
          
          .print-info-row {
            display: grid;
            grid-template-columns: 110px 1fr;
            gap: 6px;
            margin-bottom: 6px;
            font-size: 11px;
            font-family: 'Prompt', sans-serif !important;
          }
          
          .print-info-row.invoice {
            grid-template-columns: 130px 1fr;
          }
          
          .print-info-label {
            font-weight: bold;
            font-family: 'Prompt', sans-serif !important;
          }
          
          .print-info-value {
            word-break: break-word;
            font-family: 'Prompt', sans-serif !important;
          }
          
         .print-items-table {
  margin: 8px 0; // ลดจาก 18px 0
}
          
      
     
          .print-section-item {
            padding-left: 40px !important;
            padding: 8px 6px;
            font-size: 11px;
            font-family: 'Prompt', sans-serif !important;
          }
          
          .print-summary-section {
            border-top: 1px solid #000 !important;
          }
          
          .print-summary-section td {
            font-weight: bold !important;
            font-family: 'Prompt', sans-serif !important;
          }
          
          .print-summary-total {
            background-color: #e5e7eb !important;
            border-top: 1px solid #000 !important;
            border-bottom: 1px solid #000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
        .print-payment-info {
  margin: 12px 0; // ลดจาก 24px 0
}
          
          .print-payment-info h3 {
            font-weight: bold;
            margin-bottom: 6px;
            font-size: 13px;
            font-family: 'Prompt', sans-serif !important;
          }
          
          .print-payment-info p {
            margin: 3px 0;
            font-size: 11px;
            font-family: 'Prompt', sans-serif !important;
          }
          
       .print-signatures {
  margin-top: 20px; // ลดจาก 40px
  display: flex;
  justify-content: space-between;
  gap: 16px; // ลดจาก 24px
}
          
          .print-signature {
            text-align: center;
            font-size: 11px;
            font-family: 'Prompt', sans-serif !important;
          }
          
          .print-signature-area {
            border-bottom: 1px solid #6b7280;
            padding-bottom: 12px;
            margin-bottom: 6px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .print-signature-logo {
            width: 40px;
            height: auto;
            opacity: 0.7;
          }
          
          .print-signature-date {
            font-size: 14px;
            font-family: 'Prompt', sans-serif !important;
          }
          
         .print-footer {
  margin-top: 12px; // ลดจาก 24px
  padding-top: 6px; // ลดจาก 12px
  text-align: right;
  font-size: 11px;
  font-family: 'Prompt', sans-serif !important;
}
        </style>
      </head>
      <body>
        ${printContent.outerHTML}
      </body>
    </html>
  `);
    frameDoc.close();

    setTimeout(() => {
      try {
        printFrame.contentWindow.focus();
        printFrame.contentWindow.print();
      } catch (error) {
        console.error("Print error:", error);
        alert("เกิดข้อผิดพลาดในการพิมพ์");
      }

      setTimeout(() => {
        document.body.removeChild(printFrame);
      }, 1000);
    }, 500);
  };

  if (!isOpen) return null;

  // Modal Styles
  const modalStyles = {
    backdrop: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 50,
      padding: "16px",
    },
    container: {
      background: "white",
      borderRadius: "8px",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      width: "100%",
      maxWidth: "64rem",
      maxHeight: "90vh",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    },
    header: {
      backgroundColor: "#2563eb",
      padding: "16px 24px",
      color: "white",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexShrink: 0,
    },
    title: {
      fontSize: "20px",
      fontWeight: "bold",
      fontFamily: "Prompt, sans-serif",
    },
    actions: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    button: {
      padding: "8px 16px",
      borderRadius: "6px",
      fontSize: "14px",
      fontWeight: "500",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      transition: "background-color 0.2s",
      border: "none",
      cursor: "pointer",
      fontFamily: "Prompt, sans-serif",
    },
    primaryButton: {
      backgroundColor: "#16a34a",
      color: "white",
    },
    secondaryButton: {
      backgroundColor: "transparent",
      color: "white",
    },
    content: {
      flex: 1,
      overflowY: "auto",
      padding: "24px",
    },
  };

  // Document Styles
  const documentStyles = {
    document: {
      fontFamily: "Prompt, sans-serif",
      color: "#333",
      lineHeight: "1.3",
      maxWidth: "210mm",
      margin: "0 auto",
      background: "white",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      borderBottom: "none", // ลบ border เดิม
      paddingBottom: "8px",
      marginBottom: "24px",
      position: "relative", // เพิ่ม position relative
    },
    documentHeader: {
      // เปลี่ยนชื่อจาก header เป็น documentHeader
      display: "flex",
      justifyContent: "space-between",
      alignItems: "stretch", // เปลี่ยนจาก flex-start เป็น stretch
      paddingBottom: "0px", // ลบ padding
      marginBottom: "24px",
      position: "relative",
      minHeight: "100px", // กำหนดความสูงขั้นต่ำ
    },

    companyInfo: {
      display: "flex",
      alignItems: "flex-start",
      borderBottom: "4px solid #881f7e", // สีม่วง
      paddingBottom: "8px",
      width: "calc(100% - 256px)",
      flex: "1", // เพิ่ม flex
      minHeight: "100px", // ความสูงขั้นต่ำเท่ากับ header
      boxSizing: "border-box", // เพิ่ม box-sizing
    },
    logo: {
      width: "110px",
      height: "auto",
      marginRight: "16px",
    },
    companyTitle: {
      fontSize: "18px",
      fontWeight: "bold",
      marginBottom: "4px",
      fontFamily: "Prompt, sans-serif",
    },
    companyText: {
      fontSize: "12px",
      margin: "2px 0",
      fontFamily: "Prompt, sans-serif",
    },
    documentTitle: {
      width: "256px",
      backgroundColor: "#f4bb19",
      padding: "10px",
      textAlign: "center",
      borderBottom: "4px solid #fbe73a", // สีเหลือง
      minHeight: "100px", // ความสูงขั้นต่ำเท่ากับ header
      boxSizing: "border-box", // เพิ่ม box-sizing
      display: "flex", // เพิ่ม flex
      flexDirection: "column", // เพิ่ม flex direction
      justifyContent: "center", // จัดกึ่งกลางในแนวตั้ง
    },
    documentTitleText: {
      fontSize: "20px",
      fontWeight: "bold",
      color: "white",
      margin: 0,
      fontFamily: "Prompt, sans-serif",
    },
    infoSection: {
      margin: "20px auto",
      border: "1px solid #d1d5db",
      borderRadius: "6px",
      padding: "12px",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "4px",
    },
    infoRow: {
      display: "grid",
      gridTemplateColumns: "120px 1fr",
      marginBottom: "6px",
      fontSize: "12px",
      fontFamily: "Prompt, sans-serif",
    },
    infoRowInvoice: {
      display: "grid",
      gridTemplateColumns: "120px 1fr",
      marginBottom: "6px",
      fontSize: "12px",
      fontFamily: "Prompt, sans-serif",
    },
    infoLabel: {
      fontWeight: "bold",
      fontFamily: "Prompt, sans-serif",
    },
    infoValue: {
      wordBreak: "break-word",
      fontFamily: "Prompt, sans-serif",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      borderTop: "1px solid #000",
      borderBottom: "1px solid #000",
      fontFamily: "Prompt, sans-serif",
      margin: "5px 0",
      display: "table",
    },
    itemsTableContainer: {
      margin: "5px 0",
      overflowX: "hidden", // เพิ่มบรรทัดนี้
      width: "100%", // เพิ่มบรรทัดนี้
    },
    th: {
      backgroundColor: "#e5e7eb",
      borderTop: "1px solid #000",
      borderBottom: "1px solid #000",
      fontWeight: "bold",
      textAlign: "center",
      padding: "5px 5px",
      fontSize: "12px",
      fontFamily: "Prompt, sans-serif",
      width: "50%", // รายละเอียด
    },
    thQuantity: {
      backgroundColor: "#e5e7eb",
      borderTop: "1px solid #000",
      borderBottom: "1px solid #000",
      borderLeft: "1px solid #000",
      fontWeight: "bold",
      textAlign: "center",
      padding: "2px 2px",
      fontSize: "12px",
      fontFamily: "Prompt, sans-serif",
      width: "10%", // จำนวน
    },
    thPrice: {
      backgroundColor: "#e5e7eb",
      borderTop: "1px solid #000",
      borderBottom: "1px solid #000",
      borderLeft: "1px solid #000",
      fontWeight: "bold",
      textAlign: "center",
      padding: "2px 2px",
      fontSize: "12px",
      fontFamily: "Prompt, sans-serif",
      width: "20%", // ราคาต่อหน่วย
    },
    thTotal: {
      backgroundColor: "#e5e7eb",
      borderTop: "1px solid #000",
      borderBottom: "1px solid #000",
      borderLeft: "1px solid #000",
      fontWeight: "bold",
      textAlign: "center",
      padding: "2px 2px",
      fontSize: "12px",
      fontFamily: "Prompt, sans-serif",
      width: "20%", // รวมเป็นเงิน
    },
    td: {
      padding: "2px 2px",
      fontSize: "12px",
      fontFamily: "Prompt, sans-serif",
      width: "50%", // รายละเอียด
    },
    tdQuantity: {
      padding: "2px 2px",
      fontSize: "12px",
      fontFamily: "Prompt, sans-serif",
      textAlign: "center",
      borderLeft: "1px solid #000",
      width: "10%", // จำนวน
    },
    tdPrice: {
      padding: "2px 2px",
      fontSize: "12px",
      fontFamily: "Prompt, sans-serif",
      textAlign: "right",
      borderLeft: "1px solid #000",
      width: "20%", // ราคาต่อหน่วย
    },
    tdTotal: {
      padding: "2px 2px",
      fontSize: "12px",
      fontFamily: "Prompt, sans-serif",
      textAlign: "right",
      borderLeft: "1px solid #000",
      width: "20%", // รวมเป็นเงิน
    },
    sectionHeader: {
      fontWeight: "bold",
      padding: "2px 2px",
      fontSize: "12px",
      fontFamily: "Prompt, sans-serif",
    },
    sectionItem: {
      fontSize: "12px",
      fontFamily: "Prompt, sans-serif",
      padding: "3px 3px 3px 40px", // top right bottom left
    },
    summaryRow: {
      borderTop: "1px solid #000",
      fontWeight: "bold",
      fontFamily: "Prompt, sans-serif",
    },
    totalRow: {
      backgroundColor: "#e5e7eb",
      borderTop: "1px solid #000",
      borderBottom: "1px solid #000",
      fontWeight: "bold",
      fontFamily: "Prompt, sans-serif",
    },
  };

  const styles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

  if (loading) {
    return (
      <div style={modalStyles.backdrop} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.container}>
          <div style={modalStyles.header}>
            <span style={modalStyles.title}>กำลังเตรียมเอกสาร...</span>
            <div style={modalStyles.actions}>
              <button
                style={{ ...modalStyles.button, ...modalStyles.primaryButton }}
                onClick={handlePrint}
                disabled
              >
                <Printer size={18} />
                พิมพ์
              </button>
              <button
                style={{
                  ...modalStyles.button,
                  ...modalStyles.secondaryButton,
                }}
                onClick={onClose}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div style={modalStyles.content}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: "16px",
              }}
            >
              <Loader2
                size={48}
                style={{
                  animation: "spin 1s linear infinite",
                }}
              />
              <span
                style={{ fontSize: "16px", fontFamily: "Prompt, sans-serif" }}
              >
                กำลังสร้าง PO Number และเตรียมข้อมูล...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={modalStyles.backdrop} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.container}>
          <div style={modalStyles.header}>
            <span style={modalStyles.title}>เกิดข้อผิดพลาด</span>
            <div style={modalStyles.actions}>
              <button
                style={{
                  ...modalStyles.button,
                  ...modalStyles.secondaryButton,
                }}
                onClick={onClose}
              >
                <X size={16} />
              </button>
            </div>
          </div>
          <div style={modalStyles.content} className="flex justify-center ">
            <div
              style={{ textAlign: "center", padding: "40px 0" }}
              className="text-center justify-items-center"
            >
              <AlertTriangle size={40} color="#dc2626" />
              <p
                style={{
                  marginTop: "16px",
                  fontWeight: "bold",
                  fontFamily: "Prompt, sans-serif",
                }}
              >
                ไม่สามารถเตรียมเอกสารได้
              </p>
              <p style={{ marginTop: "8px", fontFamily: "Prompt, sans-serif" }}>
                {error}
              </p>
              <button
                style={{
                  ...modalStyles.button,
                  ...modalStyles.primaryButton,
                  marginTop: "24px",
                }}
                onClick={onClose}
              >
                ตกลง
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!invoiceData) return null;

  const modalTitle = `${invoiceData.invoice.poNumber} - ${invoiceData.customer.name}`;

  return (
    <div style={modalStyles.backdrop} onClick={(e) => e.stopPropagation()}>
      <div style={modalStyles.container}>
        <div style={modalStyles.header}>
          <span style={modalStyles.title}>{modalTitle}</span>
          <div style={modalStyles.actions}>
            <button
              style={{ ...modalStyles.button, ...modalStyles.primaryButton }}
              onClick={handlePrint}
            >
              <Printer size={16} />
              พิมพ์
            </button>
            <button
              style={{ ...modalStyles.button, ...modalStyles.secondaryButton }}
              onClick={onClose}
            >
              <X size={16} />
            </button>
          </div>
        </div>
        <div style={modalStyles.content}>
          <div
            ref={printRef}
            style={documentStyles.document}
            className="print-document"
          >
            {/* Header */}
            <div style={documentStyles.header} className="print-header">
              <div
                style={documentStyles.companyInfo}
                className="print-company-info"
              >
                <img
                  src={logo}
                  alt="Company Logo"
                  style={documentStyles.logo}
                  className="print-company-logo"
                />
                <div className="print-company-details">
                  <div style={documentStyles.companyTitle}>
                    บริษัท สมุย ลุค จำกัด
                  </div>
                  <div style={documentStyles.companyText}>
                    63/27 ม.3 ต.บ่อผุด อ.เกาะสมุย จ.สุราษฎร์ธานี 84320
                  </div>
                  <div style={documentStyles.companyText}>
                    โทร 077-950550 email :samuilook@yahoo.com
                  </div>
                  <div style={documentStyles.companyText}>
                    เลขประจำตัวผู้เสียภาษี 0845545002700
                  </div>
                </div>
              </div>
              <div
                style={documentStyles.documentTitle}
                className="print-document-title"
              >
                <p style={documentStyles.documentTitleText}>ใบแจ้งหนี้</p>
                <p style={documentStyles.documentTitleText}>Invoice</p>
              </div>
            </div>

            {/* Customer & Invoice Info */}
            <div
              style={{
                ...documentStyles.infoSection,
                gridTemplateColumns: "3fr 2fr", // เปลี่ยนจาก "1fr 1fr" เป็น "3fr 2fr" (60-40)
              }}
              className="print-info-section"
            >
              <div style={{ justifySelf: "stretch" }}>
                {" "}
                {/* เปลี่ยนจาก "center" เป็น "stretch" */}
                <div style={documentStyles.infoRow} className="print-info-row">
                  <span
                    style={documentStyles.infoLabel}
                    className="print-info-label"
                  >
                    ลูกค้า:
                  </span>
                  <span
                    style={documentStyles.infoValue}
                    className="print-info-value"
                  >
                    {invoiceData.customer.name}
                  </span>
                </div>
                <div style={documentStyles.infoRow} className="print-info-row">
                  <span
                    style={documentStyles.infoLabel}
                    className="print-info-label"
                  >
                    ที่อยู่:
                  </span>
                  <div
                    style={documentStyles.infoValue}
                    className="print-info-value"
                  >
                    {invoiceData.customer.address &&
                      invoiceData.customer.address
                        .split("\n")
                        .map((line, index) => (
                          <div key={index} style={{ margin: "1px 0" }}>
                            {line}
                          </div>
                        ))}
                  </div>
                </div>
                <div style={documentStyles.infoRow} className="print-info-row">
                  <span
                    style={documentStyles.infoLabel}
                    className="print-info-label"
                  >
                    เบอร์โทร:
                  </span>
                  <span
                    style={documentStyles.infoValue}
                    className="print-info-value"
                  >
                    {invoiceData.customer.phone}
                  </span>
                </div>
                <div style={documentStyles.infoRow} className="print-info-row">
                  <span
                    style={documentStyles.infoLabel}
                    className="print-info-label"
                  >
                    เลขประจำตัวผู้เสียภาษี:
                  </span>
                  <span
                    style={documentStyles.infoValue}
                    className="print-info-value"
                  >
                    {invoiceData.customer.taxId} &nbsp; <b>สาขา:</b>{" "}
                    {invoiceData.customer.branch || "Head Office"}
                  </span>
                </div>
              </div>
              <div style={{ justifySelf: "stretch" }}>
                {" "}
                {/* เปลี่ยนจาก "center" เป็น "stretch" */}
                <div
                  style={documentStyles.infoRowInvoice}
                  className="print-info-row invoice"
                >
                  <span
                    style={documentStyles.infoLabel}
                    className="print-info-label"
                  >
                    เลขที่:
                  </span>
                  <span
                    style={documentStyles.infoValue}
                    className="print-info-value"
                  >
                    {invoiceData.invoice.poNumber}
                  </span>
                </div>
                <div
                  style={documentStyles.infoRowInvoice}
                  className="print-info-row invoice"
                >
                  <span
                    style={documentStyles.infoLabel}
                    className="print-info-label"
                  >
                    วันที่:
                  </span>
                  <span
                    style={documentStyles.infoValue}
                    className="print-info-value"
                  >
                    {invoiceData.invoice.date}
                  </span>
                </div>
                <div
                  style={documentStyles.infoRowInvoice}
                  className="print-info-row invoice"
                >
                  <span
                    style={documentStyles.infoLabel}
                    className="print-info-label"
                  >
                    วันที่ครบกำหนด:
                  </span>
                  <span
                    style={documentStyles.infoValue}
                    className="print-info-value"
                  >
                    {invoiceData.invoice.dueDate}
                  </span>
                </div>
                <div
                  style={documentStyles.infoRowInvoice}
                  className="print-info-row invoice"
                >
                  <span
                    style={documentStyles.infoLabel}
                    className="print-info-label"
                  >
                    Sale /Staff:
                  </span>
                  <span
                    style={documentStyles.infoValue}
                    className="print-info-value"
                  >
                    {invoiceData.invoice.salesPerson}
                  </span>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div
              style={documentStyles.itemsTableContainer}
              className="print-items-table"
            >
              <table style={documentStyles.table}>
                <thead>
                  <tr>
                    <th style={documentStyles.th}>รายละเอียด</th>
                    <th
                      style={documentStyles.thQuantity}
                      className="col-quantity"
                    >
                      จำนวน
                    </th>
                    <th style={documentStyles.thPrice} className="col-price">
                      ราคาต่อหน่วย
                    </th>
                    <th style={documentStyles.thTotal} className="col-total">
                      รวมเป็นเงิน
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* NAME Section */}
                  <tr>
                    <td style={documentStyles.sectionHeader}>
                      NAME /ชื่อผู้โดยสาร
                    </td>
                    <td
                      style={{
                        ...documentStyles.tdQuantity,
                      }}
                    ></td>
                    <td
                      style={{
                        ...documentStyles.tdPrice,
                      }}
                    ></td>
                    <td
                      style={{
                        ...documentStyles.tdTotal,
                      }}
                    ></td>
                  </tr>
                  {invoiceData.passengers.map((passenger, index) => (
                    <tr key={`passenger-${index}`}>
                      <td style={documentStyles.sectionItem}>
                        {passenger.display}
                      </td>
                      <td style={documentStyles.tdQuantity}></td>
                      <td style={documentStyles.tdPrice}></td>
                      <td style={documentStyles.tdTotal}></td>
                    </tr>
                  ))}

                  {/* AIR TICKET Section */}
                  <tr>
                    <td style={documentStyles.sectionHeader}>
                      AIR TICKET /ตั๋วเครื่องบิน
                    </td>
                    <td
                      style={{
                        ...documentStyles.tdQuantity,
                      }}
                    ></td>
                    <td
                      style={{
                        ...documentStyles.tdPrice,
                      }}
                    ></td>
                    <td
                      style={{
                        ...documentStyles.tdTotal,
                      }}
                    ></td>
                  </tr>
                  {invoiceData.flights.map((flight, index) => (
                    <tr key={`flight-${index}`}>
                      <td style={documentStyles.sectionItem}>
                        {flight.display}
                      </td>
                      <td style={documentStyles.tdQuantity}></td>
                      <td style={documentStyles.tdPrice}></td>
                      <td style={documentStyles.tdTotal}></td>
                    </tr>
                  ))}
                  {invoiceData.passengerTypes.map((type, index) => (
                    <tr key={`type-${index}`}>
                      <td style={documentStyles.sectionItem}>{type.type}</td>
                      <td style={documentStyles.tdQuantity}>{type.quantity}</td>
                      <td style={documentStyles.tdPrice}>
                        {formatCurrency(type.unitPrice)}.-
                      </td>
                      <td style={documentStyles.tdTotal}>
                        {formatCurrency(type.amount)}.-
                      </td>
                    </tr>
                  ))}

                  {/* Other Section */}
                  {invoiceData.extras.length > 0 && (
                    <>
                      <tr>
                        <td style={documentStyles.sectionHeader}>Other</td>
                        <td
                          style={{
                            ...documentStyles.tdQuantity,
                          }}
                        ></td>
                        <td
                          style={{
                            ...documentStyles.tdPrice,
                          }}
                        ></td>
                        <td
                          style={{
                            ...documentStyles.tdTotal,
                          }}
                        ></td>
                      </tr>
                      {invoiceData.extras.map((extra, index) => (
                        <tr key={`extra-${index}`}>
                          <td style={documentStyles.sectionItem}>
                            {extra.description}
                          </td>
                          <td style={documentStyles.tdQuantity}>
                            {extra.quantity}
                          </td>
                          <td style={documentStyles.tdPrice}>
                            {formatCurrency(extra.unitPrice)}.-
                          </td>
                          <td style={documentStyles.tdTotal}>
                            {formatCurrency(extra.amount)}.-
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                  {/* Summary Rows */}
                  <tr
                    style={documentStyles.summaryRow}
                    className="print-summary-section"
                  >
                    <td
                      colSpan={2}
                      style={documentStyles.sectionHeader}
                      className="print-section-header"
                    >
                      Remark
                    </td>
                    <td style={documentStyles.tdPrice} className="col-price">
                      ราคารวมสินค้า (บาท)
                    </td>
                    <td style={documentStyles.tdTotal} className="col-total">
                      {formatCurrency(invoiceData.summary.subtotal)}.-
                    </td>
                  </tr>
                  <tr
                    style={documentStyles.summaryRow}
                    className="print-summary-section"
                  >
                    <td colSpan={2}></td>
                    <td style={documentStyles.tdPrice} className="col-price">
                      ภาษีมูลค่าเพิ่ม {invoiceData.summary.vatPercent}%
                    </td>
                    <td style={documentStyles.tdTotal} className="col-total">
                      {formatCurrency(invoiceData.summary.vat)}.-
                    </td>
                  </tr>
                  <tr
                    style={documentStyles.totalRow}
                    className="print-summary-total"
                  >
                    <td colSpan={2}></td>
                    <td style={documentStyles.tdPrice} className="col-price">
                      จำนวนเงินรวมทั้งสิ้น (บาท)
                    </td>
                    <td style={documentStyles.tdTotal} className="col-total">
                      {formatCurrency(invoiceData.summary.total)}.-
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Payment Info & Signatures */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "24px",
              }}
              className="print-signatures"
            >
              <div className="print-payment-info">
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: "13px",
                    marginBottom: "6px",
                    fontFamily: "Prompt, sans-serif",
                  }}
                >
                  ข้อมูลการชำระเงิน
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    fontFamily: "Prompt, sans-serif",
                    marginBottom: "3px",
                  }}
                >
                  - ชื่อบัญชี คิมเบอร์ลี่ เหงียน
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    fontFamily: "Prompt, sans-serif",
                    marginBottom: "3px",
                  }}
                >
                  - ธนาคาร Larana เลขที่บัญชี 0123456789
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    fontFamily: "Prompt, sans-serif",
                    marginBottom: "3px",
                    marginTop: "3px",
                  }}
                >
                  - ชื่อบัญชี คิมเบอร์ลี่ เหงียน
                </div>
                <div
                  style={{ fontSize: "12px", fontFamily: "Prompt, sans-serif" }}
                >
                  - ธนาคาร Borcelle เลขที่บัญชี 0123456789
                </div>
              </div>
              <div style={{ display: "flex", gap: "24px" }}>
                <div className="print-signature">
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: "bold",
                      marginBottom: "6px",
                      fontFamily: "Prompt, sans-serif",
                    }}
                  >
                    อนุมัติโดย
                  </div>
                  <div
                    style={{
                      borderBottom: "1px solid #6b7280",
                      paddingBottom: "12px",
                      marginBottom: "6px",
                      height: "50px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    className="print-signature-area"
                  >
                    <img
                      src={logo}
                      alt="Approved Signature"
                      style={{ width: "40px", height: "auto", opacity: 0.7 }}
                      className="print-signature-logo"
                    />
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      fontFamily: "Prompt, sans-serif",
                    }}
                    className="print-signature-date"
                  >
                    วันที่: {new Date().toLocaleDateString("th-TH")}
                  </div>
                </div>
                <div className="print-signature">
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: "bold",
                      marginBottom: "6px",
                      fontFamily: "Prompt, sans-serif",
                    }}
                  >
                    ผู้ว่าจ้าง
                  </div>
                  <div
                    style={{
                      borderBottom: "1px solid #6b7280",
                      paddingBottom: "12px",
                      marginBottom: "6px",
                      height: "50px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    className="print-signature-area"
                  ></div>
                  <div
                    style={{
                      fontSize: "12px",
                      fontFamily: "Prompt, sans-serif",
                    }}
                    className="print-signature-date"
                  >
                    วันที่: {new Date().toLocaleDateString("th-TH")}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                marginTop: "24px",
                paddingTop: "12px",
                textAlign: "right",
                fontSize: "12px",
                fontFamily: "Prompt, sans-serif",
              }}
              className="print-footer"
            >
              หน้า 1/1
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintInvoice;
