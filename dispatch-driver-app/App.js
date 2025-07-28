import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// 【核心修正】移除了所有路径中的 'src/'
import { AuthProvider, useAuth } from './context/AuthContext.js';
import LoginScreen from './screens/LoginScreen.js';
import HomeScreen from './screens/HomeScreen.js';
import OrderPoolScreen from './screens/OrderPoolScreen.js';

const Tab = createBottomTabNavigator();

function AppTabs() {
    return (
        <Tab.Navigator screenOptions={{ headerShown: false }}>
            <Tab.Screen name="MyOrders" component={HomeScreen} options={{ title: '我的订单' }} />
            <Tab.Screen name="OrderPool" component={OrderPoolScreen} options={{ title: '订单池' }} />
        </Tab.Navigator>
    );
}

function AppContent() {
    const { userToken } = useAuth();
    return (
        <NavigationContainer>
            {userToken == null ? (
                <LoginScreen />
            ) : (
                <AppTabs />
            )}
        </NavigationContainer>
    );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}