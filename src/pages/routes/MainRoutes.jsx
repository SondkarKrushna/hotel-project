import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Login from "../../pages/Login";
import Register from "../Register";
import AdminDashboard from "../AdminDashboard";
import MyOrders from "../MyOrders";
import TotalRevenue from "../TotalRevenue"; 
import Hotels from "../hotels/Hotels";
import Employees from "../employee/Employees";
import Dishes from "../dishes/Dishes"
import Categories from "../Categories";
import HotelDetails from "../hotels/HotelDetails";
import EmployeeDetails from "../employee/EmployeeDetails";
import Subscriptions from "../subscriptions/Subscriptions";
import Profile from "../Profile";

const MainRoutes = () => {
  const user = useSelector((state) => state.auth.user);

  return (
    <Routes>
      <Route path = "/" element = {<Login />} />
      <Route path = "/register" element = {<Register />} />
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="myorders" element={<MyOrders />} />
      <Route path="totalrevenue" element={<TotalRevenue />} />
      <Route path="allhotels" element={<Hotels />} />
      <Route path="staff" element={<Employees />} />
      <Route path="dishes" element={<Dishes />} />
      <Route path="category" element={<Categories />} />
      <Route path="hotelDetails/:id" element={<HotelDetails />} />
      <Route path="staff/staffdetails/:id" element={<EmployeeDetails />} />
      <Route 
        path="subscriptions" 
        element={user?.role === "SUPER_ADMIN" ? <Subscriptions /> : <Navigate to="/dashboard" replace />} 
      />
      <Route path="profile" element={<Profile />} />
      </Routes>
  );
}; 

export default MainRoutes;
