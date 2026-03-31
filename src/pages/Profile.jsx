import React, { useEffect, useState } from "react";
import { User, Phone, Shield, Crown, CalendarClock, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../store/slice/authSlice";
import { useGetProfileQuery } from "../store/Api/profileApi";
import { useRechargeSubscriptionMutation, useGetAllSubscriptionsQuery } from "../store/Api/subscriptionApi";
import { useVerifyPaymentMutation } from "../store/Api/loginApi";
import Layout from "../components/layout/Layout";
import { toast } from "react-toastify";
import { ScaleLoader } from "react-spinners";

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [adminUser, setAdminUser] = useState(null);
  
  const { data: profileData, isLoading } = useGetProfileQuery();
  const [rechargeSubscription, { isLoading: isRecharging }] = useRechargeSubscriptionMutation();
  const [verifyPayment] = useVerifyPaymentMutation();
  const { data: plansData } = useGetAllSubscriptionsQuery();
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("adminUser");
    if (storedUser) {
      setAdminUser(JSON.parse(storedUser));
    }
  }, []);

  

  const handleLogout = () => {
  setShowLogoutModal(true);
};

const confirmLogout = async () => {
  try {
    setIsLoggingOut(true);

    await new Promise((res) => setTimeout(res, 800));

    dispatch(logout());

    toast.success("Logged out successfully!");

    setTimeout(() => {
      navigate("/", { replace: true });
    }, 1200);

  } catch (error) {
    toast.error("Logout failed. Try again.");
  } finally {
    setIsLoggingOut(false);
    setShowLogoutModal(false);
  }
};

const cancelLogout = () => {
  setShowLogoutModal(false);
};

  const displayUser = profileData?.user || adminUser;
  const subscription = profileData?.subscription;
  const needsRecharge = !subscription || subscription.daysRemaining <= 5;

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const isSuperAdmin = displayUser?.role === "SUPER_ADMIN";

  const handleRecharge = async () => {
    try {
      const payload = selectedPlanId ? { planId: selectedPlanId } : {};
      const res = await rechargeSubscription(payload).unwrap();
      
      // Based on the actual backend response, the Razorpay details are directly in `res.data`
      const paymentData = res?.data?.payment || res?.data || res?.payment;
      const orderId = paymentData?.orderId || paymentData?.order?.id;
      const razorpayKey = paymentData?.keyId || paymentData?.key || import.meta.env.VITE_RAZORPAY_KEY_ID;

      if (!orderId) {
        toast.success("Subscription updated successfully!");
        window.location.reload();
        return;
      }
      
      if (!razorpayKey) {
        toast.error("Razorpay key is missing!");
        return;
      }

      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        toast.error("Razorpay SDK failed to load.");
        return;
      }

      const options = {
        key: razorpayKey,
        amount: paymentData?.amount || res?.amount,
        currency: paymentData?.currency || res?.currency || "INR",
        name: "Hotel Management",
        description: `Recharge Subscription - ${paymentData?.planName || "Plan"}`,
        order_id: orderId,
        handler: async function (response) {
          try {
             await verifyPayment({
               razorpay_order_id: response.razorpay_order_id,
               razorpay_payment_id: response.razorpay_payment_id,
               razorpay_signature: response.razorpay_signature,
               // Sending token if required
               token: res.token || localStorage.getItem("adminToken"),
             }).unwrap();
             toast.success("Recharge successful!");
             setTimeout(() => window.location.reload(), 1500);
          } catch (err) {
             console.error("Payment verification failed", err);
             toast.error("Payment verification failed.");
          }
        },
        prefill: {
          name: displayUser?.name,
          email: displayUser?.email,
          contact: displayUser?.phone,
        },
        theme: { color: "#0f172a" },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
       console.error("Recharge failed", error);
       toast.error(error?.data?.message || "Recharge failed. Please try again.");
    }
  };

  const getDaysRemaining = (endDate) => {
  if (!endDate) return 0;

  const today = new Date();
  const end = new Date(endDate);

  // Remove time for accurate day calculation
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const diffTime = end - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
};

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6 md:p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">My Profile</h2>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header Banner */}
          <div className="h-32 bg-gradient-to-r from-[#0B1F3A] to-blue-900 border-b relative">
             <div className="absolute -bottom-12 left-8 w-24 h-24 rounded-full bg-white flex items-center justify-center p-1 shadow-md">
                 <div className="w-full h-full rounded-full bg-blue-100 text-blue-600 flex items-center justify-center overflow-hidden">
                    <User size={48} />
                 </div>
             </div>
          </div>

          <div className="pt-16 pb-8 px-8 flex flex-col md:flex-row gap-8 justify-between items-start">
             {/* Info Section */}
             <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 leading-tight">
                    {displayUser?.name || "Admin"}
                  </h3>
                  <span className="text-sm font-medium text-gray-500">@{displayUser?.username || "admin"}</span>
                </div>

                <div className="flex flex-col gap-3 mt-4">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Shield size={20} className="text-gray-400" />
                    <span className="font-semibold bg-gray-100 px-3 py-1 rounded-md text-sm">{displayUser?.role?.replace("_", " ") || "No Role"}</span>
                  </div>

                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone size={20} className="text-gray-400" />
                    <span className="font-medium text-sm">{displayUser?.phone || "-"}</span>
                  </div>
                </div>
             </div>

             {/* Actions Section */}
