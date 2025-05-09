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
import TestDataFiller from "./common/TestDataFiller"; // นำเข้า component ใหม่
import usePricing from "../../hooks/usePricing";
import SaleStyles, { combineClasses } from "./common/SaleStyles";
import { createFlightTicket } from "../../services/ticketService";
import { getSuppliers } from "../../services/supplierService";
import { getCustomers, createCustomer } from "../../services/customerService";
import { validateFlightTicket } from "../../utils/validation";
import { supabase } from "../../services/supabase";
import { useAuth } from "../../pages/Login/AuthContext";

const SaleTicket = () => {
  const { user: currentUser } = useAuth();
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
    vatPercent: "0", // เพิ่ม field สำหรับเก็บ vatPercent
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

  const { pricing, updatePricing, calculateSubtotal, calculateTotal } =
    usePricing();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setValidationErrors({});

    console.log("Form submitted", { formData, passengers, routes, pricing });
    console.log("ticketType to be saved:", formData.ticketType);

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
      // ใช้ข้อมูลจาก currentUser แทนการเรียก supabase.auth.getUser()
      let userId = currentUser?.id;
      let userFullname = currentUser?.fullname;

      // กรณีที่ไม่มี currentUser (เช่น ถ้าโค้ดเดิมทำงานได้ดีแล้ว)
      if (!userId) {
        const userData = await supabase.auth.getUser();
        userId = userData.data?.user?.id;
      }

      let customerId = selectedCustomer?.id;

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
          alert(`สร้างลูกค้าใหม่สำเร็จ: ${formData.customer}`);
        } else {
          console.error("Failed to create customer:", newCustomerResult.error);
          alert(`ไม่สามารถสร้างลูกค้าใหม่ได้: ${newCustomerResult.error}`);
          setLoading(false);
          return;
        }
      }

      const subtotalAmount = calculateSubtotal();
      const vatAmount =
        (subtotalAmount * parseFloat(formData.vatPercent || 0)) / 100;
      const totalAmount = subtotalAmount + vatAmount;

      const validTicketTypes = ["bsp", "airline", "web", "tg", "b2b", "other"];
      let ticketTypeFixed = formData.ticketType.toLowerCase();
      if (!validTicketTypes.includes(ticketTypeFixed)) {
        ticketTypeFixed = "bsp"; // ใช้ค่าเริ่มต้นถ้าไม่ตรงกับค่าที่กำหนด
      }

      const ticketData = {
        customerId: customerId,
        supplierId: formData.supplierId || null,
        status: "pending",
        paymentStatus: "unpaid",
        createdBy: userId,
        updatedBy: userId,
        bookingDate: formData.date,
        dueDate: formData.dueDate,
        creditDays: formData.creditDays,
        totalAmount: totalAmount,
        code: formData.code || "",
        ticketType: ticketTypeFixed,
        ticketTypeDetails:
          formData.ticketType === "b2b"
            ? formData.b2bDetails
            : formData.ticketType === "other"
            ? formData.otherDetails
            : null,
        companyPaymentMethod: formData.paymentMethod,
        companyPaymentDetails: formData.companyPaymentDetails || "",
        customerPaymentMethod: formData.customerPayment,
        customerPaymentDetails: formData.customerPaymentDetails || "",
        pricing: pricing,
        subtotalAmount,
        vatPercent: parseFloat(formData.vatPercent || 0),
        vatAmount,
        passengers: passengers.filter((p) => p.name.trim()),
        routes: routes.filter((r) => r.origin || r.destination),
        extras: extras.filter((e) => e.description),
        remarks: formData.remarks || "",
        salesName: userFullname || formData.salesName, // เพิ่มชื่อผู้บันทึก
      };
      console.log("ticketType before sending:", formData.ticketType);
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

  // ฟังก์ชันเติมข้อมูลทดสอบ
  const fillTestData = () => {
    // 1. ข้อมูลลูกค้า
    const newFormData = {
      ...formData,
      customer: "นายสมชาย ใจดี",
      contactDetails: "123 หมู่ 4 ต.ตลาด อ.เมือง จ.สุราษฎร์ธานี 84000",
      phone: "081-234-5678",
      id: "1234567890123",
      date: new Date().toISOString().split("T")[0],
      creditDays: "0",
      dueDate: new Date().toISOString().split("T")[0],
      salesName: "นายชลันธร มานพ",
      supplier: "TG",
      supplierName: "THAI AIRWAYS",
      code: "ABC123",
      ticketType: "bsp",
      paymentMethod: "creditCard",
      companyPaymentDetails: "VISA บัตรบริษัท",
      customerPayment: "creditCard",
      customerPaymentDetails: "VISA *1234",
      vatPercent: "7",
    };
    setFormData(newFormData);

    // 2. ข้อมูลผู้โดยสาร
    const newPassengers = [
      {
        id: 1,
        name: "MR. SOMCHAI JAIDEE",
        age: "35",
        ticketNumber: "217-1234567890",
      },
      {
        id: 2,
        name: "MRS. SOMSRI JAIDEE",
        age: "32",
        ticketNumber: "217-1234567891",
      },
    ];
    setPassengers(newPassengers);

    // 3. ข้อมูลเส้นทาง
    const today = new Date();
    const depDate = `${today.getDate().toString().padStart(2, "0")}${
      [
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
      ][today.getMonth()]
    }${today.getFullYear().toString().slice(-2)}`;

    const newRoutes = [
      {
        id: 1,
        date: depDate,
        airline: "TG",
        flight: "203",
        origin: "BKK",
        destination: "USM",
        departure: "10:30",
        arrival: "11:45",
        rbd: "Y",
      },
      {
        id: 2,
        date: depDate,
        airline: "TG",
        flight: "204",
        origin: "USM",
        destination: "BKK",
        departure: "12:30",
        arrival: "13:45",
        rbd: "Y",
      },
    ];
    setRoutes(newRoutes);

    // 4. ข้อมูลราคา
    updatePricing("adult", "net", "8500", "17000");
    updatePricing("adult", "sale", "10000", "20000");
    updatePricing("adult", "pax", "2", "20000");

    updatePricing("child", "net", "6000", "6000");
    updatePricing("child", "sale", "7000", "7000");
    updatePricing("child", "pax", "1", "7000");

    updatePricing("infant", "net", "500", "0");
    updatePricing("infant", "sale", "800", "0");
    updatePricing("infant", "pax", "0", "0");

    // 5. ข้อมูลรายการเพิ่มเติม (Extras)
    const newExtras = [
      {
        id: 1,
        description: "ค่าประกันภัยการเดินทาง",
        net_price: "800",
        sale_price: "1000",
        quantity: 2,
        total_amount: "2000",
      },
    ];
    setExtras(newExtras);
  };

  // ฟังก์ชันเติมข้อมูลทดสอบแบบที่ 2 (สไตล์อื่น)
  const fillAnotherTestData = () => {
    // 1. ข้อมูลลูกค้า
    const newFormData = {
      ...formData,
      customer: "Ms. Jane Smith",
      contactDetails: "321 Chaweng Beach Road, Koh Samui, Suratthani 84320",
      phone: "094-789-1234",
      id: "AA123456",
      date: new Date().toISOString().split("T")[0],
      creditDays: "15",
      dueDate: new Date(new Date().setDate(new Date().getDate() + 15))
        .toISOString()
        .split("T")[0],

      supplier: "FD",
      supplierName: "THAI AIRASIA",
      code: "XYZ789",
      ticketType: "web",
      paymentMethod: "bankTransfer",
      companyPaymentDetails: "โอนเงินผ่าน SCB 12/05/25",
      customerPayment: "credit",
      customerPaymentDetails: "เครดิต 15 วัน",
      vatPercent: "7",
    };
    setFormData(newFormData);

    // 2. ข้อมูลผู้โดยสาร
    const newPassengers = [
      {
        id: 1,
        name: "MS. JANE SMITH",
        age: "28",
        ticketNumber: "XXX-7890123456",
      },
      {
        id: 2,
        name: "MR. JOHN SMITH",
        age: "29",
        ticketNumber: "XXX-7890123457",
      },
      {
        id: 3,
        name: "MSTR. JAMES SMITH",
        age: "5",
        ticketNumber: "XXX-7890123458",
      },
    ];
    setPassengers(newPassengers);

    // 3. ข้อมูลเส้นทาง
    const today = new Date();
    const departureDate = new Date(today);
    departureDate.setDate(today.getDate() + 30);
    const depDate = `${departureDate.getDate().toString().padStart(2, "0")}${
      [
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
      ][departureDate.getMonth()]
    }${departureDate.getFullYear().toString().slice(-2)}`;

    const returnDate = new Date(departureDate);
    returnDate.setDate(departureDate.getDate() + 7);
    const retDate = `${returnDate.getDate().toString().padStart(2, "0")}${
      [
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
      ][returnDate.getMonth()]
    }${returnDate.getFullYear().toString().slice(-2)}`;

    const newRoutes = [
      {
        id: 1,
        date: depDate,
        airline: "FD",
        flight: "3001",
        origin: "DMK",
        destination: "USM",
        departure: "09:20",
        arrival: "10:40",
        rbd: "L",
      },
      {
        id: 2,
        date: retDate,
        airline: "FD",
        flight: "3002",
        origin: "USM",
        destination: "DMK",
        departure: "11:20",
        arrival: "12:40",
        rbd: "L",
      },
    ];
    setRoutes(newRoutes);

    // 4. ข้อมูลราคา
    updatePricing("adult", "net", "4500", "9000");
    updatePricing("adult", "sale", "5500", "11000");
    updatePricing("adult", "pax", "2", "11000");

    updatePricing("child", "net", "3500", "3500");
    updatePricing("child", "sale", "4500", "4500");
    updatePricing("child", "pax", "1", "4500");

    updatePricing("infant", "net", "0", "0");
    updatePricing("infant", "sale", "0", "0");
    updatePricing("infant", "pax", "0", "0");

    // 5. ข้อมูลรายการเพิ่มเติม (Extras)
    const newExtras = [
      {
        id: 1,
        description: "น้ำหนักกระเป๋าเพิ่ม 10 กก.",
        net_price: "500",
        sale_price: "750",
        quantity: 2,
        total_amount: "1500",
      },
      {
        id: 2,
        description: "ที่นั่งริมหน้าต่าง",
        net_price: "200",
        sale_price: "300",
        quantity: 3,
        total_amount: "900",
      },
    ];
    setExtras(newExtras);
  };

  // เตรียมข้อมูลสำหรับ TestDataFiller
  const testDataSets = [
    { name: "เติมข้อมูลชุดที่ 1 (ตัวอย่างทั่วไป)", action: fillTestData },
    { name: "เติมข้อมูลชุดที่ 2 (ต่างประเทศ)", action: fillAnotherTestData },
  ];

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
                  vatPercent={formData.vatPercent} // ส่ง vatPercent
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
                <RouteSection
                  routes={routes}
                  setRoutes={setRoutes}
                  supplierCode={formData.supplier} // ส่งรหัสสายการบินจาก supplier ที่เลือก
                />
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
              setFormData={setFormData} // ส่ง setFormData เพื่ออัปเดต vatPercent
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
        </div>
      </form>

      {/* เพิ่ม TestDataFiller */}
      <TestDataFiller fillTestData={fillTestData} testDataSets={testDataSets} />
    </div>
  );
};

export default SaleTicket;
