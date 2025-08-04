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
import {
  createFlightTicket,
  validateTicketData,
} from "../../services/ticketService";
import {
  getSuppliers,
  searchSupplierByCode,
  searchSupplierByNumericCode,
} from "../../services/supplierService";
import { getCustomers, createCustomer } from "../../services/customerService";
import { validateFlightTicket } from "../../utils/validation";
import { useAuth } from "../../pages/Login/AuthContext";

const SaleTicket = () => {
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [globalEditMode, setGlobalEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    customer: "",
    customerCode: "",
    contactDetails: "",
    phone: "",
    id: "",
    date: new Date().toISOString().split("T")[0],
    creditDays: "0",
    dueDate: "",
    salesName: "",
    supplier: "",
    supplierName: "",
    supplierNumericCode: "",
    ticketType: "bsp",
    paymentMethod: "",
    companyPaymentDetails: "",
    customerPayment: "",
    customerPaymentDetails: "",
    vatPercent: "0",
  });

  useEffect(() => {
    const loadInitialData = async () => {
      console.log("🔄 1. Starting to load initial data..."); // 🆕 เพิ่มบรรทัดนี้

      const airlinesData = await getSuppliers("Airline");
      console.log("✈️ 2. Suppliers loaded:", airlinesData); // 🆕 เพิ่มบรรทัดนี้
      console.log(
        "📋 Numeric codes available:",
        airlinesData.map((s) => s.numeric_code)
      );
      setSuppliers(airlinesData);

      const customersData = await getCustomers();
      console.log("👥 3. Customers loaded:", customersData); // 🆕 เพิ่มบรรทัดนี้
      setCustomers(customersData);

      console.log("✅ 4. Initial data loading completed"); // 🆕 เพิ่มบรรทัดนี้
    };
    loadInitialData();
  }, []);

  const { pricing, updatePricing, calculateSubtotal, calculateTotal } =
    usePricing();

  const [passengers, setPassengers] = useState([
    { id: 1, name: "", type: "ADT", ticketNumber: "", ticketCode: "" },
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
    {
      id: 1,
      description: "",
      net_price: "",
      sale_price: "",
      quantity: 1,
      total_amount: "",
    },
  ]);

  // ✅ แทนที่ useEffect นี้
  useEffect(() => {
    const searchSupplier = async () => {
      if (
        formData.searchTicketNumber &&
        formData.searchTicketNumber.length === 3
      ) {
        console.log(
          "🔍 5. Searching by ticket number:",
          formData.searchTicketNumber
        ); // 🆕 เพิ่ม debug

        try {
          const supplier = await searchSupplierByNumericCode(
            formData.searchTicketNumber
          ); // ✅ ใช้ฟังก์ชันจาก supplierService
          console.log("📊 6. Supplier found:", supplier); // 🆕 เพิ่ม debug

          if (supplier) {
            setFormData((prev) => ({
              ...prev,
              supplier: supplier.code,
              supplierName: supplier.name,
              supplierId: supplier.id,
              supplierNumericCode: supplier.numeric_code,
              searchTicketNumber: "", // clear search flag
            }));
          } else {
            console.log("❌ 7. No supplier found for ticket number"); // 🆕 เพิ่ม debug
            setFormData((prev) => ({
              ...prev,
              supplier: "",
              supplierName: "",
              supplierId: null,
              supplierNumericCode: prev.searchTicketNumber, // เก็บเลขที่พิมพ์ไว้
              searchTicketNumber: "", // clear search flag
            }));
          }
        } catch (error) {
          console.error("💥 8. Error searching by ticket number:", error); // 🆕 เพิ่ม debug
          setFormData((prev) => ({
            ...prev,
            searchTicketNumber: "",
          }));
        }
      }
    };

    searchSupplier();
  }, [formData.searchTicketNumber]);

  useEffect(() => {
    const searchSupplierByCodeFunc = async () => {
      if (
        formData.searchSupplierCode &&
        formData.searchSupplierCode.length >= 2
      ) {
        console.log(
          "Searching for supplier code:",
          formData.searchSupplierCode
        );

        try {
          const supplier = await searchSupplierByCode(
            formData.searchSupplierCode
          );
          console.log("Search result:", supplier);

          if (supplier) {
            console.log("Found supplier:", supplier.code, supplier.name);
            console.log("Numeric code:", supplier.numeric_code);

            setFormData((prev) => ({
              ...prev,
              supplier: supplier.code,
              supplierName: supplier.name,
              supplierId: supplier.id,
              supplierNumericCode: supplier.numeric_code || "",
              searchSupplierCode: "",
            }));

            const ticketNumber = supplier.numeric_code || "";
            console.log("Setting ticket number to:", ticketNumber);

            const updatedPassengers = passengers.map((passenger) => ({
              ...passenger,
              ticketNumber: ticketNumber,
            }));
            setPassengers(updatedPassengers);
          } else {
            console.log(
              "Supplier not found for code:",
              formData.searchSupplierCode
            );

            setFormData((prev) => ({
              ...prev,
              supplierName: "",
              supplierId: null,
              supplierNumericCode: "",
              searchSupplierCode: "",
            }));

            const updatedPassengers = passengers.map((passenger) => ({
              ...passenger,
              ticketNumber: "",
            }));
            setPassengers(updatedPassengers);
          }
        } catch (error) {
          console.error("Error in searchSupplierByCodeFunc:", error);
          setFormData((prev) => ({
            ...prev,
            searchSupplierCode: "",
          }));
        }
      }
    };

    searchSupplierByCodeFunc();
  }, [formData.searchSupplierCode]);

  // เพิ่ม useEffect สำหรับค้นหาด้วย supplier code
  useEffect(() => {
    const searchSupplierByCodeFunc = async () => {
      if (
        formData.searchSupplierCode &&
        formData.searchSupplierCode.length >= 2
      ) {
        console.log(
          "Searching for supplier code:",
          formData.searchSupplierCode
        );

        try {
          const supplier = await searchSupplierByCode(
            formData.searchSupplierCode
          );
          console.log("Search result:", supplier);

          if (supplier) {
            console.log("Found supplier:", supplier.code, supplier.name);
            console.log("Numeric code:", supplier.numeric_code);

            // เจอ supplier -> อัปเดทข้อมูล
            setFormData((prev) => ({
              ...prev,
              supplier: supplier.code,
              supplierName: supplier.name,
              supplierId: supplier.id,
              supplierNumericCode: supplier.numeric_code || "", // อนุญาตให้เป็น empty string
              searchSupplierCode: "", // clear search flag
            }));

            // อัปเดท ticket numbers (ถ้ามี numeric_code)
            const ticketNumber = supplier.numeric_code || "";
            console.log("Setting ticket number to:", ticketNumber);

            const updatedPassengers = passengers.map((passenger) => ({
              ...passenger,
              ticketNumber: ticketNumber,
            }));
            setPassengers(updatedPassengers);
          } else {
            console.log(
              "Supplier not found for code:",
              formData.searchSupplierCode
            );

            // ไม่เจอ supplier -> clear ข้อมูล supplier อื่น (เก็บ code ที่พิมพ์ไว้)
            setFormData((prev) => ({
              ...prev,
              supplierName: "",
              supplierId: null,
              supplierNumericCode: "",
              searchSupplierCode: "", // clear search flag
            }));

            // Clear ticket numbers ด้วย
            const updatedPassengers = passengers.map((passenger) => ({
              ...passenger,
              ticketNumber: "",
            }));
            setPassengers(updatedPassengers);
          }
        } catch (error) {
          console.error("Error in searchSupplierByCodeFunc:", error);

          // Clear search flag ในกรณี error
          setFormData((prev) => ({
            ...prev,
            searchSupplierCode: "",
          }));
        }
      }
    };

    searchSupplierByCodeFunc();
  }, [formData.searchSupplierCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ ป้องกันการบันทึกซ้ำ
    if (isSubmitting || loading) {
      console.log("⏸️ Form is already submitting, ignoring...");
      return;
    }

    console.log("📝 10. Form submitted!");

    setIsSubmitting(true);
    setLoading(true);
    setValidationErrors({});

    console.log("Form data debug:", {
      formData,
      passengers,
      routes,
      pricing,
      extras,
    });

    // ✅ ตรวจสอบ validation ก่อน
    const validation = validateTicketData({
      customerId: selectedCustomer?.id || formData.customerId,
      supplierId: formData.supplierId,
      passengers,
      routes,
    });

    if (!validation.isValid) {
      console.log("❌ Validation failed:", validation.errors);
      setValidationErrors(validation.errors);
      setLoading(false);
      setIsSubmitting(false);
      return;
    }

    // ✅ เตรียมข้อมูลสำหรับส่ง API (เพิ่มส่วนที่หายไป)
    const ticketData = {
      customerId: selectedCustomer?.id || formData.customerId,
      supplierId: formData.supplierId,
      createdBy: currentUser?.id,

      date: formData.date,
      dueDate: formData.dueDate,
      creditDays: formData.creditDays,

      paymentMethod: formData.paymentMethod,
      companyPaymentDetails: formData.companyPaymentDetails,
      customerPayment: formData.customerPayment,
      customerPaymentDetails: formData.customerPaymentDetails,

      code: formData.code,
      ticketType: formData.ticketType,
      ticketTypeDetails: formData.ticketTypeDetails,

      vatPercent: formData.vatPercent,
      pricing,
      passengers,
      routes,
      extras,
    };

    console.log("📤 11. Sending ticket data to API:", ticketData);

    try {
      const result = await createFlightTicket(ticketData);
      console.log("📨 12. API Response:", result);

      if (result.success) {
        console.log("🎉 13. Ticket created successfully:", result);

        // แสดงผลสำเร็จ
        alert(
          `ตั๋วถูกสร้างเรียบร้อยแล้ว!\nReference Number: ${result.referenceNumber}`
        );

        // ✅ รีเซ็ทหน้าเหมือนกด F5
        window.location.reload();
      } else {
        console.error("❌ 14. Error creating ticket:", result.error);
        setValidationErrors({ submit: result.error });
      }
    } catch (error) {
      console.error("💥 15. Error submitting form:", error);
      setValidationErrors({ submit: error.message });
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchSuppliers = async () => {
      const data = await getSuppliers("airline");
      setSuppliers(data);
    };
    fetchSuppliers();
  }, []);

  const resetForm = () => {
    setFormData({
      customer: "",
      customerCode: "",
      contactDetails: "",
      phone: "",
      id: "",
      date: new Date().toISOString().split("T")[0],
      creditDays: "0",
      dueDate: "",
      salesName: "",
      supplier: "",
      supplierName: "",
      ticketType: "",
      paymentMethod: "",
      companyPaymentDetails: "",
      customerPayment: "",
      customerPaymentDetails: "",
      vatPercent: "0",
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

    setPassengers([
      { id: 1, name: "", type: "ADT", ticketNumber: "", ticketCode: "" },
    ]);
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
      {
        id: 1,
        description: "",
        net_price: "",
        sale_price: "",
        quantity: 1,
        total_amount: "",
      },
    ]);
    setSelectedCustomer(null);
    setValidationErrors({});
    setGlobalEditMode(true);
  };

  const calculatedSubtotal =
    calculateSubtotal() +
    extras.reduce((sum, item) => sum + parseFloat(item.total_amount || 0), 0);
  const calculatedVatAmount =
    (calculatedSubtotal * parseFloat(formData.vatPercent || 0)) / 100;
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
                  globalEditMode={globalEditMode}
                  setGlobalEditMode={setGlobalEditMode}
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
                  subtotalAmount={calculatedSubtotal}
                  vatAmount={calculatedVatAmount}
                  globalEditMode={globalEditMode}
                  setGlobalEditMode={setGlobalEditMode}
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
                  updatePricing={updatePricing}
                  pricing={pricing}
                  formData={formData}
                  setFormData={setFormData}
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
              setFormData={setFormData}
              extras={extras}
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
          {/* ปุ่มบันทึกด้านล่าง */}
          <div
            className={combineClasses(
              SaleStyles.section.container,
              "border-t-2 border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 p-6"
            )}
          >
            <div className="flex justify-center">
              <button
                type="submit"
                className={combineClasses(
                  "px-8 py-3 bg-green-500 text-white rounded-lg flex items-center hover:bg-green-600 text-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-200",
                  loading ? "opacity-50 cursor-not-allowed" : ""
                )}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    <span>กำลังบันทึก...</span>
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2" size={20} />
                    บันทึกข้อมูลตั๋วเครื่องบิน
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SaleTicket;
