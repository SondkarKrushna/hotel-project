import { useState, useMemo } from "react";
import Layout from "../../components/layout/Layout";
import Table from "../../components/tables/Table";

const Users = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 5;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);

  // ✅ STATIC USERS DATA
  const [users, setUsers] = useState([
    {
      _id: "1",
      fullName: "Monika Nikam",
      email: "monika@gmail.com",
      phone: "9876500000",
      role: "Admin",
      createdAt: "2025-01-10",
    },
    {
      _id: "2",
      fullName: "Rahul Sharma",
      email: "rahul@gmail.com",
      phone: "9876543210",
      role: "Manager",
      createdAt: "2025-01-12",
    },
    {
      _id: "3",
      fullName: "Neha Patil",
      email: "neha@gmail.com",
      phone: "9123456789",
      role: "User",
      createdAt: "2025-01-15",
    },
    {
      _id: "4",
      fullName: "Amit Deshmukh",
      email: "amit@gmail.com",
      phone: "9998887776",
      role: "User",
      createdAt: "2025-01-18",
    },
  ]);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "",
    password: "",
    confirmPassword: "",
  });

  // ✅ Search users
  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      user.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.role?.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  // ✅ Pagination
  const totalPages = Math.ceil(filteredUsers.length / limit);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * limit,
    currentPage * limit
  );

  // ✅ Open Add Modal
  const handleAdd = () => {
    setEditUser(null);
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

  // ✅ Open Edit Modal
  const handleEdit = (user) => {
    setEditUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      password: "",
      confirmPassword: "",
    });
    setIsModalOpen(true);
  };

  // ✅ Delete User
  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    setUsers((prev) => prev.filter((user) => user._id !== id));
    alert("User deleted successfully!");
  };

  // ✅ Add / Update User
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.phone || !formData.role) {
      return alert("All fields are required!");
    }

    if (!editUser) {
      if (!formData.password || !formData.confirmPassword) {
        return alert("Password and Confirm Password required!");
      }

      if (formData.password !== formData.confirmPassword) {
        return alert("Passwords do not match!");
      }

      const newUser = {
        _id: Date.now().toString(),
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        createdAt: new Date().toISOString(),
      };

      setUsers((prev) => [newUser, ...prev]);
      alert("User added successfully!");
    } else {
      setUsers((prev) =>
        prev.map((user) =>
          user._id === editUser._id
            ? {
                ...user,
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                role: formData.role,
              }
            : user
        )
      );

      alert("User updated successfully!");
    }

    setIsModalOpen(false);
  };

  const columns = [
    {
      label: "Full Name",
      key: "fullName",
      render: (row) => row.fullName || "N/A",
    },
    {
      label: "Email",
      key: "email",
      render: (row) => row.email || "N/A",
    },
    {
      label: "Phone",
      key: "phone",
      render: (row) => row.phone || "N/A",
    },
    {
      label: "Role",
      key: "role",
      render: (row) => row.role || "N/A",
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

  return (
    <Layout>
      {/* Header + Search + Add */}
      <div className="mb-6 mt-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold">Users</h1>
          <p className="text-sm text-gray-500">
            Showing {filteredUsers.length} users
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search user..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="border px-4 py-2 rounded w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <Table columns={columns} data={paginatedUsers} />
      </div>

      {/* Pagination */}
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
              {editUser ? "Edit User" : "Add User"}
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

              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full border px-4 py-2 rounded"
              >
                <option value="">Select Role</option>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="User">User</option>
              </select>

              {/* Password only for Add */}
              {!editUser && (
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
                {editUser ? "Update User" : "Add User"}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Users;
