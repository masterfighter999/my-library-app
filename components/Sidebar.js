import React from 'react';
import {
    Library,
    LayoutDashboard,
    Book,
    Settings,
    Activity,
    LogOut
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { Button } from './LibraryUI';

const NavButton = ({ id, icon: Icon, label, activeTab, setActiveTab }) => (
    <button
        onClick={() => setActiveTab(id)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${activeTab === id
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
            : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
    >
        <Icon className="w-4 h-4" />
        {label}
    </button>
);

export default function Sidebar({ user, activeTab, setActiveTab }) {
    return (
        <div className="w-64 hidden md:flex flex-col bg-slate-900 text-white h-screen fixed left-0 top-0 z-10 border-r border-slate-800">
            <div className="p-6 flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
                    <Library className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg tracking-tight text-slate-100">LibStack</span>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
                <NavButton id="dashboard" icon={LayoutDashboard} label="Dashboard" activeTab={activeTab} setActiveTab={setActiveTab} />
                <NavButton id="books" icon={Book} label="Library Catalog" activeTab={activeTab} setActiveTab={setActiveTab} />
                {user?.role === 'admin' && (
                    <>
                        <NavButton id="loans" icon={Activity} label="Active Loans" activeTab={activeTab} setActiveTab={setActiveTab} />
                        <NavButton id="settings" icon={Settings} label="System Settings" activeTab={activeTab} setActiveTab={setActiveTab} />
                    </>
                )}
            </nav>

            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-sm font-bold shadow-md">
                        {user?.name?.[0] || 'U'}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium truncate text-slate-200">{user?.name}</p>
                        <p className="text-xs text-slate-400 capitalize">{user?.role || 'User'}</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-400 hover:bg-red-900/10 hover:text-red-300 transition-colors pl-2"
                    onClick={() => signOut()}
                    icon={LogOut}
                >
                    Sign Out
                </Button>
            </div>
        </div>
    );
}
