"use client";
import React from 'react';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store';
import { logout } from '../redux/Slices/authSlice';
import { usePathname, useRouter } from 'next/navigation';

interface SidebarProps {
    tabs: { label: string; path: string }[];
}

const Sidebar: React.FC<SidebarProps> = ({ tabs }) => {
    const [activeTab, setActiveTab] = useState<string>(tabs[0]?.path || '');
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    return (
        <div className="w-52 h-screen fixed bottom-0 top-0 left-0 bg-gray-100 p-4 shadow-lg">
            <ul className="space-y-2">
                {tabs.map((tab) => (
                    <li
                        key={tab.path}
                        className={`p-2 cursor-pointer rounded transition-colors ${
                            activeTab === tab.path
                                ? 'bg-gray-300 font-bold'
                                : 'hover:bg-gray-200'
                        }`}
                        onClick={() => {setActiveTab(tab.path)
                             router.push(tab.path)}}
                    >
                        {tab.label}
                    </li>
                ))}
                <li className="p-2 cursor-pointer rounded transition-colors" onClick={() => {dispatch(logout())
                    router.push('/login')
                }}>
                        Logout
                    </li>
            </ul>
        </div>
    );
};


// Moved layout logic into a client component to access router
function LayoutWithSidebar({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLogin = pathname === '/login';
  
    return (
      <div className="flex">
        {!isLogin && (
          <Sidebar tabs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Articles', path: '/articles' },{label:'Payouts',path:'/payouts'}]} />
        )}
        <main className="w-full p-6">{children}</main>
      </div>
    );
  }
  
export default LayoutWithSidebar;
