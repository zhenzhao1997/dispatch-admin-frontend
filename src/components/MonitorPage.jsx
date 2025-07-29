// src/components/MonitorPage.jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { updateDriverLocation, setConnectionStatus } from '../store/slices/monitorSlice.js';
import L from 'leaflet';

// 修复Leaflet图标显示问题
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const MonitorPage = () => {
  const dispatch = useDispatch();
  const { driverLocations, isConnected, lastUpdate } = useSelector(state => state.monitor);

  useEffect(() => {
    // 建立SSE连接
    const token = localStorage.getItem('admin_token');
    if (!token) {
      console.error('未找到管理员令牌');
      return;
    }

    const eventSource = new EventSource(`http://localhost:8080/v1/events/admin?token=${token}`);

    eventSource.onopen = () => {
      console.log('🔗 SSE连接已建立');
      dispatch(setConnectionStatus(true));
    };

    eventSource.onmessage = (event) => {
      try {
        const sseEvent = JSON.parse(event.data);
        console.log('📡 收到SSE事件:', sseEvent);

        if (sseEvent.type === 'driver_location_updated') {
          dispatch(updateDriverLocation(sseEvent.data));
        }
      } catch (error) {
        console.error('解析SSE事件失败:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('🔥 SSE连接错误:', error);
      dispatch(setConnectionStatus(false));
    };

    // 清理函数
    return () => {
      eventSource.close();
      dispatch(setConnectionStatus(false));
    };
  }, [dispatch]);

  return (
    <div className="h-full flex flex-col">
      {/* 顶部状态栏 */}
      <div className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">实时监控</h1>
        <div className="flex items-center space-x-4">
          <div className={`flex items-center ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
            <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            {isConnected ? '已连接' : '未连接'}
          </div>
          <div className="text-gray-600">
            在线司机: {Object.keys(driverLocations).length}
          </div>
          {lastUpdate && (
            <div className="text-gray-500 text-sm">
              最后更新: {new Date(lastUpdate).toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      {/* 地图容器 */}
      <div className="flex-1 relative">
        <MapContainer
          center={[-37.8136, 144.9631]} // 墨尔本默认中心点
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* 渲染司机位置标记 */}
          {Object.entries(driverLocations).map(([driverId, location]) => (
            <Marker key={driverId} position={[location.lat, location.lng]}>
              <Popup>
                <div className="text-center">
                  <div className="font-bold">司机 #{driverId}</div>
                  <div className="text-sm text-gray-600">
                    位置: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                  </div>
                  <div className="text-sm text-gray-500">
                    时间: {new Date(location.recorded_at).toLocaleString()}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* 如果没有司机在线，显示提示 */}
        {Object.keys(driverLocations).length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
            <div className="text-center">
              <div className="text-xl font-bold mb-2">暂无司机位置数据</div>
              <div className="text-gray-300">等待司机上报位置信息...</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonitorPage;