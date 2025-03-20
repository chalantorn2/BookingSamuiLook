import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const RegisterSuccess = () => {
  return (
    <div className="min-h-screen w-full bg-blue-600 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 w-full max-w-md flex flex-col items-center">
        <div className="bg-green-500 rounded-full p-5 mb-6 text-white">
          <CheckCircle size={48} />
        </div>

        <h2 className="text-3xl font-bold text-center mb-4">ลงทะเบียนสำเร็จ</h2>

        <p className="text-sm text-gray-600 text-center mb-8">
          ระบบได้รับข้อมูลของคุณเรียบร้อยแล้ว
          กรุณารอการตรวจสอบและอนุมัติจากแอดมิน <br />
          ติดต่อแอดมิน โทร:063 515 3933
        </p>

        <Link
          to="/login"
          className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition duration-200 font-medium text-center"
        >
          เข้าสู่ระบบ
        </Link>

        <div className="mt-10 text-center text-sm text-gray-600">
          SamuiLookBooking
        </div>
      </div>
    </div>
  );
};

export default RegisterSuccess;
