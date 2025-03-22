import React, { useState, useEffect } from "react";
import { Mail, X, Send } from "lucide-react";

// คอมโพเนนต์สำหรับหน้าต่างส่งอีเมล Invoice
const SendEmail = ({ invoiceData, onClose }) => {
  // ข้อมูลฟอร์ม
  const [formData, setFormData] = useState({
    from: "samuilook@gmail.com", // อีเมลผู้ส่งฟิกไว้แล้ว
    to: "", // อีเมลผู้รับให้กรอกได้
    subject: "", // หัวข้ออีเมล
    message: "", // ข้อความเพิ่มเติม
  });

  // ตั้งค่า Subject ตามข้อมูล invoice เมื่อ component โหลด
  useEffect(() => {
    if (invoiceData) {
      setFormData({
        ...formData,
        subject: `ใบแจ้งหนี้ ${invoiceData.id} - SamuiLookBooking`,
        to: invoiceData.customerEmail || "", // ถ้ามีอีเมลลูกค้าให้ใส่อัตโนมัติ
      });
    }
  }, [invoiceData]);

  // จัดการการเปลี่ยนแปลงข้อมูลในฟอร์ม
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // จัดการการส่งฟอร์ม
  const handleSubmit = (e) => {
    e.preventDefault();

    // แสดงข้อมูลที่จะส่ง (ในระบบจริงจะส่งไปยัง API)
    console.log("ส่งอีเมลด้วยข้อมูล:", formData);

    // แสดง Alert แจ้งเตือนว่าส่งอีเมลสำเร็จ
    alert("ส่งอีเมลเรียบร้อยแล้ว");

    // ปิด Modal
    onClose();
  };

  return (
    <div className="fixed inset-0 modal-backdrop bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
          <h1 className="text-xl font-bold flex items-center">
            <Mail size={20} className="mr-2" />
            ส่งใบแจ้งหนี้ทางอีเมล
          </h1>
          <button
            className="p-2 hover:bg-blue-700 rounded-full"
            title="ปิด"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {invoiceData && (
            <div className="mb-6 bg-blue-50 p-4 rounded-md">
              <h2 className="font-medium text-gray-800 mb-1">
                ข้อมูลใบแจ้งหนี้: {invoiceData.id}
              </h2>
              <p className="text-sm text-gray-600">
                ลูกค้า: {invoiceData.customer}
              </p>
              <p className="text-sm text-gray-600">
                จำนวนเงิน: ฿{invoiceData.amount?.toLocaleString("th-TH")}
              </p>
            </div>
          )}

          <div className="space-y-4">
            {/* อีเมลผู้ส่ง */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                จาก (อีเมลผู้ส่ง)
              </label>
              <input
                type="email"
                name="from"
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                value={formData.from}
                disabled
              />
            </div>

            {/* อีเมลผู้รับ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ถึง (อีเมลผู้รับ) <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="to"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.to}
                onChange={handleChange}
                placeholder="อีเมลผู้รับ"
                required
              />
            </div>

            {/* หัวข้ออีเมล */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                หัวข้ออีเมล
              </label>
              <input
                type="text"
                name="subject"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.subject}
                onChange={handleChange}
                placeholder="หัวข้ออีเมล"
              />
            </div>

            {/* ข้อความเพิ่มเติม */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ข้อความเพิ่มเติม
              </label>
              <textarea
                name="message"
                rows="5"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.message}
                onChange={handleChange}
                placeholder="ข้อความเพิ่มเติมที่ต้องการแจ้งลูกค้า"
              ></textarea>
            </div>

            {/* ตัวเลือกไฟล์แนบ */}
            {/* <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
              <h3 className="font-medium text-gray-800 mb-2">ไฟล์แนบ</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="attach-invoice-pdf"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    defaultChecked
                  />
                  <label
                    htmlFor="attach-invoice-pdf"
                    className="ml-2 text-sm text-gray-700"
                  >
                    แนบไฟล์ PDF ใบแจ้งหนี้
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="attach-payment-info"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    defaultChecked
                  />
                  <label
                    htmlFor="attach-payment-info"
                    className="ml-2 text-sm text-gray-700"
                  >
                    แนบข้อมูลการชำระเงิน
                  </label>
                </div>
              </div>
            </div> */}
          </div>

          {/* Buttons */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <Send size={16} className="mr-2" />
              ส่งอีเมล
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendEmail;
