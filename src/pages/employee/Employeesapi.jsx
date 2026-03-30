import { useState, useMemo } from "react";
import Layout from "../../components/layout/Layout";
import Table from "../../components/tables/Table";
import {
  useGetEmployeesQuery,
  useGetHotelEmployeesQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} from "../../store/Api/employeeApi";
import { toast } from "react-toastify";

const Employees = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 5;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "",
    password: "",
    confirmPassword: "",
  });

  // ✅ Get user role from localStorage
  const userRole = useMemo(() => {
    const user = JSON.parse(localStorage.getItem("adminUser"));
    return user?.role;
  }, []);

  const hotelId = useMemo(() => {
    const user = JSON.parse(localStorage.getItem("adminUser"));
    return user?.hotel?._id || user?.hotel?.id || localStorage.getItem("hotelId");
  }, []);

  const isAdmin = userRole === "HOTEL_ADMIN";
  const isSuperAdmin = userRole === "SUPER_ADMIN";

  // ✅ Fetch employees based on role
  const { data: allData, isLoading: allLoading, error: allError } = useGetEmployeesQuery(
    undefined,
    { skip: !isSuperAdmin }
  );
  const { data: hotelData, isLoading: hotelLoading, error: hotelError } = useGetHotelEmployeesQuery(
    hotelId,
    { skip: !isAdmin || !hotelId }
  );

  // Use appropriate data based on role
  const data = isSuperAdmin ? allData : hotelData;
  const isLoading = isSuperAdmin ? allLoading : hotelLoading;
  const error = isSuperAdmin ? allError : hotelError;
  const [createEmployee] = useCreateEmployeeMutation();
  const [updateEmployee] = useUpdateEmployeeMutation();
  const [deleteEmployee] = useDeleteEmployeeMutation();

  const employees = useMemo(() => {
    // Log to debug
    console.log("isSuperAdmin:", isSuperAdmin, "isAdmin:", isAdmin, "data:", data);
    
    if (!data) return [];
    
    // Handle both response structures
    const staffData = Array.isArray(data?.data) 
      ? data.data 
      : Array.isArray(data?.staff) 
        ? data.staff 
        : [];

    if (!Array.isArray(staffData)) return [];

    return staffData.map((emp) => ({
      _id: emp._id,
      fullName: emp.profile?.name || emp.name || "",
      email: emp.profile?.email || emp.email || "",
      phone: emp.phone || "",
      role: emp.role || "",
      username: emp.username || "",
      hotelName: emp.hotel?.name || "", // For superadmin view
    }));
  }, [data]);

  // ✅ Search
  const filteredEmployees = useMemo(() => {
    return employees.filter(
      (emp) =>
        emp.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        emp.email?.toLowerCase().includes(search.toLowerCase()) ||
        emp.role?.toLowerCase().includes(search.toLowerCase())
    );
  }, [employees, search]);

  const totalPages = Math.ceil(filteredEmployees.length / limit);

  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * limit,
    currentPage * limit
  );

  // ✅ Add
  const handleAdd = () => {
    setEditEmployee(null);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      role: "",
      password: "",
      confirmPassword: "",
    });
    setIsModalOpen(true);
  };

  // ✅ Edit
  const handleEdit = (employee) => {
    setEditEmployee(employee);
    setFormData({
      fullName: employee.fullName,
      email: employee.email,
      phone: employee.phone,
      role: employee.role,
      password: "",
      confirmPassword: "",
    });
    setIsModalOpen(true);
  };

  // ✅ Delete
  const handleDelete = async (id, name) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete this employee`
    );

    if (!confirmDelete) return;

    try {
      await deleteEmployee(id).unwrap();
      toast.success("Employee deleted successfully");
    } catch (error) {
      toast.error(error?.data?.message || "Delete failed");
    }
  };

  // ✅ Submit (Add + Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.phone || !formData.role) {
      return toast.error("All fields are required");
    }

    try {
      if (!editEmployee) {
        if (!formData.password || !formData.confirmPassword) {
          return toast.error("Password required");
        }

        if (formData.password !== formData.confirmPassword) {
          return toast.error("Passwords do not match");
        }

        await createEmployee(formData).unwrap();
        toast.success("Employee added successfully");
      } else {
        await updateEmployee({
          id: editEmployee._id,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
        }).unwrap();

        toast.success("Employee updated successfully");
      }

      setIsModalOpen(false);
    } catch (error) {
      toast.error(error?.data?.message || "Something went wrong");
    }
  };

  const columns = [
    { label: "Full Name", key: "fullName" },
    { label: "Email", key: "email" },
    { label: "Phone", key: "phone" },
    { label: "Role", key: "role" },
    {
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="px-3 py-1 bg-blue-500 text-white rounded text-xs"
          >
            Edit
          </button>

          <button
            onClick={() => handleDelete(row._id, row.fullName)}
            className="px-3 py-1 bg-red-500 text-white rounded text-xs"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="mb-6 mt-6 flex justify-between items-center">
        <h1 className="text-xl font-semibold">Employees</h1>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search employee..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="border px-4 py-2 rounded"
          />

          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            + Add
          </button>
        </div>
      </div>

      <Table columns={columns} data={paginatedEmployees} loading={isLoading} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-3 mt-6">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-4 py-2 border rounded"
          >
            Prev
          </button>

          <span>
            {currentPage} / {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-4 py-2 border rounded"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal (same as your UI — no design change) */}
      {/* Keep your existing modal JSX exactly same */}
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
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-xl"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold mb-4">
              {editEmployee ? "Edit Employee" : "Add Employee"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className="w-full border px-4 py-2 rounded"
              />

              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full border px-4 py-2 rounded"
              />

              <input
                type="text"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full border px-4 py-2 rounded"
              />

              <input
                type="text"
                placeholder="Role (Manager, Chef, etc.)"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full border px-4 py-2 rounded"
              />

              {/* Password only for Add */}
              {!editEmployee && (
                <>
                  <input
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full border px-4 py-2 rounded"
                  />

                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full border px-4 py-2 rounded"
                  />
                </>
              )}

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 text-white rounded font-medium"
              >
                {editEmployee ? "Update Employee" : "Add Employee"}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Employees;