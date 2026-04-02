import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Table from "../../components/tables/Table";
import Skeleton from "../../components/ui/Skeleton";
import {
    MapPin, Phone, Mail, Users, Utensils,
    ShoppingCart, DollarSign, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useGetHotelByIdQuery } from "../../store/Api/hotelApi";

const ITEMS_PER_PAGE = 10;
const PAGINATED_TABS = ["staff", "dishes", "categories", "orders", "customers"];

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

const Pagination = ({ page, setPage, totalRecords, isFetching }) => {
    const totalPages = Math.ceil(totalRecords / ITEMS_PER_PAGE);
    if (!totalRecords || totalRecords <= ITEMS_PER_PAGE) return null;

    return (
        <div className="flex justify-end items-center gap-3 mt-4 text-sm">
            <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || isFetching}
                className="p-1.5 rounded-lg bg-[#F5FAFF] hover:bg-blue-100 text-[#24435d] border border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronLeft size={16} />
            </button>
            <span className="text-[#24435d] font-medium">
                {isFetching ? "Loading..." : `Page ${page} of ${totalPages}`}
            </span>
            <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || isFetching}
                className="p-1.5 rounded-lg bg-[#F5FAFF] hover:bg-blue-100 text-[#24435d] border border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronRight size={16} />
            </button>
        </div>
    );
};

const HotelDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState("staff");
    const [page, setPage] = useState(1);

    useEffect(() => {
        setPage(1);
    }, [activeTab]);

    // ✅ Main paginated query for active tab
    const { data, isLoading, isFetching, isError } = useGetHotelByIdQuery(
        { id, tab: activeTab, page, limit: ITEMS_PER_PAGE },
        { skip: !id }
    );

    // ✅ Always fetch all categories so dishes tab can map category names
    const { data: categoriesData } = useGetHotelByIdQuery(
        { id, tab: "categories", page: 1, limit: 100 },
        { skip: !id }
    );

    const allCategories = Array.isArray(categoriesData?.data) ? categoriesData.data : [];

    if (isLoading) {
        return (
            <div className="bg-[#F2F8FF] min-h-screen p-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="col-span-12 lg:col-span-4 space-y-4">
                        <div className="bg-[#24435d] rounded p-6 text-center">
                            <Skeleton className="w-20 h-20 rounded-full mx-auto mb-3 bg-gray-400/40" />
                            <Skeleton className="h-4 w-32 mx-auto bg-gray-400/40" />
                        </div>
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
                    <div className="col-span-12 lg:col-span-8">
                        <div className="bg-white rounded-2xl shadow p-6 space-y-6">
                            <div className="flex gap-6 border-b pb-3">
                                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-4 w-20" />)}
                            </div>
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map((row) => (
                                    <div key={row} className="grid grid-cols-4 gap-4">
                                        {[1, 2, 3, 4].map(c => <Skeleton key={c} className="h-4 w-full" />)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex justify-center items-center min-h-screen text-red-500">
                Failed to load hotel details
            </div>
        );
    }

    const hotelData = data?.hotel || {};
    const adminData = data?.admin || {};
    const summary = data?.summary || {};
    const paginationMeta = data?.pagination || {};

    // ✅ data.data is always a flat array from the API
    const paginatedItems = Array.isArray(data?.data) ? data.data : [];

    const staff      = activeTab === "staff"      ? paginatedItems : [];
    const dishes     = activeTab === "dishes"     ? paginatedItems : [];
    const categories = activeTab === "categories" ? paginatedItems : [];
    const customers  = activeTab === "customers"  ? paginatedItems : [];
    const orders     = activeTab === "orders"     ? paginatedItems : [];

    // ✅ Use pagination.totalItems for the active tab, summary counts for others
    const totalCounts = {
        staff:      activeTab === "staff"      ? (paginationMeta.totalItems ?? summary?.counts?.staff      ?? 0) : (summary?.counts?.staff      || 0),
        dishes:     activeTab === "dishes"     ? (paginationMeta.totalItems ?? summary?.counts?.dishes     ?? 0) : (summary?.counts?.dishes     || 0),
        categories: activeTab === "categories" ? (paginationMeta.totalItems ?? summary?.counts?.categories ?? 0) : (summary?.counts?.categories || 0),
        orders:     activeTab === "orders"     ? (paginationMeta.totalItems ?? summary?.counts?.orders     ?? 0) : (summary?.counts?.orders     || 0),
        customers:  activeTab === "customers"  ? (paginationMeta.totalItems ?? summary?.counts?.customers  ?? 0) : (summary?.counts?.customers  || 0),
    };

    const totalOrders  = summary?.counts?.orders || 0;
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
        { label: "Email", key: "email", render: (row) => row.profile?.email || "N/A" },
    ];

    const menuColumns = [
        { label: "Dish Name", key: "name" },
        {
            label: "Category",
            key: "category",
            render: (row) => {
                // ✅ Match dish's category ObjectId against allCategories fetched separately
                const cat = allCategories.find((c) => c._id === row.category);
                return cat ? cat.name : row.category || "N/A";
            },
        },
        { label: "Price", key: "price", render: (row) => `₹ ${row.price}` },
    ];

    const categoryColumns = [
        { label: "Category Name", key: "name" },
        { label: "Dish Count", key: "dishCount", render: (row) => row.dishCount || 0 },
    ];

    const customerColumns = [
        { label: "Customer Name", key: "name" },
        { label: "Phone", key: "phone" },
    ];

    const orderColumns = [
        { label: "Customer", key: "customer", render: (row) => row.customer?.name || "N/A" },
        { label: "Phone", key: "phone", render: (row) => row.customer?.phone || "N/A" },
        { label: "Items", key: "items", render: (row) => row.items?.length || 0 },
        { label: "Amount", key: "grandTotal", render: (row) => `₹ ${row.grandTotal}` },
        {
            label: "Status", key: "status",
            render: (row) => (
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                    row.status === "billed"
                        ? "bg-green-100 text-green-600"
                        : "bg-yellow-100 text-yellow-600"
                }`}>
                    {row.status}
                </span>
            ),
        },
        {
            label: "Date", key: "createdAt",
            render: (row) => new Date(row.createdAt).toLocaleDateString(),
        },
    ];

    return (
        <div className="bg-[#F2F8FF] min-h-screen p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* ================= LEFT SIDE ================= */}
                <div className="col-span-12 lg:col-span-4 space-y-4">

                    <div className="bg-[#24435d] text-white rounded p-6 text-center">
                        <div className="w-20 h-20 bg-white rounded-full mx-auto mb-3 overflow-hidden">
                            <img src={"/images/hotel.jpg"} alt="hotel" className="w-full h-full object-cover" />
                        </div>
                        <h2 className="font-semibold text-lg">{hotelData?.name}</h2>
                    </div>

                    <div className="bg-white p-4 rounded grid grid-cols-2 gap-3">
                        <StatBox icon={Users} label="Total Staff" value={summary?.counts?.staff || 0} />
                        <StatBox icon={Utensils} label="Menus" value={summary?.counts?.dishes || 0} />
                        <StatBox icon={ShoppingCart} label="Orders" value={totalOrders} />
                        <StatBox icon={DollarSign} label="Revenue" value={`₹ ${totalRevenue}`} />
                    </div>

                    <div className="bg-white p-4 rounded space-y-3">
                        <h3 className="font-semibold">Contact Information</h3>
                        <InfoItem icon={Phone} label="Phone" value={hotelData?.contact?.phone || adminData?.phone} />
                        <InfoItem icon={Mail} label="Email" value={hotelData?.contact?.email} />
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

                        {/* Desktop Tabs */}
                        <div className="hidden md:flex gap-6 border-b pb-3 text-sm font-semibold">
                            {PAGINATED_TABS.map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-2 capitalize ${
                                        activeTab === tab
                                            ? "text-[#24435d] border-b-2 border-[#24435d]"
                                            : "text-gray-500 hover:text-[#24435d] transition-colors"
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Mobile Tabs */}
                        <div className="md:hidden bg-[#F5FAFF] rounded-2xl p-3 mb-4 border border-gray-100 overflow-x-auto hide-scrollbar">
                            <div className="flex gap-2 text-sm font-semibold min-w-max">
                                {PAGINATED_TABS.map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`capitalize transition-all duration-200 px-4 py-2 rounded-lg ${
                                            activeTab === tab
                                                ? "bg-[#24435d] text-white shadow-sm"
                                                : "text-gray-600 hover:bg-blue-50 hover:text-[#24435d]"
                                        }`}
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
                                    <Table columns={staffColumns} data={staff} loading={isFetching} />
                                    <Pagination
                                        page={page}
                                        setPage={setPage}
                                        totalRecords={totalCounts.staff}
                                        isFetching={isFetching}
                                    />
                                </div>
                            )}

                            {/* Categories */}
                            {activeTab === "categories" && (
                                <div className="w-full overflow-x-auto">
                                    {!isFetching && categories.length === 0 ? (
                                        <p className="text-gray-500 text-sm">No categories found</p>
                                    ) : (
                                        <>
                                            <Table columns={categoryColumns} data={categories} loading={isFetching} />
                                            <Pagination
                                                page={page}
                                                setPage={setPage}
                                                totalRecords={totalCounts.categories}
                                                isFetching={isFetching}
                                            />
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Dishes */}
                            {activeTab === "dishes" && (
                                <div className="w-full overflow-x-auto">
                                    {!isFetching && dishes.length === 0 ? (
                                        <p className="text-gray-500 text-sm">No dishes found</p>
                                    ) : (
                                        <>
                                            <Table columns={menuColumns} data={dishes} loading={isFetching} />
                                            <Pagination
                                                page={page}
                                                setPage={setPage}
                                                totalRecords={totalCounts.dishes}
                                                isFetching={isFetching}
                                            />
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Orders */}
                            {activeTab === "orders" && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="bg-white rounded-2xl shadow-md p-5 flex items-center justify-between border border-gray-100">
                                            <div>
                                                <p className="text-sm text-gray-500">Total Orders</p>
                                                <h3 className="text-2xl font-bold text-[#24435d]">{totalOrders}</h3>
                                            </div>
                                            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-100 text-[#24435d]">
                                                <ShoppingCart size={22} />
                                            </div>
                                        </div>
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
                                    <div className="w-full overflow-x-auto">
                                        <Table columns={orderColumns} data={orders} loading={isFetching} />
                                        <Pagination
                                            page={page}
                                            setPage={setPage}
                                            totalRecords={totalCounts.orders}
                                            isFetching={isFetching}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Customers */}
                            {activeTab === "customers" && (
                                <div className="w-full overflow-x-auto">
                                    {!isFetching && customers.length === 0 ? (
                                        <p className="text-gray-500 text-sm">No customers found</p>
                                    ) : (
                                        <>
                                            <Table columns={customerColumns} data={customers} loading={isFetching} />
                                            <Pagination
                                                page={page}
                                                setPage={setPage}
                                                totalRecords={totalCounts.customers}
                                                isFetching={isFetching}
                                            />
                                        </>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default HotelDetails;