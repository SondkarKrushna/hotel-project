import { useState, useMemo, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Table from "../../components/tables/Table";
import Skeleton from "../../components/ui/Skeleton";

import {
  useGetHotelsQuery,
  useAddHotelMutation,
  useUpdateHotelMutation,
  useDeleteHotelMutation,
} from "../../store/Api/hotelApi";
import { toast } from "react-toastify";

const Hotels = () => {
  const [search, setSearch] = useState("");
  const [errors, setErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editHotel, setEditHotel] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
  });

  // ✅ Fetch hotels
  const { data, isLoading, isError } = useGetHotelsQuery({
    page: 1,
    limit: 1000,
  });

  const [addHotel, { isLoading: addLoading }] = useAddHotelMutation();
  const [updateHotel, { isLoading: updateLoading }] = useUpdateHotelMutation();
  const [deleteHotel] = useDeleteHotelMutation();

  const allHotels = useMemo(() => {
    if (!Array.isArray(data?.data)) return [];
    return [...data.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [data]);

  // ✅ Search hotels
  const filteredHotels = useMemo(() => {
    return allHotels.filter((hotel) =>
      hotel.name?.toLowerCase().includes(search.toLowerCase()) ||
      hotel.email?.toLowerCase().includes(search.toLowerCase()) ||
      hotel.phone?.toLowerCase().includes(search.toLowerCase()) ||
      hotel.city?.toLowerCase().includes(search.toLowerCase())
    );
  }, [allHotels, search]);

  // ✅ Pagination
  //const totalPages = Math.ceil(filteredHotels.length / limit);
  const totalPages = Math.max(1, Math.ceil(filteredHotels.length / limit));
  const paginatedHotels = filteredHotels.slice(
    (currentPage - 1) * limit,
    currentPage * limit
  );

  // ✅ Open Add Modal
  const handleAdd = () => {
    setEditHotel(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "",
    });
    setIsModalOpen(true);
  };

  // ✅ Open Edit Modal
  const handleEdit = (hotel) => {
    setEditHotel(hotel);
    setFormData({
      name: hotel.name || "",
      email: hotel.email || "",
      phone: hotel.phone || "",
      address: hotel.address || "",
      city: hotel.city || "",
      country: hotel.country || "",
    });
    setIsModalOpen(true);
  };

  // ✅ Delete Hotel
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this hotel?")) return;

    try {
      await deleteHotel(id).unwrap();
      toast.success("Hotel deleted successfully!");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete hotel");
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
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{7,15}$/.test(formData.phone)) {
      newErrors.phone = "Phone must be 7–15 digits";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };
  // ✅ Handle Submit (Add / Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (editHotel) {
        await updateHotel({
          id: editHotel._id,
          body: formData,
        }).unwrap();
      } else {
        await addHotel(formData).unwrap();
      }

      setIsModalOpen(false);
      setErrors({});
    } catch (error) {
      alert(error?.data?.message || "Something went wrong");
    }
  };

  const columns = [
    {
      label: "Hotel Name",
      key: "name",
      render: (row) => row.name || "N/A",
    },
    {
      label: "Location",
      key: "city",
      render: (row) =>
        `${row.city || ""}, ${row.country || ""}`,
    },
    {
      label: "Contact Details",
      key: "contact",
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{row.email}</span>
          <span className="text-xs text-gray-500">{row.phone}</span>
        </div>
      ),
    },
    {
      label: "Actions",
      key: "actions",
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="px-3 py-1 bg-blue-500 text-white rounded text-xs"
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
      {/* Header + Search + Add Button */}
      <div className="mb-6 mt-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        {isLoading ? (
          <>
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-10 w-full sm:w-64" />
          </>
        ) : (
          <>
            <div>
              <h1 className="text-xl font-semibold">Hotels</h1>
              <p className="text-sm text-gray-500">
                Showing {filteredHotels.length} hotels
              </p>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search hotel..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-gray-200 px-4 py-2 rounded w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                + Add
              </button>
            </div>
          </>
        )}
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <div className="sm:text-base text-xs">
          {isLoading ? (
            <div className="bg-white p-4 rounded-xl shadow-sm">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center mb-4">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              ))}
            </div>
          ) : (
            <Table columns={columns} data={paginatedHotels} loading={isLoading} />
          )}
        </div>
      </div>

      {/* Pagination */}
      {!isLoading && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>

          <span className="px-4 py-2">
            Page {currentPage} of {totalPages || 1}
          </span>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 relative"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-xl"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold mb-4">
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
                  className={`w-full border px-4 py-2 rounded ${errors.name ? "border-red-500" : "border-gray-200"
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
                  className={`w-full border px-4 py-2 rounded ${errors.email ? "border-red-500" : "border-gray-200"
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
                  className={`w-full border px-4 py-2 rounded ${errors.phone ? "border-red-500" : "border-gray-200"
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
                  className="w-full border border-gray-200 px-4 py-2 rounded"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => {
                    setFormData({ ...formData, city: e.target.value });
                    setErrors({ ...errors, city: "" });
                  }}
                  className={`w-full border px-4 py-2 rounded ${errors.city ? "border-red-500" : "border-gray-200"
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
                  className={`w-full border px-4 py-2 rounded ${errors.country ? "border-red-500" : "border-gray-200"
                    }`}
                />
                {errors.country && (
                  <p className="text-red-500 text-xs mt-1">{errors.country}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={addLoading || updateLoading}
                className="w-full py-2 bg-indigo-600 text-white rounded font-medium disabled:opacity-50"
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
