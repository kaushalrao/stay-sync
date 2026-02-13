import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { RevenueChartProps } from '@/app/lib/types';

export const RevenueChart: React.FC<RevenueChartProps> = ({ data, year, loading }) => {
    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-8 shadow-xl md:shadow-2xl dark:shadow-xl h-[420px] animate-pulse">
                <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg mb-2"></div>
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800/50 rounded-lg mb-8"></div>
                <div className="h-[300px] w-full bg-slate-100 dark:bg-slate-800/30 rounded-xl"></div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-8 shadow-xl md:shadow-2xl dark:shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 opacity-0 dark:opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none"></div>
            <div className="relative z-10">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-1">Revenue Analytics</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Monthly performance for {year}</p>
                    </div>
                    {/* Legend or Toggles could go here */}
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                tickFormatter={(value) => `₹${value / 1000}k`}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}
                                formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                            />
                            <Bar dataKey="revenue" radius={[6, 6, 6, 6]} barSize={40} className="hover:opacity-80 transition-opacity cursor-pointer">
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.revenue > 0 ? '#6366f1' : '#1e293b'} className="transition-all duration-300 hover:fill-indigo-400" />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
