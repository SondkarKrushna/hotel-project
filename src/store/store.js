import { configureStore } from "@reduxjs/toolkit"
import { loginApi } from "./Api/loginApi"
import { orderApi } from "./Api/orderApi";
import authReducer from "./slice/authSlice"
import { hotelApi } from "./Api/hotelApi";
import { dishApi } from "./Api/dishApi";
import { categoryApi } from "./Api/categoryApi";
import { employeeApi } from "./Api/employeeApi";
import { subscriptionApi } from "./Api/subscriptionApi";
import { profileApi } from "./Api/profileApi";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        [loginApi.reducerPath]: loginApi.reducer,
        [orderApi.reducerPath]: orderApi.reducer,
        [hotelApi.reducerPath]: hotelApi.reducer,
        [dishApi.reducerPath]: dishApi.reducer,
        [categoryApi.reducerPath]: categoryApi.reducer,
        [employeeApi.reducerPath]: employeeApi.reducer,
        [subscriptionApi.reducerPath]: subscriptionApi.reducer,
        [profileApi.reducerPath]: profileApi.reducer,
   },

    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            loginApi.middleware,
            orderApi.middleware,
            hotelApi.middleware,
            dishApi.middleware,
            categoryApi.middleware,
            employeeApi.middleware,
            subscriptionApi.middleware,
            profileApi.middleware,
       ),
});