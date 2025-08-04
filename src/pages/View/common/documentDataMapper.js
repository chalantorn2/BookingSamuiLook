// src/pages/View/common/documentDataMapper.js
import { ticketApi } from "../../../services/ticketApi";
import { generatePOForTicket } from "../../../services/ticketService";

/**
 * ดึงและแปลงข้อมูลสำหรับการพิมพ์เอกสาร Invoice
 * @param {number} ticketId - ID ของ ticket
 * @returns {Promise<Object>} - ข้อมูลที่แปลงแล้วสำหรับการพิมพ์
 */
export const getInvoiceData = async (ticketId) => {
  try {
    // ขั้นตอนที่ 1: สร้าง PO Number ก่อน
    const poResult = await generatePOForTicket(ticketId);
    if (!poResult.success) {
      throw new Error(poResult.error);
    }

    // ขั้นตอนที่ 2: ดึงข้อมูลทั้งหมดจาก API แทน Supabase
    const result = await ticketApi.getFlightTicket(ticketId);

    if (!result.success) {
      throw new Error(result.error || "ไม่สามารถดึงข้อมูลตั๋วได้");
    }

    const ticketData = result.data;
    const ticket = ticketData.ticket;

    // แปลงข้อมูลให้ตรงกับ format เดิม
    const transformedTicket = {
      ...ticket,
      tickets_detail: ticket.tickets_detail ? [ticket.tickets_detail] : [],
      ticket_additional_info: ticket.ticket_additional_info
        ? [ticket.ticket_additional_info]
        : [],
      tickets_pricing: ticket.tickets_pricing ? [ticket.tickets_pricing] : [],
      tickets_passengers: ticketData.passengers || [],
      tickets_routes: ticketData.routes || [],
      tickets_extras: ticketData.extras || [],
      user: ticket.user ? { fullname: ticket.user.fullname } : null,
    };

    const detail = transformedTicket.tickets_detail?.[0] || {};
    const additional = transformedTicket.ticket_additional_info?.[0] || {};
    const pricing = transformedTicket.tickets_pricing?.[0] || {};

    // แปลงข้อมูลลูกค้า - รองรับที่อยู่หลายบรรทัด
    const customerInfo = {
      name: transformedTicket.customer?.name || "",
      address: formatCustomerAddressForPrint(transformedTicket.customer),
      address_line1: transformedTicket.customer?.address_line1 || "",
      address_line2: transformedTicket.customer?.address_line2 || "",
      address_line3: transformedTicket.customer?.address_line3 || "",
      phone: transformedTicket.customer?.phone || "",
      email: transformedTicket.customer?.email,
      taxId: transformedTicket.customer?.id_number || "",
      branch: getBranchDisplay(
        transformedTicket.customer?.branch_type,
        transformedTicket.customer?.branch_number
      ),
    };

    // แปลงข้อมูลใบแจ้งหนี้
    const invoiceInfo = {
      poNumber: transformedTicket.po_number || poResult.poNumber,
      date: formatDate(detail.issue_date),
      dueDate: formatDate(detail.due_date),
      salesPerson: transformedTicket.user?.fullname || "System",
    };

    const MAX_PASSENGERS_DISPLAY = 6;
    const allPassengers = transformedTicket.tickets_passengers || [];
    const passengers = [];

    // แสดงผู้โดยสารแค่ 6 คนแรก
    const displayPassengers = allPassengers.slice(0, MAX_PASSENGERS_DISPLAY);

    // สร้าง 6 บรรทัดเสมอ
    for (let i = 0; i < MAX_PASSENGERS_DISPLAY; i++) {
      if (i < displayPassengers.length) {
        const p = displayPassengers[i];
        passengers.push({
          index: i + 1,
          name: p.passenger_name || "",
          age: p.age || "",
          ticketNumber: p.ticket_number || "",
          ticketCode: p.ticket_code || "",
          hasData: true,
          displayData: {
            index: `${i + 1}.`,
            name: p.passenger_name || "",
            age: p.age || "",
            ticketNumber: p.ticket_number || "",
            ticketCode: p.ticket_code || "",
          },
        });
      } else {
        // เติมบรรทัดว่าง (ไม่แสดงเลขลำดับ)
        passengers.push({
          index: i + 1,
          name: "",
          age: "",
          ticketNumber: "",
          ticketCode: "",
          hasData: false,
          displayData: null,
        });
      }
    }

    // แปลงข้อมูลเที่ยวบิน - ใช้ Multi-Segment Route Format
    const routes = transformedTicket.tickets_routes || [];
    const multiSegmentRoute = generateMultiSegmentRoute(routes);
    const supplierName = transformedTicket.supplier?.name || "";

    // สร้างข้อมูล flights สำหรับแสดงในตาราง
    const flights = {
      supplierName,
      multiSegmentRoute,
      routeDisplay: multiSegmentRoute || "N/A",
    };

    // แปลงข้อมูลราคาผู้โดยสาร (เฉพาะที่มี pax > 0)
    const passengerTypes = [];
    if (pricing.adult_pax > 0) {
      passengerTypes.push({
        type: "ADULT",
        quantity: pricing.adult_pax,
        unitPrice: pricing.adult_sale_price || 0,
        amount: pricing.adult_total || 0,
        priceDisplay: `${formatCurrencyNoDecimal(
          pricing.adult_sale_price || 0
        )} x ${pricing.adult_pax}`,
      });
    }
    if (pricing.child_pax > 0) {
      passengerTypes.push({
        type: "CHILD",
        quantity: pricing.child_pax,
        unitPrice: pricing.child_sale_price || 0,
        amount: pricing.child_total || 0,
        priceDisplay: `${formatCurrencyNoDecimal(
          pricing.child_sale_price || 0
        )} x ${pricing.child_pax}`,
      });
    }
    if (pricing.infant_pax > 0) {
      passengerTypes.push({
        type: "INFANT",
        quantity: pricing.infant_pax,
        unitPrice: pricing.infant_sale_price || 0,
        amount: pricing.infant_total || 0,
        priceDisplay: `${formatCurrencyNoDecimal(
          pricing.infant_sale_price || 0
        )} x ${pricing.infant_pax}`,
      });
    }

    // เพิ่มบรรทัดว่างให้ครบ 3 บรรทัด
    while (passengerTypes.length < 3) {
      passengerTypes.push({
        type: "",
        quantity: 0,
        unitPrice: 0,
        amount: 0,
        priceDisplay: "",
      });
    }

    // แปลงข้อมูลรายการเพิ่มเติม - แสดงครบทุกรายการ แต่ขั้นต่ำ 3 บรรทัด
    const MIN_EXTRAS_DISPLAY = 3;
    const allExtras = transformedTicket.tickets_extras || [];
    const extras = [];

    // คำนวณจำนวนบรรทัดที่ต้องแสดง (แสดงครบทุกรายการ หรือขั้นต่ำ 3 บรรทัด)
    const displayCount = Math.max(allExtras.length, MIN_EXTRAS_DISPLAY);

    // สร้างรายการแสดงผล
    for (let i = 0; i < displayCount; i++) {
      if (i < allExtras.length) {
        const extra = allExtras[i];
        extras.push({
          description: extra.description || "",
          quantity: extra.quantity || 1,
          unitPrice: extra.sale_price || 0,
          amount: extra.total_amount || 0,
          priceDisplay: extra.sale_price
            ? `${formatCurrencyNoDecimal(extra.sale_price)} x ${
                extra.quantity || 1
              }`
            : "",
        });
      } else {
        // เติมบรรทัดว่าง
        extras.push({
          description: "",
          quantity: 0,
          unitPrice: 0,
          amount: 0,
          priceDisplay: "",
        });
      }
    }

    // สรุปยอดเงิน
    const summary = {
      subtotal: detail.subtotal_before_vat || 0,
      vatPercent: detail.vat_percent || 0,
      vat: detail.vat_amount || 0,
      total: detail.grand_total || 0,
    };

    return {
      success: true,
      data: {
        customer: customerInfo,
        invoice: invoiceInfo,
        passengers,
        flights,
        passengerTypes,
        extras,
        summary,
        poResult, // ส่งผลลัพธ์การสร้าง PO กลับไปด้วย
      },
    };
  } catch (error) {
    console.error("Error getting invoice data:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * สร้าง Multi-Segment Route Format
 * @param {Array} routes - array ของเส้นทาง
 * @returns {string} - route ในรูปแบบ Multi-Segment
 */
export const generateMultiSegmentRoute = (routes) => {
  if (!routes || routes.length === 0) return "";

  const routeSegments = [];
  let currentSegment = [];

  routes.forEach((route, index) => {
    const origin = route.origin;
    const destination = route.destination;

    if (currentSegment.length === 0) {
      // เริ่มต้น segment ใหม่
      currentSegment = [origin, destination];
    } else {
      // ตรวจสอบว่าต่อเนื่องกับ segment ปัจจุบันหรือไม่
      const lastDestination = currentSegment[currentSegment.length - 1];

      if (origin === lastDestination) {
        // ต่อเนื่อง - เพิ่ม destination
        currentSegment.push(destination);
      } else {
        // ไม่ต่อเนื่อง - บันทึก segment เดิมและเริ่มใหม่
        routeSegments.push(currentSegment.join("-"));
        currentSegment = [origin, destination];
      }
    }

    // ถ้าเป็นเส้นทางสุดท้าย ให้บันทึก segment ปัจจุบัน
    if (index === routes.length - 1) {
      routeSegments.push(currentSegment.join("-"));
    }
  });

  // รวม segments ด้วย "//"
  return routeSegments.join("//");
};

/**
 * แปลงที่อยู่ลูกค้าสำหรับการพิมพ์ (หลายบรรทัด)
 * @param {Object} customer - ข้อมูลลูกค้า
 * @returns {string} - ที่อยู่ที่แปลงแล้ว (ขึ้นบรรทัดใหม่ด้วย \n)
 */
const formatCustomerAddressForPrint = (customer) => {
  if (!customer) return "";

  const addressLines = [
    customer.address_line1,
    customer.address_line2,
    customer.address_line3,
  ].filter((line) => line && line.trim() !== "");

  return addressLines.join("\n"); // ใช้ \n สำหรับขึ้นบรรทัดใหม่
};

/**
 * แปลงวันที่เป็นรูปแบบ DD/MM/YYYY
 */
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

/**
 * แปลงวันที่เที่ยวบินเป็นรูปแบบ ddMMM (เช่น 05APR)
 */
const formatRouteDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

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
  const month = monthNames[date.getMonth()];

  return `${day}${month}`;
};

/**
 * แปลงข้อมูลสาขาให้แสดงผลถูกต้อง
 */
const getBranchDisplay = (branchType, branchNumber) => {
  if (branchType === "Branch" && branchNumber) {
    return `${branchType} ${branchNumber}`;
  }
  return branchType || "Head Office";
};

/**
 * จัดรูปแบบตัวเลขไม่มีทศนิยม (สำหรับราคาต่อหน่วย)
 */
export const formatCurrencyNoDecimal = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return "0";
  return Math.floor(parseFloat(amount)).toLocaleString("th-TH");
};

/**
 * จัดรูปแบบตัวเลขมีทศนิยม 2 ตำแหน่ง (สำหรับยอดรวม)
 */
export const formatCurrencyWithDecimal = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return "0.00";
  return parseFloat(amount).toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * จัดรูปแบบตัวเลขไม่มีทศนิยม (backward compatibility)
 */
export const formatCurrency = (amount) => {
  return formatCurrencyNoDecimal(amount);
};

/**
 * แปลงตัวเลขเป็นตัวอักษรภาษาอังกฤษ
 */
export const numberToEnglishText = (amount) => {
  if (amount === 0) return "Zero";

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  const thousands = ["", "Thousand", "Million", "Billion"];

  function convertHundreds(num) {
    let result = "";

    if (num >= 100) {
      result += ones[Math.floor(num / 100)] + " Hundred ";
      num %= 100;
    }

    if (num >= 20) {
      result += tens[Math.floor(num / 10)] + " ";
      num %= 10;
    } else if (num >= 10) {
      result += teens[num - 10] + " ";
      return result.trim();
    }

    if (num > 0) {
      result += ones[num] + " ";
    }

    return result.trim();
  }

  let integerPart = Math.floor(amount); // เปลี่ยนจาก const เป็น let
  let result = "";
  let thousandIndex = 0;

  if (integerPart === 0) {
    return "Zero";
  }

  while (integerPart > 0) {
    const chunk = integerPart % 1000;
    if (chunk !== 0) {
      const chunkText = convertHundreds(chunk);
      result =
        chunkText +
        (thousands[thousandIndex] ? " " + thousands[thousandIndex] : "") +
        (result ? " " + result : "");
    }
    integerPart = Math.floor(integerPart / 1000); // ตอนนี้สามารถ assign ได้แล้ว
    thousandIndex++;
  }

  return result.trim();
};
