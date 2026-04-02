import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const hotelApi = createApi({
  reducerPath: "hotelApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BACKEND_URL,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ["Hotels"],

  endpoints: (builder) => ({
    getHotels: builder.query({
  query: ({ page = 1, limit = 10, search = "" }) => ({
    url: "/api/hotels",
    params: { page, limit, search },
  }),
  providesTags: ["Hotels"],
}),
    // ✅ NEW
    getHotelById: builder.query({
  query: ({ id, tab = "staff", page = 1, limit = 10 }) => ({
    url: `/api/hotels/${id}/dashboard`,
    params: { tab, page, limit }, // ✅ use params object, not string interpolation
  }),
  providesTags: ["Hotels"],
}),

    addHotel: builder.mutation({
      query: (body) => ({
        url: "/api/hotels",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Hotels"],
    }),

    updateHotel: builder.mutation({
      query: ({ id, body }) => ({
        url: `/api/hotels/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Hotels"],
    }),
    updateHotelStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/api/hotels/${id}/approve`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Hotels"],
    }),

    deleteHotel: builder.mutation({
      query: (id) => ({
        url: `/api/hotels/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Hotels"],
    }),
  }),
});


export const {
  useGetHotelsQuery,
  useGetHotelByIdQuery,
  useAddHotelMutation,
  useUpdateHotelMutation,
  useUpdateHotelStatusMutation,
  useDeleteHotelMutation,
} = hotelApi;

