import { useState } from "react";
import Layout from "../../components/layout/Layout";
import StatCard from "../../components/cards/StatCard";
import { IndianRupee, Calendar, Layers } from "lucide-react";
import { useGetAllSubscriptionsQuery, useAddplansMutation, useUpdatePlanStatusMutation } from "../../store/Api/subscriptionApi";
import { ScaleLoader } from "react-spinners";



/* ================= STATIC DATA ================= */
// const initialPlans = [
//     {
//         id: 1,
//         name: "Basic Plan",
//         price: 499,
//         duration: "15 Days",
//         features: ["Access to menu", "Basic support"],
//         status: "Active",
//     },
//     {
//         id: 2,
//         name: "Premium Plan",
//         price: 999,
//         duration: "1 Month",
//         features: ["Priority support", "Analytics", "Unlimited orders"],
//         status: "Active",
//     },
//     {
//         id: 3,
//         name: "Gold Plan",
//         price: 1499,
//         duration: "3 Months",
//         features: ["All Premium features", "Dedicated manager"],
//         status: "Inactive",
//     },
// ];

/* ================= COMPONENT ================= */

const Subscriptions = () => {
    const [openModal, setOpenModal] = useState(false);

    const [form, setForm] = useState({
        name: "",
        planType: "main",
        description: "",
        price: "",
        billingCycle: "",
        trialDays: 0,
    });

    const { data, isLoading, isError } = useGetAllSubscriptionsQuery();

    const plans = data?.data || [];

    const [addPlan, { isLoading: isAdding }] = useAddplansMutation();
    const [updatePlanStatus] = useUpdatePlanStatusMutation();

    /* ================= STATS ================= */
    const stats = [
        {
            title: "Total Plans",
            value: plans.length,
            icon: Layers,
            bg: "#EEF2FF",
        },
        {
            title: "Active Plans",
            value: plans.filter((p) => p.isActive).length,
            icon: Calendar,
            bg: "#E6F9F0",
        },
        {
            title: "Highest Price",
            value: `₹${Math.max(...plans.map((p) => p.price || 0))}`,
            icon: IndianRupee,
            bg: "#F3EEFE",
        },
    ];

    /* ================= ADD PLAN ================= */
    const handleAdd = async () => {
        try {
            const payload = {
                name: form.name,
                planType: form.planType,
                description: form.description,
                price: form.planType === "trial" ? 0 : Number(form.price), // ✅ force
                billingCycle: form.billingCycle,
                trialDays: form.trialDays,
            };

            await addPlan(payload).unwrap();

            setOpenModal(false);

            setForm({
                name: "",
                planType: "main",
                description: "",
                price: "",
                billingCycle: "",
                trialDays: 0,
            });

        } catch (error) {
            console.error("Error adding plan:", error);
        }
    };

    const handlePlanTypeChange = (value) => {
        if (value === "trial") {
            setForm((prev) => ({
                ...prev,
                planType: "trial",
                price: 0,              // always 0
                billingCycle: "NONE",
                trialDays: 30,
            }));
        } else {
            setForm((prev) => ({
                ...prev,
                planType: "main",
                price: "",
                billingCycle: "",
                trialDays: 0,
            }));
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            await updatePlanStatus({ id, isActive: !currentStatus }).unwrap();
        } catch (error) {
            console.error("Failed to toggle plan status", error);
        }
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-24 bg-gray-200 animate-pulse rounded-xl"
                        />
                    ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                            key={i}
                            className="p-5 bg-white rounded-xl shadow-sm border"
                        >
                            <div className="h-5 bg-gray-200 animate-pulse mb-3 rounded w-2/3" />
                            <div className="h-6 bg-gray-200 animate-pulse mb-2 rounded w-1/3" />
                            <div className="h-4 bg-gray-200 animate-pulse mb-2 rounded w-1/2" />
                            <div className="h-4 bg-gray-200 animate-pulse rounded w-full" />
                        </div>
                    ))}
                </div>
            </Layout>
        );
    }
    if (isError) return <p className="p-5 text-red-500">Error loading plans</p>;

    return (
        <Layout>
            {/* ================= STATS ================= */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {stats.map((item, i) => (
                    <StatCard key={i} {...item} />
                ))}
            </div>

            {/* ================= HEADER ================= */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                    Subscription Plans
                </h2>

                <button
                    onClick={() => setOpenModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                    + Add Plan
                </button>
            </div>

            {/* ================= CARDS ================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <div
                        key={plan._id}
                        className="bg-white rounded-xl shadow-sm p-5 border hover:shadow-md transition"
                    >
                        {/* Plan Header */}
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg font-semibold">
                                {plan.name}
                            </h3>

                            <label className="inline-flex items-center cursor-pointer">
                                <span className="text-xs mr-3">
                                    {plan.isActive ? "Active" : "Inactive"}
                                </span>

                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={plan.isActive}
                                    onChange={() => toggleStatus(plan._id, plan.isActive)}
                                />

                                <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 relative transition">
                                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></div>
                                </div>
                            </label>
                        </div>

                        {/* Price */}
                        <p className="text-2xl font-bold mb-1">
                            ₹{plan.price}
                        </p>

                        {/* Duration / Billing */}
                        <p className="text-gray-500 text-sm mb-3">
                            {plan.billingCycle === "NONE"
                                ? `${plan.trialDays} Days Trial`
                                : plan.billingCycle}
                        </p>

                        {/* Description */}
                        <ul className="text-sm text-gray-600 mb-4">
                            <li>• {plan.description}</li>
                        </ul>

                        {/* Action Buttons */}
                        <div className="flex justify-between">
                            <button className="text-blue-600 text-sm">
                                Edit
                            </button>
                            <button className="text-red-500 text-sm">
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* ================= MODAL ================= */}
            {openModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">

                    {/* Modal Box */}
                    <div className="bg-white w-[420px] rounded-2xl shadow-xl p-6 animate-fadeIn">

                        <h2 className="text-xl font-semibold mb-5 text-center">
                            Add Subscription Plan
                        </h2>

                        {/* Inputs */}
                        <div className="space-y-3">

                            {/* Plan Name */}
                            <div>
                                <label className="text-xs text-gray-500 ml-1">
                                    Plan Name
                                </label>
                                <input
                                    placeholder="Plan Name"
                                    className="w-full border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none p-2.5 rounded-lg"
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm({ ...form, name: e.target.value })
                                    }
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-xs text-gray-500 ml-1">
                                    Description
                                </label>
                                <input
                                    placeholder="Description"
                                    className="w-full border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none p-2.5 rounded-lg"
                                    value={form.description}
                                    onChange={(e) =>
                                        setForm({ ...form, description: e.target.value })
                                    }
                                />
                            </div>

                            {/* Plan Type */}
                            <div>
                                <label className="text-xs text-gray-500 ml-1">
                                    Plan Type
                                </label>
                                <select
                                    className="w-full border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none p-2.5 rounded-lg"
                                    value={form.planType}
                                    onChange={(e) => handlePlanTypeChange(e.target.value)}
                                >
                                    <option value="main">Main Plan</option>
                                    <option value="trial">Trial Plan</option>
                                </select>
                            </div>

                            {/* Price */}
                            {form.planType === "main" && (
                                <div>
                                    <label className="text-xs text-gray-500 ml-1">
                                        Price
                                    </label>
                                    <input
                                        placeholder="Price"
                                        type="number"
                                        className="w-full border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none p-2.5 rounded-lg"
                                        value={form.price}
                                        onChange={(e) =>
                                            setForm({ ...form, price: e.target.value })
                                        }
                                    />
                                </div>
                            )}

                            {/* Billing Cycle */}
                            {form.planType === "main" && (
                                <div>
                                    <label className="text-xs text-gray-500 ml-1">
                                        Billing Cycle
                                    </label>
                                    <select
                                        className="w-full border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none p-2.5 rounded-lg"
                                        value={form.billingCycle}
                                        onChange={(e) =>
                                            setForm({ ...form, billingCycle: e.target.value })
                                        }
                                    >
                                        <option value="">Select Billing</option>
                                        <option value="MONTHLY">Monthly</option>
                                        <option value="YEARLY">Yearly</option>
                                        <option value="QUARTERLY">Quarterly</option>
                                        <option value="HALF_YEARLY">Half Yearly</option>
                                    </select>
                                </div>
                            )}

                            {/* Trial Days */}
                            {form.planType === "trial" && (
                                <div>
                                    <label className="text-xs text-gray-500 ml-1">
                                        Trial Days
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="Trial Days"
                                        className="w-full border border-gray-300 outline-none p-2.5 rounded-lg"
                                        value={form.trialDays}
                                        onChange={(e) =>
                                            setForm({ ...form, trialDays: Number(e.target.value) })
                                        }
                                    />
                                </div>
                            )}

                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setOpenModal(false)}
                                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleAdd}
                                disabled={isAdding}
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition flex items-center justify-center"
                            >
                                {isAdding ? <ScaleLoader height={15} color="#fff" /> : "Add Plan"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Subscriptions;