import React, { useState } from "react";
import { Link } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    displayName: "",
    position: "",
    phone: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // ตรวจสอบชื่อ-นามสกุล
    if (!formData.fullName.trim()) {
      newErrors.fullName = "กรุณากรอกชื่อ-นามสกุล";
    }

    // ตรวจสอบอีเมล
    if (!formData.email.trim()) {
      newErrors.email = "กรุณากรอกอีเมล";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
    }

    // ตรวจสอบชื่อเล่น
    if (!formData.displayName.trim()) {
      newErrors.displayName = "กรุณากรอกชื่อเล่น";
    }

    // ตรวจสอบ username
    if (!formData.username.trim()) {
      newErrors.username = "กรุณากรอก Username";
    }

    // ตรวจสอบรหัสผ่าน
    if (!formData.password) {
      newErrors.password = "กรุณากรอกรหัสผ่าน";
    } else if (formData.password.length < 6) {
      newErrors.password = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
    }

    // ตรวจสอบยืนยันรหัสผ่าน
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "กรุณายืนยันรหัสผ่าน";
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // สำหรับตัวอย่าง แค่ log ข้อมูล
      console.log("ลงทะเบียนด้วยข้อมูล:", formData);

      // นำทางไปยังหน้าลงทะเบียนสำเร็จ
      window.location.href = "/register-success";
    }
  };

  return (
    <div className="min-h-screen w-full bg-blue-600 flex items-center justify-center py-8">
      <div className="bg-white rounded-lg p-8 w-full max-w-4xl mx-4">
        <div className="flex flex-col items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">ลงทะเบียน</h2>
          <p className="text-sm text-gray-600 text-center">
            กรุณากรอก User Name และ Password เพื่อเข้าสู่ระบบ
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* ชื่อ-นามสกุล */}
            <div>
              <div className="relative">
                <input
                  type="text"
                  name="fullName"
                  className={`w-full px-4 py-3 border ${
                    errors.fullName ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="ชื่อ-นามสกุล(ภาษาอังกฤษ)"
                  value={formData.fullName}
                  onChange={handleChange}
                />
                <span className="absolute top-0 right-0 px-2 py-1 text-red-500">
                  *
                </span>
              </div>
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* อีเมล */}
            <div>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  className={`w-full px-4 py-3 border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="อีเมล"
                  value={formData.email}
                  onChange={handleChange}
                />
                <span className="absolute top-0 right-0 px-2 py-1 text-red-500">
                  *
                </span>
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* ชื่อเล่น */}
            <div>
              <div className="relative">
                <input
                  type="text"
                  name="displayName"
                  className={`w-full px-4 py-3 border ${
                    errors.displayName ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="ชื่อเล่น(ภาษาอังกฤษ)"
                  value={formData.displayName}
                  onChange={handleChange}
                />
                <span className="absolute top-0 right-0 px-2 py-1 text-red-500">
                  *
                </span>
              </div>
              {errors.displayName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.displayName}
                </p>
              )}
            </div>

            {/* Username */}
            <div>
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  className={`w-full px-4 py-3 border ${
                    errors.username ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                />
                <span className="absolute top-0 right-0 px-2 py-1 text-red-500">
                  *
                </span>
              </div>
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">{errors.username}</p>
              )}
            </div>

            {/* ตำแหน่งงาน */}
            <div>
              <input
                type="text"
                name="position"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ตำแหน่งงาน"
                value={formData.position}
                onChange={handleChange}
              />
            </div>

            {/* รหัสผ่าน */}
            <div>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  className={`w-full px-4 py-3 border ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <span className="absolute top-0 right-0 px-2 py-1 text-red-500">
                  *
                </span>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* เบอร์โทรศัพท์ */}
            <div>
              <input
                type="text"
                name="phone"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="เบอร์โทรศัพท์"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            {/* ยืนยันรหัสผ่าน */}
            <div>
              <div className="relative">
                <input
                  type="password"
                  name="confirmPassword"
                  className={`w-full px-4 py-3 border ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <span className="absolute top-0 right-0 px-2 py-1 text-red-500">
                  *
                </span>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition duration-200 font-medium"
            >
              ลงทะเบียน
            </button>
          </div>
        </form>

        <div className="mt-10 text-center text-sm text-gray-600">
          SamuiLookBooking
        </div>
      </div>
    </div>
  );
};

export default Register;
