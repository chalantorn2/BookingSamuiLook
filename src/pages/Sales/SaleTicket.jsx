import React, { useState, useEffect } from "react";
import { FiSave } from "react-icons/fi";
import SaleHeader from "./common/SaleHeader";
import PaymentMethodSection from "./common/PaymentMethodSection";
import PassengerSection from "./ticket/PassengerSection";
import SupplierSection from "./ticket/SupplierSection";
import RouteSection from "./ticket/RouteSection";
import TicketTypeSection from "./ticket/TicketTypeSection";
import ExtrasSection from "./ticket/ExtrasSection";
import PricingSummarySection from "./ticket/PricingSummarySection";
import usePricing from "../../hooks/usePricing";
import SaleStyles, { combineClasses } from "./common/SaleStyles";

import { createFlightTicket } from "../../services/ticketService";
import { getSuppliers } from "../../services/supplierService";
import { getCustomers, createCustomer } from "../../services/customerService";
import { validateFlightTicket } from "../../utils/validation";
import { supabase } from "../../services/supabase";

const SaleTicket = () => {
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [formData, setFormData] = useState({
    customer: "",
    contactDetails: "",
    phone: "",
    id: "",
    date: new Date().toISOString().split("T")[0],
    creditDays: "0",
    dueDate: "",
    salesName: "",
    supplier: "",
    supplierName: "",
    ticketType: "bsp",
    paymentMethod: "",
    companyPaymentDetails: "",
    customerPayment: "",
    customerPaymentDetails: "",
  });

  useEffect(() => {
    const loadInitialData = async () => {
      const airlinesData = await getSuppliers("airline");
      setSuppliers(airlinesData);

      const customersData = await getCustomers();
      setCustomers(customersData);
    };

    loadInitialData();
  }, []);

  const {
    pricing,
    vatPercent,
    setVatPercent,
    updatePricing,
    calculateSubtotal,
    calculateVat,
    calculateTotal,
  } = usePricing();

  const [passengers, setPassengers] = useState([
    { id: 1, name: "", age: "", ticketNo: "" },
  ]);

  const [routes, setRoutes] = useState([
    {
      id: 1,
      date: "",
      airline: "",
      flight: "",
      origin: "",
      destination: "",
      departure: "",
      arrival: "",
    },
  ]);

  const [extras, setExtras] = useState([
    { id: 1, description: "", net: "", sale: "", pax: 1, total: "" },
  ]);

  // แก้ไขเฉพาะในฟังก์ชัน handleSubmit ของ SaleTicket.jsx
  // ส่วนที่ต้องแก้ไขในฟังก์ชัน handleSubmit ของ SaleTicket.jsx

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setValidationErrors({});

    console.log("Form submitted", { formData, passengers, routes, pricing });

    const { isValid, errors } = validateFlightTicket({
      customer: formData.customer,
      supplier: formData.supplier,
      passengers,
      routes,
      pricing,
      ticketType: formData.ticketType,
      b2bDetails: formData.b2bDetails,
      otherDetails: formData.otherDetails,
      paymentMethod: formData.paymentMethod,
      customerPayment: formData.customerPayment,
    });

    if (!isValid) {
      console.log("Validation failed", errors);
      setValidationErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const userData = await supabase.auth.getUser();
      const userId = userData.data?.user?.id;

      // ตรวจสอบว่ามีลูกค้าที่เลือกหรือไม่
      let customerId = selectedCustomer?.id;

      // ถ้าไม่มี customerId แต่มีชื่อลูกค้า ให้สร้างลูกค้าใหม่
      if (!customerId && formData.customer) {
        console.log("Creating new customer from form submission");
        const newCustomerResult = await createCustomer({
          name: formData.customer,
          address: formData.contactDetails || "",
          id_number: formData.id || "",
          phone: formData.phone || "",
        });

        if (newCustomerResult.success) {
          customerId = newCustomerResult.customerId;
          console.log("New customer created with ID:", customerId);
        } else {
          console.error("Failed to create customer:", newCustomerResult.error);
          alert(`ไม่สามารถสร้างลูกค้าใหม่ได้: ${newCustomerResult.error}`);
          setLoading(false);
          return;
        }
      }

      console.log("Form Payment Details:", {
        companyMethod: formData.paymentMethod,
        companyDetails: formData.company_payment_details,
        customerMethod: formData.customerPayment,
        customerDetails: formData.customer_payment_details,
      });

      const subtotalAmount = calculateSubtotal();
      const vatAmount = calculateVat();
      const totalAmount = calculateTotal();

      // จัดรูปแบบข้อมูลเพื่อส่งไปยัง API ตามโครงสร้างฐานข้อมูลใหม่
      const ticketData = {
        // ข้อมูลหลัก
        customerId: customerId, // ใช้ customerId ที่ได้จากการสร้างลูกค้าใหม่หรือที่มีอยู่แล้ว
        supplierId: formData.supplierId || null,
        code: formData.code || "",
        bookingDate: formData.date,
        status: "pending",
        paymentStatus: "unpaid",
        creditDays: formData.creditDays,
        dueDate: formData.dueDate,
        salesName: formData.salesName,

        // ข้อมูล ticket_type ใน ticket_additional_info
        ticketType: formData.ticketType,
        ticketTypeDetails:
          formData.ticketType === "b2b"
            ? formData.b2bDetails
            : formData.ticketType === "other"
            ? formData.otherDetails
            : null,

        // ข้อมูลการชำระเงินใน ticket_additional_info
        companyPaymentMethod: formData.paymentMethod,
        companyPaymentDetails: formData.company_payment_details || "",
        customerPaymentMethod: formData.customerPayment,
        customerPaymentDetails: formData.customer_payment_details || "",

        // ข้อมูลราคา
        subtotalAmount,
        vatPercent,
        vatAmount,
        totalAmount,
        pricing,

        // ข้อมูลอื่นๆ
        passengers: passengers.filter((p) => p.name.trim()),
        routes: routes.filter((r) => r.origin || r.destination),
        extras: extras.filter((e) => e.description),

        // ข้อมูลผู้สร้าง
        createdBy: userId,
        remarks: formData.remarks || "",
      };

      console.log("Sending data to createFlightTicket:", ticketData);
      const result = await createFlightTicket(ticketData);

      if (result.success) {
        alert(`บันทึกข้อมูลสำเร็จ เลขที่อ้างอิง: ${result.referenceNumber}`);
        resetForm();
      } else {
        alert(`เกิดข้อผิดพลาด: ${result.error}`);
      }
    } catch (error) {
      console.error("Error saving ticket:", error);
      alert(`เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchSuppliers = async () => {
      const data = await getSuppliers("airline");
      setSuppliers(data);
    };

    fetchSuppliers();
  }, []);

  // สร้างฟังก์ชันสำหรับรีเซ็ตฟอร์ม
  const resetForm = () => {
    setFormData({
      customer: "",
      contactDetails: "",
      phone: "",
      id: "",
      date: new Date().toISOString().split("T")[0],
      creditDays: "0",
      dueDate: "",
      salesName: "",
      supplier: "",
      supplierName: "",
      ticketType: "bsp",
      paymentMethod: "",
      companyPaymentDetails: "",
      customerPayment: "",
      customerPaymentDetails: "",
    });

    updatePricing("adult", "net", "", 0);
    updatePricing("adult", "sale", "", 0);
    updatePricing("adult", "pax", 0, 0);
    updatePricing("child", "net", "", 0);
    updatePricing("child", "sale", "", 0);
    updatePricing("child", "pax", 0, 0);
    updatePricing("infant", "net", "", 0);
    updatePricing("infant", "sale", "", 0);
    updatePricing("infant", "pax", 0, 0);

    setPassengers([{ id: 1, name: "", age: "", ticketNo: "" }]);
    setRoutes([
      {
        id: 1,
        date: "",
        airline: "",
        flight: "",
        origin: "",
        destination: "",
        departure: "",
        arrival: "",
      },
    ]);
    setExtras([
      { id: 1, description: "", net: "", sale: "", pax: 1, total: "" },
    ]);
    setSelectedCustomer(null);
    setValidationErrors({});
  };

  const calculatedSubtotal =
    calculateSubtotal() +
    extras.reduce((sum, item) => sum + parseFloat(item.total_amount || 0), 0);
  const calculatedVatAmount = (calculatedSubtotal * vatPercent) / 100;
  const calculatedTotal = calculatedSubtotal + calculatedVatAmount;

  return (
    <div className={SaleStyles.mainContainer}>
      <form onSubmit={handleSubmit} className={SaleStyles.contentWrapper}>
        <div className={SaleStyles.mainCard}>
          <div className={SaleStyles.header.container}>
            <h1 className={SaleStyles.header.title}>
              Sale Ticket / ขายตั๋วเครื่องบิน
            </h1>
            <div className={SaleStyles.header.buttonContainer}>
              <button
                type="submit"
                className={SaleStyles.button.primary}
                disabled={loading}
              >
                {loading ? (
                  <span>กำลังบันทึก...</span>
                ) : (
                  <>
                    <FiSave className={SaleStyles.button.icon} /> บันทึก
                  </>
                )}
              </button>
            </div>
          </div>

          <div className={SaleStyles.mainContent}>
            <div className={SaleStyles.grid.twoColumns}>
              <div>
                <h2
                  className={combineClasses(
                    "text-lg font-semibold border-b pb-2",
                    SaleStyles.spacing.mb4
                  )}
                >
                  ข้อมูลลูกค้า
                </h2>
                <SaleHeader
                  formData={formData}
                  setFormData={setFormData}
                  section="customer"
                  selectedCustomer={selectedCustomer}
                  setSelectedCustomer={setSelectedCustomer}
                />
              </div>
              <div>
                <h2
                  className={combineClasses(
                    "text-lg font-semibold border-b pb-2",
                    SaleStyles.spacing.mb4
                  )}
                >
                  ราคาและวันที่
                </h2>
                <SaleHeader
                  formData={formData}
                  setFormData={setFormData}
                  section="price"
                  totalAmount={calculatedTotal}
                  vatPercent={vatPercent}
                  subtotalAmount={calculatedSubtotal}
                  vatAmount={calculatedVatAmount}
                />
              </div>
            </div>

            <div className={SaleStyles.section.container}>
              <div className={SaleStyles.section.headerWrapper}>
                <h2 className={SaleStyles.section.headerTitle}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  ข้อมูลผู้โดยสารและซัพพลายเออร์
                </h2>
              </div>
              <div className={SaleStyles.grid.fifteenColumns}>
                <PassengerSection
                  passengers={passengers}
                  setPassengers={setPassengers}
                />
                <SupplierSection
                  formData={formData}
                  setFormData={setFormData}
                />
              </div>
            </div>

            <div className={SaleStyles.section.container}>
              <div className={SaleStyles.section.headerWrapper}>
                <h2 className={SaleStyles.section.headerTitle}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                  </svg>
                  ประเภทตั๋วและเส้นทางการเดินทาง
                </h2>
              </div>
              <div className="grid grid-cols-10 gap-2">
                <RouteSection routes={routes} setRoutes={setRoutes} />
                <TicketTypeSection
                  formData={formData}
                  setFormData={setFormData}
                />
              </div>
            </div>

            <ExtrasSection extras={extras} setExtras={setExtras} />
            <PricingSummarySection
              pricing={pricing}
              updatePricing={updatePricing}
              vatPercent={vatPercent}
              extras={extras} // ส่ง props extras ไปยัง PricingSummarySection
            />

            <div className={SaleStyles.section.container}>
              <section className={SaleStyles.subsection.container}>
                <div className={SaleStyles.section.headerWrapper2}>
                  <h2 className={SaleStyles.section.headerTitle}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                      <path
                        fillRule="evenodd"
                        d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    การชำระเงิน
                  </h2>
                </div>
                <div className={SaleStyles.subsection.content}>
                  <div className={SaleStyles.grid.twoColumns}>
                    <PaymentMethodSection
                      title="การชำระเงินของบริษัท"
                      sectionType="company"
                      fieldName="paymentMethod"
                      detailsFieldName="companyPaymentDetails"
                      options={[
                        {
                          id: "creditCardCompany",
                          value: "creditCard",
                          label: "เครดิตการ์ด",
                        },
                        {
                          id: "bankTransferCompany",
                          value: "bankTransfer",
                          label: "โอนเงินผ่านธนาคาร",
                        },
                        {
                          id: "cashCompany",
                          value: "cash",
                          label: "เงินสด",
                        },
                        { id: "otherCompany", value: "other", label: "อื่น ๆ" },
                      ]}
                      formData={formData}
                      setFormData={setFormData}
                      detailPlaceholder="รายละเอียดการชำระเงิน"
                    />
                    <PaymentMethodSection
                      title="การชำระเงินของลูกค้า"
                      sectionType="customer"
                      fieldName="customerPayment"
                      detailsFieldName="customerPaymentDetails"
                      options={[
                        {
                          id: "creditCardCustomer",
                          value: "creditCard",
                          label: "เครดิตการ์ด VISA / MSTR / AMEX / JCB",
                        },
                        {
                          id: "bankTransferCustomer",
                          value: "bankTransfer",
                          label: "โอนเงินผ่านธนาคาร",
                        },
                        {
                          id: "cashCustomer",
                          value: "cash",
                          label: "เงินสด",
                        },
                        {
                          id: "creditCustomer",
                          value: "credit",
                          label: "เครดิต",
                        },
                      ]}
                      formData={formData}
                      setFormData={setFormData}
                      detailPlaceholder="รายละเอียดการชำระเงิน"
                    />
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SaleTicket;
