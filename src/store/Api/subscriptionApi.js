import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export const subscriptionApi = createApi({
    reducerPath: "subscriptionApi",

    baseQuery: fetchBaseQuery({
        baseUrl,
        credentials: "include",
        prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
    }),

    tagTypes: ["Subscriptions"],

    endpoints: (builder) => ({
        getAllSubscriptions: builder.query({
            query: () => "/api/plans",
            providesTags: ["Subscriptions"],
        }),
        addplans: builder.mutation({
            query: (data) => ({
                url: "/api/plans/admin",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Subscriptions"],
        }),
        updatePlanStatus: builder.mutation({
            query: ({ id, isActive }) => ({
                url: `/api/plans/admin/${id}`,
                method: "PATCH",
                body: { isActive },
            }),
            invalidatesTags: ["Subscriptions"],
        }),
        rechargeSubscription: builder.mutation({
            query: (data) => ({
                url: "/api/subscription/recharge",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Subscriptions"],
        }),
    }),
});

export const {
    useGetAllSubscriptionsQuery,
    useAddplansMutation,
    useUpdatePlanStatusMutation,
    useRechargeSubscriptionMutation,
} = subscriptionApi;