import React, { useRef } from "react";
import { X, Printer } from "lucide-react";
import logo from "../../../assets/Logo.png"; // อย่าลืมปรับเส้นทางให้ถูกต้อง
import "./PrintInvoice.css"; // นำเข้าไฟล์ CSS

const PrintInvoice = ({ invoiceData, onClose }) => {
  const printRef = useRef();

  // ฟังก์ชันสำหรับการพิมพ์
  const handlePrint = () => {
    const printContent = printRef.current;

    // สร้าง iframe สำหรับการพิมพ์
    const printFrame = document.createElement("iframe");
    printFrame.style.position = "absolute";
    printFrame.style.top = "-9999px";
    printFrame.style.left = "-9999px";
    document.body.appendChild(printFrame);

    // สร้างเนื้อหาสำหรับ iframe
    const frameDocument =
      printFrame.contentDocument || printFrame.contentWindow.document;
    frameDocument.open();

    // แทรก CSS ลงไปใน iframe
    const styles = document.querySelectorAll('link[rel="stylesheet"], style');
    let stylesContent = "";
    styles.forEach((style) => {
      stylesContent += style.outerHTML;
    });

    // สร้าง HTML ที่จะพิมพ์
    frameDocument.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>พิมพ์ใบแจ้งหนี้</title>
          ${stylesContent}
          <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        </head>
        <body>
          <div class="invoice-document">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);

    frameDocument.close();

    // รอให้แสดงผลเสร็จแล้วค่อยพิมพ์
    setTimeout(() => {
      printFrame.contentWindow.focus();
      printFrame.contentWindow.print();

      // ลบ iframe หลังจากพิมพ์เสร็จ
      setTimeout(() => {
        document.body.removeChild(printFrame);
      }, 1000);
    }, 500);
  };

  if (!invoiceData) return null;

  return (
    <div className="fixed inset-0 bg-black modal-backdrop flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
          <h1 className="text-xl font-bold">
            พิมพ์ใบแจ้งหนี้ #{invoiceData.id}
          </h1>
          <div className="flex space-x-2">
            <button
              className="px-4 py-2 bg-green-500 text-white rounded-md flex items-center hover:bg-green-600 transition-colors"
              onClick={handlePrint}
            >
              <Printer size={16} className="mr-2" />
              พิมพ์
            </button>
            <button
              className="p-2 hover:bg-blue-700 rounded-full"
              title="ปิด"
              onClick={onClose}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Print Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div ref={printRef} className="bg-white p-8 min-h-[1000px]">
            {/* Invoice Template */}
            <div className="invoice-document">
              {/* Header */}
              <div className="flex justify-between border-b-4 border-yellow-500 pb-2">
                {/* Company Info */}
                <div className="flex items-start">
                  <img
                    src={logo}
                    alt="Samui Look Logo"
                    className="w-24 h-auto mr-4"
                  />
                  <div>
                    <h1 className="text-xl font-bold text-purple-900">
                      บริษัท สมุย ลุค จำกัด
                    </h1>
                    <p className="text-sm">
                      63/27 ม.3 ต.บ่อผุด อ.เกาะสมุย จ.สุราษฎร์ธานี 84320
                    </p>
                    <p className="text-sm">
                      โทร 077-950550 Email: samuilook@yahoo.com
                    </p>
                    <p className="text-sm">
                      เลขประจำตัวผู้เสียภาษี 0845545002700
                    </p>
                  </div>
                </div>

                {/* Invoice Title */}
                <div className="w-64 bg-yellow-500 p-6 text-center">
                  <h2 className="text-2xl font-bold text-white">ใบแจ้งหนี้</h2>
                  <h2 className="text-2xl font-bold text-white">Invoice</h2>
                </div>
              </div>

              {/* Customer and Invoice Info */}
              <div className="mt-6 border rounded-lg p-6 grid grid-cols-2 gap-6">
                {/* Customer Info */}
                <div>
                  <div className="grid grid-cols-[120px_1fr] gap-2 mb-2">
                    <span className="font-bold">ลูกค้า:</span>
                    <span>
                      {invoiceData.customer?.name || "บริษัท Rimberio"}
                    </span>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-2 mb-2">
                    <span className="font-bold">ที่อยู่:</span>
                    <span>
                      {invoiceData.customer?.address ||
                        "123 Anywhere St., Any City, ST 12345"}
                    </span>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-2 mb-2">
                    <span className="font-bold">เบอร์โทร:</span>
                    <span>
                      {invoiceData.customer?.phone || "+123-456-7890"}
                    </span>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <span className="font-bold">เลขประจำตัวผู้เสียภาษี:</span>
                    <span>{invoiceData.customer?.taxId || "1234567890"}</span>
                  </div>
                </div>

                {/* Invoice Info */}
                <div>
                  <div className="grid grid-cols-[150px_1fr] gap-2 mb-2">
                    <span className="font-bold">เลขที่:</span>
                    <span>
                      {invoiceData.reference ||
                        invoiceData.id ||
                        "PO-25-1-0001"}
                    </span>
                  </div>
                  <div className="grid grid-cols-[150px_1fr] gap-2 mb-2">
                    <span className="font-bold">วันที่:</span>
                    <span>{invoiceData.date || "12/12/2025"}</span>
                  </div>
                  <div className="grid grid-cols-[150px_1fr] gap-2 mb-2">
                    <span className="font-bold">วันที่ครบกำหนด:</span>
                    <span>{invoiceData.dueDate || "13/12/2025"}</span>
                  </div>
                  <div className="grid grid-cols-[150px_1fr] gap-2">
                    <span className="font-bold">Sale /Staff</span>
                    <span>{invoiceData.salesPerson || "Nisarat"}</span>
                  </div>
                </div>
              </div>

              {/* Invoice Items */}
              <div className="mt-6">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-t-2 border-b-2 border-black">
                      <th className="p-2 text-left">รายละเอียด</th>
                      <th className="p-2 text-center">จำนวน</th>
                      <th className="p-2 text-right">ราคาต่อหน่วย</th>
                      <th className="p-2 text-right">รวมเป็นเงิน</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* ผู้โดยสาร */}
                    <tr>
                      <td className="p-2 font-bold">NAME /ชื่อผู้โดยสาร</td>
                      <td className="p-2"></td>
                      <td className="p-2"></td>
                      <td className="p-2"></td>
                    </tr>

                    {/* รายชื่อผู้โดยสาร */}
                    {invoiceData.items &&
                      invoiceData.items[0]?.passengers &&
                      invoiceData.items[0].passengers.map(
                        (passenger, index) => (
                          <tr key={index}>
                            <td className="p-2 pl-6">
                              {index + 1}. {passenger}
                            </td>
                            <td className="p-2"></td>
                            <td className="p-2"></td>
                            <td className="p-2"></td>
                          </tr>
                        )
                      )}

                    {/* ตั๋วเครื่องบิน */}
                    <tr>
                      <td className="p-2 font-bold">
                        AIR TICKET /ตั๋วเครื่องบิน
                      </td>
                      <td className="p-2"></td>
                      <td className="p-2"></td>
                      <td className="p-2"></td>
                    </tr>

                    {/* รายการตั๋ว */}
                    {invoiceData.items &&
                      invoiceData.items.map((item, index) => {
                        if (item && item.type === "flight") {
                          const flightDetails = item.details
                            ? item.details.split("|")[0].trim()
                            : item.description;
                          return (
                            <tr key={`flight-${index}`}>
                              <td className="p-2 pl-6">{flightDetails}</td>
                              <td className="p-2 text-center">
                                {item.quantity} (Adult)
                              </td>
                              <td className="p-2 text-right">
                                {Number(item.unitPrice).toLocaleString()}.-
                              </td>
                              <td className="p-2 text-right">
                                {Number(item.amount).toLocaleString()}.-
                              </td>
                            </tr>
                          );
                        }
                        return null;
                      })}

                    {/* รายการอื่นๆ */}
                    <tr>
                      <td className="p-2 font-bold">Other</td>
                      <td className="p-2"></td>
                      <td className="p-2"></td>
                      <td className="p-2"></td>
                    </tr>

                    {invoiceData.items &&
                      invoiceData.items.map((item, index) => {
                        if (item && item.type !== "flight") {
                          return (
                            <tr key={`other-${index}`}>
                              <td className="p-2 pl-6">{item.description}</td>
                              <td className="p-2 text-center">
                                {item.quantity}
                              </td>
                              <td className="p-2 text-right">
                                {Number(item.unitPrice).toLocaleString()}.-
                              </td>
                              <td className="p-2 text-right">
                                {Number(item.amount).toLocaleString()}.-
                              </td>
                            </tr>
                          );
                        }
                        return null;
                      })}

                    {/* ข้อมูลเพิ่มเติม */}
                    <tr>
                      <td className="p-2 font-bold">Remark</td>
                      <td className="p-2"></td>
                      <td className="p-2 text-right">ราคารวมสินค้า (บาท)</td>
                      <td className="p-2 text-right">
                        {invoiceData.summary &&
                          Number(
                            invoiceData.summary.subtotal || 0
                          ).toLocaleString()}
                        .-
                      </td>
                    </tr>

                    <tr>
                      <td className="p-2" colSpan="2"></td>
                      <td className="p-2 text-right">
                        ภาษีมูลค่าเพิ่ม{" "}
                        {(invoiceData.summary &&
                          invoiceData.summary.vatPercent) ||
                          0}
                        %
                      </td>
                      <td className="p-2 text-right">
                        {invoiceData.summary &&
                          Number(invoiceData.summary.vat || 0).toLocaleString()}
                        .-
                      </td>
                    </tr>

                    <tr>
                      <td className="p-2" colSpan="2"></td>
                      <td className="p-2 font-bold text-right border-t-2 border-black">
                        จำนวนเงินรวมทั้งสิ้น (บาท)
                      </td>
                      <td className="p-2 font-bold text-right border-t-2 border-black">
                        {invoiceData.summary &&
                          Number(
                            invoiceData.summary.total || 0
                          ).toLocaleString()}
                        .-
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Payment Info and Signatures */}
              <div className="mt-4">
                <h3 className="font-bold mb-2">ข้อมูลการชำระเงิน</h3>
                <p className="mb-1">- ชื่อบัญชี คิมเบอร์ลี่ เหงียน</p>
                <p className="mb-1">- ธนาคาร Larana เลขที่บัญชี 0123456789</p>
                <p className="mb-1">- ชื่อบัญชี คิมเบอร์ลี่ เหงียน</p>
                <p>- ธนาคาร Borcelle เลขที่บัญชี 0123456789</p>

                <div className="mt-4 grid grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className="border-b border-gray-500 pb-4 mb-2">
                      <p>อนุมัติโดย</p>
                    </div>
                    <p>วันที่: 20/11/2035</p>
                  </div>
                  <div className="text-center">
                    <div className="border-b border-gray-500 pb-4 mb-2">
                      <p>ผู้ว่าจ้าง</p>
                    </div>
                    <p>วันที่: 20/11/2035</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-4 text-right">
                <p>หน้า 1/1</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintInvoice;
