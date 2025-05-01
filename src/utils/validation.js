export const validateTicketForm = (formData) => {
  const errors = {};

  if (!formData.customer) {
    errors.customer = "กรุณาระบุชื่อลูกค้า";
  }

  if (!formData.supplier) {
    errors.supplier = "กรุณาระบุสายการบิน";
  }

  // ตรวจสอบผู้โดยสาร
  const hasValidPassengers =
    formData.passengers && formData.passengers.some((p) => p.name?.trim());
  if (!hasValidPassengers) {
    errors.passengers = "กรุณาระบุข้อมูลผู้โดยสารอย่างน้อย 1 คน";
  }

  // ตรวจสอบเส้นทาง
  const hasValidRoutes =
    formData.routes && formData.routes.some((r) => r.origin && r.destination);
  if (!hasValidRoutes) {
    errors.routes = "กรุณาระบุเส้นทางการเดินทางอย่างน้อย 1 เส้นทาง";
  }

  // ตรวจสอบราคา
  if (
    !formData.pricing ||
    (!formData.pricing.adult?.total &&
      !formData.pricing.child?.total &&
      !formData.pricing.infant?.total)
  ) {
    errors.pricing = "กรุณาระบุราคาอย่างน้อย 1 รายการ";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateCustomerForm = (customer) => {
  const errors = {};

  if (!customer.name) {
    errors.name = "กรุณาระบุชื่อลูกค้า";
  }

  if (!customer.phone && !customer.email) {
    errors.contact = "กรุณาระบุเบอร์โทรศัพท์หรืออีเมล";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