<div className="flex flex-col gap-4 w-full md:w-auto md:min-w-[300px]">

  {/* Hide Subscription + Recharge for SUPER_ADMIN */}
  {!isSuperAdmin && (
    <>
      {/* Subscription Card */}
      {subscription && (
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-5 shadow-sm">
          
          <div className="flex items-center gap-2 mb-3 text-orange-600 font-bold">
            <Crown size={20} />
            <h4 className="tracking-wide uppercase text-xs">Subscription</h4>
          </div>

          <div>
            <p className="font-bold text-gray-900 mb-1">
              {subscription?.plan?.name || "No Plan"}
            </p>

            <p className="text-sm text-gray-600 mb-2">
              ₹{subscription?.plan?.price} / {subscription?.plan?.billingCycle}
            </p>

            <div className="flex items-center justify-between text-sm">
              <span
                className={`px-3 py-1 rounded-full font-bold text-xs ${
                  subscription?.status === "ACTIVE"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {subscription?.status}
              </span>

              <span className="flex items-center gap-1 text-xs text-gray-600 font-bold">
                <CalendarClock size={16} />
                {subscription?.daysRemaining ?? getDaysRemaining(subscription?.endDate)} days left
              </span>
            </div>

            <div className="flex flex-col gap-1 text-xs text-gray-600 font-medium mt-3 border-t border-orange-100 pt-2">
              {subscription?.startDate && (
                <div>
                  <span className="font-bold">Start:</span>{" "}
                  {new Date(subscription.startDate).toLocaleDateString()}
                </div>
              )}

              {subscription?.endDate && (
                <div>
                  <span className="font-bold">End:</span>{" "}
                  {new Date(subscription.endDate).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recharge Section */}
      {needsRecharge && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-3">
          <h4 className="text-sm font-bold text-slate-800">Recharge Subscription</h4>

          <select
            value={selectedPlanId}
            onChange={(e) => setSelectedPlanId(e.target.value)}
            className="w-full text-sm p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
          >
            <option value="">-- Choose Plan (Optional) --</option>

            {plansData?.data
              ?.filter((p) => p.isActive)
              .map((plan) => (
                <option key={plan._id} value={plan._id}>
                  {plan.name} - ₹{plan.price}
                </option>
              ))}
          </select>

          <button
            onClick={handleRecharge}
            disabled={isRecharging}
            className="w-full flex justify-center py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition disabled:opacity-70"
          >
            {isRecharging ? (
              <ScaleLoader color="#fff" height={15} width={3} radius={2} margin={2} />
            ) : (
              "Recharge Now"
            )}
          </button>
        </div>
      )}
    </>
  )}

  {/* Logout (always visible) */}
  <button
  onClick={handleLogout}
  disabled={isLoggingOut}
  className="mt-2 w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-red-500 hover:bg-red-50 text-red-600 font-semibold rounded-xl transition disabled:opacity-70"
>
  {isLoggingOut ? (
    <ScaleLoader color="#ef4444" height={15} width={3} radius={2} margin={2} />
  ) : (
    <>
      <LogOut size={20} />
      Logout
    </>
  )}
</button>

</div>
          </div>
        </div>
      </div>
      {showLogoutModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-white/20 z-50">
    <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md">
      
      <h3 className="text-lg font-bold text-gray-800 mb-3">
        Confirm Logout
      </h3>

      <p className="text-sm text-gray-600 mb-5">
        Are you sure you want to logout?
      </p>

      <div className="flex justify-end gap-3">
        <button
          onClick={cancelLogout}
          className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
        >
          Cancel
        </button>

        <button
          onClick={confirmLogout}
          className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
        >
          {isLoggingOut ? (
            <ScaleLoader color="#fff" height={12} width={3} />
          ) : (
            "Logout"
          )}
        </button>
      </div>

    </div>
  </div>
)}
    </Layout>
  );
};

export default Profile;
