"use client";
import React from 'react';
import { useState } from 'react';

interface SidebarProps {
    tabs: { label: string; path: string }[];
}

const Sidebar: React.FC<SidebarProps> = ({ tabs }) => {
    const [activeTab, setActiveTab] = useState<string>(tabs[0]?.path || '');

    return (
        <div className="w-52 h-screen bg-gray-100 p-4 border-r border-gray-300">
            <ul className="space-y-2">
                {tabs.map((tab) => (
                    <li
                        key={tab.path}
                        className={`p-2 cursor-pointer rounded transition-colors ${
                            activeTab === tab.path
                                ? 'bg-gray-300 font-bold'
                                : 'hover:bg-gray-200'
                        }`}
                        onClick={() => setActiveTab(tab.path)}
                    >
                        {tab.label}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;
