   import { useState } from "react";
   import { login } from "../services/apis/auth";
   import { useNavigate } from "react-router-dom";
   import { useAuth } from "../../src/contexts/AuthContext";
   import { type ResponseLoginDTO } from "../types";
   import { type User } from "../contexts/AuthContext";

   function Login() {
     const [tenDangNhap, setTenDangNhap] = useState("");
     const [matKhau, setMatKhau] = useState("");
     const [error, setError] = useState<string>("");
     const navigate = useNavigate();
     const { setUser, setAccessToken, setRefreshToken } = useAuth();

     const handleLogin = async (e: React.FormEvent) => {
       e.preventDefault();
       setError("");
       try {
         const response: ResponseLoginDTO = await login({ username: tenDangNhap, password: matKhau });
         localStorage.setItem("accessToken", response.accessToken);
         localStorage.setItem("refreshToken", response.refreshToken);
         setAccessToken(response.accessToken);
         setRefreshToken(response.refreshToken);

         const payload = JSON.parse(atob(response.accessToken.split(".")[1]));
         const userInfo: User = {
           id: parseInt(payload.sub),
           username: tenDangNhap,
           role: payload.role || "Guest",
         };
         setUser(userInfo);
         navigate("/");
       } catch (error: any) {
         const errorMessage = error.response?.data?.error || "Đăng nhập thất bại!";
         setError(errorMessage);
         console.error("Lỗi đăng nhập:", error);
       }
     };

     return (
       <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 overflow-hidden">
         <div className="absolute inset-0 -z-10">
           <div className="absolute w-64 h-64 bg-indigo-200 opacity-20 rounded-full blur-3xl animate-pulse top-20 left-20"></div>
           <div className="absolute w-80 h-80 bg-pink-200 opacity-20 rounded-full blur-3xl animate-pulse bottom-20 right-20"></div>
         </div>

         <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md z-10">
           <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Đăng nhập</h2>
           {error && (
             <p className="text-red-500 text-center mb-4 bg-red-50 p-3 rounded-lg">{error}</p>
           )}
           <form onSubmit={handleLogin} className="space-y-6">
             <div className="relative">
               <label className="block text-sm font-medium text-gray-700 mb-2">Tên đăng nhập</label>
               <div className="flex items-center">
                 <span className="absolute left-3 text-gray-400">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path
                       strokeLinecap="round"
                       strokeLinejoin="round"
                       strokeWidth="2"
                       d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                     />
                   </svg>
                 </span>
                 <input
                   type="text"
                   value={tenDangNhap}
                   onChange={(e) => setTenDangNhap(e.target.value)}
                   className="pl-10 pr-4 py-3 w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all duration-300"
                   placeholder="Tên đăng nhập"
                   required
                   aria-label="Tên đăng nhập"
                 />
               </div>
             </div>
             <div className="relative">
               <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
               <div className="flex items-center">
                 <span className="absolute left-3 text-gray-400">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path
                       strokeLinecap="round"
                       strokeLinejoin="round"
                       strokeWidth="2"
                       d="M12 11c1.10457-0 2-0.89543 2-2 0-1.10457-0.89543-2-2-2-1.10457 0-2 0.89543-2 2 0 1.10457 0.89543 2 2 2zM12 17c-2.76142 0-5 2.23858-5 5h10c0-2.76142-2.23858-5-5-5z"
                     />
                   </svg>
                 </span>
                 <input
                   type="password"
                   value={matKhau}
                   onChange={(e) => setMatKhau(e.target.value)}
                   className="pl-10 pr-4 py-3 w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all duration-300"
                   placeholder="••••••••"
                   required
                   aria-label="Mật khẩu"
                 />
               </div>
             </div>
             <div className="flex justify-end">
               <button
                 type="submit"
                 className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition duration-300"
               >
                 Đăng nhập
               </button>
             </div>
           </form>  
           <p className="text-center text-sm text-gray-600 mt-4">
             Chưa có tài khoản?{" "}
             <a href="/register" className="text-indigo-500 hover:text-indigo-600 font-medium">
               Đăng ký
             </a>
             {" | "}
             <a href="/forgot-password" className="text-indigo-500 hover:text-indigo-600 font-medium">
               Quên mật khẩu?
             </a>
           </p>
         </div>
       </div>
     );
   }

   export default Login;
