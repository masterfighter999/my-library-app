import React from 'react';
import { Card } from './LibraryUI';
import { Zap, Activity } from 'lucide-react';

export const MetricsCard = ({ title, value, subtext, icon: Icon, color, trend }) => (
    <Card className="p-5 hover:shadow-md transition-all duration-300 border-l-4 border-l-transparent hover:border-l-blue-500">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 tracking-wide">{title}</p>
                <h3 className="text-2xl font-bold mt-2 text-slate-900 dark:text-white">{value}</h3>
            </div>
            <div className={`p-2.5 rounded-xl ${color} shadow-sm`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
            {trend && <span className="text-green-500 text-xs font-bold flex items-center gap-1 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                <Zap className="w-3 h-3" /> {trend}
            </span>}
            <span className="text-slate-400 text-xs">{subtext}</span>
        </div>
    </Card>
);

export const SystemLogs = ({ logs = [] }) => (
    <div className="space-y-4">
        {logs.length === 0 && <p className="text-sm text-slate-400 text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">No recent system activity</p>}
        {logs.map((log) => (
            <div key={log.id} className="flex gap-3 text-sm animate-in fade-in slide-in-from-right-4 duration-300 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className={`mt-1.5 min-w-[8px] h-2 rounded-full shadow-sm ${log.type === 'success' ? 'bg-emerald-500 shadow-emerald-500/50' :
                        log.type === 'warning' ? 'bg-amber-500 shadow-amber-500/50' : 'bg-blue-500 shadow-blue-500/50'
                    }`} />
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-400">{log.timestamp}</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200 text-xs uppercase tracking-wider">{log.action}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{log.details}</p>
                </div>
            </div>
        ))}
    </div>
);
