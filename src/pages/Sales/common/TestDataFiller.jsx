// src/components/common/TestDataFiller.jsx
import React, { useState } from "react";

/**
 * TestDataFiller - Component สำหรับเติมข้อมูลทดสอบอัตโนมัติในฟอร์ม
 *
 * @param {Object} props
 * @param {Function} props.fillTestData - Function สำหรับเติมข้อมูลทดสอบ
 * @param {Array} props.testDataSets - ชุดข้อมูลทดสอบหลายชุด (ถ้ามี)
 */
const TestDataFiller = ({ fillTestData, testDataSets }) => {
  const [expanded, setExpanded] = useState(false);

  // สร้างข้อมูลตัวอย่างพื้นฐานหากไม่มีการส่ง testDataSets มา
  const defaultTestDataSets = testDataSets || [
    { name: "ชุดข้อมูลพื้นฐาน", action: () => fillTestData() },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {expanded ? (
        <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-800">
              เติมข้อมูลทดสอบ
            </h3>
            <button
              onClick={() => setExpanded(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="space-y-2">
            {defaultTestDataSets.map((dataset, index) => (
              <button
                key={index}
                onClick={dataset.action}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                  <path d="M9 14l2 2 4-4"></path>
                </svg>
                {dataset.name}
              </button>
            ))}
          </div>

          <div className="text-xs text-gray-500 mt-2 italic">
            * ใช้เฉพาะการทดสอบในสภาพแวดล้อมพัฒนาเท่านั้น
          </div>
        </div>
      ) : (
        <button
          onClick={() => setExpanded(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg flex items-center justify-center"
          title="เติมข้อมูลทดสอบ"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            <path d="M12 11v6"></path>
            <path d="M9 14h6"></path>
          </svg>
        </button>
      )}
    </div>
  );
};

export default TestDataFiller;
