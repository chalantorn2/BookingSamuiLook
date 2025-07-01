// src/utils/validation.js

/**
 * ตรวจสอบความถูกต้องของข้อมูลตั๋วเครื่องบิน
 * @param {Object} data - ข้อมูลตั๋วเครื่องบินที่ต้องการตรวจสอบ
 * @returns {Object} - ผลการตรวจสอบและข้อผิดพลาด
 */
export const validateFlightTicket = (data) => {
  const errors = {};

  // ตรวจสอบชื่อลูกค้า
  if (!data.customer?.trim()) {
    errors.customer = "กรุณาระบุชื่อลูกค้า";
  }

  // ตรวจสอบซัพพลายเออร์
  if (!data.supplier?.trim()) {
    errors.supplier = "กรุณาระบุซัพพลายเออร์";
  }

  // ตรวจสอบรายการผู้โดยสาร
  if (!data.passengers || data.passengers.length === 0) {
    errors.passengers = "กรุณาระบุข้อมูลผู้โดยสารอย่างน้อย 1 คน";
  } else {
    const passengerErrors = [];
    data.passengers.forEach((passenger, index) => {
      const error = {};
      if (!passenger.name?.trim()) {
        error.name = "กรุณาระบุชื่อผู้โดยสาร";
      }
      if (Object.keys(error).length > 0) {
        passengerErrors[index] = error;
      }
    });
    if (passengerErrors.length > 0) {
      errors.passengers = passengerErrors;
    }
  }

  // ตรวจสอบเส้นทางการเดินทาง
  if (!data.routes || data.routes.length === 0) {
    errors.routes = "กรุณาระบุเส้นทางการเดินทางอย่างน้อย 1 เส้นทาง";
  } else {
    const routeErrors = [];
    data.routes.forEach((route, index) => {
      const error = {};
      if (!route.origin?.trim()) {
        error.origin = "กรุณาระบุต้นทาง";
      }
      if (!route.destination?.trim()) {
        error.destination = "กรุณาระบุปลายทาง";
      }
      if (Object.keys(error).length > 0) {
        routeErrors[index] = error;
      }
    });
    if (routeErrors.length > 0) {
      errors.routes = routeErrors;
    }
  }

  // ตรวจสอบราคา
  if (!data.pricing) {
    errors.pricing = "กรุณาระบุข้อมูลราคา";
  } else {
    if (
      !data.pricing.adult?.pax &&
      !data.pricing.child?.pax &&
      !data.pricing.infant?.pax
    ) {
      errors.pricing = "กรุณาระบุจำนวนผู้โดยสารอย่างน้อย 1 คน";
    }

    // Adult
    if (data.pricing.adult?.pax > 0) {
      if (!data.pricing.adult?.sale) {
        errors.adultSale = "กรุณาระบุราคาขายสำหรับผู้ใหญ่";
      }
    }

    // Child
    if (data.pricing.child?.pax > 0) {
      if (!data.pricing.child?.sale) {
        errors.childSale = "กรุณาระบุราคาขายสำหรับเด็ก";
      }
    }

    // Infant
    if (data.pricing.infant?.pax > 0) {
      if (!data.pricing.infant?.sale) {
        errors.infantSale = "กรุณาระบุราคาขายสำหรับทารก";
      }
    }
  }

  // ตรวจสอบ ticket type
  if (!data.ticketType) {
    errors.ticketType = "กรุณาเลือกประเภทตั๋ว";
  }

  // ตรวจสอบข้อมูลเพิ่มเติมตามประเภทตั๋ว
  if (data.ticketType === "b2b" && !data.b2bDetails?.trim()) {
    errors.b2bDetails = "กรุณาระบุรายละเอียด B2B";
  }

  if (data.ticketType === "other" && !data.otherDetails?.trim()) {
    errors.otherDetails = "กรุณาระบุรายละเอียดประเภทตั๋ว";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * ฟังก์ชันช่วยในการตรวจสอบความถูกต้องของอีเมล
 * @param {string} email - อีเมลที่ต้องการตรวจสอบ
 * @returns {boolean} - ผลการตรวจสอบ
 */
export const isValidEmail = (email) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

/**
 * ฟังก์ชันช่วยในการตรวจสอบความถูกต้องของเบอร์โทรศัพท์
 * @param {string} phone - เบอร์โทรศัพท์ที่ต้องการตรวจสอบ
 * @returns {boolean} - ผลการตรวจสอบ
 */
export const isValidPhone = (phone) => {
  const re = /^[0-9]{9,10}$/;
  return re.test(String(phone).replace(/[^0-9]/g, ""));
};

/**
 * ตรวจสอบการกรอกข้อมูลจำเป็นในฟอร์ม
 * @param {Object} data - ข้อมูลฟอร์ม
 * @param {Array} requiredFields - รายการฟิลด์ที่จำเป็น
 * @returns {Object} - ผลการตรวจสอบและข้อผิดพลาด
 */
export const validateRequired = (data, requiredFields) => {
  const errors = {};

  requiredFields.forEach((field) => {
    if (!data[field]?.toString().trim()) {
      errors[field] = `กรุณากรอกข้อมูล ${field}`;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
