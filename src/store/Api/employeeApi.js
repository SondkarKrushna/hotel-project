import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const employeeApi = createApi({
    reducerPath: "employeeApi",

    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_BACKEND_URL}`,
        prepareHeaders: (headers, { getState }) => {
            const token = getState()?.auth?.token;
            if (token) {
                headers.set("authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),

    tagTypes: ["Employee"],

    endpoints: (builder) => ({

        // ✅ GET ALL EMPLOYEES
        getEmployees: builder.query({
            query: () => ({
                url: `/api/staff/all`,
            }),
            providesTags: ["Employee"],
        }),
        // ✅ GET ALL EMPLOYEES by hotel
        getHotelEmployees: builder.query({
            query: (hotelId) => {
                //console.log("HotelId in API:", hotelId);

                return {
                    url: `/api/staff/hotel/${hotelId}`,
                    method: "GET",
                };
            },
            providesTags: ["Employee"],
        }),

        // ✅ GET SINGLE EMPLOYEE (optional)
        getEmployeeById: builder.query({
            query: (id) => `/api/staff/${id}`,
            providesTags: ["Employee"],
        }),

        getEmployeeProfile: builder.query({
            query: (id) => `/api/staff/${id}/mega-profile`,
            providesTags: ["Employee"]
        }),

        // ✅ CREATE EMPLOYEE
        createEmployee: builder.mutation({
            query: (body) => ({
                url: "/api/staff",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Employee"],
        }),

        // ✅ UPDATE EMPLOYEE
        updateEmployee: builder.mutation({
            query: ({ id, body }) => ({
                url: `/api/staff/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["Employee"],
        }),

        // ✅ DELETE EMPLOYEE
        deleteEmployee: builder.mutation({
            query: (id) => ({
                url: `/api/staff/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Employee"],
        }),
    }),
});

export const {
    useGetEmployeesQuery,
    useGetHotelEmployeesQuery,
    useGetEmployeeByIdQuery,
    useGetEmployeeProfileQuery,
    useCreateEmployeeMutation,
    useUpdateEmployeeMutation,
    useDeleteEmployeeMutation,
} = employeeApi;

