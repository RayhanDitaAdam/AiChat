import React, { useState, useEffect } from 'react';
import { getAdminStats } from '../../services/api.js';
import { Users, Store, MessageCircle, Package, ArrowUpRight, ArrowDownRight, MoreHorizontal } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import { PATHS } from '../../routes/paths.js';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        users: 0,
        owners: 0,
        totalChats: 0,
        totalProducts: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await getAdminStats();
                if (res.status === 'success') {
                    setStats(res.data);
                }
            } catch (error) {
                console.error('Failed to fetch admin stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Generate mock history data based on total chats
    const generateChartData = () => {
        const labels = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
        });

        const base = stats.totalChats > 0 ? stats.totalChats / 7 : 10;
        const dataPoints = labels.map((_, i) => Math.floor(base * (0.5 + Math.random() * (i * 0.2 + 0.5))));

        return {
            labels,
            datasets: [
                {
                    label: 'Platform Activity',
                    data: dataPoints,
                    borderColor: '#1C64F2', // Flowbite blue
                    backgroundColor: 'rgba(28, 100, 242, 0.1)',
                    borderWidth: 3,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#1C64F2',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.4
                }
            ]
        };
    };

    const generatePieData = () => {
        const approved = Math.floor(stats.owners * 0.85);
        const unapproved = stats.owners - approved;

        return {
            labels: ['Approved', 'Pending Validation'],
            datasets: [
                {
                    data: [approved, unapproved],
                    backgroundColor: ['#16BDCA', '#FDBA8C'], // Flowbite teal and orange
                    borderWidth: 0,
                    hoverOffset: 4
                }
            ]
        };
    };

    const generateBarData = () => {
        const retail = Math.floor(stats.owners * 0.5);
        const food = Math.floor(stats.owners * 0.3);
        const service = stats.owners - retail - food;

        return {
            labels: ['Retail', 'F&B', 'Service'],
            datasets: [
                {
                    label: 'Store Category',
                    data: [retail, food, service],
                    backgroundColor: ['#1C64F2', '#E74694', '#16BDCA'],
                    borderRadius: 4,
                    borderWidth: 0,
                    barThickness: 32,
                }
            ]
        };
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: '#111827',
                titleColor: '#fff',
                bodyColor: '#D1D5DB',
                padding: 12,
                cornerRadius: 8,
                displayColors: true,
            }
        },
        scales: {
            x: {
                grid: { display: false, drawBorder: false },
                ticks: { color: '#6B7280', font: { size: 12, family: 'Inter, sans-serif' } }
            },
            y: {
                grid: { color: '#E5E7EB', drawBorder: false, strokeDash: [4, 4] },
                ticks: { color: '#6B7280', font: { size: 12, family: 'Inter, sans-serif' }, padding: 10 },
                border: { dash: [4, 4], display: false },
                suggestedMin: 0
            }
        },
        interaction: { mode: 'nearest', axis: 'x', intersect: false }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in-up pb-10">
            {/* Header / Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Analytics</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Detailed growth metrics and platform performance data</p>
                </div>
                <div className="mt-4 sm:mt-0 flex gap-2">
                    <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                        <MoreHorizontal className="w-4 h-4 mr-2" />
                        Options
                    </button>
                </div>
            </div>

            {/* Top Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Users Card */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm dark:border-gray-700 dark:bg-gray-800 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center dark:bg-blue-900/30 dark:text-blue-500">
                            <Users size={20} strokeWidth={2.5} />
                        </div>
                        <span className="flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            <ArrowUpRight size={12} className="mr-1" />
                            8.2%
                        </span>
                    </div>
                    <div>
                        <h5 className="text-gray-500 text-sm font-normal dark:text-gray-400">Total Users</h5>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.users.toLocaleString()}</p>
                    </div>
                </div>

                {/* Stores Card */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm dark:border-gray-700 dark:bg-gray-800 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center dark:bg-purple-900/30 dark:text-purple-500">
                            <Store size={20} strokeWidth={2.5} />
                        </div>
                        <span className="flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            <ArrowUpRight size={12} className="mr-1" />
                            12.5%
                        </span>
                    </div>
                    <div>
                        <h5 className="text-gray-500 text-sm font-normal dark:text-gray-400">Active Stores</h5>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.owners.toLocaleString()}</p>
                    </div>
                </div>

                {/* Chats Card */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm dark:border-gray-700 dark:bg-gray-800 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center dark:bg-teal-900/30 dark:text-teal-500">
                            <MessageCircle size={20} strokeWidth={2.5} />
                        </div>
                        <span className="flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                            <ArrowDownRight size={12} className="mr-1" />
                            2.1%
                        </span>
                    </div>
                    <div>
                        <h5 className="text-gray-500 text-sm font-normal dark:text-gray-400">AI Chats Handled</h5>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalChats.toLocaleString()}</p>
                    </div>
                </div>

                {/* Products Card */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm dark:border-gray-700 dark:bg-gray-800 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center dark:bg-orange-900/30 dark:text-orange-500">
                            <Package size={20} strokeWidth={2.5} />
                        </div>
                        <span className="flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            <ArrowUpRight size={12} className="mr-1" />
                            5.4%
                        </span>
                    </div>
                    <div>
                        <h5 className="text-gray-500 text-sm font-normal dark:text-gray-400">Total Products</h5>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalProducts.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Main Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
                {/* Large Chart Card */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm dark:border-gray-700 dark:bg-gray-800 p-6 lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Platform Activity</h3>
                            <p className="text-sm font-normal text-gray-500 dark:text-gray-400">Daily interactions over the last 7 days</p>
                        </div>
                        <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-100 dark:bg-gray-700 dark:border-gray-600">
                            <button className="px-3 py-1.5 text-xs font-medium bg-white text-gray-900 rounded-md shadow-sm dark:bg-gray-800 dark:text-white">7 days</button>
                            <button className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">30 days</button>
                        </div>
                    </div>
                    <div className="h-[300px] w-full mt-2">
                        <Line data={generateChartData()} options={chartOptions} />
                    </div>
                </div>

                {/* Right Side Cards */}
                <div className="flex flex-col gap-6 lg:col-span-1">
                    {/* Store Approvals Donut */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm dark:border-gray-700 dark:bg-gray-800 p-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Store Approvals</h3>
                            <button className="text-gray-400 hover:text-gray-900 dark:hover:text-white"><MoreHorizontal className="w-5 h-5" /></button>
                        </div>
                        <div className="flex-1 flex justify-center items-center min-h-[180px] py-2">
                            <Pie data={generatePieData()} options={{ maintainAspectRatio: false, cutout: '70%', plugins: { legend: { display: false }, tooltip: { cornerRadius: 8, padding: 12 } } }} />
                        </div>
                        <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <div className="text-center">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-3 h-3 rounded-full bg-[#16BDCA]"></div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Approved</span>
                                </div>
                                <span className="font-semibold text-gray-900 dark:text-white">{Math.floor(stats.owners * 0.85)}</span>
                            </div>
                            <div className="text-center w-px bg-gray-200 dark:bg-gray-700"></div>
                            <div className="text-center">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-3 h-3 rounded-full bg-[#FDBA8C]"></div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Pending</span>
                                </div>
                                <span className="font-semibold text-gray-900 dark:text-white">{stats.owners - Math.floor(stats.owners * 0.85)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 gap-6">

                {/* Store Categories Bar Chart */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm dark:border-gray-700 dark:bg-gray-800 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Store Categories</h3>
                            <p className="text-sm font-normal text-gray-500 dark:text-gray-400">Distribution of businesses on the platform</p>
                        </div>
                    </div>
                    <div className="h-[250px] w-full">
                        <Bar
                            data={generateBarData()}
                            options={{
                                ...chartOptions,
                                plugins: { legend: { display: false } },
                                scales: {
                                    x: { grid: { display: false, drawBorder: false }, ticks: { font: { family: 'Inter' } } },
                                    y: { grid: { color: '#F3F4F6', strokeDash: [4, 4] }, border: { display: false }, beginAtZero: true }
                                }
                            }}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;
