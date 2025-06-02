import React, { useState, useEffect } from "react";
import { Mail, X, Send, FileText, Eye, AlertTriangle } from "lucide-react";
import {
  sendInvoiceEmail,
  generateDefaultEmailContent,
  generateDefaultEmailSubject,
  initializeBrevo,
} from "./EmailService";
import { generatePDFSafely } from "./PDFGenerator";

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

  useEffect(() => {
    initializeBrevo();
  }, []);

  useEffect(() => {
    if (isOpen && invoiceData) {
      setFormData({
        to: invoiceData.customer?.email || "chalantorn.work@gmail.com",
        subject: generateDefaultEmailSubject(invoiceData),
        message: generateDefaultEmailContent(invoiceData),
      });
      generatePDF();
    }
  }, [isOpen, invoiceData]);

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    setError(null);
    setPdfReady(false);

    try {
      const result = await generatePDFSafely(invoiceData, ticketId);

      if (result.success) {
        setPdfBase64(result.pdfBase64);
        setPdfReady(true);
        console.log("PDF generated successfully");
      } else {
        setError(`ไม่สามารถสร้าง PDF ได้: ${result.message}`);
      }
    } catch (err) {
      setError(`เกิดข้อผิดพลาดในการสร้าง PDF: ${err.message}`);
    } finally {
      setIsGeneratingPDF(false);
    }
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
        invoiceData: invoiceData,
      };

      const result = await sendInvoiceEmail(emailData);

      if (result.success) {
        if (onEmailSent) {
          onEmailSent(result.message);
        }
        onClose();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(`เกิดข้อผิดพลาด: ${err.message || "ไม่ทราบสาเหตุ"}`);
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

  if (!isOpen) return null;

  return (
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
                <div className="flex items-center">
                  <AlertTriangle className="text-red-400 mr-2" size={16} />
                  <p className="text-red-700 text-sm">
                    {error}
                    {error.includes("ที่อยู่อีเมล") && (
                      <span>
                        {" "}
                        กรุณาตรวจสอบที่อยู่อีเมลหรือลองใช้ที่อยู่อีเมลอื่น
                      </span>
                    )}
                  </p>
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
                      กำลังสร้าง PDF...
                    </div>
                  )}
                  {pdfReady && (
                    <>
                      <span className="text-sm text-green-600">
                        ✓ PDF พร้อมส่ง
                      </span>
                      <button
                        type="button"
                        onClick={handlePreviewPDF}
                        className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm flex items-center transition-colors"
                      >
                        <Eye size={14} className="mr-1" />
                        ดูตัวอย่าง
                      </button>
                    </>
                  )}
                  {typeof error === "string" &&
                    error.includes("ใหญ่เกินไป") && (
                      <span className="text-sm text-red-600">
                        ⚠️ ไฟล์ PDF ใหญ่เกินไป
                      </span>
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
  );
};

export default EmailInvoice;
