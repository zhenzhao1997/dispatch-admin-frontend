// src/store/slices/systemConstantsSlice.js
// 【技术总监V3.0】系统常量Redux切片 - 统一的业务术语字典管理

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// =================================================================
// 异步Action：从后端获取系统常量字典
// =================================================================

export const fetchSystemConstants = createAsyncThunk(
  'systemConstants/fetchConstants',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/system/constants');
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 带语言和角色参数的获取
export const fetchSystemConstantsWithOptions = createAsyncThunk(
  'systemConstants/fetchConstantsWithOptions',
  async ({ locale = 'zh-CN', role = 'admin' }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/system/constants/locale?locale=${locale}&role=${role}`);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// =================================================================
// SystemConstants Slice
// =================================================================

const systemConstantsSlice = createSlice({
  name: 'systemConstants',
  initialState: {
    // 字典数据
    order_status: {},
    order_type: {},
    service_level: {},
    driver_type: {},
    states: {},
    compliance_status: {},
    rule_type: {},
    complaint_status: {},
    adjustment_type: {},
    payment_status: {},
    registration_states: {},
    issue_type: {},
    media_type: {},
    message_type: {},
    rating_levels: {},
    currency: {},
    timezones: {},
    api_info: {},
    
    // 状态管理
    loading: false,
    error: null,
    lastUpdated: null,
    isInitialized: false,
  },
  reducers: {
    // 清除错误
    clearError: (state) => {
      state.error = null;
    },
    
    // 重置状态
    resetConstants: (state) => {
      Object.keys(state).forEach(key => {
        if (typeof state[key] === 'object' && key !== 'api_info') {
          state[key] = {};
        }
      });
      state.loading = false;
      state.error = null; 
      state.lastUpdated = null;
      state.isInitialized = false;
    },
    
    // 手动更新特定字典（用于热更新）
    updateDictionary: (state, action) => {
      const { key, data } = action.payload;
      if (state.hasOwnProperty(key)) {
        state[key] = data;
        state.lastUpdated = new Date().toISOString();
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchSystemConstants
      .addCase(fetchSystemConstants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSystemConstants.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.lastUpdated = new Date().toISOString();
        state.isInitialized = true;
        
        // 更新所有字典数据
        Object.keys(action.payload).forEach(key => {
          if (state.hasOwnProperty(key)) {
            state[key] = action.payload[key];
          }
        });
      })
      .addCase(fetchSystemConstants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isInitialized = false;
      })
      
      // fetchSystemConstantsWithOptions
      .addCase(fetchSystemConstantsWithOptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSystemConstantsWithOptions.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.lastUpdated = new Date().toISOString();
        state.isInitialized = true;
        
        // 更新字典数据
        Object.keys(action.payload).forEach(key => {
          if (state.hasOwnProperty(key)) {
            state[key] = action.payload[key];
          }
        });
      })
      .addCase(fetchSystemConstantsWithOptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, resetConstants, updateDictionary } = systemConstantsSlice.actions;

// =================================================================
// Selectors - 用于组件中获取翻译后的文本
// =================================================================

// 基础选择器
export const selectSystemConstants = (state) => state.systemConstants;
export const selectConstantsLoading = (state) => state.systemConstants.loading;
export const selectConstantsError = (state) => state.systemConstants.error;
export const selectIsInitialized = (state) => state.systemConstants.isInitialized;

// 字典选择器
export const selectOrderStatusMap = (state) => state.systemConstants.order_status;
export const selectOrderTypeMap = (state) => state.systemConstants.order_type;
export const selectServiceLevelMap = (state) => state.systemConstants.service_level;
export const selectDriverTypeMap = (state) => state.systemConstants.driver_type;
export const selectStatesMap = (state) => state.systemConstants.states;
export const selectRegistrationStatesMap = (state) => state.systemConstants.registration_states;

// 【核心功能】翻译选择器 - 组件中直接使用
export const makeSelectTranslatedText = (dictionaryKey) => (state) => (key) => {
  const dictionary = state.systemConstants[dictionaryKey];
  return dictionary[key] || key; // 如果找不到翻译，返回原始值
};

// 便捷的翻译选择器
export const selectOrderStatusText = (state) => (status) => {
  return state.systemConstants.order_status[status] || `状态${status}`;
};

export const selectOrderTypeText = (state) => (type) => {
  return state.systemConstants.order_type[type] || type;
};

export const selectServiceLevelText = (state) => (level) => {
  return state.systemConstants.service_level[level] || level;
};

export const selectDriverTypeText = (state) => (type) => {
  return state.systemConstants.driver_type[type] || type;
};

export const selectStateText = (state) => (stateCode) => {
  return state.systemConstants.states[stateCode] || stateCode;
};

// 带样式信息的选择器
export const selectRegistrationStateInfo = (state) => (stateCode) => {
  const stateInfo = state.systemConstants.registration_states[stateCode];
  if (stateInfo) {
    return {
      name: stateInfo.name,
      shortName: stateInfo.short_name,
      color: stateInfo.color,
    };
  }
  return {
    name: stateCode,
    shortName: stateCode,
    color: 'gray',
  };
};

export default systemConstantsSlice.reducer;