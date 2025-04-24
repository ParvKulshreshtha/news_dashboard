'use client';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

const Dashboard = () => {
  const { email, role, token } = useSelector((state: RootState) => state.auth);
  const router = useRouter();


  useEffect(() => {
    if (!token) {
      router.push('/login'); // Redirect to login if not logged in
    }
  }, [token, router]);
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white shadow rounded p-4">
          <p className="text-gray-600 text-sm">Total Articles</p>
          <p className="text-2xl font-semibold text-blue-600">152</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <p className="text-gray-600 text-sm">Total Blogs</p>
          <p className="text-2xl font-semibold text-green-600">68</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <p className="text-gray-600 text-sm">Unique Authors</p>
          <p className="text-2xl font-semibold text-purple-600">24</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <p className="text-gray-600 text-sm">Total Payouts</p>
          <p className="text-2xl font-semibold text-yellow-600">$3,480</p>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white shadow rounded p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Monthly Payouts</h2>
        <div className="h-64 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-sm">
          Chart Placeholder (Insert chart.js / recharts component here)
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
