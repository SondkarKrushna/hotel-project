import { useState, useEffect, useMemo } from "react";
import Layout from "../../components/layout/Layout";
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

const Hotels = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editHotel, setEditHotel] = useState(null);
  const [updateHotelStatus] = useUpdateHotelStatusMutation();
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
  const [deleteHotel] = useDeleteHotelMutation();
  console.log("Current Page:", currentPage);


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

    if (!window.confirm(`Are you sure you want to ${newStatus} this hotel?`)) return;

    try {
      await updateHotelStatus({ id, status: newStatus }).unwrap();
      toast.success("Status updated successfully! ✅");

    } catch (error) {
      toast.error(error?.data?.message || "Failed to update status");
    }
  };

  // ✅ Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this hotel?")) return;
    try {
      await deleteHotel(id).unwrap();
      toast("Hotel deleted successfully!");
    } catch (error) {
      toast(error?.data?.message || "Failed to delete hotel");
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

        console.log("Update Response:", resp);
        toast.success("Hotel updated successfully");
      }

      setIsModalOpen(false);
      setEditHotel(null);
    } catch (error) {
      console.error("API ERROR:", error);

      const errorMessage =
        error?.data?.message ||     // backend message
        error?.error ||             // fetchBaseQuery error
        error?.message ||           // generic error
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

  if (isError) {
    return (
      <Layout>
        <p className="text-red-500">Failed to load hotels</p>
      </Layout>
    );
  }

  return (
    <Layout>
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

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <div className="sm:text-base text-xs">
          {isLoading ? (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, index) => (
      <div
        key={index}
        className="bg-white rounded-2xl shadow-md border overflow-hidden"
      >
        {/* HEADER */}
        <div className="p-5 border-b space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>

        {/* BODY */}
        <div className="p-5 space-y-3">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* SUBSCRIPTION */}
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

        {/* FOOTER */}
        <div className="px-5 pb-5 flex justify-between items-center">
          <Skeleton className="h-6 w-20 rounded" />

          <div className="flex gap-2">
            <Skeleton className="h-7 w-14 rounded" />
            <Skeleton className="h-7 w-14 rounded" />
            <Skeleton className="h-7 w-14 rounded" />
          </div>
        </div>
      </div>
    ))}
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
                    className="bg-white rounded-2xl shadow-md border hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    {/* HEADER */}
                    <div className="p-5 border-b">
                      <h2 className="text-lg font-semibold">
                        {hotel.name || "N/A"}
                      </h2>

                      <p className="text-xs text-gray-500">
                        {hotel.city}, {hotel.country}
                      </p>
                    </div>

                    {/* BODY */}
                    <div className="p-5 space-y-2 text-sm text-gray-600">
                      <p>
                        <strong>Admin:</strong>{" "}
                        {hotel.admin?.profile?.name || "N/A"}
                      </p>

                      <p>
                        <strong>Phone:</strong> {hotel.phone || "N/A"}
                      </p>

                      <p className="break-all">
                        <strong>Email:</strong> {hotel.email || "N/A"}
                      </p>
                    </div>

                    {/* SUBSCRIPTION */}
                    <div className="px-5 pb-4">
                      <div className="bg-gray-50 rounded-xl p-3">
                        {subscription ? (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-sm">
                                {subscription.plan?.name}
                              </span>

                              <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded">
                                ₹{subscription.plan?.price}
                              </span>
                            </div>

                            <div className="flex justify-between mt-2 items-center">
                              {/* STATUS */}
                              <span
                                className={`text-xs px-2 py-1 rounded text-white ${subscription.status === "ACTIVE"
                                  ? "bg-green-500"
                                  : subscription.status === "TRIALING"
                                    ? "bg-blue-500"
                                    : subscription.status === "PAST_DUE"
                                      ? "bg-red-500"
                                      : "bg-gray-400"
                                  }`}
                              >
                                {subscription.status}
                              </span>

                              {/* DAYS LEFT */}
                              {daysLeft !== null && (
                                <span className="text-xs text-gray-500">
                                  {isExpired
                                    ? "Expired"
                                    : `${daysLeft} days left`}
                                </span>
                              )}
                            </div>

                            {/* EXPIRY */}
                            <p className="text-xs text-gray-400 mt-1">
                              Expiry:{" "}
                              {new Date(
                                subscription.endDate
                              ).toLocaleDateString()}
                            </p>
                          </>
                        ) : (
                          <p className="text-xs text-gray-400 italic">
                            No Subscription
                          </p>
                        )}
                      </div>
                    </div>

                    {/* FOOTER */}
                    <div className="px-5 pb-5 flex justify-between items-center">
                      {/* HOTEL STATUS */}
                      <button
                        onClick={() =>
                          status === "pending" &&
                          handleStatusUpdate(hotel._id, status)
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

                      {/* ACTIONS */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(hotel._id)}
                          className="px-3 py-1 bg-[#048314] text-white rounded text-xs"
                        >
                          View
                        </button>

                        <button
                          onClick={() => handleEdit(hotel)}
                          disabled={hotel.status === "approved"}
                          className={`px-3 py-1 rounded text-xs ${hotel.status === "approved"
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-500 text-white"
                            }`}
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(hotel._id)}
                          className="px-3 py-1 bg-red-500 text-white rounded text-xs"
                        >
                          Delete
                        </button>
                      </div>
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
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-2 bg-white shadow-md rounded-xl px-4 py-2">

            {/* Previous */}
            <button
              onClick={() => setCurrentPage((prev) => prev - 1)}
              disabled={!pagination.hasPrevPage}
              className={`px-3 py-1 rounded-lg text-sm ${pagination.hasPrevPage
                  ? "bg-gray-100 hover:bg-gray-200"
                  : "bg-gray-50 text-gray-400 cursor-not-allowed"
                }`}
            >
              ←
            </button>

            {/* Page Numbers */}
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .slice(
                Math.max(0, currentPage - 3),
                Math.min(pagination.totalPages, currentPage + 2)
              )
              .map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-lg text-sm ${currentPage === page
                      ? "bg-indigo-600 text-white shadow"
                      : "bg-gray-100 hover:bg-gray-200"
                    }`}
                >
                  {page}
                </button>
              ))}

            {/* Next */}
            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={!pagination.hasNextPage}
              className={`px-3 py-1 rounded-lg text-sm ${pagination.hasNextPage
                  ? "bg-gray-100 hover:bg-gray-200"
                  : "bg-gray-50 text-gray-400 cursor-not-allowed"
                }`}
            >
              →
            </button>
          </div>
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

            <h2 className="text-lg md:text-xl font-semibold mb-4">
              {editHotel ? "Edit Hotel" : "Add Hotel"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Hotel Name"
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
                <input
                  type="email"
                  placeholder="Email"
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
                <input
                  type="text"
                  placeholder="Phone"
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
                <input
                  type="text"
                  placeholder="Address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full border border-gray-200 px-4 py-2 rounded text-sm"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    placeholder="City"
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
                  <input
                    type="text"
                    placeholder="Country"
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
                    <input
                      type="text"
                      placeholder="Admin Name"
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
                    <input
                      type="text"
                      placeholder="Admin Username"
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
                      <input
                        type="password"
                        placeholder="Password"
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
                      <input
                        type="password"
                        placeholder="Confirm Password"
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
                className="w-full py-2 bg-indigo-600 text-white rounded font-medium disabled:opacity-50 text-sm"
              >
                {editHotel
                  ? updateLoading
                    ? "Updating..."
                    : "Update Hotel"
                  : addLoading
                    ? "Adding..."
                    : "Add Hotel"}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Hotels;
