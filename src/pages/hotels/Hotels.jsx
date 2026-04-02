import { useState, useEffect, useMemo } from "react";
import Table from "../../components/tables/Table";
import Skeleton from "../../components/ui/Skeleton";
import { useUpdateHotelStatusMutation } from "../../store/Api/hotelApi"
import {
  useGetHotelsQuery,
  useAddHotelMutation,
  useUpdateHotelMutation,
  useDeleteHotelMutation,
} from "../../store/Api/hotelApi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ScaleLoader } from "react-spinners";

const Hotels = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editHotel, setEditHotel] = useState(null);
  const [updateHotelStatus, { isLoading: statusLoading }] = useUpdateHotelStatusMutation();
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Confirm modal state (for approve action)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    country: "",
    phone: "",
    email: "",
    adminUsername: "",
    adminName: "",
    adminPassword: "",
    confirmPassword: "",
  });

  // ✅ Fetch Hotels
  const { data, isLoading, isError } = useGetHotelsQuery(
    {
      page: currentPage,
      limit: 10,
      search,
    },
    {
      refetchOnMountOrArgChange: true, // 🔥 FIX
    }
  );

  const [addHotel, { isLoading: addLoading }] = useAddHotelMutation();
  const [updateHotel, { isLoading: updateLoading }] = useUpdateHotelMutation();
  const [deleteHotel, { isLoading: deleteLoading }] = useDeleteHotelMutation();
  // console.log("Current Page:", currentPage);


  // ✅ Pagination
  const paginatedHotels = data?.data || [];

  const pagination = data?.pagination || {};
  const totalPages = pagination.totalPages || 1;

  // ✅ Open Add Modal
  const handleAdd = () => {
    setEditHotel(null);
    setFormData({
      name: "",
      address: "",
      city: "",
      country: "",
      phone: "",
      email: "",
      adminUsername: "",
      adminName: "",
      adminPassword: "",
      confirmPassword: "",
    });
    setIsModalOpen(true);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // ✅ Open Edit Modal
  const handleEdit = (hotel) => {
    setEditHotel(hotel);
    setFormData({
      name: hotel.name || "",
      address: hotel.address || "",
      city: hotel.city || "",
      country: hotel.country || "",
      phone: hotel.phone || "",
      email: hotel.email || "",
      password: "",
      confirmPassword: "",
    });
    setIsModalOpen(true);
  };
  const handleView = (id) => {
    navigate(`/hotelDetails/${id}`);
  };
  const handleStatusUpdate = async (id, currentStatus) => {
    const newStatus = currentStatus === "pending" ? "approved" : "pending";

    setConfirmTarget({ id, newStatus });
    setIsConfirmModalOpen(true);
  };

  const confirmStatusUpdate = async () => {
    if (!confirmTarget) return;
    const { id, newStatus } = confirmTarget;
    setStatusUpdatingId(id);

    try {
      await updateHotelStatus({ id, status: newStatus }).unwrap();
      toast.success(`Hotel ${newStatus} successfully!`);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update status");
    } finally {
      setStatusUpdatingId(null);
      setIsConfirmModalOpen(false);
      setConfirmTarget(null);
    }
  };

  // ✅ Delete
  const handleDelete = async (id) => {
    setDeleteTarget(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteHotel(deleteTarget).unwrap();
      toast.success("Hotel deleted successfully!");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete hotel");
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Hotel name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!/^[0-9]{7,15}$/.test(formData.phone)) {
      newErrors.phone = "Phone must be 7–15 digits";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    }

    if (!editHotel) {
      if (!formData.adminName.trim()) {
        newErrors.adminName = "Admin name is required";
      }

      if (!formData.adminUsername.trim()) {
        newErrors.adminUsername = "Admin username is required";
      }

      if (!formData.adminPassword) {
        newErrors.adminPassword = "Password is required";
      } else if (formData.adminPassword.length < 6) {
        newErrors.adminPassword = "Password must be at least 6 characters";
      }

      if (formData.adminPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    //console.log("FORM SUBMITTED");

    if (!validateForm()) return;

    try {
      if (!editHotel) {
        const resp = await addHotel({
          name: formData.name,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          phone: formData.phone,
          email: formData.email,
          adminUsername: formData.adminUsername,
          adminPassword: formData.adminPassword,
          adminName: formData.adminName,
        }).unwrap();

        console.log("Add Response:", resp);
        //toast.success("Hotel added successfully");
        toast.success(resp?.message || "Hotel updated successfully");
      } else {
        const resp = await updateHotel({
          id: editHotel._id,
          body: {
            name: formData.name,
            address: formData.address,
            city: formData.city,
            country: formData.country,
            phone: formData.phone,
            email: formData.email,
          },
        }).unwrap();

        // console.log("Update Response:", resp);
        toast.success("Hotel updated successfully");
      }

      setIsModalOpen(false);
      setEditHotel(null);
    } catch (error) {
      console.error("API ERROR:", error);

      const errorMessage =
        error?.data?.message ||
        error?.error ||
        error?.message ||
        "Something went wrong";

      toast.error(errorMessage);
    }
  };

  // ✅ Table Columns
  const columns = [
    {
      label: "Hotel Name",
      render: (row) => row.name || "N/A",
    },
    {
      label: "Admin",
      render: (row) => row.admin?.profile?.name || "N/A",
    },
    {
      label: "City",
      render: (row) => row.city || "N/A",
    },
    {
      label: "Phone",
      render: (row) => row.phone || "N/A",
    },
    {
      label: "Email",
      render: (row) => row.email || "N/A",
    },

    {
      label: "Status",
      render: (row) => {
        const status =
          row.status === "active"
            ? "approved"
            : row.status;

        return (
          <button
            onClick={() =>
              status === "pending" &&
              handleStatusUpdate(row._id, status)
            }
            disabled={status !== "pending"}
            className={`px-3 py-1 rounded text-xs text-white ${status === "approved"
              ? "bg-green-600 cursor-not-allowed"
              : status === "rejected"
                ? "bg-red-600 cursor-not-allowed"
                : "bg-yellow-500 hover:bg-yellow-600"
              }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        );
      },
    },

    // ✅ ACTION COLUMN
    {
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleView(row._id)}
            className="px-3 py-1 bg-[#048314] text-white rounded text-xs"
          >
            View
          </button>

          <button
            onClick={() => handleEdit(row)}
            disabled={row.status === "approved"}
            className={`px-3 py-1 rounded text-xs ${row.status === "approved"
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 text-white"
              }`}
          >
            Edit
          </button>

          <button
            onClick={() => handleDelete(row._id)}
            className="px-3 py-1 bg-red-500 text-white rounded text-xs"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  // Status helpers
  const getStatusColor = (status) => {
    switch (status) {
      case "approved": return "bg-emerald-500";
      case "rejected": return "bg-red-500";
      case "pending": return "bg-amber-500";
      default: return "bg-gray-400";
    }
  };

  const getStatusAccent = (status) => {
    switch (status) {
      case "approved": return "from-emerald-500 to-emerald-600";
      case "rejected": return "from-red-500 to-red-600";
      case "pending": return "from-amber-400 to-amber-500";
      default: return "from-gray-400 to-gray-500";
    }
  };

  if (isError) {
    return (
      <>
        <p className="text-red-500">Failed to load hotels</p>
      </>
    );
  }

  return (
    <>
      <div className="mt-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-xl md:text-2xl font-semibold">
          Hotels ({pagination.totalItems || 0})
        </h1>

        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-4 py-2 rounded text-sm md:text-base"
          />
          {/* <button
            onClick={handleAdd}
            className="px-4 py-2 bg-green-600 text-white rounded text-sm md:text-base whitespace-nowrap"
          >
            + Add
          </button> */}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="w-full overflow-x-auto">
        <div className="sm:text-base text-xs">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-md border overflow-hidden"
                >
                  {/* HEADER SKELETON */}
                  <div className="p-5 border-b space-y-2">
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-1/2" />
                  </div>

                  {/* BODY SKELETON */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>

                  {/* SUBSCRIPTION SKELETON */}
                  <div className="px-5 pb-4">
                    <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>

                  {/* FOOTER SKELETON */}
                  <div className="px-5 pb-5 flex justify-end gap-2">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : paginatedHotels.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21" />
              </svg>
              <p className="text-lg font-medium">No hotels found</p>
              <p className="text-sm mt-1">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedHotels.map((hotel) => {
                const status =
                  hotel.status === "active" ? "approved" : hotel.status;

                const subscription = hotel.subscription;

                const isExpired =
                  subscription &&
                  new Date(subscription.endDate) < new Date();

                const daysLeft = subscription
                  ? Math.ceil(
                    (new Date(subscription.endDate) - new Date()) /
                    (1000 * 60 * 60 * 24)
                  )
                  : null;

                return (
                  <div
                    key={hotel._id}
                    className="group bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 overflow-hidden relative"
                  >
                    {/* Colored Left Accent Bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${getStatusAccent(status)} rounded-l-2xl`} />

                    {/* HEADER */}
                    <div className="px-6 pt-5 pb-4 border-b border-gray-100">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h2 className="text-lg font-bold text-gray-800 truncate group-hover:text-indigo-600 transition-colors duration-200">
                            {hotel.name || "N/A"}
                          </h2>
                          <div className="flex items-center gap-1.5 mt-1 text-gray-400">
                            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                            </svg>
                            <span className="text-xs truncate">{hotel.city}, {hotel.country}</span>
                          </div>
                        </div>

                        {/* Status Badge + Approve Button */}
                        {status === "pending" ? (
                          <div className="flex flex-col items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => handleStatusUpdate(hotel._id, status)}
                              disabled={statusLoading && statusUpdatingId === hotel._id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 hover:border-amber-300 transition-all duration-200 cursor-pointer"
                            >
                              {statusLoading && statusUpdatingId === hotel._id ? (
                                <ScaleLoader color="#d97706" height={10} width={2} margin={1} />
                              ) : (
                                <>
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Approve
                                </>
                              )}
                            </button>
                            <span className="text-[10px] font-medium text-amber-500">Pending</span>
                          </div>
                        ) : (
                          <span className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${status === "approved"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                            : "bg-red-50 text-red-600 border border-red-200"
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status === "approved" ? "bg-emerald-500" : "bg-red-500"
                              }`} />
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* BODY — 2 Column Grid */}
                    <div className="px-6 py-4 grid grid-cols-2 gap-3">
                      {/* Admin */}
                      <div className="flex items-center gap-2.5 text-sm text-gray-600">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                          <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-gray-400 leading-none">Admin</p>
                          <p className="text-xs font-medium text-gray-700 truncate">{hotel.admin?.profile?.name || "N/A"}</p>
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="flex items-center gap-2.5 text-sm text-gray-600">
                        <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                          <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-gray-400 leading-none">Phone</p>
                          <p className="text-xs font-medium text-gray-700">{hotel.phone || "N/A"}</p>
                        </div>
                      </div>

                      {/* Email — spans full width */}
                      <div className="col-span-2 flex items-center gap-2.5 text-sm text-gray-600">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-gray-400 leading-none">Email</p>
                          <p className="text-xs font-medium text-gray-700 truncate">{hotel.email || "N/A"}</p>
                        </div>
                      </div>
                    </div>

                    {/* SUBSCRIPTION */}
                    <div className="px-6 pb-4">
                      <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-100">
                        {subscription ? (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-sm text-gray-700">
                                {subscription.plan?.name}
                              </span>

                              <span className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full font-semibold">
                                ₹{subscription.plan?.price}
                              </span>
                            </div>

                            <div className="flex justify-between mt-2.5 items-center">
                              {/* STATUS */}
                              <span
                                className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium text-white ${subscription.status === "ACTIVE"
                                  ? "bg-emerald-500"
                                  : subscription.status === "TRIALING"
                                    ? "bg-blue-500"
                                    : subscription.status === "PAST_DUE"
                                      ? "bg-red-500"
                                      : "bg-gray-400"
                                  }`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
                                {subscription.status}
                              </span>

                              {/* DAYS LEFT */}
                              {daysLeft !== null && (
                                <span className={`text-xs font-medium ${isExpired ? "text-red-500" : daysLeft <= 7 ? "text-amber-500" : "text-gray-500"}`}>
                                  {isExpired
                                    ? "Expired"
                                    : `${daysLeft} days left`}
                                </span>
                              )}
                            </div>

                            {/* EXPIRY */}
                            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                              </svg>
                              Expiry:{" "}
                              {new Date(
                                subscription.endDate
                              ).toLocaleDateString()}
                            </p>
                          </>
                        ) : (
                          <p className="text-xs text-gray-400 italic text-center py-1">
                            No Subscription
                          </p>
                        )}
                      </div>
                    </div>

                    {/* FOOTER — Action Buttons */}
                    <div className="px-6 pb-5 flex justify-end items-center gap-2">
                      {/* View */}
                      <button
                        onClick={() => handleView(hotel._id)}
                        title="View Details"
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 transition-all duration-200 border border-emerald-100 hover:border-emerald-200 hover:shadow-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => handleEdit(hotel)}
                        disabled={hotel.status === "approved"}
                        title={hotel.status === "approved" ? "Cannot edit approved hotel" : "Edit Hotel"}
                        className={`inline-flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 border hover:shadow-sm ${hotel.status === "approved"
                          ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                          : "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 border-blue-100 hover:border-blue-200"
                          }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(hotel._id)}
                        title="Delete Hotel"
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-all duration-200 border border-red-100 hover:border-red-200 hover:shadow-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {!isLoading && pagination.totalPages > 1 && (
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 md:px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 text-sm md:text-base transition-colors hover:bg-gray-300 font-medium"
          >
            Previous
          </button>

          <span className="px-3 md:px-4 py-2 text-sm md:text-base font-medium text-gray-700">
            Page {currentPage} of {pagination.totalPages || 1}
          </span>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pagination.totalPages))}
            disabled={currentPage === pagination.totalPages}
            className="px-3 md:px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 text-sm md:text-base transition-colors hover:bg-gray-300 font-medium"
          >
            Next
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-xl"
            >
              ✕
            </button>

            <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21" /></svg>
              </span>
              {editHotel ? "Edit Hotel" : "Add Hotel"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21" /></svg>
                  Hotel Name
                </label>
                <input
                  type="text"
                  placeholder="Enter hotel name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    setErrors({ ...errors, name: "" });
                  }}
                  className={`w-full border px-4 py-2 rounded text-sm ${errors.name ? "border-red-500" : "border-gray-200"
                    }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    setErrors({ ...errors, email: "" });
                  }}
                  className={`w-full border px-4 py-2 rounded text-sm ${errors.email ? "border-red-500" : "border-gray-200"
                    }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                  Phone
                </label>
                <input
                  type="text"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    setErrors({ ...errors, phone: "" });
                  }}
                  className={`w-full border px-4 py-2 rounded text-sm ${errors.phone ? "border-red-500" : "border-gray-200"
                    }`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                  Address
                </label>
                <input
                  type="text"
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full border border-gray-200 px-4 py-2 rounded text-sm"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21" /></svg>
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="Enter city"
                    value={formData.city}
                    onChange={(e) => {
                      setFormData({ ...formData, city: e.target.value });
                      setErrors({ ...errors, city: "" });
                    }}
                    className={`w-full border px-4 py-2 rounded text-sm ${errors.city ? "border-red-500" : "border-gray-200"
                      }`}
                  />
                  {errors.city && (
                    <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>
                    Country
                  </label>
                  <input
                    type="text"
                    placeholder="Enter country"
                    value={formData.country}
                    onChange={(e) => {
                      setFormData({ ...formData, country: e.target.value });
                      setErrors({ ...errors, country: "" });
                    }}
                    className={`w-full border px-4 py-2 rounded text-sm ${errors.country ? "border-red-500" : "border-gray-200"
                      }`}
                  />
                  {errors.country && (
                    <p className="text-red-500 text-xs mt-1">{errors.country}</p>
                  )}
                </div>
              </div>
              {/* Admin Fields only when Adding */}
              {!editHotel && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                      Admin Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter admin name"
                      value={formData.adminName}
                      onChange={(e) => {
                        setFormData({ ...formData, adminName: e.target.value });
                        setErrors({ ...errors, adminName: "" });
                      }}
                      className={`w-full border px-4 py-2 rounded text-sm ${errors.adminName ? "border-red-500" : "border-gray-200"
                        }`}
                    />
                    {errors.adminName && (
                      <p className="text-red-500 text-xs mt-1">{errors.adminName}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      Admin Username
                    </label>
                    <input
                      type="text"
                      placeholder="Enter admin username"
                      value={formData.adminUsername}
                      onChange={(e) => {
                        setFormData({ ...formData, adminUsername: e.target.value });
                        setErrors({ ...errors, adminUsername: "" });
                      }}
                      className={`w-full border px-4 py-2 rounded text-sm ${errors.adminUsername ? "border-red-500" : "border-gray-200"
                        }`}
                    />
                    {errors.adminUsername && (
                      <p className="text-red-500 text-xs mt-1">{errors.adminUsername}</p>
                    )}
                  </div>
                </>
              )}

              {/* Passwords only when adding a hotel */}
              {!editHotel && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                        Password
                      </label>
                      <input
                        type="password"
                        placeholder="Enter password"
                        value={formData.adminPassword}
                        onChange={(e) => {
                          setFormData({ ...formData, adminPassword: e.target.value });
                          setErrors({ ...errors, adminPassword: "" });
                        }}
                        className={`w-full border px-4 py-2 rounded text-sm ${errors.adminPassword ? "border-red-500" : "border-gray-200"
                          }`}
                      />
                      {errors.adminPassword && (
                        <p className="text-red-500 text-xs mt-1">{errors.adminPassword}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        placeholder="Re-enter password"
                        value={formData.confirmPassword}
                        onChange={(e) => {
                          setFormData({ ...formData, confirmPassword: e.target.value });
                          setErrors({ ...errors, confirmPassword: "" });
                        }}
                        className={`w-full border px-4 py-2 rounded text-sm ${errors.confirmPassword ? "border-red-500" : "border-gray-200"
                          }`}
                      />
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={addLoading || updateLoading}
                className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium disabled:opacity-50 text-sm hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center min-h-[40px]"
              >
                {editHotel
                  ? updateLoading
                    ? <ScaleLoader color="#fff" height={15} width={3} />
                    : "Update Hotel"
                  : addLoading
                    ? <ScaleLoader color="#fff" height={15} width={3} />
                    : "Add Hotel"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={() => {
            if (!deleteLoading) {
              setIsDeleteModalOpen(false);
              setDeleteTarget(null);
            }
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center"
          >
            {/* Warning Icon */}
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>

            <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Hotel</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this hotel? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteTarget(null);
                }}
                disabled={deleteLoading}
                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-500 text-white font-medium text-sm hover:bg-red-600 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center min-h-[40px]"
              >
                {deleteLoading ? (
                  <ScaleLoader color="#fff" height={15} width={3} />
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      {isConfirmModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={() => {
            if (!statusLoading) {
              setIsConfirmModalOpen(false);
              setConfirmTarget(null);
            }
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center"
          >
            {/* Approve Icon */}
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h3 className="text-lg font-bold text-gray-800 mb-2">
              {confirmTarget?.newStatus === "approved" ? "Approve" : "Update"} Hotel
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to {confirmTarget?.newStatus} this hotel?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsConfirmModalOpen(false);
                  setConfirmTarget(null);
                }}
                disabled={statusLoading}
                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusUpdate}
                disabled={statusLoading}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 text-white font-medium text-sm hover:bg-emerald-600 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center min-h-[40px]"
              >
                {statusLoading ? (
                  <ScaleLoader color="#fff" height={15} width={3} />
                ) : (
                  "Confirm"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Hotels;
