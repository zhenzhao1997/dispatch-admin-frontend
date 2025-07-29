// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import monitorReducer from './slices/monitorSlice.js';

export const store = configureStore({
  reducer: {
    monitor: monitorReducer,
  },
});

export default store;