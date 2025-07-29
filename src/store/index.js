// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import monitorReducer from './slices/monitorSlice.js';
import authReducer from './slices/authSlice.js';

// 创建一个简化的 systemConstants reducer 避免错误
const systemConstantsSlice = {
  name: 'systemConstants',
  reducer: (state = { 
    order_status: {},
    order_type: {},
    service_level: {},
    loading: false,
    error: null,
    isInitialized: true // 设为true避免无限加载
  }, action) => {
    switch (action.type) {
      default:
        return state;
    }
  }
};

export const store = configureStore({
  reducer: {
    monitor: monitorReducer,
    auth: authReducer,
    systemConstants: systemConstantsSlice.reducer,
  },
});

// 导出简化的selectors
export const selectIsInitialized = (state) => state.systemConstants.isInitialized;
export const selectConstantsLoading = (state) => state.systemConstants.loading;
export const selectConstantsError = (state) => state.systemConstants.error;
export const selectSystemConstants = (state) => state.systemConstants;
export const selectOrderStatusText = (state) => (status) => {
  const statusMap = {
    0: '待处理',
    1: '已派单',
    2: '司机已接单',
    3: '前往接驾',
    4: '已到达',
    5: '服务中',
    6: '已完成',
    7: '已取消'
  };
  return statusMap[status] || '未知';
};
export const selectOrderTypeText = (state) => (type) => {
  const typeMap = {
    'airport_pickup': '机场接机',
    'airport_dropoff': '机场送机',
    'point_to_point': '点对点',
    'charter': '包车'
  };
  return typeMap[type] || type;
};
export const selectServiceLevelText = (state) => (level) => {
  const levelMap = {
    'Economy': '经济型',
    'Comfort': '舒适型',
    'Luxury': '豪华型'
  };
  return levelMap[level] || level;
};

export default store;