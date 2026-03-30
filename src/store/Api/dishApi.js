import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export const dishApi = createApi({
  reducerPath: "dishApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Dish"],
  endpoints: (builder) => ({
    getDishes: builder.query({
      query: ({ role, page = 1, limit = 10 } = {}) => {
        // For SUPER_ADMIN, call /api/dish/all with pagination
        if (role === "SUPER_ADMIN") {
          return `/api/dish/all?page=${page}&limit=${limit}`;
        }
        // For other roles, call /api/dish with pagination
        return `/api/dish?page=${page}&limit=${limit}`;
      },
      providesTags: ["Dish"],
    }),

    createDish: builder.mutation({
      query: (body) => ({
        url: "/api/dish",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Dish"],
    }),

    updateDish: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/dish/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Dish"],
    }),
   
    bulkUploadDish: builder.mutation({
    query: (formData) => ({
        url: "/api/dish/bulk-upload",
        method: "POST",
        body: formData,
    }),
    invalidatesTags: ["Dish"], // VERY IMPORTANT
}),

    deleteDish: builder.mutation({
      query: (id) => ({
        url: `/api/dish/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Dish"],
    }),
  }),
});

export const {
  useGetDishesQuery,
  useBulkUploadDishMutation,
  useCreateDishMutation,
  useUpdateDishMutation,
  useDeleteDishMutation,
} = dishApi;