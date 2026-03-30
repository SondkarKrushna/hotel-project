import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export const orderApi = createApi({
  reducerPath: "orderApi",

  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: "include",

    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.auth?.token;

      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),

  // ✅ Declare all tag types ONCE
  tagTypes: ["Dashboard", "Orders"],

  // ✅ Declare endpoints ONCE
  endpoints: (builder) => ({
    
    // 🏨 HOTEL ADMIN DASHBOARD
    getHotelDashboard: builder.query({
      query: (hotelId) => `/api/hotels/${hotelId}/dashboard`,
      providesTags: ["Dashboard"],
    }),

    // 👑 SUPER ADMIN DASHBOARD
    getSuperAdminDashboard: builder.query({
      query: ({ page = 1, limit = 10 } = {}) =>
        `/api/hotels/super/dashboard?page=${page}&limit=${limit}`,
      providesTags: ["Dashboard"],
    }),

    // 📦 ORDERS LIST
    getOrders: builder.query({
      query: ({ page = 1, limit = 10 } = {}) =>
        `/api/orders?page=${page}&limit=${limit}`,
      providesTags: ["Orders"],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetHotelDashboardQuery,
  useGetSuperAdminDashboardQuery,
} = orderApi;