import { useState, useMemo } from "react";
import Layout from "../components/layout/Layout";
import Table from "../components/tables/Table";
import { toast } from "react-toastify";
import { ScaleLoader } from "react-spinners";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "../store/Api/categoryApi";

const Categories = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const limit = 10;

  const user = useMemo(() => {
    return JSON.parse(localStorage.getItem("adminUser"));
  }, []);
  // console.log("user==",user)

  const userRole = user?.role;
  const hotelId = user?.hotel;

  const isSuperAdmin = userRole === "SUPER_ADMIN";
  const isHotelAdmin = userRole === "HOTEL_ADMIN";
  const isAdmin = userRole === "HOTEL_ADMIN";

  const { data, isLoading, isError } = useGetCategoriesQuery({
    role: userRole,
    hotelId,
    page: currentPage,
    limit,
  });
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const allCategories = useMemo(() => {
    if (!Array.isArray(data?.data)) return [];
    return [...data.data].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [data]);

  const filteredCategories = useMemo(() => {
    return allCategories.filter((cat) =>
      cat.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [allCategories, search]);

  const totalPages = Math.ceil(filteredCategories.length / limit);

  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * limit,
    currentPage * limit
  );

  // 🔹 Add / Update
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const payload = {
      name: formData.get("name"),
    };

    try {
      setIsSubmitting(true);

      if (selectedCategory) {
        await updateCategory({
          id: selectedCategory._id,
          ...payload,
        }).unwrap();

        toast.success("Category updated successfully!");
      } else {
        await createCategory(payload).unwrap();

        toast.success("Category created successfully!");
      }

      setOpenModal(false);
      setSelectedCategory(null);

    } catch (error) {
      toast.error(error?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCategory(deleteId).unwrap();

      toast.success("Category deleted successfully!");
      setDeleteModalOpen(false);
      setDeleteId(null);

    } catch (error) {
      toast.error(error?.data?.message || "Delete failed");
    }
  };

  const columns = [
    { label: "Name", key: "name" },

    {
      label: "Created At",
      render: (row) =>
        new Date(row.createdAt).toLocaleDateString(),
    },

    ...(isAdmin
      ? [
        {
          label: "Actions",
          render: (row) => (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedCategory(row);
                  setOpenModal(true);
                }}
                className="px-3 py-1 bg-blue-500 text-white rounded text-xs"
              >
                Edit
              </button>

              <button
                onClick={() => {
                  setDeleteId(row._id);
                  setDeleteModalOpen(true);
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

  if (isError) {
    return (
      <Layout>
        <p className="text-red-500">Failed to load categories</p>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-6 mb-6 gap-4">
        <h1 className="text-xl md:text-2xl font-semibold">All Categories</h1>

        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search category..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="border px-4 py-2 rounded text-sm md:text-base"
          />
          {isAdmin && (
            <button
              onClick={() => {
                setSelectedCategory(null);
                setOpenModal(true);
              }}
              className="bg-indigo-600 text-white px-4 py-2 rounded text-sm md:text-base whitespace-nowrap"
            >
              + Add Category
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={paginatedCategories}
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

      {/* Modal */}
      {openModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setOpenModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl relative"
          >
            <button
              onClick={() => setOpenModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-xl transition-colors"
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
              </span>
              {selectedCategory ? "Edit Category" : "Add Category"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
                  Category Name
                </label>
                <input
                  name="name"
                  defaultValue={selectedCategory?.name}
                  placeholder="Enter category name"
                  required
                  className="border border-gray-200 w-full px-3 py-2 rounded"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded flex justify-center items-center disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <ScaleLoader color="#fff" height={12} width={3} />
                  ) : selectedCategory ? (
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
      {deleteModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setDeleteModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-6 rounded-xl w-full max-w-sm"
          >
            <h2 className="text-lg font-semibold mb-4 text-red-600">
              Confirm Delete
            </h2>

            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this category?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
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
    </Layout>

  );
};

export default Categories;