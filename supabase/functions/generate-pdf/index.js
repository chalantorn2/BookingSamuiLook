import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { ticketId } = await req.json();

    if (!ticketId) {
      throw new Error("ticketId is required");
    }

    console.log(`Generating PDF for ticket: ${ticketId}`);

    // 1. Get ticket data
    const invoiceData = await getTicketData(ticketId);

    if (!invoiceData.success) {
      throw new Error(invoiceData.error);
    }

    // 2. Generate HTML
    const html = createInvoiceHTML(invoiceData.data);

    // 3. Create PDF with Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-web-security",
      ],
    });

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: {
        top: "8mm",
        right: "8mm",
        bottom: "8mm",
        left: "8mm",
      },
      printBackground: true,
    });

    await browser.close();

    // 4. Return PDF as base64
    const pdfBase64 = btoa(String.fromCharCode(...pdfBuffer));

    return new Response(
      JSON.stringify({
        success: true,
        pdf: pdfBase64,
        poNumber: invoiceData.data.invoice.poNumber,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);

    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// ================== Helper Functions ==================

async function getTicketData(ticketId) {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: ticket, error } = await supabase
      .from("bookings_ticket")
      .select(
        `
        id, reference_number, po_number, created_at,
        customer:customer_id(name, address_line1, address_line2, address_line3, phone, id_number, branch_type, branch_number),
        supplier:information_id(name, code),
        tickets_detail(issue_date, due_date, subtotal_before_vat, vat_percent, vat_amount, grand_total),
        tickets_pricing(adult_sale_price, adult_pax, adult_total, child_sale_price, child_pax, child_total, infant_sale_price, infant_pax, infant_total),
        tickets_passengers(passenger_name, age, ticket_number, ticket_code),
        tickets_routes(flight_number, date, origin, destination),
        tickets_extras(description, sale_price, quantity, total_amount),
        created_by_user:created_by(fullname)
      `
      )
      .eq("id", ticketId)
      .single();

    if (error) throw error;

    // Process data
    const detail = ticket.tickets_detail?.[0] || {};
    const pricing = ticket.tickets_pricing?.[0] || {};

    // Customer info
    const addressParts = [
      ticket.customer?.address_line1,
      ticket.customer?.address_line2,
      ticket.customer?.address_line3,
    ].filter((part) => part?.trim());
    const fullAddress = addressParts.join(" ");

    const getBranchDisplay = (branchType, branchNumber) => {
      if (branchType === "Branch" && branchNumber) {
        return `${branchType} ${branchNumber}`;
      }
      return branchType || "Head Office";
    };

    const formatDate = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString("th-TH");
    };

    const formatRouteDate = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, "0");
      const monthNames = [
        "JAN",
        "FEB",
        "MAR",
        "APR",
        "MAY",
        "JUN",
        "JUL",
        "AUG",
        "SEP",
        "OCT",
        "NOV",
        "DEC",
      ];
      return `${day}${monthNames[date.getMonth()]}`;
    };

    // Process data
    const passengers =
      ticket.tickets_passengers?.map((p, index) => ({
        display: `${index + 1}. ${p.passenger_name || ""} ${p.age || ""} ${
          p.ticket_number || ""
        } ${p.ticket_code || ""}`
          .trim()
          .replace(/\s+/g, " "),
      })) || [];

    const flights =
      ticket.tickets_routes?.map((route) => ({
        display: `${route.flight_number || ""} ${formatRouteDate(route.date)} ${
          route.origin || ""
        }${route.destination || ""}`
          .trim()
          .replace(/\s+/g, " "),
      })) || [];

    const passengerTypes = [];
    if (pricing.adult_pax > 0) {
      passengerTypes.push({
        type: "Adult",
        quantity: pricing.adult_pax,
        unitPrice: pricing.adult_sale_price || 0,
        amount: pricing.adult_total || 0,
      });
    }
    if (pricing.child_pax > 0) {
      passengerTypes.push({
        type: "Child",
        quantity: pricing.child_pax,
        unitPrice: pricing.child_sale_price || 0,
        amount: pricing.child_total || 0,
      });
    }
    if (pricing.infant_pax > 0) {
      passengerTypes.push({
        type: "Infant",
        quantity: pricing.infant_pax,
        unitPrice: pricing.infant_sale_price || 0,
        amount: pricing.infant_total || 0,
      });
    }

    const extras =
      ticket.tickets_extras?.map((extra) => ({
        description: extra.description || "",
        quantity: extra.quantity || 1,
        unitPrice: extra.sale_price || 0,
        amount: extra.total_amount || 0,
      })) || [];

    return {
      success: true,
      data: {
        customer: {
          name: ticket.customer?.name || "",
          address: fullAddress,
          phone: ticket.customer?.phone || "",
          taxId: ticket.customer?.id_number || "",
          branch: getBranchDisplay(
            ticket.customer?.branch_type,
            ticket.customer?.branch_number
          ),
        },
        invoice: {
          poNumber: ticket.po_number || "",
          date: formatDate(detail.issue_date),
          dueDate: formatDate(detail.due_date),
          salesPerson: ticket.created_by_user?.fullname || "System",
        },
        passengers,
        flights,
        passengerTypes,
        extras,
        summary: {
          subtotal: detail.subtotal_before_vat || 0,
          vatPercent: detail.vat_percent || 0,
          vat: detail.vat_amount || 0,
          total: detail.grand_total || 0,
        },
      },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function createInvoiceHTML(data) {
  const formatCurrency = (amount) => {
    if (!amount) return "0";
    return Math.floor(amount).toLocaleString("th-TH");
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { font-family: 'Prompt', sans-serif !important; }
    body { margin: 0; padding: 4mm; background: white; font-size: 12px; color: #000; line-height: 1.4; }
    
    .print-header { 
      display: flex; justify-content: space-between; align-items: stretch; 
      margin-bottom: 24px; min-height: 100px; 
    }
    .print-company-info { 
      display: flex; align-items: flex-start; border-bottom: 4px solid #881f7e; 
      padding-bottom: 8px; width: calc(100% - 256px); flex: 1; min-height: 100px; box-sizing: border-box; 
    }
    .print-company-logo { width: 110px; height: auto; margin-right: 16px; }
    .company-title { font-size: 18px; font-weight: bold; margin-bottom: 4px; }
    .company-text { font-size: 12px; margin: 2px 0; }
    .print-document-title { 
      width: 256px; background-color: #f4bb19; padding: 10px; text-align: center; 
      border-bottom: 4px solid #fbe73a; min-height: 100px; box-sizing: border-box; 
      display: flex; flex-direction: column; justify-content: center; 
    }
    .document-title-text { font-size: 20px; font-weight: bold; color: white; margin: 0; }
    
    .print-info-section { 
      margin: 20px auto; border: 1px solid #d1d5db; border-radius: 6px; padding: 12px; 
      display: grid; grid-template-columns: 1fr 1fr; gap: 4px; 
    }
    .print-info-row { display: grid; grid-template-columns: 120px 1fr; margin-bottom: 6px; font-size: 12px; }
    .print-info-label { font-weight: bold; }
    .print-info-value { word-break: break-word; }
    
    .print-items-table { margin: 5px 0; width: 100%; }
    .print-items-table table { 
      width: 100%; border-collapse: collapse; border-top: 4px solid #000; border-bottom: 4px solid #000; 
      margin: 5px 0; 
    }
    .print-items-table th { 
      background-color: #e5e7eb; border-top: 2px solid #000; border-bottom: 2px solid #000; 
      font-weight: bold; text-align: center; padding: 5px; font-size: 12px; 
    }
    .print-items-table th:not(:first-child) { border-left: 1px solid #000; }
    .print-items-table td { padding: 2px; font-size: 12px; }
    .print-items-table td:not(:first-child) { border-left: 1px solid #000; }
    .col-quantity, .col-price, .col-total { text-align: center; }
    .col-price, .col-total { text-align: right; }
    
    .print-section-header { font-weight: bold; padding: 2px; font-size: 12px; }
    .print-section-item { font-size: 12px; padding: 3px 3px 3px 40px; }
    .print-summary-section { border-top: 2px solid #000; }
    .print-summary-section td { font-weight: bold; }
    .print-summary-total { 
      background-color: #e5e7eb; border-top: 3px solid #000; border-bottom: 3px solid #000; 
    }
    .print-summary-total td { font-weight: bold; }
    
    .print-signatures { 
      margin-top: 24px; display: flex; justify-content: space-between; gap: 24px; 
    }
    .print-signature { text-align: center; font-size: 11px; }
    .print-signature-area { 
      border-bottom: 1px solid #6b7280; padding-bottom: 12px; margin-bottom: 6px; height: 50px; 
      display: flex; align-items: center; justify-content: center; 
    }
    .print-footer { 
      margin-top: 24px; padding-top: 12px; text-align: right; font-size: 12px; 
    }
  </style>
</head>
<body>
  <div class="print-document">
    <!-- Header -->
    <div class="print-header">
      <div class="print-company-info">
        <img src="data:image/png;base64,${getLogoBase64()}" alt="Company Logo" class="print-company-logo" />
        <div>
          <div class="company-title">บริษัท สมุย ลุค จำกัด</div>
          <div class="company-text">63/27 ม.3 ต.บ่อผุด อ.เกาะสมุย จ.สุราษฎร์ธานี 84320</div>
          <div class="company-text">โทร 077-950550 email :samuilook@yahoo.com</div>
          <div class="company-text">เลขประจำตัวผู้เสียภาษี 0845545002700</div>
        </div>
      </div>
      <div class="print-document-title">
        <p class="document-title-text">ใบแจ้งหนี้</p>
        <p class="document-title-text">Invoice</p>
      </div>
    </div>

    <!-- Customer & Invoice Info -->
    <div class="print-info-section">
      <div>
        <div class="print-info-row">
          <span class="print-info-label">ลูกค้า:</span>
          <span class="print-info-value">${data.customer.name}</span>
        </div>
        <div class="print-info-row">
          <span class="print-info-label">ที่อยู่:</span>
          <span class="print-info-value">${data.customer.address}</span>
        </div>
        <div class="print-info-row">
          <span class="print-info-label">เบอร์โทร:</span>
          <span class="print-info-value">${data.customer.phone}</span>
        </div>
        <div class="print-info-row">
          <span class="print-info-label">เลขประจำตัวผู้เสียภาษี:</span>
          <span class="print-info-value">${
            data.customer.taxId
          } &nbsp; <b>สาขา:</b> ${data.customer.branch}</span>
        </div>
      </div>
      <div>
        <div class="print-info-row">
          <span class="print-info-label">เลขที่:</span>
          <span class="print-info-value">${data.invoice.poNumber}</span>
        </div>
        <div class="print-info-row">
          <span class="print-info-label">วันที่:</span>
          <span class="print-info-value">${data.invoice.date}</span>
        </div>
        <div class="print-info-row">
          <span class="print-info-label">วันที่ครบกำหนด:</span>
          <span class="print-info-value">${data.invoice.dueDate}</span>
        </div>
        <div class="print-info-row">
          <span class="print-info-label">Sale /Staff:</span>
          <span class="print-info-value">${data.invoice.salesPerson}</span>
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <div class="print-items-table">
      <table>
        <thead>
          <tr>
            <th style="width: 50%;">รายละเอียด</th>
            <th style="width: 10%;">จำนวน</th>
            <th style="width: 20%;">ราคาต่อหน่วย</th>
            <th style="width: 20%;">รวมเป็นเงิน</th>
          </tr>
        </thead>
        <tbody>
          <!-- NAME Section -->
          <tr>
            <td colspan="4" class="print-section-header">NAME /ชื่อผู้โดยสาร</td>
          </tr>
          ${data.passengers
            .map(
              (passenger) => `
            <tr>
              <td class="print-section-item">${passenger.display}</td>
              <td class="col-quantity"></td>
              <td class="col-price"></td>
              <td class="col-total"></td>
            </tr>
          `
            )
            .join("")}

          <!-- AIR TICKET Section -->
          <tr>
            <td colspan="4" class="print-section-header">AIR TICKET /ตั๋วเครื่องบิน</td>
          </tr>
          ${data.flights
            .map(
              (flight) => `
            <tr>
              <td class="print-section-item">${flight.display}</td>
              <td class="col-quantity"></td>
              <td class="col-price"></td>
              <td class="col-total"></td>
            </tr>
          `
            )
            .join("")}
          ${data.passengerTypes
            .map(
              (type) => `
            <tr>
              <td class="print-section-item">${type.type}</td>
              <td class="col-quantity">${type.quantity}</td>
              <td class="col-price">${formatCurrency(type.unitPrice)}.-</td>
              <td class="col-total">${formatCurrency(type.amount)}.-</td>
            </tr>
          `
            )
            .join("")}

          ${
            data.extras.length > 0
              ? `
            <!-- Other Section -->
            <tr>
              <td colspan="4" class="print-section-header">Other</td>
            </tr>
            ${data.extras
              .map(
                (extra) => `
              <tr>
                <td class="print-section-item">${extra.description}</td>
                <td class="col-quantity">${extra.quantity}</td>
                <td class="col-price">${formatCurrency(extra.unitPrice)}.-</td>
                <td class="col-total">${formatCurrency(extra.amount)}.-</td>
              </tr>
            `
              )
              .join("")}
          `
              : ""
          }

          <!-- Summary -->
          <tr class="print-summary-section">
            <td colspan="2" class="print-section-header">Remark</td>
            <td class="col-price">ราคารวมสินค้า (บาท)</td>
            <td class="col-total">${formatCurrency(
              data.summary.subtotal
            )}.-</td>
          </tr>
          <tr class="print-summary-section">
            <td colspan="2"></td>
            <td class="col-price">ภาษีมูลค่าเพิ่ม ${
              data.summary.vatPercent
            }%</td>
            <td class="col-total">${formatCurrency(data.summary.vat)}.-</td>
          </tr>
          <tr class="print-summary-total">
            <td colspan="2"></td>
            <td class="col-price">จำนวนเงินรวมทั้งสิ้น (บาท)</td>
            <td class="col-total">${formatCurrency(data.summary.total)}.-</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Payment & Signatures -->
    <div class="print-signatures">
      <div>
        <div style="font-weight: bold; font-size: 13px; margin-bottom: 6px;">ข้อมูลการชำระเงิน</div>
        <div style="font-size: 12px; margin-bottom: 3px;">- ชื่อบัญชี คิมเบอร์ลี่ เหงียน</div>
        <div style="font-size: 12px; margin-bottom: 3px;">- ธนาคาร Larana เลขที่บัญชี 0123456789</div>
        <div style="font-size: 12px; margin-bottom: 3px; margin-top: 3px;">- ชื่อบัญชี คิมเบอร์ลี่ เหงียน</div>
        <div style="font-size: 12px;">- ธนาคาร Borcelle เลขที่บัญชี 0123456789</div>
      </div>
      <div style="display: flex; gap: 24px;">
        <div class="print-signature">
          <div style="font-size: 12px; font-weight: bold; margin-bottom: 6px;">อนุมัติโดย</div>
          <div class="print-signature-area">
            <img src="data:image/png;base64,${getLogoBase64()}" alt="Approved" style="width: 40px; height: auto; opacity: 0.7;" />
          </div>
          <div style="font-size: 12px;">วันที่: ${new Date().toLocaleDateString(
            "th-TH"
          )}</div>
        </div>
        <div class="print-signature">
          <div style="font-size: 12px; font-weight: bold; margin-bottom: 6px;">ผู้ว่าจ้าง</div>
          <div class="print-signature-area"></div>
          <div style="font-size: 12px;">วันที่: ${new Date().toLocaleDateString(
            "th-TH"
          )}</div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="print-footer">หน้า 1/1</div>
  </div>
</body>
</html>
  `;
}

function getLogoBase64() {
  // TODO: แปลง src/assets/logo-print.png เป็น base64
  // ใช้คำสั่ง: base64 -i src/assets/logo-print.png
  // หรือ: https://base64.guru/converter/encode/image
  return "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
}
