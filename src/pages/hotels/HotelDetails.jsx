import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Table from "../../components/tables/Table"
import Skeleton from "../../components/ui/Skeleton"
import {
    MapPin,
    Phone,
    Mail,
    Users,
    Utensils,
    ShoppingCart,
    DollarSign,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import { useGetHotelByIdQuery } from "../../store/Api/hotelApi";
import { useNavigate } from "react-router-dom";

const StatBox = ({ icon: Icon, label, value }) => (
    <div className="border border-gray-100 rounded p-3 flex items-center gap-3 text-sm">
        <div className="w-8 h-8 flex items-center justify-center rounded bg-blue-100 text-[#24435d]">
            <Icon size={16} />
        </div>
        <div>
            <p className="text-gray-500 text-xs">{label}</p>
            <p className="font-semibold">{value}</p>
        </div>
    </div>
);

const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 bg-[#F5FAFF] p-3 rounded border border-gray-100">
        <div className="w-8 h-8 bg-[#24435d] text-white flex items-center justify-center rounded-full">
            <Icon size={16} />
        </div>
        <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-sm font-medium break-all">{value}</p>
        </div>
    </div>
);

const HotelDetails = () => {

    const navigate = useNavigate();
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState("staff");
    const [page, setPage] = useState(1);

    useEffect(() => {
        setPage(1);
    }, [activeTab]);

    const { data, isLoading, isError } = useGetHotelByIdQuery(id, {
        skip: !id,
    });

    if (isLoading) {
        return (
            <>
                <div className="bg-[#F2F8FF] min-h-screen p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                        {/* LEFT SIDE SKELETON */}
                        <div className="col-span-12 lg:col-span-4 space-y-4">

                            {/* Profile Card */}
                            <div className="bg-[#24435d] rounded p-6 text-center">
                                <Skeleton className="w-20 h-20 rounded-full mx-auto mb-3 bg-gray-400/40" />
                                <Skeleton className="h-4 w-32 mx-auto bg-gray-400/40" />
                            </div>

                            {/* Stats */}
                            <div className="bg-white p-4 rounded grid grid-cols-2 gap-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="flex gap-3 items-center">
                                        <Skeleton className="w-8 h-8 rounded" />
                                        <div className="space-y-2 w-full">
                                            <Skeleton className="h-3 w-16" />
                                            <Skeleton className="h-4 w-10" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Contact Info */}
                            <div className="bg-white p-4 rounded space-y-4">
                                <Skeleton className="h-4 w-40" />
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex gap-3">
                                        <Skeleton className="w-8 h-8 rounded-full" />
                                        <div className="space-y-2 w-full">
                                            <Skeleton className="h-3 w-20" />
                                            <Skeleton className="h-4 w-full" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT SIDE SKELETON */}
                        <div className="col-span-12 lg:col-span-8">
                            <div className="bg-white rounded-2xl shadow p-6 space-y-6">

                                {/* Tabs */}
                                <div className="flex gap-6 border-b pb-3">
                                    {[1, 2, 3, 4].map(i => (
                                        <Skeleton key={i} className="h-4 w-20" />
                                    ))}
                                </div>

                                {/* Table Skeleton */}
                                <div className="space-y-4">
                                    {[1, 2, 3, 4, 5].map((row) => (
                                        <div key={row} className="grid grid-cols-4 gap-4">
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-full" />
                                        </div>
                                    ))}
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </>
        );
    }

    if (isError) {
        return (
            <>
                <div className="flex justify-center items-center min-h-screen text-red-500">
                    Failed to load hotel details
                </div>
            </>
        );
    }

    // ✅ Extract API Data Properly
    const hotelData = data?.data?.hotel || {};
    const adminData = data?.data?.admin || {};
    const summary = data?.data?.summary || {};
    const staff = data?.data?.data?.staff || [];
    const menus = data?.data?.data?.dishes || [];
    const categories = data?.data?.data?.categories || [];
    const customers = data?.data?.data?.customers || [];
    const orders = data?.data?.data?.orders || [];

    const totalOrders = summary?.counts?.orders || 0;
    const totalRevenue = summary?.financials?.totalRevenue || 0;

    const staffColumns = [
        {
            label: "Name",
            key: "name",
            render: (row) => (
                <button
                    onClick={() => navigate(`/staff/staffdetails/${row._id}`)}
                    className="text-[#24435d] font-medium hover:underline hover:text-blue-600 transition"
                >
                    {row.profile?.name || "N/A"}
                </button>
            ),
        },
        {
            label: "Email",
            key: "email",
            render: (row) => row.profile?.email || "N/A",
        },
    ];

    const menuColumns = [
        {
            label: "Dish Name",
            key: "name",
        },
        {
            label: "Category",
            key: "category",
            render: (row) => {
                const category = categories.find((c) => c._id === row.category);
                return category ? category.name : "N/A";
            },
        },
        {
            label: "Price",
            key: "price",
            render: (row) => `₹ ${row.price}`,
        },
    ];

    const categoryColumns = [
        {
            label: "Category Name",
            key: "name",
        },
        {
            label: "Dish Count",
            key: "dishCount",
            render: (row) => row.dishCount || 0,
        },
    ];

    const customerColumns = [
        {
            label: "Customer Name",
            key: "name",
        },
        {
            label: "Phone",
            key: "phone",
        },
    ];

    const orderColumns = [
        {
            label: "Customer",
            key: "customer",
            render: (row) => row.customer?.name || "N/A",
        },
        {
            label: "Phone",
            key: "phone",
            render: (row) => row.customer?.phone || "N/A",
        },
        {
            label: "Items",
            key: "items",
            render: (row) => row.items?.length || 0,
        },
        {
            label: "Amount",
            key: "grandTotal",
            render: (row) => `₹ ${row.grandTotal}`,
        },
        {
            label: "Status",
            key: "status",
            render: (row) => (
                <span
                    className={`px-2 py-1 rounded text-xs font-medium ${row.status === "billed"
                        ? "bg-green-100 text-green-600"
                        : "bg-yellow-100 text-yellow-600"
                        }`}
                >
                    {row.status}
                </span>
            ),
        },
        {
            label: "Date",
            key: "createdAt",
            render: (row) =>
                new Date(row.createdAt).toLocaleDateString(),
        },
    ];

    const ITEMS_PER_PAGE = 10;
    const getPaginatedData = (dataList) => {
        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        return dataList.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    };

    const renderPagination = (dataList) => {
        if (dataList.length <= ITEMS_PER_PAGE) return null;
        const totalPages = Math.ceil(dataList.length / ITEMS_PER_PAGE);
        return (
            <div className="flex justify-end items-center gap-3 mt-4 text-sm">
                <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg bg-[#F5FAFF] hover:bg-blue-100 text-[#24435d] border border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft size={16} />
                </button>
                <span className="text-[#24435d] font-medium">Page {page} of {totalPages}</span>
                <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg bg-[#F5FAFF] hover:bg-blue-100 text-[#24435d] border border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        );
    };

    return (
        <>
            <div className="bg-[#F2F8FF] min-h-screen p-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* ================= LEFT SIDE ================= */}
                    <div className="col-span-12 lg:col-span-4 space-y-4">

                        {/* Hotel Profile Card */}
                        <div className="bg-[#24435d] text-white rounded p-6 text-center">
                            <div className="w-20 h-20 bg-white rounded-full mx-auto mb-3 overflow-hidden">
                                <img
                                    src={"/images/hotel.jpg"}
                                    alt="hotel"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h2 className="font-semibold text-lg">{hotelData?.name}</h2>
                            {/* <p className="text-sm">Hotel ID: {hotelData?.id}</p> */}
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white p-4 rounded grid grid-cols-2 gap-3">
                            <StatBox
                                icon={Users}
                                label="Total Staff"
                                value={summary?.counts?.staff || 0}
                            />
                            <StatBox
                                icon={Utensils}
                                label="Menus"
                                value={summary?.counts?.dishes || 0}
                            />
                            <StatBox
                                icon={ShoppingCart}
                                label="Orders"
                                value={totalOrders}
                            />
                            <StatBox
                                icon={DollarSign}
                                label="Revenue"
                                value={`₹ ${totalRevenue}`}
                            />
                        </div>

                        {/* Contact Info */}
                        <div className="bg-white p-4 rounded space-y-3">
                            <h3 className="font-semibold">Contact Information</h3>

                            <InfoItem
                                icon={Phone}
                                label="Phone"
                                value={hotelData?.contact?.phone || adminData?.phone}
                            />

                            <InfoItem
                                icon={Mail}
                                label="Email"
                                value={hotelData?.contact?.email}
                            />

                            <InfoItem
                                icon={MapPin}
                                label="Address"
                                value={`${hotelData?.address || ""}, ${hotelData?.city || ""}, ${hotelData?.country || ""}`}
                            />
                        </div>
                    </div>

                    {/* ================= RIGHT SIDE ================= */}
                    <div className="col-span-12 lg:col-span-8">

                        <div className="bg-white rounded-2xl shadow p-6">

                            {/* ================= TABS ================= */}
                            <div className="hidden md:flex gap-6 border-b pb-3 text-sm font-semibold">
                                {["staff", "categories", "menus", "orders", "customers"].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`pb-2 capitalize ${activeTab === tab
                                            ? "text-[#24435d] border-b-2 border-[#24435d]"
                                            : "text-gray-500 hover:text-[#24435d] transition-colors"
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                            {/* ✅ Mobile Tabs (Theme Matching) */}
                            <div className="md:hidden bg-[#F5FAFF] rounded-2xl p-3 mb-4 border border-gray-100 overflow-x-auto hide-scrollbar">
                                <div className="flex gap-2 text-sm font-semibold min-w-max">
                                    {["staff", "categories", "menus", "orders", "customers"].map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`capitalize transition-all duration-200 px-4 py-2 rounded-lg
                                                ${activeTab === tab
                                                    ? "bg-[#24435d] text-white shadow-sm"
                                                    : "text-gray-600 hover:bg-blue-50 hover:text-[#24435d]"
                                                }
                                            `}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* ================= TAB CONTENT ================= */}
                            <div className="mt-6">

                                {/* Staff */}
                                {activeTab === "staff" && (
                                    <div className="w-full overflow-x-auto">
                                        <Table
                                            columns={staffColumns}
                                            data={getPaginatedData(staff)}
                                            loading={false}
                                        />
                                        {renderPagination(staff)}
                                    </div>
                                )}

                                {/* Categories */}
                                {activeTab === "categories" && (
                                    <div className="w-full overflow-x-auto">
                                        {categories.length === 0 ? (
                                            <p className="text-gray-500 text-sm">No categories found</p>
                                        ) : (
                                            <>
                                                <Table
                                                    columns={categoryColumns}
                                                    data={getPaginatedData(categories)}
                                                    loading={false}
                                                />
                                                {renderPagination(categories)}
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* Menus */}
                                {activeTab === "menus" && (
                                    <div className="w-full overflow-x-auto">
                                        <Table
                                            columns={menuColumns}
                                            data={getPaginatedData(menus)}
                                            loading={false}
                                        />
                                        {renderPagination(menus)}
                                    </div>
                                )}

                                {/* Orders (Dynamic count only for now) */}
                                {activeTab === "orders" && (
                                    <div className="space-y-6">

                                        {/* ===== Summary Cards (KEEP AS IT IS) ===== */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                            {/* Orders Card */}
                                            <div className="bg-white rounded-2xl shadow-md p-5 flex items-center justify-between border border-gray-100">
                                                <div>
                                                    <p className="text-sm text-gray-500">Total Orders</p>
                                                    <h3 className="text-2xl font-bold text-[#24435d]">
                                                        {totalOrders}
                                                    </h3>
                                                </div>
                                                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-100 text-[#24435d]">
                                                    <ShoppingCart size={22} />
                                                </div>
                                            </div>

                                            {/* Revenue Card */}
                                            <div className="bg-white rounded-2xl shadow-md p-5 flex items-center justify-between border border-gray-100">
                                                <div>
                                                    <p className="text-sm text-gray-500">Total Revenue</p>
                                                    <h3 className="text-2xl font-bold text-green-600">
                                                        ₹ {totalRevenue.toLocaleString()}
                                                    </h3>
                                                </div>
                                                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-green-100 text-green-600">
                                                    <DollarSign size={22} />
                                                </div>
                                            </div>

                                        </div>

                                        {/* ===== Orders Table (NEW) ===== */}
                                        <div className="w-full overflow-x-auto">
                                            <Table
                                                columns={orderColumns}
                                                data={getPaginatedData(orders)}
                                                loading={false}
                                            />
                                            {renderPagination(orders)}
                                        </div>

                                    </div>
                                )}

                                {/* Customers (Not available in API yet) */}
                                {activeTab === "customers" && (
                                    <div className="w-full overflow-x-auto">
                                        {customers.length === 0 ? (
                                            <p className="text-gray-500 text-sm">No customers found</p>
                                        ) : (
                                            <>
                                                <Table
                                                    columns={customerColumns}
                                                    data={getPaginatedData(customers)}
                                                    loading={false}
                                                />
                                                {renderPagination(customers)}
                                            </>
                                        )}
                                    </div>
                                )}

                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

export default HotelDetails;