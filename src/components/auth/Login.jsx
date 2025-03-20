import React, { useState } from "react";
import { Link } from "react-router-dom";
import logoImage from "../../assets/Logo.png";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    // ฟังก์ชันจำลองการเข้าสู่ระบบ (ในโปรเจคจริงจะเชื่อมต่อกับ API)
    console.log("Login with:", { username, password, rememberMe });
    // นำทางกลับไปยังหน้าหลักหลังจากเข้าสู่ระบบสำเร็จ
    window.location.href = "/";
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen w-full bg-blue-600 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            ล็อคอินเข้าสู่ระบบ
          </h2>
          <p className="text-sm text-gray-600 text-center">
            กรุณากรอก Username และ Password เพื่อเข้าสู่ระบบ
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="mb-4 relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={toggleShowPassword}
            >
              {showPassword ? "HIDE" : "SHOW"}
            </button>
          </div>

          <div className="flex justify-between mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <label htmlFor="rememberMe" className="text-sm text-gray-600">
                จดจำการเข้าสู่ระบบ
              </label>
            </div>

            <div>
              <a href="#" className="text-sm text-blue-600 hover:underline">
                ลืมรหัสผ่าน?
              </a>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition duration-200 font-medium"
          >
            เข้าสู่ระบบ
          </button>

          <Link
            to="/register"
            className="block w-full text-center border border-blue-600 text-blue-600 py-3 rounded-md hover:bg-blue-50 transition duration-200 font-medium mt-4"
          >
            ลงทะเบียน
          </Link>
        </form>

        <div className="mt-10 text-center text-sm text-gray-600">
          SamuiLookBooking
        </div>
      </div>
    </div>
  );
};

export default Login;
