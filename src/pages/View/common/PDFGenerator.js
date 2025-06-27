import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * สร้าง PDF จาก Invoice data โดยรองรับหลายหน้า
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

    // คำนวณหน้า
    const { totalPages, passengerPages } = calculatePages(invoiceData);

    // สร้าง wrapper div สำหรับเนื้อหาทั้งหมด
    const printWrapper = document.createElement("div");
    printWrapper.style.width = "100%";
    printWrapper.style.background = "white";
    printWrapper.style.padding = "0";
    printWrapper.style.boxSizing = "border-box";

    container.appendChild(printWrapper);

    // สร้างเนื้อหาทั้งหมด
    const printContent = createMultiPageHTML(
      invoiceData,
      passengerPages,
      totalPages
    );
    printWrapper.innerHTML = printContent;

    // รอให้ fonts และ images โหลด
    await waitForFonts();
    await waitForImages(printWrapper);

    console.log("Content rendered, capturing canvas...");

    // สร้าง canvas จาก HTML
    const canvas = await html2canvas(printWrapper, {
      scale: 3.0,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      width: 794, // A4 width in pixels at 96 DPI
      height: printWrapper.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      logging: false,
      quality: 0.95,
    });

    console.log("Canvas created, generating PDF...");

    // สร้าง PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: false,
    });

    // คำนวณขนาดและแบ่งหน้า
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // เพิ่มรูปลงใน PDF (หน้าแรก)
    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // *** เพิ่มเงื่อนไขใหม่ตรงนี้ ***
    // เช็คว่าควรจะมีกี่หน้าจริงๆ ตามจำนวนผู้โดยสาร
    if (totalPages === 1) {
      // ถ้าเป็นหน้าเดียว ไม่ต้องเพิ่มหน้าใหม่
      console.log("Single page detected, not adding extra pages");
    } else {
      // เพิ่มหน้าถัดไปถ้าจำเป็น (สำหรับหลายหน้าเท่านั้น)
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
    }
    // ทำความสะอาด
    document.body.removeChild(container);

    // แปลงเป็น base64
    const pdfBase64 = pdf.output("datauristring").split(",")[1];

    // ตรวจสอบขนาดไฟล์
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
 * คำนวณจำนวนหน้าและแบ่งผู้โดยสาร
 */
