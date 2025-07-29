// src/store/slices/monitorSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  driverLocations: {}, // 结构：{ driver_id: { lat, lng, recorded_at } }
  isConnected: false,
  lastUpdate: null,
};

const monitorSlice = createSlice({
  name: 'monitor',
  initialState,
  reducers: {
    updateDriverLocation: (state, action) => {
      const { driver_id, lat, lng, recorded_at } = action.payload;
      state.driverLocations[driver_id] = { lat, lng, recorded_at };
      state.lastUpdate = new Date().toISOString();
    },
    setConnectionStatus: (state, action) => {
      state.isConnected = action.payload;
    },
    clearAllLocations: (state) => {
      state.driverLocations = {};
    },
  },
});

export const { updateDriverLocation, setConnectionStatus, clearAllLocations } = monitorSlice.actions;
export default monitorSlice.reducer;