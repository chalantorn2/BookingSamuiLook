import React, { useState, useEffect } from "react";
import {
  Mail,
  X,
  Send,
  FileText,
  Eye,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import {
  sendInvoiceEmail,
  generateDefaultEmailContent,
  generateDefaultEmailSubject,
  initializeBrevo,
} from "./EmailService";
import { generatePDFSafely } from "./PDFGenerator";
import { getInvoiceData } from "./documentDataMapper";
import { useNotification } from "../../../hooks/useNotification";

const EmailInvoice = ({
  isOpen,
  onClose,
  invoiceData,
  ticketId,
  onEmailSent,
}) => {
  const [formData, setFormData] = useState({
    to: "",
    subject: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [error, setError] = useState(null);
  const [pdfBase64, setPdfBase64] = useState(null);
  const [pdfReady, setPdfReady] = useState(false);
  const [sendWithoutPDF, setSendWithoutPDF] = useState(false);
  const [pdfGenerationAttempts, setPdfGenerationAttempts] = useState(0);
  const [currentInvoiceData, setCurrentInvoiceData] = useState(null);
  const { showSuccess, showError, NotificationContainer } = useNotification();
  const MAX_PDF_ATTEMPTS = 3;

  useEffect(() => {
    initializeBrevo();
  }, []);

  useEffect(() => {
    if (isOpen && ticketId) {
      // Reset states ก่อน
      setPdfBase64(null);
      setPdfReady(false);
      setError(null);
      setSendWithoutPDF(false);
      setPdfGenerationAttempts(0);

      // เปลี่ยนจากใช้ invoiceData ที่ส่งมา เป็นดึงใหม่จาก database
      fetchInvoiceDataFromDB();
    }
  }, [isOpen, ticketId]);

  const fetchInvoiceDataFromDB = async () => {
    try {
      setError(null);
      const result = await getInvoiceData(ticketId);

      if (result.success) {
        const dbInvoiceData = result.data;

        console.log("=== EMAIL DEBUG ===");
        console.log("dbInvoiceData.customer:", dbInvoiceData.customer);
        console.log("customer email:", dbInvoiceData.customer?.email);
        console.log("===================");

        setCurrentInvoiceData(dbInvoiceData); // เก็บข้อมูลใหม่

        setFormData({
          to: dbInvoiceData.customer?.email || "",
          subject: generateDefaultEmailSubject(dbInvoiceData),
          message: generateDefaultEmailContent(dbInvoiceData),
        });

        generatePDF(false, dbInvoiceData);
      } else {
        setError("ไม่สามารถดึงข้อมูล Invoice ได้: " + result.error);
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการดึงข้อมูล: " + err.message);
    }
  };

  const generatePDF = async (isRetry = false, customInvoiceData = null) => {
    if (!isRetry) {
      setIsGeneratingPDF(true);
    }
    setError(null);
    setPdfReady(false);

    try {
      console.log("Starting PDF generation...");
      // ใช้ข้อมูลที่ส่งมา หรือข้อมูลเดิม
      const dataToUse = customInvoiceData || invoiceData;
      const result = await generatePDFSafely(dataToUse, ticketId);

      if (result.success) {
        setPdfBase64(result.pdfBase64);
        setPdfReady(true);
        setPdfGenerationAttempts(0);
        console.log("PDF generated successfully");
      } else {
        throw new Error(result.message || "ไม่สามารถสร้าง PDF ได้");
      }
    } catch (err) {
      const currentAttempts = pdfGenerationAttempts + 1;
      setPdfGenerationAttempts(currentAttempts);

      console.error("PDF generation failed:", err);

      if (currentAttempts < MAX_PDF_ATTEMPTS) {
        setError(
          `การสร้าง PDF ล้มเหลว (ครั้งที่ ${currentAttempts}/${MAX_PDF_ATTEMPTS}): ${err.message}`
        );
      } else {
        setError(
          `ไม่สามารถสร้าง PDF ได้หลังจากพยายาม ${MAX_PDF_ATTEMPTS} ครั้ง: ${err.message}`
        );
      }
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const retryPDFGeneration = () => {
    generatePDF(true, null); // เพิ่ม parameter ที่ 2
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.to.trim()) {
      setError("กรุณากรอกอีเมลผู้รับ");
      return;
    }

    if (!isValidEmail(formData.to)) {
      setError("รูปแบบอีเมลไม่ถูกต้อง กรุณาตรวจสอบ");
      return;
    }

    if (!sendWithoutPDF && !pdfReady) {
      setError("PDF ยังไม่พร้อม กรุณารอสักครู่ หรือเลือกส่งโดยไม่แนบไฟล์");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const emailData = {
        to: formData.to,
        subject: formData.subject,
        message: formData.message,
        pdfBase64: sendWithoutPDF ? null : pdfBase64,
        invoiceData: currentInvoiceData || invoiceData, // ใช้ข้อมูลใหม่
      };

      const result = await sendInvoiceEmail(emailData);

      if (result.success) {
        // แสดง Toast notification สำเร็จ
        showSuccess(result.message, 6000); // แสดง 4 วินาที

        // รอให้ผู้ใช้เห็น notification ก่อนปิด modal
        setTimeout(() => {
          if (onEmailSent) {
            onEmailSent(result.message);
          }
          onClose();
        }, 3000); // รอ 1.5 วินาทีก่อนปิด modal
      } else {
        // แสดง Toast notification ผิดพลาด
        showError(result.message, 6000); // แสดง 6 วินาที (error ควรแสดงนานกว่า)

        // เก็บ error ไว้แสดงใน modal ด้วย
        setError(result.message);
      }
    } catch (err) {
      const errorMessage = `เกิดข้อผิดพลาด: ${err.message || "ไม่ทราบสาเหตุ"}`;

      // แสดง Toast notification ผิดพลาด
      showError(errorMessage, 6000);

      // เก็บ error ไว้แสดงใน modal ด้วย
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviewPDF = () => {
    if (!pdfBase64) return;

    try {
      const byteCharacters = atob(pdfBase64);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      setError("ไม่สามารถเปิด PDF ได้");
    }
  };

  const getPDFStatusMessage = () => {
    if (isGeneratingPDF) {
      return "กำลังสร้าง PDF...";
    }

    if (pdfReady) {
      return "✓ PDF พร้อมส่ง";
    }

    if (error && pdfGenerationAttempts >= MAX_PDF_ATTEMPTS) {
      return "⚠️ ไม่สามารถสร้าง PDF ได้";
    }

    if (error && pdfGenerationAttempts < MAX_PDF_ATTEMPTS) {
      return `⚠️ กำลังลองใหม่... (${pdfGenerationAttempts}/${MAX_PDF_ATTEMPTS})`;
    }

    return "กำลังเตรียม PDF...";
  };

  const getPDFStatusColor = () => {
    if (isGeneratingPDF) return "text-blue-600";
    if (pdfReady) return "text-green-600";
    if (error) return "text-red-600";
    return "text-gray-600";
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        style={{ position: "fixed", top: "1rem", right: "1rem", zIndex: 9999 }}
      >
        <NotificationContainer />
      </div>
      <div className="fixed inset-0 modal-backdrop bg-black flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="bg-blue-600 p-4 text-white flex justify-between items-center shrink-0">
            <h1 className="text-xl font-bold flex items-center">
              <Mail size={20} className="mr-2" />
              ส่ง Invoice ทางอีเมล
            </h1>
            <button
              className="p-2 hover:bg-blue-700 rounded-full transition-colors"
              title="ปิด"
              onClick={onClose}
              disabled={isLoading}
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6">
              {invoiceData && (
                <div className="mb-6 bg-blue-50 p-4 rounded-md">
                  <h2 className="font-medium text-gray-800 mb-2 flex items-center">
                    <FileText size={16} className="mr-2" />
                    ข้อมูล Invoice
                  </h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">เลขที่:</span>
                      <span className="ml-2 font-medium">
                        {invoiceData.invoice?.poNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">วันที่:</span>
                      <span className="ml-2">{invoiceData.invoice?.date}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">ลูกค้า:</span>
                      <span className="ml-2">{invoiceData.customer?.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">จำนวนเงิน:</span>
                      <span className="ml-2 font-medium">
                        ฿
                        {(invoiceData.summary?.total || 0).toLocaleString(
                          "th-TH"
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex items-start">
                    <AlertTriangle
                      className="text-red-400 mr-2 mt-1 flex-shrink-0"
                      size={16}
                    />
                    <div className="flex-1">
                      <p className="text-red-700 text-sm">{error}</p>
                      {pdfGenerationAttempts < MAX_PDF_ATTEMPTS &&
                        error.includes("PDF") && (
                          <button
                            type="button"
                            onClick={retryPDFGeneration}
                            className="mt-2 text-sm text-red-600 hover:text-red-800 underline flex items-center"
                            disabled={isGeneratingPDF}
                          >
                            <RefreshCw size={14} className="mr-1" />
                            ลองสร้าง PDF ใหม่
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-6 bg-gray-50 p-4 rounded-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <FileText size={16} className="mr-2 text-gray-500" />
                    <span className="text-sm font-medium">ไฟล์แนบ PDF</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isGeneratingPDF && (
                      <div className="flex items-center text-sm text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        {/* กำลังสร้าง PDF... */}
                      </div>
                    )}

                    <span className={`text-sm ${getPDFStatusColor()}`}>
                      {getPDFStatusMessage()}
                    </span>

                    {pdfReady && (
                      <button
                        type="button"
                        onClick={handlePreviewPDF}
                        className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm flex items-center transition-colors"
                      >
                        <Eye size={14} className="mr-1" />
                        ดูตัวอย่าง
                      </button>
                    )}

                    {error && pdfGenerationAttempts < MAX_PDF_ATTEMPTS && (
                      <button
                        type="button"
                        onClick={retryPDFGeneration}
                        className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-600 rounded text-sm flex items-center transition-colors"
                        disabled={isGeneratingPDF}
                      >
                        <RefreshCw size={14} className="mr-1" />
                        ลองใหม่
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sendWithoutPDF"
                    checked={sendWithoutPDF}
                    onChange={(e) => setSendWithoutPDF(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="sendWithoutPDF"
                    className="ml-2 text-sm text-gray-700"
                  >
                    ส่งอีเมลโดยไม่แนบไฟล์ PDF
                  </label>
                </div>

                {sendWithoutPDF && (
                  <div className="mt-2 text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
                    ⚠️ อีเมลจะถูกส่งโดยไม่มีไฟล์ PDF แนบ
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ถึง (อีเมลผู้รับ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="to"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.to}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    หัวข้ออีเมล
                  </label>
                  <input
                    type="text"
                    name="subject"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="หัวข้ออีเมล"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ข้อความ
                  </label>
                  <textarea
                    name="message"
                    rows="8"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="ข้อความที่ต้องการส่งให้ลูกค้า"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </form>
          </div>

          <div className="bg-gray-50 px-6 py-4 border-t flex justify-end space-x-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              disabled={isLoading}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || (!sendWithoutPDF && !pdfReady)}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  กำลังส่ง...
                </>
              ) : (
                <>
                  <Send size={16} className="mr-2" />
                  ส่งอีเมล
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmailInvoice;
