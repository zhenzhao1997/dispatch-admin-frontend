// src/store/slices/authSlice.js
// 认证状态管理切片

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false,
  token: null,
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 开始登录
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    
    // 登录成功
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user || null;
      state.error = null;
    },
    
    // 登录失败
    loginFailure: (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      state.error = action.payload;
    },
    
    // 登出
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      state.error = null;
      state.loading = false;
    },
    
    // 从localStorage恢复认证状态
    restoreAuth: (state, action) => {
      if (action.payload.token) {
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user || null;
      }
    },
    
    // 清除错误
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  restoreAuth,
  clearError,
} = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthToken = (state) => state.auth.token;
export const selectAuthUser = (state) => state.auth.user;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;