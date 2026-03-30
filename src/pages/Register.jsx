import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BiDish } from "react-icons/bi";
import { CiUser, CiLock } from "react-icons/ci";
import { SlEnvolope } from "react-icons/sl";
import { RiHotelLine } from "react-icons/ri";
import { MdOutlineLocalPhone, MdLocationOn } from "react-icons/md";
import { FaCity, FaUserShield } from "react-icons/fa";
import { GiWorld } from "react-icons/gi";
import { useGetAllSubscriptionsQuery } from "../store/Api/subscriptionApi";
import { useRegisterHotelMutation, useVerifyPaymentMutation } from "../store/Api/loginApi";

const Register = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const { data: plansData, isLoading: isLoadingPlans } = useGetAllSubscriptionsQuery();
    const [registerHotel, { isLoading: isRegistering }] = useRegisterHotelMutation();
    const [verifyPayment, { isLoading: isVerifying }] = useVerifyPaymentMutation();

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const [formData, setFormData] = useState({
        name: "",
        address: "",
        city: "",
        country: "",
        phone: "",
        email: "",
        adminUserName: "",
        adminPassword: "",
        adminConfirmPassword: "",
        adminName: "",
        planId: ""
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.adminPassword !== formData.adminConfirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        if (!formData.planId) {
            alert("Please select a subscription plan.");
            return;
        }

        try {
            // Mapping fields exactly to match backend payload requirements
            const payload = {
                name: formData.name,
                address: formData.address,
                city: formData.city,
                country: formData.country,
                phone: formData.phone,
                email: formData.email,
                adminUsername: formData.adminUserName,
                adminPassword: formData.adminPassword,
                adminName: formData.adminName,
                planId: formData.planId
            };

            const res = await registerHotel(payload).unwrap();

            // Debug: log full response to identify exact field names
            // console.log("Register API response:", JSON.stringify(res, null, 2));

            // Extract Razorpay payment details from correct path: res.data.payment
            const payment = res.data?.payment;
            const orderId = payment?.orderId;
            const razorpayKey = payment?.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID;

            if (orderId) {
                const isLoaded = await loadRazorpay();
                if (!isLoaded) {
                    alert("Razorpay SDK failed to load. Please check your connection.");
                    return;
                }

                const options = {
                    key: razorpayKey,
                    amount: payment?.amount,
                    currency: payment?.currency || "INR",
                    name: "Hotel Management",
                    description: `Subscription - ${payment?.planName || "Plan"}`,
                    order_id: orderId,
                    handler: async function (response) {
                        try {
                            await verifyPayment({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                token: res.token,
                            }).unwrap();
                            alert("Registration and payment successful!");
                            navigate("/");
                        } catch (err) {
                            console.error("Payment verification failed", err);
                            alert("Payment verification failed. Please contact support.");
                        }
                    },
                    prefill: {
                        name: formData.adminName,
                        email: formData.email,
                        contact: formData.phone,
                    },
                    theme: {
                        color: "#0f172a",
                    },
                };

                const paymentObject = new window.Razorpay(options);
                paymentObject.open();

            } else {
                alert("Registered successfully!");
                navigate("/");
            }

        } catch (error) {
            console.error("Registration failed:", error);
            alert(error?.data?.message || "Registration failed. Please try again.");
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-gray-100">

            {/* MOBILE TOP */}
            <div className="lg:hidden bg-gradient-to-br from-slate-900 via-slate-800 to-orange-400 text-white text-center pt-16 pb-20 rounded-bl-[40px]">
                <div className="flex justify-center mb-4">
                    <BiDish className="text-5xl" />
                </div>
                <h1 className="text-2xl font-bold">Create Account</h1>
                <p className="text-gray-200 mt-1">Join our management system.</p>
            </div>

            {/* DESKTOP LEFT */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-orange-400 text-white flex-col justify-center items-center p-10">
                <h1 className="text-4xl font-bold mb-3">Create Account</h1>
                <p className="text-gray-200 text-lg">
                    Join our management system.
                </p>
            </div>

            {/* FORM */}
            <div className="flex-1 flex justify-center items-start lg:items-center px-4 -mt-10 lg:mt-0">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-xl hover:shadow-2xl transition duration-300 p-6 lg:p-7">

                    <h2 className="text-lg lg:text-xl font-bold mb-4">
                        {step === 1 ? "Hotel Details" : "Admin Details"}
                    </h2>

                    {/* STEP INDICATOR */}
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center w-full">
                            <div className={`w-10 h-10 flex items-center justify-center rounded-full text-white text-sm shadow-md ${step === 1 ? "bg-slate-900" : "bg-green-500"}`}>
                                1
                            </div>
                            <div className={`flex-1 h-1 rounded-full ${step === 2 ? "bg-slate-900" : "bg-gray-300"}`} />
                            <div className={`w-10 h-10 flex items-center justify-center rounded-full text-white text-sm shadow-md ${step === 2 ? "bg-slate-900" : "bg-gray-300"}`}>
                                2
                            </div>
                        </div>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>

                        <div className="bg-gray-50 rounded-3xl p-4 transition-all duration-300">

                            {/* STEP 1 */}
                            {step === 1 && (
                                <>
                                    <p className="text-xs text-gray-400 mb-2">Hotel Information</p>

                                    {/* Hotel Name */}
                                    <div>
                                        <label className="text-xs text-gray-500 font-medium">Hotel Name</label>
                                        <div className="relative mt-1">
                                            <RiHotelLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Enter Hotel Name"
                                                className="w-full border rounded-xl pl-10 pr-3 py-2.5 text-sm border-gray-300 focus:ring-2 focus:ring-slate-800 transition"
                                            />
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div>
                                        <label className="text-xs text-gray-500 font-medium">Address</label>
                                        <div className="relative mt-1">
                                            <MdLocationOn className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                placeholder="Enter Address"
                                                className="w-full border rounded-xl pl-10 pr-3 py-2.5 text-sm border-gray-300 focus:ring-2 focus:ring-slate-800 transition"
                                            />
                                        </div>
                                    </div>

                                    {/* City */}
                                    <div>
                                        <label className="text-xs text-gray-500 font-medium">City</label>
                                        <div className="relative mt-1">
                                            <FaCity className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                placeholder="Enter City"
                                                className="w-full border rounded-xl pl-10 pr-3 py-2.5 text-sm border-gray-300 focus:ring-2 focus:ring-slate-800 transition"
                                            />
                                        </div>
                                    </div>

                                    {/* Country */}
                                    <div>
                                        <label className="text-xs text-gray-500 font-medium">Country</label>
                                        <div className="relative mt-1">
                                            <GiWorld className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                            <input
                                                type="text"
                                                name="country"
                                                value={formData.country}
                                                onChange={handleChange}
                                                placeholder="Enter Country"
                                                className="w-full border rounded-xl pl-10 pr-3 py-2.5 text-sm border-gray-300 focus:ring-2 focus:ring-slate-800 transition"
                                            />
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="text-xs text-gray-500 font-medium">Phone</label>
                                        <div className="relative mt-1">
                                            <MdOutlineLocalPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                            <input
                                                type="text"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="Enter Phone Number"
                                                className="w-full border rounded-xl pl-10 pr-3 py-2.5 text-sm border-gray-300 focus:ring-2 focus:ring-slate-800 transition"
                                            />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="text-xs text-gray-500 font-medium">Email</label>
                                        <div className="relative mt-1">
                                            <SlEnvolope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="Enter Email"
                                                className="w-full border rounded-xl pl-10 pr-3 py-2.5 text-sm border-gray-300 focus:ring-2 focus:ring-slate-800 transition"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        className="w-full bg-slate-900 hover:bg-slate-800 transform hover:scale-[1.03] active:scale-[0.98] transition text-white py-2.5 rounded-xl mt-4 shadow-md"
                                    >
                                        Next →
                                    </button>
                                </>
                            )}

                            {/* STEP 2 */}
                            {step === 2 && (
                                <>
                                    <p className="text-xs text-gray-400 mb-2">Admin Credentials</p>

                                    {/* Admin Name */}
                                    <div>
                                        <label className="text-xs text-gray-500 font-medium">Admin Name</label>
                                        <div className="relative mt-1">
                                            <CiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                            <input
                                                type="text"
                                                name="adminName"
                                                value={formData.adminName}
                                                onChange={handleChange}
                                                placeholder="Enter Admin Name"
                                                className="w-full border rounded-xl pl-10 pr-3 py-2.5 text-sm border-gray-300 focus:ring-2 focus:ring-slate-800 transition"
                                            />
                                        </div>
                                    </div>

                                    {/* Username */}
                                    <div>
                                        <label className="text-xs text-gray-500 font-medium">Admin Username</label>
                                        <div className="relative mt-1">
                                            <FaUserShield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                            <input
                                                type="text"
                                                name="adminUserName"
                                                value={formData.adminUserName}
                                                onChange={handleChange}
                                                placeholder="Enter Username"
                                                className="w-full border rounded-xl pl-10 pr-3 py-2.5 text-sm border-gray-300 focus:ring-2 focus:ring-slate-800 transition"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs text-gray-500 font-medium">Admin Password</label>
                                        <div className="relative mt-1">
                                            <CiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                            <input
                                                type="password"
                                                name="adminPassword"
                                                value={formData.adminPassword}
                                                onChange={handleChange}
                                                placeholder="Enter Password"
                                                className="w-full border rounded-xl pl-10 pr-3 py-2.5 text-sm border-gray-300 focus:ring-2 focus:ring-slate-800 transition"
                                            />
                                        </div>
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label className="text-xs text-gray-500 font-medium">Confirm Password</label>
                                        <div className="relative mt-1">
                                            <CiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                            <input
                                                type="password"
                                                name="adminConfirmPassword"
                                                value={formData.adminConfirmPassword}
                                                onChange={handleChange}
                                                placeholder="Confirm Password"
                                                className="w-full border rounded-xl pl-10 pr-3 py-2.5 text-sm border-gray-300 focus:ring-2 focus:ring-slate-800 transition"
                                            />
                                        </div>
                                    </div>

                                    {/* Plan Dropdown */}
                                    <div>
                                        <label className="text-xs text-gray-500 font-medium">Subscription Plan</label>
                                        <div className="relative mt-1">
                                            <select
                                                name="planId"
                                                value={formData.planId}
                                                onChange={handleChange}
                                                className="w-full border rounded-xl px-3 py-2.5 text-sm border-gray-300 focus:ring-2 focus:ring-slate-800 transition bg-white"
                                            >
                                                <option value="" disabled>Select a Plan</option>
                                                {plansData?.data?.map((plan) => (
                                                    <option key={plan._id} value={plan._id}>
                                                        {plan.name} {plan.price > 0 ? `(₹${plan.price})` : '(Free Trial)'}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-4">
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="w-1/2 bg-gray-400 hover:bg-gray-500 transform hover:scale-[1.03] active:scale-[0.98] transition text-white py-2.5 rounded-xl"
                                        >
                                            ← Back
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={isRegistering || isVerifying}
                                            className="w-1/2 bg-slate-900 hover:bg-slate-800 transform hover:scale-[1.03] active:scale-[0.98] transition text-white py-2.5 rounded-xl shadow-md disabled:opacity-70"
                                        >
                                            {isRegistering ? "Registering..." : isVerifying ? "Verifying..." : "Register & Pay"}
                                        </button>
                                    </div>
                                </>
                            )}

                        </div>
                        {/* Register */}
                        <p className="text-center text-sm text-gray-600">
                            Already Registered Hotel?{" "}
                            <span className="font-semibold text-slate-900 cursor-pointer" onClick={() => navigate("/")}>
                                Login
                            </span>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;