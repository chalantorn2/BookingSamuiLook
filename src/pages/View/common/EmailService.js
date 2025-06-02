import SibApiV3Sdk from "sib-api-v3-sdk";

// Brevo Configuration
const BREVO_CONFIG = {
  API_KEY: import.meta.env.VITE_SENDINBLUE_API_KEY,
  FROM_EMAIL: "chalantorn2@gmail.com",
  DEFAULT_TO_EMAIL: "chalantorn.work@gmail.com",
};

/**
 * Initialize Brevo
 */
export function initializeBrevo() {
  if (!BREVO_CONFIG.API_KEY) {
    throw new Error(
      "Sendinblue API Key is not defined in environment variables"
    );
  }
  SibApiV3Sdk.ApiClient.instance.authentications["api-key"].apiKey =
    BREVO_CONFIG.API_KEY;
}

/**
 * ตรวจสอบความถูกต้องของที่อยู่อีเมล
 * @param {string} email - ที่อยู่อีเมล
 * @returns {boolean} - ผลลัพธ์การตรวจสอบ
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * ส่งอีเมล Invoice
 * @param {Object} emailData - ข้อมูลที่จะส่ง
 * @param {string} emailData.to - อีเมลผู้รับ
 * @param {string} emailData.subject - หัวข้ออีเมล
 * @param {string} emailData.message - ข้อความ
 * @param {string} emailData.pdfBase64 - PDF file ในรูปแบบ base64
 * @param {Object} emailData.invoiceData - ข้อมูล Invoice
 * @returns {Promise<Object>} ผลลัพธ์การส่งอีเมล
 */
export async function sendInvoiceEmail(emailData) {
  try {
    console.log("Sending email with data:", emailData);

    // ตรวจสอบที่อยู่อีเมล
    const toEmail = emailData.to?.trim();
    if (!toEmail) {
      throw new Error("ที่อยู่อีเมลผู้รับว่างเปล่า");
    }
    if (!isValidEmail(toEmail)) {
      throw new Error("รูปแบบที่อยู่อีเมลไม่ถูกต้อง");
    }

    // สร้าง instance ของ Brevo Transactional Emails API
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    // เตรียมข้อมูลอีเมล
    const sendSmtpEmail = {
      sender: { email: BREVO_CONFIG.FROM_EMAIL },
      to: [{ email: toEmail }],
      subject: emailData.subject || " Invoice จาก SamuiLookBooking",
      textContent: emailData.message || "",
      params: {
        po_number: emailData.invoiceData?.invoice?.poNumber || "",
        customer_name: emailData.invoiceData?.customer?.name || "",
        invoice_date: emailData.invoiceData?.invoice?.date || "",
        due_date: emailData.invoiceData?.invoice?.dueDate || "",
        total_amount: formatCurrency(
          emailData.invoiceData?.summary?.total || 0
        ),
        passengers:
          emailData.invoiceData?.passengers?.map((p) => p.display).join("\n") ||
          "",
        flights:
          emailData.invoiceData?.flights?.map((f) => f.display).join("\n") ||
          "",
        sent_time: new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      },
    };

    // เพิ่มไฟล์แนบ PDF ถ้ามี
    if (emailData.pdfBase64) {
      sendSmtpEmail.attachment = [
        {
          content: emailData.pdfBase64,
          name: `Invoice_${
            emailData.invoiceData?.invoice?.poNumber || "Unknown"
          }.pdf`,
        },
      ];

      // ตรวจสอบขนาดไฟล์ (Brevo จำกัดที่ 10MB)
      const fileSizeInMB = (emailData.pdfBase64.length * 0.75) / 1024 / 1024;
      console.log(`PDF size: ${fileSizeInMB.toFixed(2)} MB`);
      if (fileSizeInMB > 10) {
        throw new Error(
          `ไฟล์ PDF ใหญ่เกิน 10MB (${fileSizeInMB.toFixed(2)} MB)`
        );
      }
    }

    console.log("Brevo email params:", sendSmtpEmail);

    // ส่งอีเมล
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log("Email sent successfully:", result);

    return {
      success: true,
      message: `ส่งอีเมลสำเร็จถึง ${toEmail} เมื่อ ${sendSmtpEmail.params.sent_time}`,
      result: result,
    };
  } catch (error) {
    console.error("Email sending failed:", error);

    let errorMessage = "ส่งอีเมลไม่สำเร็จ";
    if (error.message.includes("ว่างเปล่า")) {
      errorMessage = "กรุณาระบุที่อยู่อีเมลผู้รับ";
    } else if (error.message.includes("รูปแบบ")) {
      errorMessage = "รูปแบบที่อยู่อีเมลไม่ถูกต้อง";
    } else if (error.message.includes("PDF")) {
      errorMessage = error.message;
    } else if (error.response?.text) {
      errorMessage = `เกิดข้อผิดพลาด: ${error.response.text}`;
    }

    return {
      success: false,
      message: errorMessage,
      error: error,
    };
  }
}

/**
 * จัดรูปแบบตัวเลขเป็นสกุลเงิน
 * @param {number} amount - จำนวนเงิน
 * @returns {string} - จำนวนเงินที่จัดรูปแบบแล้ว
 */
function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return "0";
  return Math.floor(parseFloat(amount)).toLocaleString("th-TH");
}

/**
 * สร้างเนื้อหาอีเมลเริ่มต้น
 * @param {Object} invoiceData - ข้อมูล Invoice
 * @returns {string} - เนื้อหาอีเมล
 */
export function generateDefaultEmailContent(invoiceData) {
  if (!invoiceData) return "";

  return `เรียน คุณ${invoiceData.customer?.name || "ลูกค้า"}

บริษัท สมุย ลุค จำกัด ขอส่ง Invoice ดังรายละเอียดต่อไปนี้:

เลขที่ Invoice : ${invoiceData.invoice?.poNumber || ""}
วันที่: ${invoiceData.invoice?.date || ""}
วันครบกำหนด: ${invoiceData.invoice?.dueDate || ""}

รายการผู้โดยสาร:
${invoiceData.passengers?.map((p) => `- ${p.display}`).join("\n") || ""}

เส้นทางการเดินทาง:
${invoiceData.flights?.map((f) => `- ${f.display}`).join("\n") || ""}

จำนวนเงินรวมทั้งสิ้น: ${formatCurrency(invoiceData.summary?.total || 0)} บาท

กรุณาชำระเงินภายในกำหนดเวลา หากมีข้อสงสัยกรุณาติดต่อกลับ

ขอบคุณที่ใช้บริการ
บริษัท สมุย ลุค จำกัด
โทร 077-950550
อีเมล samuilook@yahoo.com`;
}

/**
 * สร้างหัวข้ออีเมลเริ่มต้น
 * @param {Object} invoiceData - ข้อมูล Invoice
 * @returns {string} - หัวข้ออีเมล
 */
export function generateDefaultEmailSubject(invoiceData) {
  const poNumber = invoiceData?.invoice?.poNumber || "";
  const customerName = invoiceData?.customer?.name || "ลูกค้า";

  return `Invoice ${poNumber} - ${customerName} - SamuiLookBooking`;
}
