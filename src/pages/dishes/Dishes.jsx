import { useState, useMemo, useEffect } from "react";
import Table from "../../components/tables/Table";
import {
    useGetDishesQuery,
    useCreateDishMutation,
    useUpdateDishMutation,
    useDeleteDishMutation,
    useBulkUploadDishMutation,
} from "../../store/Api/dishApi";
import { useGetCategoriesQuery } from "../../store/Api/categoryApi";
import { toast } from "react-toastify";
import { ScaleLoader } from "react-spinners";

const Dishes = () => {
    const [errors, setErrors] = useState({});
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedDish, setSelectedDish] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [openBulkModal, setOpenBulkModal] = useState(false);
    const [bulkCategory, setBulkCategory] = useState("");
    const [bulkFile, setBulkFile] = useState(null);
    const [bulkErrors, setBulkErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    // Controlled dish form state
    const [dishForm, setDishForm] = useState({
        name: "",
        price: "",
        type: "veg",
        isAvailable: "true",
        category: "",
    });

    const [bulkUploadDish, { isLoading: bulkLoading }] =
        useBulkUploadDishMutation();

    const limit = 10;
    const user = useMemo(() => {
        return JSON.parse(localStorage.getItem("adminUser"));
    }, []);
    // console.log("user==", user)

    const userRole = user?.role;
    const hotelId = user?.hotel;

    const isSuperAdmin = userRole === "SUPER_ADMIN";
    const isHotelAdmin = userRole === "HOTEL_ADMIN";
    const isAdmin = userRole === "HOTEL_ADMIN";


    const { data, isLoading, isError } = useGetDishesQuery({
        role: userRole,
        hotelId,
        page: currentPage,
        limit,
    });

    useEffect(() => {
        // console.log("useGetDishesQuery ->", { data, isLoading, isError });
    }, [data, isLoading, isError]);
    const [createDish] = useCreateDishMutation();
    const [updateDish] = useUpdateDishMutation();
    const [deleteDish] = useDeleteDishMutation();


    const { data: categoryData, isLoading: catLoading } = useGetCategoriesQuery({
        role: userRole,
        hotelId,
        page: currentPage,
        limit,
    });
    const categories = useMemo(() => {
        if (!Array.isArray(categoryData?.data)) return [];
        return categoryData.data;
    }, [categoryData]);

    const allDishes = useMemo(() => {
        if (Array.isArray(data?.data)) return data.data;
        if (Array.isArray(data)) return data;
        return [];
    }, [data]);

    const filteredDishes = useMemo(() => {
        return allDishes.filter((dish) =>
            dish.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [allDishes, search]);

    // Get totalPages from API response pagination object
    const totalPages = data?.pagination?.totalPages || Math.ceil(filteredDishes.length / limit);

    // Use server-provided page data when not searching; when searching, paginate client-side
    const paginatedDishes = search
        ? filteredDishes.slice((currentPage - 1) * limit, currentPage * limit)
        : allDishes;

    // ✅ Reset page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    // 🔹 Handle Save (Add + Edit)
    const handleSubmit = async (e) => {
        e.preventDefault();

        const name = dishForm.name?.trim();
        const price = dishForm.price;
        const type = dishForm.type;
        const isAvailable = dishForm.isAvailable;
        const category = dishForm.category;

        let newErrors = {};

        if (!name) newErrors.name = "Dish name is required";
        if (!price) newErrors.price = "Price is required";
        else if (Number(price) <= 0) newErrors.price = "Price must be greater than 0";
        if (!category) newErrors.category = "Category is required";

        setErrors(newErrors);
        if (Object.keys(newErrors).length !== 0) return;

        const payload = {
            name,
            price: Number(price),
            type,
            isAvailable: isAvailable === "true",
            category,
        };

        const toastId = toast.loading(
            selectedDish ? "Updating dish..." : "Creating dish..."
        );

        try {
            setIsSubmitting(true);

            if (selectedDish) {
                await updateDish({ id: selectedDish._id || selectedDish.id, ...payload }).unwrap();

                toast.update(toastId, {
                    render: "Dish updated successfully ✅",
                    type: "success",
                    isLoading: false,
                    autoClose: 2000,
                });
            } else {
                await createDish(payload).unwrap();

                toast.update(toastId, {
                    render: "Dish added successfully ✅",
                    type: "success",
                    isLoading: false,
                    autoClose: 2000,
                });
            }

            setOpenModal(false);
            setSelectedDish(null);
            setErrors({});
        } catch (error) {
            toast.update(toastId, {
                render: error?.data?.message || "Something went wrong ❌",
                type: "error",
                isLoading: false,
                autoClose: 2000,
            });

            setErrors({
                apiError: error?.data?.message || "Something went wrong",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        const toastId = toast.loading("Deleting dish...");

        try {
            await deleteDish(deleteId).unwrap();

            toast.update(toastId, {
                render: "Dish deleted successfully 🗑️",
                type: "success",
                isLoading: false,
                autoClose: 2000,
            });

        } catch (error) {
            toast.update(toastId, {
                render: error?.data?.message || "Delete failed ❌",
                type: "error",
                isLoading: false,
                autoClose: 2000,
            });
        } finally {
            setShowDeleteModal(false);
            setDeleteId(null);
        }
    };
    const handleBulkUpload = async (e) => {
        e.preventDefault();

        let errors = {};

        if (!bulkCategory) {
            errors.category = "Category is required";
        }

        if (!bulkFile) {
            errors.file = "Excel file is required";
        }

        if (bulkFile) {
            const allowedTypes = [
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/vnd.ms-excel",
            ];

            if (!allowedTypes.includes(bulkFile.type)) {
                errors.file = "Only .xlsx or .xls files are allowed";
            }

            if (bulkFile.size > 5 * 1024 * 1024) {
                errors.file = "File size must be less than 5MB";
            }
        }

        setBulkErrors(errors);

        if (Object.keys(errors).length > 0) return;

        try {
            const formData = new FormData();
            formData.append("file", bulkFile);
            formData.append("categoryId", bulkCategory);
            formData.append("hotelId", hotelId);

            await bulkUploadDish(formData).unwrap();

            toast.success("Bulk upload successful ✅");

            setOpenBulkModal(false);
            setBulkCategory("");
            setBulkFile(null);
            setBulkErrors({});

        } catch (error) {
            toast.error(error?.data?.message || "Bulk upload failed ❌");
        }
    };

    const columns = [
        { label: "Name", key: "name" },
        {
            label: "Category",
            render: (row) => row.category?.name || "N/A",
        },
        {
            label: "Price",
            render: (row) => `₹${row.price}`,
        },
        { label: "Type", key: "type" },
        {
            label: "Available",
            render: (row) => (
                <span
                    className={
                        row.isAvailable ? "text-green-600" : "text-red-600"
                    }
                >
                    {row.isAvailable ? "Yes" : "No"}
                </span>
            ),
        },

        // ✅ Conditionally add Actions column
        ...(isAdmin
            ? [
                {
                    label: "Actions",
                    render: (row) => (
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setSelectedDish(row);
                                    setDishForm({
                                        name: row.name || "",
                                        price: row.price?.toString() || "",
                                        type: row.type || "veg",
                                        isAvailable: row.isAvailable?.toString() || "true",
                                        category: row.category?._id || "",
                                    });
                                    setErrors({});
                                    setOpenModal(true);
                                }}
                                className="px-3 py-1 bg-blue-500 text-white rounded text-xs"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => {
                                    setDeleteId(row._id);
                                    setShowDeleteModal(true);
                                }}
                                className="px-3 py-1 bg-red-500 text-white rounded text-xs"
                            >
                                Delete
                            </button>
                        </div>
                    ),
                },
            ]
            : []),
    ];

    return (
        <>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-6 mb-6 gap-4">
                <h1 className="text-xl md:text-2xl font-semibold">All Dishes</h1>

                <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        placeholder="Search dish..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border px-4 py-2 rounded text-sm md:text-base"
                    />
                    {isHotelAdmin && (
                        <>
                            <button
                                onClick={() => {
                                    setSelectedDish(null);
                                    setDishForm({ name: "", price: "", type: "veg", isAvailable: "true", category: "" });
                                    setErrors({});
                                    setOpenModal(true);
                                }}
                                className="bg-indigo-600 text-white px-4 py-2 rounded text-sm"
                            >
                                + Add Dish
                            </button>

                            <button
                                onClick={() => setOpenBulkModal(true)}
                                className="bg-green-600 text-white px-4 py-2 rounded text-sm"
                            >
                                ⬆ Bulk Upload
                            </button>
                        </>
                    )}

                </div>
            </div>

            <Table
                columns={columns}
                data={paginatedDishes}
                loading={isLoading}
            />

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
                <div className="flex flex-wrap justify-center gap-2 md:gap-3 mt-6">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 md:px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 text-sm md:text-base transition-colors hover:bg-gray-300 font-medium"
                    >
                        Previous
                    </button>

                    <span className="px-3 md:px-4 py-2 text-sm md:text-base font-medium text-gray-700">
                        Page {currentPage} of {totalPages || 1}
                    </span>

                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 md:px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 text-sm md:text-base transition-colors hover:bg-gray-300 font-medium"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* ✅ Modal */}
            {openModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setOpenModal(false)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white p-6 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl"
                    >
                        <button
                            onClick={() => setOpenModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-xl transition-colors"
                        >
                            ✕
                        </button>

                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </span>
                            {selectedDish ? "Edit Dish" : "Add Dish"}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {errors.apiError && (
                                <p className="text-red-500 text-sm text-center">
                                    {errors.apiError}
                                </p>
                            )}

                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
                                    Dish Name
                                </label>
                                <input
                                    type="text"
                                    value={dishForm.name}
                                    onChange={(e) => {
                                        setDishForm({ ...dishForm, name: e.target.value });
                                        setErrors({ ...errors, name: "" });
                                    }}
                                    placeholder="Enter dish name"
                                    className={`border w-full px-3 py-2 rounded ${errors.name
                                        ? "border-red-500"
                                        : "border-gray-300"
                                        }`}
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Price (₹)
                                </label>
                                <input
                                    type="number"
                                    value={dishForm.price}
                                    onChange={(e) => {
                                        setDishForm({ ...dishForm, price: e.target.value });
                                        setErrors({ ...errors, price: "" });
                                    }}
                                    placeholder="Enter price"
                                    className={`border w-full px-3 py-2 rounded ${errors.price
                                        ? "border-red-500"
                                        : "border-gray-300"
                                        }`}
                                />
                                {errors.price && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.price}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" /></svg>
                                    Type
                                </label>
                                <select
                                    value={dishForm.type}
                                    onChange={(e) => setDishForm({ ...dishForm, type: e.target.value })}
                                    className="border w-full px-3 py-2 rounded text-sm border-gray-300"
                                >
                                    <option value="veg">Veg</option>
                                    <option value="non-veg">Non Veg</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Availability
                                </label>
                                <select
                                    value={dishForm.isAvailable}
                                    onChange={(e) => setDishForm({ ...dishForm, isAvailable: e.target.value })}
                                    className="border w-full px-3 py-2 rounded text-sm border-gray-300"
                                >
                                    <option value="true">Available</option>
                                    <option value="false">Not Available</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
                                    Category
                                </label>
                                <select
                                    disabled={catLoading}
                                    value={dishForm.category}
                                    onChange={(e) => {
                                        setDishForm({ ...dishForm, category: e.target.value });
                                        setErrors({ ...errors, category: "" });
                                    }}
                                    className={`border w-full px-3 py-2 rounded text-sm ${errors.category
                                        ? "border-red-500"
                                        : "border-gray-300"
                                        }`}
                                >
                                    <option value="">
                                        {catLoading
                                            ? "Loading..."
                                            : "Select Category"}
                                    </option>

                                    {categories.map((cat) => (
                                        <option key={cat._id} value={cat._id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.category && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.category}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setOpenModal(false)}
                                    className="px-4 py-2 bg-gray-200 rounded text-sm"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded text-sm flex justify-center items-center disabled:opacity-60"
                                >
                                    {isSubmitting ? (
                                        <ScaleLoader color="#fff" height={12} width={3} />
                                    ) : selectedDish ? (
                                        "Update"
                                    ) : (
                                        "Create"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {openBulkModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setOpenBulkModal(false)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white p-6 rounded-xl w-full max-w-md"
                    >
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                            </span>
                            Bulk Upload Dishes
                        </h2>

                        <form onSubmit={handleBulkUpload} className="space-y-4">

                            {/* Category Select */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
                                    Category
                                </label>
                                <select
                                    value={bulkCategory}
                                    onChange={(e) => {
                                        setBulkCategory(e.target.value);
                                        setBulkErrors((prev) => ({ ...prev, category: "" }));
                                    }}
                                    className={`border w-full px-3 py-2 rounded ${bulkErrors.category ? "border-red-500" : "border-gray-300"
                                        }`}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat._id} value={cat._id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>

                                {bulkErrors.category && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {bulkErrors.category}
                                    </p>
                                )}
                            </div>

                            {/* File Upload */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                                    Upload File (.xlsx, .xls)
                                </label>
                                <input
                                    type="file"
                                    accept=".xlsx,.xls"
                                    onChange={(e) => {
                                        setBulkFile(e.target.files[0]);
                                        setBulkErrors((prev) => ({ ...prev, file: "" }));
                                    }}
                                    className={`border w-full px-3 py-2 rounded ${bulkErrors.file ? "border-red-500" : "border-gray-300"
                                        }`}
                                    key={bulkFile ? bulkFile.name : "empty"}
                                />

                                {bulkFile && (
                                    <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                                        📄 {bulkFile.name}
                                    </p>
                                )}

                                {bulkErrors.file && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {bulkErrors.file}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setOpenBulkModal(false)}
                                    className="px-4 py-2 bg-gray-200 rounded"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={bulkLoading}
                                    className="px-4 py-2 bg-green-600 text-white rounded flex justify-center items-center disabled:opacity-60"
                                >
                                    {bulkLoading ? (
                                        <ScaleLoader color="#fff" height={12} width={3} />
                                    ) : (
                                        "Upload"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {showDeleteModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md">

                        <h3 className="text-lg font-bold text-gray-800 mb-3">
                            Confirm Delete
                        </h3>

                        <p className="text-sm text-gray-600 mb-5">
                            Are you sure you want to delete this dish? This action cannot be undone.
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 bg-gray-200 rounded"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
};

export default Dishes;