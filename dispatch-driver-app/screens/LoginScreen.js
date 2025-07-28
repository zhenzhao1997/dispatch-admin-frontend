import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert, ActivityIndicator } from 'react-native';
// 【核心修正】从 'screens' 目录出发，上一级就是根目录，所以路径是 '../'
import { useAuth } from '../context/AuthContext.js'; 

const API_BASE_URL = 'http://192.168.50.38:8080/v1'; // 请再次确认IP

export default function LoginScreen() {
    const { login } = useAuth();
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/drivers/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || '登录失败');
            login(data.token);
        } catch (error) {
            Alert.alert('登录失败', error.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <View style={styles.container}>
            <Text style={styles.title}>司机端登录</Text>
            <TextInput style={styles.input} placeholder="手机号" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <TextInput style={styles.input} placeholder="密码" value={password} onChangeText={setPassword} secureTextEntry />
            {isLoading ? <ActivityIndicator size="large" color="#0000ff" /> : <Button title="登 录" onPress={handleLogin} />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 20, },
    title: { fontSize: 32, fontWeight: 'bold', marginBottom: 40, },
    input: { width: '100%', height: 50, borderColor: 'gray', borderWidth: 1, borderRadius: 5, marginBottom: 20, paddingHorizontal: 10, fontSize: 18, },
});