// FlightTicketDetail_Edit.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../../../services/supabase";
import {
  User,
  Plane,
  Calendar,
  CreditCard,
  DollarSign,
  Save,
  ChevronLeft,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency } from "../../../utils/helpers";
import { useAlertDialogContext } from "../../../contexts/AlertDialogContext";

const FlightTicketDetail_Edit = ({ ticketId, onClose, onSave }) => {
  const showAlert = useAlertDialogContext();
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    customer: "",
    contactDetails: "",
    id: "",
    date: new Date().toISOString().split("T")[0],
    creditDays: "0",
    dueDate: "",
    supplier: "",
    supplierName: "",
    supplierId: null,
    code: "",
    ticketType: "bsp",
    status: "pending",
    paymentStatus: "unpaid",
    companyPaymentMethod: "",
    companyPaymentDetails: "",
    customerPaymentMethod: "",
    customerPaymentDetails: "",
  });

  const [passengers, setPassengers] = useState([
    { id: 1, name: "", age: "", ticketNumber: "" },
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

  const [pricing, setPricing] = useState({
    adult: { net: 0, sale: 0, pax: 0, total: 0 },
    child: { net: 0, sale: 0, pax: 0, total: 0 },
    infant: { net: 0, sale: 0, pax: 0, total: 0 },
    subtotal: 0,
    vatPercent: 0,
    vatAmount: 0,
    total: 0,
  });

  // Fetch ticket data when component mounts
  useEffect(() => {
    const fetchTicketDetails = async () => {
      setLoading(true);
      try {
        // Main ticket data
        const { data, error } = await supabase
          .from("bookings_ticket")
          .select(
            `
            id, reference_number, status, payment_status, created_at,
            customer:customer_id(*),
            tickets_detail(*),
            supplier:information_id(*)
          `
          )
          .eq("id", ticketId)
          .single();

        if (error) throw error;

        // Additional info
        const { data: additionalInfoData, error: additionalInfoError } =
          await supabase
            .from("ticket_additional_info")
            .select("*")
            .eq("bookings_ticket_id", ticketId)
            .single();

        if (
          additionalInfoError &&
          !additionalInfoError.message.includes("No rows found")
        ) {
          throw additionalInfoError;
        }

        // Pricing info
        const { data: pricingData, error: pricingError } = await supabase
          .from("tickets_pricing")
          .select("*")
          .eq("bookings_ticket_id", ticketId)
          .single();

        if (pricingError && !pricingError.message.includes("No rows found")) {
          throw pricingError;
        }

        // Routes data
        const { data: routesData, error: routesError } = await supabase
          .from("tickets_routes")
          .select("*")
          .eq("bookings_ticket_id", ticketId);

        if (routesError) throw routesError;

        // Passenger data
        const { data: passengersData, error: passengersError } = await supabase
          .from("tickets_passengers")
          .select("*")
          .eq("bookings_ticket_id", ticketId);

        if (passengersError) throw passengersError;

        // Extras data
        const { data: extrasData, error: extrasError } = await supabase
          .from("tickets_extras")
          .select("*")
          .eq("bookings_ticket_id", ticketId);

        if (extrasError) throw extrasError;

        // Combine data
        const fullTicketData = {
          ...data,
          additionalInfo: additionalInfoData || {},
          pricing: pricingData || {},
          routes: routesData || [],
          passengers: passengersData || [],
          extras: extrasData || [],
        };

        setTicketData(fullTicketData);

        // Initialize form with existing data
        if (data) {
          setFormData({
            customer: data.customer?.name || "",
            contactDetails: data.customer?.address || "",
            id: data.customer?.id_number || "",
            customerId: data.customer_id,
            date:
              data.tickets_detail?.issue_date ||
              new Date().toISOString().split("T")[0],
            creditDays: String(data.tickets_detail?.credit_days || "0"),
            dueDate: data.tickets_detail?.due_date || "",
            supplier: data.supplier?.code || "",
            supplierName: data.supplier?.name || "",
            supplierId: data.supplier?.id || null,
            code: additionalInfoData?.code || "",
            ticketType: additionalInfoData?.ticket_type || "bsp",
            status: data.status || "pending",
            paymentStatus: data.payment_status || "unpaid",
            companyPaymentMethod:
              additionalInfoData?.company_payment_method || "",
            companyPaymentDetails:
              additionalInfoData?.company_payment_details || "",
            customerPaymentMethod:
              additionalInfoData?.customer_payment_method || "",
            customerPaymentDetails:
              additionalInfoData?.customer_payment_details || "",
          });

          // Initialize pricing
          if (pricingData) {
            setPricing({
              adult: {
                net: pricingData.adult_net_price || 0,
                sale: pricingData.adult_sale_price || 0,
                pax: pricingData.adult_pax || 0,
                total: pricingData.adult_total || 0,
              },
              child: {
                net: pricingData.child_net_price || 0,
                sale: pricingData.child_sale_price || 0,
                pax: pricingData.child_pax || 0,
                total: pricingData.child_total || 0,
              },
              infant: {
                net: pricingData.infant_net_price || 0,
                sale: pricingData.infant_sale_price || 0,
                pax: pricingData.infant_pax || 0,
                total: pricingData.infant_total || 0,
              },
              subtotal: pricingData.subtotal_amount || 0,
              vatPercent: pricingData.vat_percent || 0,
              vatAmount: pricingData.vat_amount || 0,
              total: pricingData.total_amount || 0,
            });
          }

          // Initialize routes
          if (routesData && routesData.length > 0) {
            setRoutes(
              routesData.map((route, idx) => ({
                id: idx + 1,
                date: route.date || "",
                airline: route.airline || "",
                flight: route.flight_number || "",
                origin: route.origin || "",
                destination: route.destination || "",
                departure: route.departure_time || "",
                arrival: route.arrival_time || "",
                originalId: route.id, // Keep track of original ID for update
              }))
            );
          }

          // Initialize passengers
          if (passengersData && passengersData.length > 0) {
            setPassengers(
              passengersData.map((passenger, idx) => ({
                id: idx + 1,
                name: passenger.passenger_name || "",
                age: passenger.age || "",
                ticketNumber: passenger.ticket_number || "",
                originalId: passenger.id,
              }))
            );
          }

          // Initialize extras
          if (extrasData && extrasData.length > 0) {
            setExtras(
              extrasData.map((extra, idx) => ({
                id: idx + 1,
                description: extra.description || "",
                net_price: extra.net_price || 0,
                sale_price: extra.sale_price || 0,
                quantity: extra.quantity || 1,
                total_amount: extra.total_amount || 0,
                originalId: extra.id,
              }))
            );
          }
        }
      } catch (err) {
        console.error("Error fetching ticket details:", err);
        setError(err.message || "ไม่สามารถโหลดข้อมูลตั๋วได้");
      } finally {
        setLoading(false);
      }
    };

    if (ticketId) fetchTicketDetails();
  }, [ticketId]);

  // Calculate price totals
  const calculatePricing = () => {
    // Calculate totals for adult, child, infant
    const adultTotal = pricing.adult.sale * pricing.adult.pax;
    const childTotal = pricing.child.sale * pricing.child.pax;
    const infantTotal = pricing.infant.sale * pricing.infant.pax;

    // Calculate subtotal
    const subtotal = adultTotal + childTotal + infantTotal;

    // Calculate VAT
    const vatAmount = (subtotal * pricing.vatPercent) / 100;

    // Calculate total
    const total = subtotal + vatAmount;

    return {
      ...pricing,
      adult: { ...pricing.adult, total: adultTotal },
      child: { ...pricing.child, total: childTotal },
      infant: { ...pricing.infant, total: infantTotal },
      subtotal,
      vatAmount,
      total,
    };
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const calculatedPricing = calculatePricing();

      // อัพเดท bookings_ticket status
      const { error: bookingError } = await supabase
        .from("bookings_ticket")
        .update({
          status: formData.status,
          payment_status: formData.paymentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", ticketId);

      if (bookingError) throw bookingError;

      // อัพเดท tickets_detail
      const { error: detailError } = await supabase
        .from("tickets_detail")
        .update({
          total_price: calculatedPricing.total,
          issue_date: formData.date,
          due_date: formData.dueDate,
          credit_days: parseInt(formData.creditDays, 10),
        })
        .eq("bookings_ticket_id", ticketId);

      if (detailError) throw detailError;

      // อัพเดท ticket_additional_info
      const { error: additionalInfoError } = await supabase
        .from("ticket_additional_info")
        .update({
          company_payment_method: formData.companyPaymentMethod,
          company_payment_details: formData.companyPaymentDetails,
          customer_payment_method: formData.customerPaymentMethod,
          customer_payment_details: formData.customerPaymentDetails,
          code: formData.code,
          ticket_type: formData.ticketType,
        })
        .eq("bookings_ticket_id", ticketId);

      if (additionalInfoError) throw additionalInfoError;

      // อัพเดท tickets_pricing
      const { error: pricingError } = await supabase
        .from("tickets_pricing")
        .update({
          adult_net_price: pricing.adult.net,
          adult_sale_price: pricing.adult.sale,
          adult_pax: pricing.adult.pax,
          adult_total: pricing.adult.total,
          child_net_price: pricing.child.net,
          child_sale_price: pricing.child.sale,
          child_pax: pricing.child.pax,
          child_total: pricing.child.total,
          infant_net_price: pricing.infant.net,
          infant_sale_price: pricing.infant.sale,
          infant_pax: pricing.infant.pax,
          infant_total: pricing.infant.total,
          subtotal_amount: calculatedPricing.subtotal,
          vat_percent: pricing.vatPercent,
          vat_amount: calculatedPricing.vatAmount,
          total_amount: calculatedPricing.total,
        })
        .eq("bookings_ticket_id", ticketId);

      if (pricingError) throw pricingError;

      // อัพเดทเส้นทาง (routes)
      for (const route of routes) {
        if (route.originalId) {
          // อัพเดทเส้นทางที่มีอยู่เดิม
          const { error: routeError } = await supabase
            .from("tickets_routes")
            .update({
              airline: route.airline,
              flight_number: route.flight,
              date: route.date,
              origin: route.origin,
              destination: route.destination,
              departure_time: route.departure,
              arrival_time: route.arrival,
            })
            .eq("id", route.originalId);

          if (routeError) throw routeError;
        } else if (route.origin && route.destination) {
          // สร้างเส้นทางใหม่
          const { error: newRouteError } = await supabase
            .from("tickets_routes")
            .insert({
              bookings_ticket_id: ticketId,
              airline: route.airline,
              flight_number: route.flight,
              date: route.date,
              origin: route.origin,
              destination: route.destination,
              departure_time: route.departure,
              arrival_time: route.arrival,
            });

          if (newRouteError) throw newRouteError;
        }
      }

      // อัพเดทผู้โดยสาร (passengers)
      for (const passenger of passengers) {
        if (passenger.originalId) {
          // อัพเดทผู้โดยสารที่มีอยู่เดิม
          const { error: passengerError } = await supabase
            .from("tickets_passengers")
            .update({
              passenger_name: passenger.name,
              age: passenger.age,
              ticket_number: passenger.ticketNumber,
            })
            .eq("id", passenger.originalId);

          if (passengerError) throw passengerError;
        } else if (passenger.name) {
          // สร้างผู้โดยสารใหม่
          const { error: newPassengerError } = await supabase
            .from("tickets_passengers")
            .insert({
              bookings_ticket_id: ticketId,
              passenger_name: passenger.name,
              age: passenger.age,
              ticket_number: passenger.ticketNumber,
            });

          if (newPassengerError) throw newPassengerError;
        }
      }

      // อัพเดทรายการเพิ่มเติม (extras) ถ้ามี
      if (extras && extras.length > 0) {
        for (const extra of extras) {
          if (extra.originalId) {
            // อัพเดทรายการที่มีอยู่เดิม
            const { error: extraError } = await supabase
              .from("tickets_extras")
              .update({
                description: extra.description,
                net_price: extra.net_price,
                sale_price: extra.sale_price,
                quantity: extra.quantity,
                total_amount: extra.total_amount,
              })
              .eq("id", extra.originalId);

            if (extraError) throw extraError;
          } else if (extra.description) {
            // สร้างรายการใหม่
            const { error: newExtraError } = await supabase
              .from("tickets_extras")
              .insert({
                bookings_ticket_id: ticketId,
                description: extra.description,
                net_price: extra.net_price || 0,
                sale_price: extra.sale_price || 0,
                quantity: extra.quantity || 1,
                total_amount: extra.total_amount || 0,
              });

            if (newExtraError) throw newExtraError;
          }
        }
      }

      // แสดงข้อความแจ้งสำเร็จ
      showAlert({
        title: "บันทึกข้อมูลสำเร็จ",
        description: `ตั๋วเครื่องบินรหัส ${ticketData.reference_number} ถูกอัปเดตเรียบร้อยแล้ว`,
        actionText: "ตกลง",
      });

      // เรียกใช้ callback onSave
      if (onSave) onSave();

      // ปิด modal
      onClose();
    } catch (err) {
      console.error("Error updating ticket:", err);
      setError("ไม่สามารถบันทึกข้อมูลตั๋วได้: " + err.message);
      showAlert({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อมูลตั๋วได้: " + err.message,
        actionText: "ตกลง",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle deletion
  const handleDelete = async () => {
    const confirmed = await showAlert({
      title: "ยืนยันการลบตั๋ว",
      description: `คุณต้องการลบตั๋วเครื่องบินรหัส ${ticketData.reference_number} ใช่หรือไม่?`,
      actionText: "ลบ",
      cancelText: "ยกเลิก",
      actionVariant: "destructive",
    });

    if (!confirmed) return;

    setSaving(true);
    try {
      // Instead of deleting, just mark as cancelled
      const { error: updateError } = await supabase
        .from("bookings_ticket")
        .update({ status: "cancelled" })
        .eq("id", ticketId);

      if (updateError) throw updateError;

      showAlert({
        title: "ลบข้อมูลสำเร็จ",
        description: `ตั๋วเครื่องบินรหัส ${ticketData.reference_number} ถูกยกเลิกเรียบร้อยแล้ว`,
        actionText: "ตกลง",
      });

      if (onSave) onSave();
      onClose();
    } catch (err) {
      console.error("Error deleting ticket:", err);
      setError("ไม่สามารถลบข้อมูลตั๋วได้: " + err.message);
      showAlert({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบข้อมูลตั๋วได้: " + err.message,
        actionText: "ตกลง",
      });
    } finally {
      setSaving(false);
    }
  };

  // Update pricing field
  const updatePricing = (category, field, value) => {
    setPricing((prev) => {
      const newPricing = {
        ...prev,
        [category]: {
          ...prev[category],
          [field]: Number(value),
        },
      };

      // If updating sale price or pax, recalculate total
      if (field === "sale" || field === "pax") {
        newPricing[category].total =
          Number(newPricing[category].sale) * Number(newPricing[category].pax);
      }

      return newPricing;
    });
  };

  // Helper function to add new passenger
  const addPassenger = () => {
    setPassengers([
      ...passengers,
      { id: passengers.length + 1, name: "", age: "", ticketNumber: "" },
    ]);
  };

  // Helper function to remove passenger
  const removePassenger = (id) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter((p) => p.id !== id));
    }
  };

  // Helper function to add new route
  const addRoute = () => {
    setRoutes([
      ...routes,
      {
        id: routes.length + 1,
        date: "",
        airline: "",
        flight: "",
        origin: "",
        destination: "",
        departure: "",
        arrival: "",
      },
    ]);
  };

  // Helper function to remove route
  const removeRoute = (id) => {
    if (routes.length > 1) {
      setRoutes(routes.filter((r) => r.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 modal-backdrop bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
          <p className="text-center mt-4">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error && !ticketData) {
    return (
      <div className="fixed inset-0 modal-backdrop bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
          <div className="text-center text-red-500 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-center text-red-600">{error}</p>
          <div className="flex justify-center mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!ticketData) return null;

  return (
    <div className="fixed inset-0 modal-backdrop bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
          <h1 className="text-xl font-bold">
            แก้ไขตั๋วเครื่องบิน:{" "}
            {ticketData.reference_number || `#${ticketData.id}`}
          </h1>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                <p>{error}</p>
              </div>
            )}

            {/* Customer Info and Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Info */}
              <div>
                <h2 className="text-lg font-semibold border-b pb-2 mb-4">
                  ข้อมูลลูกค้า
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-400 rounded-md p-2"
                      value={formData.customer}
                      onChange={(e) =>
                        setFormData({ ...formData, customer: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Contact Details
                    </label>
                    <textarea
                      className="w-full border border-gray-400 rounded-md p-2 h-24"
                      placeholder="ที่อยู่และข้อมูลติดต่อ"
                      value={formData.contactDetails}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactDetails: e.target.value,
                        })
                      }
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        ID/Passport
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-400 rounded-md p-2"
                        placeholder="เลขประจำตัว/พาสปอร์ต"
                        value={formData.id}
                        onChange={(e) =>
                          setFormData({ ...formData, id: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        สถานะรายการ
                      </label>
                      <select
                        className="w-full border border-gray-400 rounded-md p-2"
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                      >
                        <option value="pending">รอดำเนินการ</option>
                        <option value="confirmed">ยืนยันแล้ว</option>
                        <option value="cancelled">ยกเลิก</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing & Dates */}
              <div>
                <h2 className="text-lg font-semibold border-b pb-2 mb-4">
                  ราคาและวันที่
                </h2>
                <div className="bg-blue-50 p-4 rounded-md mb-4">
                  <div className="text-sm text-gray-600 mb-1">
                    ราคารวมทั้งสิ้น
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(calculatePricing().total)}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        วันที่:
                      </label>
                      <input
                        type="date"
                        className="w-full border border-gray-400 rounded-md p-2"
                        value={formData.date || ""}
                        onChange={(e) => {
                          const newDate = e.target.value;
                          const newDueDate = calculateDueDate(
                            newDate,
                            formData.creditDays
                          );
                          setFormData({
                            ...formData,
                            date: newDate,
                            dueDate: newDueDate,
                          });
                        }}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        เครดิต (วัน):
                      </label>
                      <input
                        type="number"
                        className="w-full border border-gray-400 rounded-md p-2"
                        value={formData.creditDays}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            creditDays: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        วันครบกำหนด:
                      </label>
                      <input
                        type="date"
                        className="w-full border border-gray-400 rounded-md p-2"
                        value={formData.date || ""}
                        onChange={(e) => {
                          const newDate = e.target.value;
                          const newDueDate = calculateDueDate(
                            newDate,
                            formData.creditDays
                          );
                          setFormData({
                            ...formData,
                            date: newDate,
                            dueDate: newDueDate,
                          });
                        }}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        สถานะการชำระเงิน:
                      </label>
                      <select
                        className="w-full border border-gray-400 rounded-md p-2"
                        value={formData.paymentStatus}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            paymentStatus: e.target.value,
                          })
                        }
                      >
                        <option value="unpaid">ยังไม่ชำระ</option>
                        <option value="partially">ชำระบางส่วน</option>
                        <option value="paid">ชำระแล้ว</option>
                        <option value="refunded">คืนเงินแล้ว</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Passengers */}
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="bg-blue-600 p-1 text-white">
                <h2 className="font-bold px-3 py-2 flex items-center">
                  <User className="text-white mr-2" size={20} />
                  ข้อมูลผู้โดยสาร
                </h2>
              </div>
              <div className="p-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          #
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ชื่อผู้โดยสาร
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          อายุ
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          เลขที่ตั๋ว
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          การจัดการ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {passengers.map((passenger, index) => (
                        <tr key={passenger.id}>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {index + 1}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <input
                              type="text"
                              className="w-full border border-gray-400 rounded-md p-1"
                              value={passenger.name}
                              onChange={(e) => {
                                const newPassengers = [...passengers];
                                newPassengers[index].name = e.target.value;
                                setPassengers(newPassengers);
                              }}
                            />
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <input
                              type="text"
                              className="w-full border border-gray-400 rounded-md p-1"
                              value={passenger.age}
                              onChange={(e) => {
                                const newPassengers = [...passengers];
                                newPassengers[index].age = e.target.value;
                                setPassengers(newPassengers);
                              }}
                            />
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <input
                              type="text"
                              className="w-full border border-gray-400 rounded-md p-1"
                              value={passenger.ticketNumber}
                              onChange={(e) => {
                                const newPassengers = [...passengers];
                                newPassengers[index].ticketNumber =
                                  e.target.value;
                                setPassengers(newPassengers);
                              }}
                            />
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <button
                              type="button"
                              className="text-red-600 hover:text-red-800"
                              onClick={() => removePassenger(passenger.id)}
                              disabled={passengers.length === 1}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  type="button"
                  onClick={addPassenger}
                  className="mt-4 bg-blue-50 text-blue-600 border border-blue-200 rounded-md py-1 px-3 text-sm hover:bg-blue-100"
                >
                  + เพิ่มผู้โดยสาร
                </button>
              </div>
            </div>

            {/* Routes */}
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="bg-blue-600 p-1 text-white">
                <h2 className="font-bold px-3 py-2 flex items-center">
                  <Plane className="text-white mr-2" size={20} />
                  เส้นทางการเดินทาง
                </h2>
              </div>
              <div className="p-4">
                {routes.map((route, index) => (
                  <div
                    key={route.id}
                    className="mb-4 border border-gray-400 rounded-md p-3 bg-gray-50"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">เส้นทางที่ {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeRoute(route.id)}
                        className="text-red-600 hover:text-red-800"
                        disabled={routes.length === 1}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          วันที่
                        </label>
                        <input
                          type="date"
                          className="w-full border border-gray-400 rounded-md p-1 text-sm"
                          value={route.date}
                          onChange={(e) => {
                            const newRoutes = [...routes];
                            newRoutes[index].date = e.target.value;
                            setRoutes(newRoutes);
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          สายการบิน
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-400 rounded-md p-1 text-sm"
                          value={route.airline}
                          onChange={(e) => {
                            const newRoutes = [...routes];
                            newRoutes[index].airline = e.target.value;
                            setRoutes(newRoutes);
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          เที่ยวบิน
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-400 rounded-md p-1 text-sm"
                          value={route.flight}
                          onChange={(e) => {
                            const newRoutes = [...routes];
                            newRoutes[index].flight = e.target.value;
                            setRoutes(newRoutes);
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          ต้นทาง
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-400 rounded-md p-1 text-sm"
                          value={route.origin}
                          onChange={(e) => {
                            const newRoutes = [...routes];
                            newRoutes[index].origin = e.target.value;
                            setRoutes(newRoutes);
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          ปลายทาง
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-400 rounded-md p-1 text-sm"
                          value={route.destination}
                          onChange={(e) => {
                            const newRoutes = [...routes];
                            newRoutes[index].destination = e.target.value;
                            setRoutes(newRoutes);
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          เวลาออก
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-400 rounded-md p-1 text-sm"
                          value={route.departure}
                          onChange={(e) => {
                            const newRoutes = [...routes];
                            newRoutes[index].departure = e.target.value;
                            setRoutes(newRoutes);
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          เวลาถึง
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-400 rounded-md p-1 text-sm"
                          value={route.arrival}
                          onChange={(e) => {
                            const newRoutes = [...routes];
                            newRoutes[index].arrival = e.target.value;
                            setRoutes(newRoutes);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addRoute}
                  className="bg-blue-50 text-blue-600 border border-blue-200 rounded-md py-1 px-3 text-sm hover:bg-blue-100"
                >
                  + เพิ่มเส้นทาง
                </button>
              </div>
            </div>

            {/* Pricing */}
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="bg-blue-600 p-1 text-white">
                <h2 className="font-bold px-3 py-2 flex items-center">
                  <DollarSign className="text-white mr-2" size={20} />
                  ราคา
                </h2>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-12 gap-2 pt-2 p-1 pl-3 items-center bg-gray-50 font-medium text-sm mb-2">
                  <div className="col-span-1"></div>
                  <div className="col-span-3">Net</div>
                  <div className="col-span-3">Sale</div>
                  <div className="col-span-1">Pax</div>
                  <div className="col-span-4">Total</div>
                </div>

                {/* Adult Row */}
                <div className="grid grid-cols-12 gap-2 pt-2 p-1 pl-3 items-center bg-white">
                  <div className="col-span-1">
                    <span className="text-right font-medium">Adult</span>
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      className="w-full border text-right border-gray-400 rounded-md p-2"
                      value={pricing.adult.net}
                      onChange={(e) =>
                        updatePricing("adult", "net", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      className="w-full border text-right border-gray-400 rounded-md p-2"
                      value={pricing.adult.sale}
                      onChange={(e) =>
                        updatePricing("adult", "sale", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      className="w-full border text-center border-gray-400 rounded-md p-2"
                      value={pricing.adult.pax}
                      onChange={(e) =>
                        updatePricing("adult", "pax", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-4">
                    <input
                      type="text"
                      className="w-full border text-right border-gray-400 rounded-md p-2 bg-gray-100"
                      value={formatCurrency(pricing.adult.total)}
                      readOnly
                    />
                  </div>
                </div>

                {/* Child Row */}
                <div className="grid grid-cols-12 gap-2 pt-2 p-1 pl-3 items-center bg-white">
                  <div className="col-span-1">
                    <span className="text-right font-medium">Child</span>
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      className="w-full border text-right border-gray-400 rounded-md p-2"
                      value={pricing.child.net}
                      onChange={(e) =>
                        updatePricing("child", "net", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      className="w-full border text-right border-gray-400 rounded-md p-2"
                      value={pricing.child.sale}
                      onChange={(e) =>
                        updatePricing("child", "sale", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      className="w-full border text-center border-gray-400 rounded-md p-2"
                      value={pricing.child.pax}
                      onChange={(e) =>
                        updatePricing("child", "pax", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-4">
                    <input
                      type="text"
                      className="w-full border text-right border-gray-400 rounded-md p-2 bg-gray-100"
                      value={formatCurrency(pricing.child.total)}
                      readOnly
                    />
                  </div>
                </div>

                {/* Infant Row */}
                <div className="grid grid-cols-12 gap-2 pt-2 p-1 pl-3 items-center bg-white mb-4">
                  <div className="col-span-1">
                    <span className="text-right font-medium">Infant</span>
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      className="w-full border text-right border-gray-400 rounded-md p-2"
                      value={pricing.infant.net}
                      onChange={(e) =>
                        updatePricing("infant", "net", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      className="w-full border text-right border-gray-400 rounded-md p-2"
                      value={pricing.infant.sale}
                      onChange={(e) =>
                        updatePricing("infant", "sale", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      className="w-full border text-center border-gray-400 rounded-md p-2"
                      value={pricing.infant.pax}
                      onChange={(e) =>
                        updatePricing("infant", "pax", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-4">
                    <input
                      type="text"
                      className="w-full border text-right border-gray-400 rounded-md p-2 bg-gray-100"
                      value={formatCurrency(pricing.infant.total)}
                      readOnly
                    />
                  </div>
                </div>

                {/* VAT and Total */}
                <div className="bg-blue-50 p-4 rounded-md shadow-sm">
                  <div className="flex justify-between mb-3 items-center">
                    <div className="font-medium">ยอดรวมเป็นเงิน</div>
                    <div className="font-bold text-gray-700">
                      {formatCurrency(calculatePricing().subtotal)}
                    </div>
                  </div>
                  <div className="flex justify-between mb-3 items-center">
                    <div className="font-medium flex items-center">
                      <span>ภาษีมูลค่าเพิ่ม</span>
                      <input
                        type="number"
                        className="w-12 mx-2 border border-gray-400 rounded-md p-1 text-center"
                        value={pricing.vatPercent}
                        onChange={(e) =>
                          setPricing({
                            ...pricing,
                            vatPercent: Number(e.target.value),
                          })
                        }
                      />
                      <span>%</span>
                    </div>
                    <div className="text-gray-700">
                      {formatCurrency(calculatePricing().vatAmount)}
                    </div>
                  </div>
                  <div className="flex justify-between border-t border-blue-200 pt-2 mt-2">
                    <div className="font-semibold">ยอดรวมทั้งสิ้น</div>
                    <div className="font-bold text-blue-600 text-xl">
                      {formatCurrency(calculatePricing().total)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="bg-blue-600 p-1 text-white">
                <h2 className="font-bold px-3 py-2 flex items-center">
                  <CreditCard className="text-white mr-2" size={20} />
                  การชำระเงิน
                </h2>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-3">การชำระเงินของบริษัท</h3>
                  <div className="space-y-2">
                    <div>
                      <select
                        className="w-full border border-gray-400 rounded-md p-2 mb-2"
                        value={formData.companyPaymentMethod}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            companyPaymentMethod: e.target.value,
                          })
                        }
                      >
                        <option value="">เลือกวิธีการชำระเงิน</option>
                        <option value="creditCard">เครดิตการ์ด</option>
                        <option value="bankTransfer">โอนเงินผ่านธนาคาร</option>
                        <option value="cash">เงินสด</option>
                        <option value="other">อื่นๆ</option>
                      </select>
                    </div>
                    {formData.companyPaymentMethod && (
                      <div>
                        <textarea
                          className="w-full border border-gray-400 rounded-md p-2 h-20"
                          placeholder="รายละเอียดการชำระเงิน"
                          value={formData.companyPaymentDetails}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              companyPaymentDetails: e.target.value,
                            })
                          }
                        ></textarea>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-3">การชำระเงินของลูกค้า</h3>
                  <div className="space-y-2">
                    <div>
                      <select
                        className="w-full border border-gray-400 rounded-md p-2 mb-2"
                        value={formData.customerPaymentMethod}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customerPaymentMethod: e.target.value,
                          })
                        }
                      >
                        <option value="">เลือกวิธีการชำระเงิน</option>
                        <option value="creditCard">
                          เครดิตการ์ด VISA / MSTR / AMEX / JCB
                        </option>
                        <option value="bankTransfer">โอนเงินผ่านธนาคาร</option>
                        <option value="cash">เงินสด</option>
                        <option value="credit">เครดิต</option>
                      </select>
                    </div>
                    {formData.customerPaymentMethod && (
                      <div>
                        <textarea
                          className="w-full border border-gray-400 rounded-md p-2 h-20"
                          placeholder="รายละเอียดการชำระเงิน"
                          value={formData.customerPaymentDetails}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              customerPaymentDetails: e.target.value,
                            })
                          }
                        ></textarea>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer with action buttons */}
        <div className="bg-gray-50 p-4 border-t flex justify-between">
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
            disabled={saving}
          >
            <Trash2 size={16} className="mr-2" />
            {saving ? "กำลังลบ..." : "ลบรายการ"}
          </button>

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
              disabled={saving}
            >
              <ChevronLeft size={16} className="mr-2" />
              ยกเลิก
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
              disabled={saving}
            >
              <Save size={16} className="mr-2" />
              {saving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightTicketDetail_Edit;
