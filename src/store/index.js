// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import monitorReducer from './slices/monitorSlice.js';
import authReducer from './slices/authSlice.js';
import systemConstantsReducer from './slices/systemConstantsSlice.js';

export const store = configureStore({
  reducer: {
    monitor: monitorReducer,
    auth: authReducer,  // 添加认证状态管理
    systemConstants: systemConstantsReducer,  // 添加系统常量管理
  },
});

export default store;