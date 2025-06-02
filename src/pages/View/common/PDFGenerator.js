import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import React from "react";
import { createRoot } from "react-dom/client";
import PrintInvoice from "./PrintInvoice";

/**
 * สร้าง PDF จาก PrintInvoice component
 * @param {Object} invoiceData - ข้อมูล Invoice ที่จะสร้าง PDF
 * @param {number} ticketId - ID ของ ticket
 * @returns {Promise<string>} - PDF ในรูปแบบ base64
 */
export const generateInvoicePDF = async (invoiceData, ticketId) => {
  try {
    console.log("Starting PDF generation for ticket:", ticketId);
    console.log("Invoice data:", invoiceData);

    // สร้าง container สำหรับ render component
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.top = "-9999px";
    container.style.left = "-9999px";
    container.style.width = "210mm";
    container.style.height = "auto";
    container.style.background = "white";
    container.style.fontFamily = "Prompt, sans-serif";

    document.body.appendChild(container);

    // สร้าง wrapper div สำหรับ PrintInvoice
    const printWrapper = document.createElement("div");
    printWrapper.style.width = "100%";
    printWrapper.style.background = "white";
    printWrapper.style.padding = "20px";
    printWrapper.style.boxSizing = "border-box";

    container.appendChild(printWrapper);

    // Render PDF content
    const printContent = createPrintInvoiceHTML(invoiceData);
    printWrapper.innerHTML = printContent;

    // รอให้ fonts โหลด
    await waitForFonts();

    // รอให้ images โหลด
    await waitForImages(printWrapper);

    console.log("Content rendered, capturing canvas...");

    // สร้าง canvas จาก HTML
    const canvas = await html2canvas(printWrapper, {
      scale: 3.0, // เพิ่มจาก 2.0 เป็น 3.0
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      width: 794,
      height: printWrapper.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      logging: true,
      quality: 0.95, // เพิ่มจาก 0.8 เป็น 0.95
    });

    console.log("Canvas created, generating PDF...");

    // สร้าง PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: false, // ปิดการบีบอัด
    });

    // คำนวณขนาด
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // เพิ่มรูปลงใน PDF
    const imgData = canvas.toDataURL("image/jpeg", 0.95); // เพิ่มจาก 0.8 เป็น 0.95
    pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);

    // ทำความสะอาด
    document.body.removeChild(container);

    // แปลงเป็น base64
    const pdfBase64 = pdf.output("datauristring").split(",")[1];

    // ตรวจสอบขนาดไฟล์ (Brevo สูงสุด 10MB)
    const fileSizeInMB = (pdfBase64.length * 0.75) / 1024 / 1024;
    console.log(`PDF size: ${fileSizeInMB.toFixed(2)} MB`);
    if (fileSizeInMB > 10) {
      throw new Error(`ไฟล์ PDF ใหญ่เกิน 10MB (${fileSizeInMB.toFixed(2)} MB)`);
    }

    console.log("PDF generated successfully");

    return pdfBase64;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error(`ไม่สามารถสร้าง PDF ได้: ${error.message}`);
  }
};

/**
 * สร้าง HTML content จาก invoice data
 * @param {Object} invoiceData - ข้อมูล Invoice
 * @returns {string} - HTML string
 */
