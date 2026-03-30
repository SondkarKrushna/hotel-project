import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export const profileApi = createApi({
    reducerPath: "profileApi",

    baseQuery: fetchBaseQuery({
        baseUrl,
        credentials: "include",
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth?.token;
            if (token) headers.set("authorization", `Bearer ${token}`);
            return headers;
        },
    }),

    tagTypes: ["Profile"],

    endpoints: (builder) => ({
        getProfile: builder.query({
            query: () => "/api/profile/get",
            providesTags: ["Profile"],
        }),
    }),
});

export const { useGetProfileQuery } = profileApi;
