'use client';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { AppDispatch, RootState } from '../redux/store';
import { fetchNews, selectAuthorStats } from '../redux/Slices/newsSlice';
import Papa from 'papaparse';
import Table from '../components/Payouts/Table';

const PayoutPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const authorStats = useSelector(selectAuthorStats);
  const user = useSelector((state: RootState) => state.auth);

  const [defaultRates, setDefaultRates] = useState({
    articleRate: 20, // Default fallback value
  });

  const [authorRates, setAuthorRates] = useState<Record<string, { articleRate: number }>>({});
  const [isClient, setIsClient] = useState(false); // Track if we're on the client side

  // UseEffect to update `isClient` to true after the component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch and set rates from localStorage only on the client side
  useEffect(() => {
    if (isClient) {
      const storedArticleRate = localStorage.getItem('articleRate');
      const storedAuthorRates = localStorage.getItem('authorRates');

      if (storedArticleRate) {
        setDefaultRates({
          articleRate: parseFloat(storedArticleRate),
        });
      }

      if (storedAuthorRates) {
        setAuthorRates(JSON.parse(storedAuthorRates));
      }
    }

    dispatch(fetchNews());
  }, [isClient, dispatch]);

  // Store rates to localStorage on change
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('articleRate', defaultRates.articleRate.toString());
      localStorage.setItem('authorRates', JSON.stringify(authorRates));
    }
  }, [defaultRates, authorRates, isClient]);

  // Redirect unauthorized users
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/unauthorized');
    }
  }, [user, router]);

  const getAuthorRate = (name: string) => {
    return authorRates[name] || defaultRates;
  };

  const updateRate = (name: string, field: 'articleRate', value: number) => {
    setAuthorRates((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        [field]: value,
      },
    }));
  };

  const calculatePayout = (author: string, articles: number) => {
    const { articleRate } = getAuthorRate(author);
    return articles * articleRate;
  };

  const totalPayout = authorStats.reduce(
    (sum, a) => sum + calculatePayout(a.name, a.articles),
    0
  );

  const handleExportCSV = () => {
    const data = authorStats.map(({ name, articles }) => ({
      Author: name,
      Articles: articles,
      Rate: getAuthorRate(name).articleRate,
      Payout: calculatePayout(name, articles).toFixed(2),
    }));

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'payout_data.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="p-10 text-center text-red-600 text-xl font-semibold">
        Unauthorized Access – Admins Only
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Payout Calculator</h1>

      {/* Default Rate Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Default Rate Settings</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <label className="flex flex-col text-sm text-gray-600">
            Article Rate ($)
            <input
              type="number"
              min="0"
              step="0.01"
              value={defaultRates.articleRate}
              onChange={(e) =>
                setDefaultRates({ ...defaultRates, articleRate: parseFloat(e.target.value) })
              }
              className="mt-1 px-4 py-2 border rounded-md shadow-sm w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      {/* Export to CSV Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={handleExportCSV}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow transition"
        >
          Export to CSV
        </button>
      </div>

      {/* Author Rate Table */}
      <Table
        updateRate={updateRate}
        authorStats={authorStats}
        getAuthorRate={getAuthorRate}
        calculatePayout={calculatePayout}
      />

      {/* Total Summary */}
      <div className="mt-8 text-right text-lg text-gray-800 font-semibold">
        Total Payout:{' '}
        <span className="text-green-700">${totalPayout.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default PayoutPage;