const createPrintInvoiceHTML = (invoiceData) => {
  return `
    <div style="font-family: Prompt, sans-serif; color: #333; line-height: 1.3; max-width: 210mm; margin: 0 auto; background: white;">
      
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: stretch; padding-bottom: 0px; margin-bottom: 24px; position: relative; min-height: 100px;">
        
        <!-- Company Info -->
        <div style="display: flex; align-items: flex-start; border-bottom: 4px solid #881f7e; padding-bottom: 8px; width: calc(100% - 256px); flex: 1; min-height: 100px; box-sizing: border-box;">
          <img src="../../../assets/logo-print.png" alt="Company Logo" style="width: 110px; height: auto; margin-right: 16px;" />
          <div>
            <div style="font-size: 18px; font-weight: bold; margin-bottom: 4px; font-family: Prompt, sans-serif;">
              บริษัท สมุย ลุค จำกัด
            </div>
            <div style="font-size: 12px; margin: 2px 0; font-family: Prompt, sans-serif;">
              63/27 ม.3 ต.บ่อผุด อ.เกาะสมุย จ.สุราษฎร์ธานี 84320
            </div>
            <div style="font-size: 12px; margin: 2px 0; font-family: Prompt, sans-serif;">
              โทร 077-950550 email :samuilook@yahoo.com
            </div>
            <div style="font-size: 12px; margin: 2px 0; font-family: Prompt, sans-serif;">
              เลขประจำตัวผู้เสียภาษี 0845545002700
            </div>
          </div>
        </div>
        
        <!-- Document Title -->
        <div style="width: 256px; background-color: #f4bb19; padding: 10px; text-align: center; border-bottom: 4px solid #fbe73a; min-height: 100px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center;">
          <p style="font-size: 20px; font-weight: bold; color: white; margin: 0; font-family: Prompt, sans-serif;">ใบแจ้งหนี้</p>
          <p style="font-size: 20px; font-weight: bold; color: white; margin: 0; font-family: Prompt, sans-serif;">Invoice</p>
        </div>
      </div>

      <!-- Customer & Invoice Info -->
      <div style="margin: 20px auto; border: 1px solid #d1d5db; border-radius: 6px; padding: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
        
        <!-- Customer Info -->
        <div>
          <div style="display: grid; grid-template-columns: 120px 1fr; margin-bottom: 6px; font-size: 12px; font-family: Prompt, sans-serif;">
            <span style="font-weight: bold;">ลูกค้า:</span>
            <span>${invoiceData.customer?.name || ""}</span>
          </div>
          <div style="display: grid; grid-template-columns: 120px 1fr; margin-bottom: 6px; font-size: 12px; font-family: Prompt, sans-serif;">
            <span style="font-weight: bold;">ที่อยู่:</span>
            <span>${invoiceData.customer?.address || ""}</span>
          </div>
          <div style="display: grid; grid-template-columns: 120px 1fr; margin-bottom: 6px; font-size: 12px; font-family: Prompt, sans-serif;">
            <span style="font-weight: bold;">เบอร์โทร:</span>
            <span>${invoiceData.customer?.phone || ""}</span>
          </div>
          <div style="display: grid; grid-template-columns: 120px 1fr; margin-bottom: 6px; font-size: 12px; font-family: Prompt, sans-serif;">
            <span style="font-weight: bold;">เลขประจำตัวผู้เสียภาษี:</span>
            <span>${invoiceData.customer?.taxId || ""} &nbsp; <b>สาขา:</b> ${
    invoiceData.customer?.branch || "Head Office"
  }</span>
          </div>
        </div>
        
        <!-- Invoice Info -->
        <div>
          <div style="display: grid; grid-template-columns: 120px 1fr; margin-bottom: 6px; font-size: 12px; font-family: Prompt, sans-serif;">
            <span style="font-weight: bold;">เลขที่:</span>
            <span>${invoiceData.invoice?.poNumber || ""}</span>
          </div>
          <div style="display: grid; grid-template-columns: 120px 1fr; margin-bottom: 6px; font-size: 12px; font-family: Prompt, sans-serif;">
            <span style="font-weight: bold;">วันที่:</span>
            <span>${invoiceData.invoice?.date || ""}</span>
          </div>
          <div style="display: grid; grid-template-columns: 120px 1fr; margin-bottom: 6px; font-size: 12px; font-family: Prompt, sans-serif;">
            <span style="font-weight: bold;">วันที่ครบกำหนด:</span>
            <span>${invoiceData.invoice?.dueDate || ""}</span>
          </div>
          <div style="display: grid; grid-template-columns: 120px 1fr; margin-bottom: 6px; font-size: 12px; font-family: Prompt, sans-serif;">
            <span style="font-weight: bold;">Sale /Staff:</span>
            <span>${invoiceData.invoice?.salesPerson || ""}</span>
          </div>
        </div>
      </div>

      <!-- Items Table -->
      <div style="margin: 5px 0; overflow-x: hidden; width: 100%;">
        <table style="width: 100%; border-collapse: collapse; border-top: 4px solid #000; border-bottom: 4px solid #000; font-family: Prompt, sans-serif; margin: 5px 0; display: table;">
          <thead>
            <tr>
              <th style="background-color: #e5e7eb; border-top: 2px solid #000; border-bottom: 2px solid #000; font-weight: bold; text-align: center; padding: 5px; font-size: 12px; width: 50%;">รายละเอียด</th>
              <th style="background-color: #e5e7eb; border-top: 2px solid #000; border-bottom: 2px solid #000; border-left: 1px solid #000; font-weight: bold; text-align: center; padding: 2px; font-size: 12px; width: 10%;">จำนวน</th>
              <th style="background-color: #e5e7eb; border-top: 2px solid #000; border-bottom: 2px solid #000; border-left: 1px solid #000; font-weight: bold; text-align: center; padding: 2px; font-size: 12px; width: 20%;">ราคาต่อหน่วย</th>
              <th style="background-color: #e5e7eb; border-top: 2px solid #000; border-bottom: 2px solid #000; border-left: 1px solid #000; font-weight: bold; text-align: center; padding: 2px; font-size: 12px; width: 20%;">รวมเป็นเงิน</th>
            </tr>
          </thead>
          <tbody>
            
            <!-- NAME Section -->
            <tr>
              <td colspan="4" style="font-weight: bold; padding: 2px; font-size: 12px;">NAME /ชื่อผู้โดยสาร</td>
            </tr>
            ${(invoiceData.passengers || [])
              .slice(0, 10)
              .map(
                (passenger) => `
              <tr>
                <td style="font-size: 12px; padding: 3px 3px 3px 40px;">${passenger.display}</td>
                <td style="padding: 2px; font-size: 12px; text-align: center; border-left: 1px solid #000;"></td>
                <td style="padding: 2px; font-size: 12px; text-align: right; border-left: 1px solid #000;"></td>
                <td style="padding: 2px; font-size: 12px; text-align: right; border-left: 1px solid #000;"></td>
              </tr>
            `
              )
              .join("")}

            <!-- AIR TICKET Section -->
            <tr>
              <td colspan="4" style="font-weight: bold; padding: 2px; font-size: 12px;">AIR TICKET /ตั๋วเครื่องบิน</td>
            </tr>
            ${(invoiceData.flights || [])
              .slice(0, 5)
              .map(
                (flight) => `
              <tr>
                <td style="font-size: 12px; padding: 3px 3px 3px 40px;">${flight.display}</td>
                <td style="padding: 2px; font-size: 12px; text-align: center; border-left: 1px solid #000;"></td>
                <td style="padding: 2px; font-size: 12px; text-align: right; border-left: 1px solid #000;"></td>
                <td style="padding: 2px; font-size: 12px; text-align: right; border-left: 1px solid #000;"></td>
              </tr>
            `
              )
              .join("")}

            ${(invoiceData.passengerTypes || [])
              .map(
                (type) => `
              <tr>
                <td style="font-size: 12px; padding: 3px 3px 3px 40px;">${
                  type.type
                }</td>
                <td style="padding: 2px; font-size: 12px; text-align: center; border-left: 1px solid #000;">${
                  type.quantity
                }</td>
                <td style="padding: 2px; font-size: 12px; text-align: right; border-left: 1px solid #000;">${formatCurrency(
                  type.unitPrice
                )}.-</td>
                <td style="padding: 2px; font-size: 12px; text-align: right; border-left: 1px solid #000;">${formatCurrency(
                  type.amount
                )}.-</td>
              </tr>
            `
              )
              .join("")}

            <!-- Other Section -->
            ${
              (invoiceData.extras || []).length > 0
                ? `
              <tr>
                <td colspan="4" style="font-weight: bold; padding: 2px; font-size: 12px;">Other</td>
              </tr>
              ${(invoiceData.extras || [])
                .slice(0, 5)
                .map(
                  (extra) => `
                <tr>
                  <td style="font-size: 12px; padding: 3px 3px 3px 40px;">${
                    extra.description
                  }</td>
                  <td style="padding: 2px; font-size: 12px; text-align: center; border-left: 1px solid #000;">${
                    extra.quantity
                  }</td>
                  <td style="padding: 2px; font-size: 12px; text-align: right; border-left: 1px solid #000;">${formatCurrency(
                    extra.unitPrice
                  )}.-</td>
                  <td style="padding: 2px; font-size: 12px; text-align: right; border-left: 1px solid #000;">${formatCurrency(
                    extra.amount
                  )}.-</td>
                </tr>
              `
                )
                .join("")}
            `
                : ""
            }

            <!-- Summary -->
            <tr style="border-top: 2px solid #000;">
              <td colspan="2" style="font-weight: bold; padding: 2px; font-size: 12px;">Remark</td>
              <td style="padding: 2px; font-size: 12px; text-align: right; border-left: 1px solid #000; font-weight: bold;">ราคารวมสินค้า (บาท)</td>
              <td style="padding: 2px; font-size: 12px; text-align: right; border-left: 1px solid #000; font-weight: bold;">${formatCurrency(
                invoiceData.summary?.subtotal || 0
              )}.-</td>
            </tr>
            <tr style="border-top: 2px solid #000;">
              <td colspan="2"></td>
              <td style="padding: 2px; font-size: 12px; text-align: right; border-left: 1px solid #000; font-weight: bold;">ภาษีมูลค่าเพิ่ม ${
                invoiceData.summary?.vatPercent || 0
              }%</td>
              <td style="padding: 2px; font-size: 12px; text-align: right; border-left: 1px solid #000; font-weight: bold;">${formatCurrency(
                invoiceData.summary?.vat || 0
              )}.-</td>
            </tr>
            <tr style="background-color: #e5e7eb; border-top: 3px solid #000; border-bottom: 3px solid #000;">
              <td colspan="2"></td>
              <td style="padding: 2px; font-size: 12px; text-align: right; border-left: 1px solid #000; font-weight: bold;">จำนวนเงินรวมทั้งสิ้น (บาท)</td>
              <td style="padding: 2px; font-size: 12px; text-align: right; border-left: 1px solid #000; font-weight: bold;">${formatCurrency(
                invoiceData.summary?.total || 0
              )}.-</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Payment & Signatures -->
      <div style="display: flex; justify-content: space-between; margin-top: 24px;">
        <div>
          <div style="font-weight: bold; font-size: 13px; margin-bottom: 6px;">ข้อมูลการชำระเงิน</div>
          <div style="font-size: 12px; margin-bottom: 3px;">- ชื่อบัญชี คิมเบอร์ลี่ เหงียน</div>
          <div style="font-size: 12px; margin-bottom: 3px;">- ธนาคาร Larana เลขที่บัญชี 0123456789</div>
          <div style="font-size: 12px; margin-bottom: 3px; margin-top: 3px;">- ชื่อบัญชี คิมเบอร์ลี่ เหงียน</div>
          <div style="font-size: 12px;">- ธนาคาร Borcelle เลขที่บัญชี 0123456789</div>
        </div>
        <div style="display: flex; gap: 24px;">
          <div style="text-align: center; font-size: 11px;">
            <div style="font-size: 12px; font-weight: bold; margin-bottom: 6px;">อนุมัติโดย</div>
            <div style="border-bottom: 1px solid #6b7280; padding-bottom: 12px; margin-bottom: 6px; height: 50px;"></div>
            <div style="font-size: 12px;">วันที่: ${new Date().toLocaleDateString(
              "th-TH"
            )}</div>
          </div>
          <div style="text-align: center; font-size: 11px;">
            <div style="font-size: 12px; font-weight: bold; margin-bottom: 6px;">ผู้ว่าจ้าง</div>
            <div style="border-bottom: 1px solid #6b7280; padding-bottom: 12px; margin-bottom: 6px; height: 50px;"></div>
            <div style="font-size: 12px;">วันที่: ${new Date().toLocaleDateString(
              "th-TH"
            )}</div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="margin-top: 24px; padding-top: 12px; text-align: right; font-size: 12px;">
        หน้า 1/1
      </div>
    </div>
  `;
};

