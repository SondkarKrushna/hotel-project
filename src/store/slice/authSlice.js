import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: localStorage.getItem("adminToken") || null,
  user: JSON.parse(localStorage.getItem("adminUser")) || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;

      localStorage.setItem("adminToken", action.payload.token);
      localStorage.setItem("adminUser", JSON.stringify(action.payload.user));
    },

    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
