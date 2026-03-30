import axios from "axios";

const APIs = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}`,
  withCredentials: true,
});

APIs.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

APIs.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data);
    return Promise.reject(error);
  }
);

export default APIs;

export const loginUser = async ({ email, password }) => {
  const { data } = await APIs.post("/admin/doctor-login", {
    email,
    password,
  });
  return data;
};