const calculatePages = (invoiceData) => {
  const PASSENGERS_PER_PAGE = 9;

  if (!invoiceData?.passengers?.length) {
    return { totalPages: 1, passengerPages: [[]] };
  }

  const totalPassengers = invoiceData.passengers.length;
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

/**
 * สร้าง HTML content สำหรับหลายหน้า
 */
const createMultiPageHTML = (invoiceData, passengerPages, totalPages) => {
  const pages = passengerPages.map((passengers, pageIndex) => {
    const pageNumber = pageIndex + 1;
    const isFirstPage = pageNumber === 1;

    return `
      <div class="print-page ${
        !isFirstPage ? "page-break" : ""
      }" id="page-${pageNumber}">
        ${renderPageHeader(invoiceData)}
        ${renderPassengerTable(invoiceData, passengers, pageNumber, totalPages)}
        ${renderPageFooter(pageNumber, totalPages)}
      </div>
    `;
  });

  return `
    <div class="print-document">
      <style>${getDocumentStyles()}</style>
      ${pages.join("")}
    </div>
  `;
};

/**
 * สร้าง Header ของแต่ละหน้า
 */
const renderPageHeader = (invoiceData) => {
  console.log("=== PDF DEBUG ADDRESS ===");
  console.log("invoiceData.customer:", invoiceData.customer);
  console.log("address_line1:", invoiceData.customer?.address_line1);
  console.log("address_line2:", invoiceData.customer?.address_line2);
  console.log("address_line3:", invoiceData.customer?.address_line3);
  return `
    <!-- Header -->
    <div class="print-header">
      <div class="print-company-info">
        <img src="/src/assets/logo-print.png" alt="Company Logo" class="print-company-logo" crossorigin="anonymous" />
        <div class="print-company-details">
          <div class="print-company-title">บริษัท สมุย ลุค จำกัด</div>
          <div class="print-company-text">63/27 ม.3 ต.บ่อผุด อ.เกาะสมุย จ.สุราษฎร์ธานี 84320</div>
          <div class="print-company-text">โทร 077-950550 Email: samuilook@yahoo.com</div>
          <div class="print-company-text">เลขประจำตัวผู้เสียภาษี 0845545002700</div>
        </div>
      </div>
      <div class="print-document-title">
        <div class="print-document-title-text">ใบแจ้งหนี้</div>
        <div class="print-document-title-text">Invoice</div>
      </div>
    </div>

    <!-- Customer & Invoice Info -->
    <div class="print-info-section">
      <div class="print-info-customer">
        <div class="print-info-row">
          <span class="print-info-label">ลูกค้า:</span>
          <span class="print-info-value">${
            invoiceData.customer?.name || ""
          }</span>
        </div>
       <div class="print-info-row">
          <span class="print-info-label">ที่อยู่:</span>
          <div class="print-info-value print-address">
            ${
              invoiceData.customer?.address_line1
                ? `<div>${invoiceData.customer.address_line1}</div>`
                : ""
            }
            ${
              invoiceData.customer?.address_line2
                ? `<div>${invoiceData.customer.address_line2}</div>`
                : ""
            }
            ${
              invoiceData.customer?.address_line3
                ? `<div>${invoiceData.customer.address_line3}</div>`
                : ""
            }
          </div>
        </div>

        <div class="print-info-row">
          <span class="print-info-label">เบอร์โทร:</span>
          <span class="print-info-value">${
            invoiceData.customer?.phone || ""
          }</span>
        </div>
        <div class="print-info-row">
          <span class="print-info-label">เลขประจำตัวผู้เสียภาษี:</span>
          <span class="print-info-value">${
            invoiceData.customer?.taxId || ""
          } <strong>สาขา:</strong> ${
    invoiceData.customer?.branch || "Head Office"
  }</span>
        </div>
      </div>
      <div class="print-info-invoice">
        <div class="print-info-row">
          <span class="print-info-label">เลขที่:</span>
          <span class="print-info-value">${
            invoiceData.invoice?.poNumber || ""
          }</span>
        </div>
        <div class="print-info-row">
          <span class="print-info-label">วันที่:</span>
          <span class="print-info-value">${
            invoiceData.invoice?.date || ""
          }</span>
        </div>
        <div class="print-info-row">
          <span class="print-info-label">วันที่ครบกำหนด:</span>
          <span class="print-info-value">${
            invoiceData.invoice?.dueDate || ""
          }</span>
        </div>
        <div class="print-info-row">
          <span class="print-info-label">Sale /Staff:</span>
          <span class="print-info-value">${
            invoiceData.invoice?.salesPerson || ""
          }</span>
        </div>
      </div>
    </div>
  `;
};

/**
 * สร้างตารางผู้โดยสารสำหรับแต่ละหน้า
 */
const renderPassengerTable = (
  invoiceData,
  passengers,
  pageNumber,
  totalPages
) => {
  return `
    <div class="print-items-table">
      <table class="print-table">
        <thead>
          <tr>
            <th class="print-th-detail">รายละเอียด</th>
            <th class="print-th-quantity">จำนวน</th>
            <th class="print-th-price">ราคาต่อหน่วย</th>
            <th class="print-th-total">รวมเป็นเงิน</th>
          </tr>
        </thead>
        <tbody>
          
          <!-- NAME Section - ผู้โดยสารของหน้านี้ -->
          <tr>
            <td class="print-section-header">NAME /ชื่อผู้โดยสาร</td>
            <td class="print-td-quantity"></td>
            <td class="print-td-price"></td>
            <td class="print-td-total"></td>
          </tr>
          ${passengers
            .map(
              (passenger, index) => `
            <tr>
              <td class="print-section-item">${passenger.display || ""}</td>
              <td class="print-td-quantity"></td>
              <td class="print-td-price"></td>
              <td class="print-td-total"></td>
            </tr>
          `
            )
            .join("")}

          <!-- AIR TICKET Section - แสดงทุกหน้า -->
          <tr>
            <td class="print-section-header">AIR TICKET /ตั๋วเครื่องบิน</td>
            <td class="print-td-quantity"></td>
            <td class="print-td-price"></td>
            <td class="print-td-total"></td>
          </tr>
          ${(invoiceData.flights || [])
            .map(
              (flight, index) => `
            <tr>
              <td class="print-section-item">${flight.display || ""}</td>
              <td class="print-td-quantity"></td>
              <td class="print-td-price"></td>
              <td class="print-td-total"></td>
            </tr>
          `
            )
            .join("")}
          ${(invoiceData.passengerTypes || [])
            .map(
              (type, index) => `
            <tr>
              <td class="print-section-item">${type.type || ""}</td>
              <td class="print-td-quantity">${type.quantity || ""}</td>
              <td class="print-td-price">${formatCurrency(
                type.unitPrice || 0
              )}.-</td>
              <td class="print-td-total">${formatCurrency(
                type.amount || 0
              )}.-</td>
            </tr>
          `
            )
            .join("")}

          <!-- Other Section - แสดงทุกหน้า -->
          ${
            (invoiceData.extras || []).length > 0
              ? `
            <tr>
              <td class="print-section-header">Other</td>
              <td class="print-td-quantity"></td>
              <td class="print-td-price"></td>
              <td class="print-td-total"></td>
            </tr>
            ${(invoiceData.extras || [])
              .map(
                (extra, index) => `
              <tr>
                <td class="print-section-item">${extra.description || ""}</td>
                <td class="print-td-quantity">${extra.quantity || ""}</td>
                <td class="print-td-price">${formatCurrency(
                  extra.unitPrice || 0
                )}.-</td>
                <td class="print-td-total">${formatCurrency(
                  extra.amount || 0
                )}.-</td>
              </tr>
            `
              )
              .join("")}
          `
              : ""
          }

          <!-- Summary - แสดงทุกหน้า -->
          <tr class="print-summary-row">
            <td class="print-section-header">Remark</td>
            <td colspan="2" class="print-td-price print-summary-label">ราคารวมสินค้า (บาท)</td>
            <td class="print-td-total print-summary-value">${formatCurrency(
              invoiceData.summary?.subtotal || 0
            )}.-</td>
          </tr>
          <tr class="print-summary-row">
            <td></td>
            <td colspan="2" class="print-td-price print-summary-label">ภาษีมูลค่าเพิ่ม ${
              invoiceData.summary?.vatPercent || 0
            }%</td>
            <td class="print-td-total print-summary-value">${formatCurrency(
              invoiceData.summary?.vat || 0
            )}.-</td>
          </tr>
          <tr class="print-total-row">
            <td></td>
            <td colspan="2" class="print-td-price print-summary-label">จำนวนเงินรวมทั้งสิ้น (บาท)</td>
            <td class="print-td-total print-summary-value">${formatCurrency(
              invoiceData.summary?.total || 0
            )}.-</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
};

/**
 * สร้าง Footer ของแต่ละหน้า
 */
const renderPageFooter = (pageNumber, totalPages) => {
  return `
    <!-- Payment Info & Signatures -->
    <div class="print-bottom-section">
      <div class="print-payment-info">
        <div class="print-payment-title" style="text-decoration: underline;">ข้อมูลการชำระเงิน</div>
        
        <!-- ชื่อบัญชี: นิศารัตน์ ชัยชนะโชติวีรกุล -->
        <div class="print-payment-item" style="font-weight: bold; margin-top: 6px; margin-bottom: 3px;">
          ชื่อบัญชี: นิศารัตน์ ชัยชนะโชติวีรกุล
        </div>
        <div class="print-payment-item">• ธนาคารกสิกรไทย เลขบัญชี 502-207768-8</div>
        <div class="print-payment-item">• ธนาคารไทยพาณิชย์ เลขบัญชี 836-200976-4</div>
        <div class="print-payment-item">• ธนาคารกรุงไทย เลขบัญชี 829-002106-2</div>
        
        <!-- ชื่อบัญชี: Mr. Hajime Watanabe -->
        <div class="print-payment-item" style="font-weight: bold; margin-top: 6px; margin-bottom: 3px;">
          ชื่อบัญชี: Mr. Hajime Watanabe
        </div>
        <div class="print-payment-item">• ธนาคารกรุงศรี เลขบัญชี 423-125269-8</div>
        <div class="print-payment-item">• ธนาคารกรุงเทพ เลขบัญชี 691-001639-0</div>
        <div class="print-payment-item">• ธนาคารทหารไทย เลขบัญชี 585-200121-2</div>
      </div>
      
      <!-- Signatures -->
      <div class="print-signatures">
        <div class="print-signature">
          <div class="print-signature-title">อนุมัติโดย</div>
          <div class="print-signature-area">
            <img src="/src/assets/logo-print.png" alt="Approved Signature" class="print-signature-logo" crossorigin="anonymous" />
          </div>
          <div class="print-signature-date">วันที่: ${new Date().toLocaleDateString(
            "th-TH"
          )}</div>
        </div>
        <div class="print-signature">
          <div class="print-signature-title">ผู้ว่าจ้าง</div>
          <div class="print-signature-area"></div>
          <div class="print-signature-date">วันที่: ${new Date().toLocaleDateString(
            "th-TH"
          )}</div>
        </div>
      </div>
    </div>

    <!-- Page Footer -->
    <div class="print-footer">หน้า ${pageNumber}/${totalPages}</div>
  `;
};

/**
 * CSS Styles สำหรับ PDF (Copy จาก PrintInvoice.jsx)
 */
const getDocumentStyles = () => {
  return `
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
    
    .print-document {
      font-family: "Prompt", sans-serif;
      color: #333;
      line-height: 1.3;
      padding: 0;
      box-sizing: border-box;
      width: auto;
      background: transparent;
    }
    
    .print-page {
      width: 210mm;
      height: auto;
      min-height: 297mm;
      position: relative;
      background: white;
      margin: 0;
      padding: 10mm 15mm;
      box-sizing: border-box;
      overflow: hidden;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    
    .page-break {
      page-break-before: always !important;
      break-before: page !important;
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
      border-top: 1px solid #000;
      border-bottom: 1px solid #000;
    }

    .print-table th {
  background-color: #e5e7eb !important;
  border-top: 1px solid #000;
  border-bottom: 1px solid #000;
  font-weight: bold;
  text-align: center !important;
  padding: 8px 4px !important;  /* เพิ่ม padding บน-ล่าง */
  font-size: 12px;
  line-height: 1.2 !important;  /* กำหนด line-height */
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
      padding-left: 40px !important;
    }

    .print-summary-row {
      border-top: 1px solid #000;
    }

    .print-summary-label {
      font-weight: bold;
    }

    .print-summary-value {
      font-weight: bold;
    }

    .print-total-row {
      background-color: #e5e7eb !important;
      border-top: 1px solid #000;
      border-bottom: 1px solid #000;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .print-bottom-section {
      display: flex;
      justify-content: space-between;
      margin-top: 15px;
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
      text-align: right;
      font-size: 12px;
      color: #6b7280;
      margin-top: 10px;
    }

  `;
};

/**
 * รอให้ Google Fonts โหลดเสร็จ
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
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return "0";
  return Math.floor(parseFloat(amount)).toLocaleString("th-TH");
}

/**
 * สร้าง PDF พร้อมกับจัดการ error
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