/**
 * รอให้ Google Fonts โหลดเสร็จ
 * @returns {Promise<void>}
 */
export async function waitForFonts() {
  try {
    if ("fonts" in document) {
      await document.fonts.ready;
      console.log("Fonts loaded successfully");
    } else {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  } catch (error) {
    console.warn("Font loading error:", error);
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
}

/**
 * รอให้รูปภาพโหลดเสร็จ
 * @param {HTMLElement} container - Container ที่มีรูปภาพ
 * @returns {Promise<void>}
 */
export async function waitForImages(container) {
  const images = container.querySelectorAll("img");

  if (!images.length) {
    return Promise.resolve();
  }

  const imagePromises = Array.from(images).map((img) => {
    return new Promise((resolve) => {
      if (img.complete) {
        resolve();
      } else {
        img.onload = resolve;
        img.onerror = resolve;
        setTimeout(resolve, 2000);
      }
    });
  });

  await Promise.all(imagePromises);
  console.log("All images loaded");
}

/**
 * จัดรูปแบบตัวเลขเป็นสกุลเงิน
 * @param {number} amount - จำนวนเงิน
 * @returns {string} - จำนวนเงินที่จัดรูปแบบแล้ว
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return "0";
  return Math.floor(parseFloat(amount)).toLocaleString("th-TH");
}

/**
 * สร้าง PDF พร้อมกับจัดการ error
 * @param {Object} invoiceData - ข้อมูล Invoice
 * @param {number} ticketId - ID ของ ticket
 * @returns {Promise<Object>} - ผลลัพธ์การสร้าง PDF
 */
export async function generatePDFSafely(invoiceData, ticketId) {
  try {
    const pdfBase64 = await generateInvoicePDF(invoiceData, ticketId);

    return {
      success: true,
      pdfBase64: pdfBase64,
      message: "สร้าง PDF สำเร็จ",
    };
  } catch (error) {
    console.error("PDF generation failed:", error);

    return {
      success: false,
      error: error.message,
      message: "ไม่สามารถสร้าง PDF ได้",
    };
  }
}
