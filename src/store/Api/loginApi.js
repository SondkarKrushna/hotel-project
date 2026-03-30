import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = `${import.meta.env.VITE_BACKEND_URL}`;

export const loginApi = createApi({
    reducerPath: "loginApi",
    baseQuery: fetchBaseQuery({ baseUrl, credentials: "include" }),
    endpoints: (builder) => ({
        loginUser: builder.mutation({
            query: (data) => ({
                url: "/api/auth/login",
                method: "POST",
                body: data,
            }),
        }),
        registerHotel: builder.mutation({
            query: (data) => ({
                url: "/api/hotels/register",
                method: "POST",
                body: data,
            }),
        }),
        verifyPayment: builder.mutation({
            query: ({ token, ...data }) => ({
                url: "/api/subscription/verify-payment",
                method: "POST",
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` })
                },
                body: data,
            }),
        }),
    }),
});

export const {
    useLoginUserMutation,
    useRegisterHotelMutation,
    useVerifyPaymentMutation
} = loginApi;