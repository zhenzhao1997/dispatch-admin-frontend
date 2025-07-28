// screens/OrderPoolScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import api from '../utils/api.js';

const OrderItem = ({ item }) => {
    const serviceTime = new Date(item.ServiceTime);
    
    const handleGrabPress = async () => {
        Alert.alert(
            "确认抢单",
            `您确定要抢这笔去往 "${item.DropoffAddress}" 的订单吗？抢单成功后将直接分配给您！`,
            [
                { text: "取消", style: "cancel" },
                {
                    text: "确认",
                    onPress: async () => {
                        try {
                            const response = await api.post(`/drivers/me/order-pool/${item.ID}/request-grab`, {});
                            Alert.alert("成功", response.message || "抢单成功！订单已分配给您。");
                        } catch (error) {
                            Alert.alert("失败", error.message || "发送请求失败，请稍后再试。");
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.orderType}>{item.OrderType === 'AirportTransfer' ? '接送机' : '包车'}</Text>
                <Text style={styles.amountText}>${item.Amount.toFixed(2)}</Text>
            </View>
            <View style={styles.cardBody}>
                <Text style={styles.timeText}>用车时间: {serviceTime.toLocaleDateString()} {serviceTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                <Text style={styles.addressText}>起: {item.PickupAddress}</Text>
                <Text style={styles.addressText}>终: {item.DropoffAddress}</Text>
            </View>
            <View style={styles.cardFooter}>
                <TouchableOpacity style={styles.actionButton} onPress={handleGrabPress}>
                    <Text style={styles.actionButtonText}>我要接单</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default function OrderPoolScreen() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadOrders = async () => {
            setIsLoading(true);
            try {
                const data = await api.get('/drivers/me/order-pool');
                setOrders(data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        loadOrders();
    }, []);

    if (isLoading) {
        return <View style={styles.centerContainer}><ActivityIndicator size="large" /></View>;
    }
    if (error) {
        return <View style={styles.centerContainer}><Text style={styles.errorText}>加载失败: {error}</Text></View>;
    }
    
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>订单池</Text>
            </View>
            <FlatList
                data={orders}
                renderItem={({ item }) => <OrderItem item={item} />}
                keyExtractor={item => item.ID.toString()}
                // 【核心修正】确保在列表为空时，文本也被 Text 组件包裹
                ListEmptyComponent={<Text style={styles.emptyText}>当前订单池没有符合您资格的订单</Text>}
                contentContainerStyle={{ paddingHorizontal: 10 }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    header: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#ddd', backgroundColor: 'white' },
    title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { color: 'red' },
    emptyText: { textAlign: 'center', marginTop: 50, color: 'gray' },
    card: { backgroundColor: 'white', borderRadius: 8, marginVertical: 8, elevation: 3, },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, paddingTop: 15 },
    orderType: { fontWeight: 'bold', fontSize: 16 },
    amountText: { color: 'green', fontWeight: 'bold', fontSize: 16 },
    cardBody: { paddingHorizontal: 15, paddingTop: 10, paddingBottom: 15 },
    timeText: { fontSize: 14, color: '#333', marginBottom: 5 },
    addressText: { fontSize: 14, color: '#555' },
    cardFooter: { borderTopWidth: 1, borderTopColor: '#f0f2f5', padding: 10 },
    actionButton: { backgroundColor: '#10b981', paddingVertical: 10, borderRadius: 5 },
    actionButtonText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
});