import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BiDish } from "react-icons/bi";
import { MdOutlineLocalPhone } from "react-icons/md";
import { CiLock } from "react-icons/ci";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { useLoginUserMutation } from "../store/Api/loginApi"
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "../store/slice/authSlice";
import { ScaleLoader } from "react-spinners";
import { toast } from "react-toastify";

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});

    const token = useSelector((state) => state.auth.token);
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            navigate("/dashboard");
        }
    }, [token, navigate]);

    const [loginUser, { isLoading }] = useLoginUserMutation();

    const dispatch = useDispatch();

    const handleSubmit = async (e) => {
        e.preventDefault();

        let newErrors = {};

        if (!phone.trim()) {
            newErrors.phone = "Phone Number is required";
        }

        if (!password.trim()) {
            newErrors.password = "Password is required";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            try {
                const response = await loginUser({ phone, password }).unwrap();

                const userData = response.user;

                dispatch(
                    setCredentials({
                        token: response.token,
                        user: userData,
                    })
                );

                if (userData.hotel?._id) {
                    localStorage.setItem("hotelId", userData.hotel._id);
                } else if (userData.hotel?.id) {
                    localStorage.setItem("hotelId", userData.hotel.id);
                }

                toast.success("Login successful!");

                setTimeout(() => {
                    navigate("/dashboard");
                }, 1000);

            } catch (error) {
                console.error("Login Failed:", error);

                const errorMessage =
                    error?.data?.message || "Invalid credentials";

                setErrors({
                    ...newErrors,
                    apiError: errorMessage,
                });

                toast.error(errorMessage);
            }
        }
    };



    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-gray-100">

            {/* MOBILE TOP DESIGN */}
            <div className="lg:hidden bg-gradient-to-br from-slate-900 via-slate-800 to-orange-400 text-white text-center pt-16 pb-20 rounded-bl-4xl">
                <div className="flex justify-center mb-4">
                    <BiDish className="text-5xl" />
                </div>
                <h1 className="text-2xl font-bold">Hotel Management</h1>
                <p className="text-gray-200 mt-1">Welcome Back</p>
            </div>

            {/* DESKTOP LEFT SIDE */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-orange-400 text-white flex-col justify-center items-center p-10">
                <BiDish className="text-6xl mb-6" />
                <h1 className="text-4xl font-bold mb-3">
                    Hotel Management
                </h1>
                <p className="text-gray-200 text-lg">
                    Welcome Back
                </p>
            </div>

            {/* Form selection */}
            <div className="flex-1 flex justify-center items-start lg:items-center px-6 -mt-12 lg:mt-0">

                <div className="w-full max-w-md bg-white lg:bg-white rounded-3xl shadow-xl p-6 lg:p-8">

                    <h2 className="text-xl lg:text-2xl font-bold mb-6 lg:mb-8">
                        Login to your account
                    </h2>

                    <form className="space-y-6" onSubmit={handleSubmit}>

                        {/* Phone */}
                        <div>
                            <label className="text-sm text-gray-600">
                                Phone Number <span className="text-red-500 text-sm">*</span>
                            </label>

                            <div className={`flex items-center border rounded-xl px-4 py-3 mt-2 focus-within:border-slate-700 ${errors.phone ? "border-red-500" : "border-gray-300"
                                }`}>
                                <MdOutlineLocalPhone className="text-gray-500 text-xl mr-3" />
                                <input
                                    type="tel"
                                    placeholder="Phone Number"
                                    value={phone}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, ""); // allow only digits

                                        if (value.length <= 10) {
                                            setPhone(value);
                                            setErrors({ ...errors, phone: "" });
                                        }
                                    }}
                                    onKeyPress={(e) => {
                                        if (!/[0-9]/.test(e.key)) {
                                            e.preventDefault(); // block non-numeric keys
                                        }
                                    }}
                                    maxLength={10}
                                    className="w-full outline-none bg-transparent"
                                />

                            </div>
                            {errors.phone && (
                                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                            )}

                        </div>

                        {/* Password */}
                        <div>
                            <label className="text-sm text-gray-600">
                                Password <span className="text-red-500 text-sm">*</span>
                            </label>

                            <div className={`flex items-center border rounded-xl px-4 py-3 mt-2 focus-within:border-slate-700 ${errors.password ? "border-red-500" : "border-gray-300"
                                }`}>

                                <CiLock className="text-gray-500 text-xl mr-3" />

                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setErrors({ ...errors, password: "" });
                                    }}
                                    className="w-full outline-none bg-transparent"
                                />


                                {showPassword ? (
                                    <IoEyeOutline
                                        className="text-gray-500 text-xl cursor-pointer"
                                        onClick={() => setShowPassword(false)}
                                    />
                                ) : (
                                    <IoEyeOffOutline
                                        className="text-gray-500 text-xl cursor-pointer"
                                        onClick={() => setShowPassword(true)}
                                    />
                                )}
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                            )}

                        </div>

                        {/* Forgot Password */}
                        {/* <div className="text-right">
                            <p className="text-sm text-gray-500 hover:text-slate-700 cursor-pointer">
                                Forgot Password?
                            </p>
                        </div> */}

                        {/* Login Button */}
                        {errors.apiError && (
                            <p className="text-red-500 text-sm text-center">
                                {errors.apiError}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-2xl shadow-md transition duration-300 disabled:opacity-60 flex items-center justify-center"
                        >
                            {isLoading ? (
                                <ScaleLoader
                                    color="#ffffff"
                                    height={20}
                                    width={3}
                                    radius={2}
                                    margin={2}
                                />
                            ) : (
                                "Login"
                            )}
                        </button>


                        {/* Register */}
                        <p className="text-center text-sm text-gray-600">
                            Want to register new Hotel?{" "}
                            <span className="font-semibold text-slate-900 cursor-pointer" onClick={() => navigate("/register")}>
                                Register
                            </span>
                        </p>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
