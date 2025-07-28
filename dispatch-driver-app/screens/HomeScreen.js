// screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.js';

const TABS = [ { title: '待服务', statuses: [1, 2, 3, 4] }, { title: '服务中', statuses: [5] }, { title: '已完成', statuses: [6] }, ];

const getStatusText = (status) => {
    const statusMap = { 0: '待处理', 1: '已派单', 2: '已接单', 3: '前往接驾', 4: '已到达', 5: '服务中', 6: '已完成', 7: '已取消' };
    return statusMap[status] || '未知状态';
};

const OrderItem = ({ item, onUpdateStatus }) => {
    const serviceTime = new Date(item.ServiceTime);
    let nextAction = null;
    if ([1, 2, 3].includes(item.Status)) { nextAction = { text: '我已到达', nextStatus: 4 }; }
    else if (item.Status === 4) { nextAction = { text: '开始行程', nextStatus: 5 }; }
    else if (item.Status === 5) { nextAction = { text: '完成行程', nextStatus: 6 }; }

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.orderType}>{item.OrderType === 'AirportTransfer' ? '接送机' : '包车'}</Text>
                <Text style={[styles.statusText, item.Status === 5 && styles.inProgressStatus]}>{getStatusText(item.Status)}</Text>
            </View>
            <View style={styles.cardBody}>
                <Text style={styles.timeText}>用车时间: {serviceTime.toLocaleDateString()} {serviceTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                <Text style={styles.addressText}>起: {item.PickupAddress}</Text>
                <Text style={styles.addressText}>终: {item.DropoffAddress}</Text>
            </View>
            {nextAction && (
                <View style={styles.cardFooter}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => onUpdateStatus(item.ID, nextAction.nextStatus)}>
                        <Text style={styles.actionButtonText}>{nextAction.text}</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};


export default function HomeScreen() {
    const { logout } = useAuth();
    const [allOrders, setAllOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTabIndex, setActiveTabIndex] = useState(0);

    const loadOrders = async () => {
        setIsLoading(true);
        try {
            const data = await api.get('/drivers/me/orders');
            setAllOrders(data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadOrders(); }, []);

    useEffect(() => {
        if (!isLoading) {
            const activeStatuses = TABS[activeTabIndex].statuses;
            const newFilteredOrders = allOrders.filter(order => activeStatuses.includes(order.Status));
            setFilteredOrders(newFilteredOrders);
        }
    }, [allOrders, activeTabIndex, isLoading]);

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await api.post(`/drivers/me/orders/${orderId}/status`, {
                status: newStatus
            });
            Alert.alert("成功", `订单状态已更新为: ${getStatusText(newStatus)}`);
            loadOrders();
        } catch (err) {
            Alert.alert("失败", "状态更新失败: " + err.message);
        }
    };
    
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>我的订单</Text>
                <Button title="退出登录" onPress={logout} color="#ff3b30" />
            </View>
            <View style={styles.tabContainer}>
                {TABS.map((tab, index) => (
                    <TouchableOpacity
                        key={tab.title}
                        style={[styles.tab, activeTabIndex === index && styles.activeTab]}
                        onPress={() => setActiveTabIndex(index)}
                    >
                        <Text style={[styles.tabText, activeTabIndex === index && styles.activeTabText]}>
                            {tab.title}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            
            {isLoading ? (
                <View style={styles.centerContainer}><ActivityIndicator size="large" /></View>
            ) : error ? (
                <View style={styles.centerContainer}><Text style={styles.errorText}>加载失败: {error}</Text></View>
            ) : (
                <FlatList
                    data={filteredOrders}
                    renderItem={({ item }) => <OrderItem item={item} onUpdateStatus={handleStatusUpdate} />}
                    keyExtractor={item => item.ID.toString()}
                    // 【核心修正】确保在列表为空时，文本也被 Text 组件包裹
                    ListEmptyComponent={<Text style={styles.emptyText}>这个分类下没有订单</Text>}
                    contentContainerStyle={{ paddingHorizontal: 10 }}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#ddd', backgroundColor: 'white' },
    title: { fontSize: 24, fontWeight: 'bold' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { color: 'red' },
    emptyText: { textAlign: 'center', marginTop: 50, color: 'gray' },
    tabContainer: { flexDirection: 'row', backgroundColor: 'white', paddingHorizontal: 10, paddingTop: 10 },
    tab: { paddingVertical: 10, paddingHorizontal: 15, borderBottomWidth: 2, borderBottomColor: 'transparent' },
    activeTab: { borderBottomColor: '#4f46e5' },
    tabText: { color: 'gray', fontWeight: '600' },
    activeTabText: { color: '#4f46e5' },
    card: { backgroundColor: 'white', borderRadius: 8, marginVertical: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.22, shadowRadius: 2.22, elevation: 3, },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, paddingTop: 15 },
    orderType: { fontWeight: 'bold', fontSize: 16 },
    statusText: { fontWeight: 'bold' },
    inProgressStatus: { color: '#059669' },
    cardBody: { paddingHorizontal: 15, paddingTop: 10, paddingBottom: 15 },
    timeText: { fontSize: 14, color: '#333', marginBottom: 5 },
    addressText: { fontSize: 14, color: '#555' },
    cardFooter: { borderTopWidth: 1, borderTopColor: '#f0f2f5', padding: 10 },
    actionButton: { backgroundColor: '#4f46e5', paddingVertical: 10, borderRadius: 5 },
    actionButtonText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
});