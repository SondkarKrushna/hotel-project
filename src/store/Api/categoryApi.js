import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export const categoryApi = createApi({
  reducerPath: "categoryApi",

  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ["Category"],

  endpoints: (builder) => ({
    // ✅ GET
    getCategories: builder.query({
      query: ({ role, hotelId, page = 1, limit = 10 }) => {
        if (role === "HOTEL_ADMIN") {
          return `/api/category/hotel/${hotelId}?page=${page}&limit=${limit}`;
        }
        return `/api/category?page=${page}&limit=${limit}`;
      },
      providesTags: ["Category"],
    }),

    // ✅ CREATE
    createCategory: builder.mutation({
      query: (body) => ({
        url: "/api/category",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Category"],
    }),

    // ✅ FIXED UPDATE
    updateCategory: builder.mutation({
  query: ({ id, ...body }) => ({
    url: `/api/category/${id}`, // ✅ FIXED
    method: "PUT",
    body,
  }),
  invalidatesTags: ["Category"],
}),

    // ✅ DELETE
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/api/category/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;