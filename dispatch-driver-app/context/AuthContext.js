// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState(null);

    useEffect(() => {
        const bootstrapAsync = async () => {
            let token;
            try {
                token = await AsyncStorage.getItem('driver_token');
            } catch (e) { /* restoring token failed */ }
            setUserToken(token);
            setIsLoading(false);
        };
        bootstrapAsync();
    }, []);

    const authContext = {
        login: async (token) => {
            setIsLoading(true);
            await AsyncStorage.setItem('driver_token', token);
            setUserToken(token);
            setIsLoading(false);
        },
        logout: async () => {
            setIsLoading(true);
            await AsyncStorage.removeItem('driver_token');
            setUserToken(null);
            setIsLoading(false);
        },
        userToken,
    };

    if (isLoading) {
        return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" /></View>;
    }

    return (
        <AuthContext.Provider value={authContext}>
            {children}
        </AuthContext.Provider>
    );
};

// 创建一个自定义 Hook，方便其他组件使用
export const useAuth = () => {
    return useContext(AuthContext);
};