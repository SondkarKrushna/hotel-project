import { useState, useMemo } from "react";
import Layout from "../components/layout/Layout";
import Table from "../components/tables/Table";
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

  const limit = 10;
  
    const user = useMemo(() => {
  return JSON.parse(localStorage.getItem("adminUser"));
}, []);
// console.log("user==",user)

const userRole = user?.role;
const hotelId = user?.hotel;

const isSuperAdmin = userRole === "SUPER_ADMIN";
const isHotelAdmin = userRole === "HOTEL_ADMIN";
const isAdmin  = userRole === "HOTEL_ADMIN";

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

  if (selectedCategory) {
    await updateCategory({
      id: selectedCategory._id, // ✅ FIXED
      ...payload,
    });
  } else {
    await createCategory(payload);
  }

  setOpenModal(false);
  setSelectedCategory(null);
};

  const handleDelete = async (id) => {
    if (window.confirm("Delete this category?")) {
      await deleteCategory(id);
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
            onClick={() => handleDelete(row._id)}
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
      {!isLoading && (
        <div className="flex flex-wrap justify-center md:justify-end gap-2 md:gap-3 mt-6">
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.max(prev - 1, 1))
            }
            disabled={currentPage === 1}
            className="px-3 md:px-4 py-2 bg-gray-200 rounded disabled:opacity-50 text-sm md:text-base"
          >
            Previous
          </button>

          <span className="px-3 md:px-4 py-2 text-sm md:text-base">
            Page {currentPage} of {totalPages || 1}
          </span>

          <button
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(prev + 1, totalPages)
              )
            }
            disabled={currentPage === totalPages}
            className="px-3 md:px-4 py-2 bg-gray-200 rounded disabled:opacity-50 text-sm md:text-base"
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
            className="bg-white p-6 rounded-xl w-full max-w-md"
          >
            <h2 className="text-lg font-semibold mb-4">
              {selectedCategory ? "Edit Category" : "Add Category"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="name"
                defaultValue={selectedCategory?.name}
                placeholder="Category Name"
                required
                className="border border-gray-200 w-full px-3 py-2 rounded"
              />

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
                  className="px-4 py-2 bg-indigo-600 text-white rounded"
                >
                  {selectedCategory ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Categories;