import React, { useState } from 'react';
import { Settings, MapPin, DollarSign, Clock } from 'lucide-react';

// 子组件（稍后实现）
import PricingRulesTab from './pricing/PricingRulesTab.jsx';
import PricingZonesTab from './pricing/PricingZonesTab.jsx';
import PricingSurchargesTab from './pricing/PricingSurchargesTab.jsx';

function PricingStrategyPage() {
    const [activeTab, setActiveTab] = useState('rules');

    const tabs = [
        {
            id: 'rules',
            name: '计价规则',
            icon: DollarSign,
            description: '管理基础计费规则'
        },
        {
            id: 'zones', 
            name: '计费区域',
            icon: MapPin,
            description: '管理地理区域和邮编'
        },
        {
            id: 'surcharges',
            name: '附加费',
            icon: Clock,
            description: '管理时间段附加费'
        }
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'rules':
                return <PricingRulesTab />;
            case 'zones':
                return <PricingZonesTab />;
            case 'surcharges':
                return <PricingSurchargesTab />;
            default:
                return <PricingRulesTab />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 页面头部 */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6">
                        <div className="flex items-center">
                            <Settings className="h-8 w-8 text-indigo-600 mr-3" />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">定价策略中心</h1>
                                <p className="text-gray-600 mt-1">管理计费规则、区域和附加费设置</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab导航 */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-8">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                            activeTab === tab.id
                                                ? 'border-indigo-500 text-indigo-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <Icon className={`mr-2 h-5 w-5 ${
                                            activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'
                                        }`} />
                                        <span>{tab.name}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Tab描述 */}
                    <div className="mt-4 mb-6">
                        <p className="text-gray-600">
                            {tabs.find(tab => tab.id === activeTab)?.description}
                        </p>
                    </div>

                    {/* Tab内容 */}
                    <div className="bg-white rounded-lg shadow-sm border">
                        {renderTabContent()}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PricingStrategyPage;