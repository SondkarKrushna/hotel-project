import { useState, useMemo } from "react";
import Layout from "../../components/layout/Layout";
import Table from "../../components/tables/Table";
import {
  useGetEmployeesQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
  useGetHotelEmployeesQuery,
} from "../../store/Api/employeeApi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Employees = () => {
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const navigate = useNavigate();

  // ✅ Get user role and hotel ID from localStorage and Redux
  const userRole = useMemo(() => {
    const user = JSON.parse(localStorage.getItem("adminUser"));
    return user?.role;
  }, []);

  const hotelId = useMemo(() => {
    const user = JSON.parse(localStorage.getItem("adminUser"));
    const hotel = user?.hotel || user?.hotel || localStorage.getItem("hotelId");
    console.log("hotelId from localStorage:", hotel);
    return hotel;
  }, []);
  const isAdmin = userRole === "HOTEL_ADMIN";
  const isSuperAdmin = userRole === "SUPER_ADMIN";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);

  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    phone: "",
    // role: "",
    password: "",
    confirmPassword: "",
  });

  // ✅ API Hooks - Get all employees (superadmin)
  const { data: allData, isLoading: allLoading } = useGetEmployeesQuery(
    undefined,
    { skip: !isSuperAdmin }
  );

  // ✅ API Hooks - Get hotel employees (admin)
  const { data: hotelData, isLoading: hotelLoading } = useGetHotelEmployeesQuery(
    hotelId,
    { skip: !isAdmin || !hotelId }
  );

  const [createEmployee] = useCreateEmployeeMutation();
  const [updateEmployee] = useUpdateEmployeeMutation();
  const [deleteEmployee] = useDeleteEmployeeMutation();

  // ✅ Determine which data to use based on role
  const data = isSuperAdmin ? allData : hotelData;
  const isLoading = isSuperAdmin ? allLoading : hotelLoading;

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
      // role: emp.role || "",
      username: emp.username || "",
      hotelName: emp.hotel?.name || "", // For superadmin view
    }));
  }, [data]);

  // ✅ Search
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) =>
      emp.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      emp.email?.toLowerCase().includes(search.toLowerCase()) ||
      // emp.role?.toLowerCase().includes(search.toLowerCase()) ||
      (isSuperAdmin && emp.hotelName?.toLowerCase().includes(search.toLowerCase()))
    );
  }, [employees, search, isSuperAdmin]);

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
      // role: "",
      password: "",
      confirmPassword: "",
    });
    setIsModalOpen(true);
  };

  // ✅ Edit
  const handleEdit = (employee) => {
    setEditEmployee(employee);
    setFormData({
      username: employee.username,
      fullName: employee.fullName,
      email: employee.email,
      phone: employee.phone,
      // role: employee.role,
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
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
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    // if (!formData.role.trim()) {
    //   newErrors.role = "Role is required";
    // }

    if (!editEmployee) {
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  // ✅ Submit (Add + Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) return;

    try {
      if (!editEmployee) {
        await createEmployee({
          username: formData.username,
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          // role: formData.role,
          password: formData.password,
        }).unwrap();

        toast.success("Staff added successfully");
      } else {
        await updateEmployee({
          id: editEmployee._id,
          body: {
            username: formData.username,
            name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            // role: formData.role,
          },
        }).unwrap();
        toast.success("Staff updated successfully");
      }

      setIsModalOpen(false);
      setEditEmployee(null);
    } catch (error) {
      toast.error(error?.data?.message || "Something went wrong");
    }
  };


  const columns = [
    {
  label: "Full Name",
  key: "fullName",
  render: (row) => (
    <button
      onClick={() => navigate(`/staff/staffdetails/${row._id}`)}
      className="text-indigo-600 hover:underline font-medium"
    >
      {row.fullName}
    </button>
  ),
},
    // { label: "Role", key: "role" },
    { label: "Email", key: "email" },
    { label: "Phone", key: "phone" },
    ...(isSuperAdmin
      ? [
        {
          label: "Hotel",
          key: "hotelName",
          render: (row) => row.hotelName || "N/A",
        },
      ]
      : []),
    ...(isAdmin
      ? [
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
      ]
      : []),
  ];
  return (
    <Layout>
      <div className="mb-6 mt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-xl md:text-2xl font-semibold">
          {isSuperAdmin ? "All Staff" : "Hotel Staff"}
        </h1>

        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder={isSuperAdmin ? "Search staff..." : "Search staff..."}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-200 px-4 py-2 rounded text-sm md:text-base"
          />

          {isAdmin && (
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-indigo-600 text-white rounded text-sm md:text-base whitespace-nowrap"
            >
              + Add
            </button>
          )}
        </div>
      </div>

      <Table columns={columns} data={paginatedEmployees} loading={isLoading} />

      {/* Pagination */}
      {totalPages > 1 && (
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
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-xl"
            >
              ✕
            </button>

            <h2 className="text-lg md:text-xl font-semibold mb-4">
              {editEmployee ? "Edit Staff" : "Add Staff"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Full Name */}
              <div>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={(e) => {
                    setFormData({ ...formData, fullName: e.target.value });
                    setErrors({ ...errors, fullName: "" });
                  }}
                  className={`w-full px-4 py-2 rounded border ${errors.fullName ? "border-red-500" : "border-gray-200"
                    }`}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.fullName}
                  </p>
                )}
              </div>
              {/* Username */}
              <div>
                <input
                  type="text"
                  placeholder="Username"
                  value={formData.username}
                  onChange={(e) => {
                    setFormData({ ...formData, username: e.target.value });
                    setErrors({ ...errors, username: "" });
                  }}
                  className={`w-full px-4 py-2 rounded border ${errors.username ? "border-red-500" : "border-gray-200"
                    }`}
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.username}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    setErrors({ ...errors, email: "" });
                  }}
                  className={`w-full px-4 py-2 rounded border ${errors.email ? "border-red-500" : "border-gray-200"
                    }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    setErrors({ ...errors, phone: "" });
                  }}
                  className={`w-full px-4 py-2 rounded border ${errors.phone ? "border-red-500" : "border-gray-200"
                    }`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Role */}
              {/* <div>
                <input
                  type="text"
                  placeholder="Role (Manager, Chef, etc.)"
                  value={formData.role}
                  onChange={(e) => {
                    setFormData({ ...formData, role: e.target.value });
                    setErrors({ ...errors, role: "" });
                  }}
                  className={`w-full px-4 py-2 rounded border ${errors.role ? "border-red-500" : "border-gray-200"
                    }`}
                />
                {errors.role && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.role}
                  </p>
                )}
              </div> */}

              {/* Password Fields (Only on Add) */}
              {!editEmployee && (
                <>
                  <div>
                    <input
                      type="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        setErrors({ ...errors, password: "" });
                      }}
                      className={`w-full px-4 py-2 rounded border ${errors.password ? "border-red-500" : "border-gray-200"
                        }`}
                    />
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.password}
                      </p>
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
                      className={`w-full px-4 py-2 rounded border ${errors.confirmPassword ? "border-red-500" : "border-gray-200"
                        }`}
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </>
              )}
              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 transition text-white rounded font-medium"
              >
                {editEmployee ? "Update Staff" : "Add Staff"}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Employees;
