'use client';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { AppDispatch, RootState } from '../redux/store';
import { Article, fetchNews } from '../redux/Slices/newsSlice';
import { selectAuthorStats } from '../redux/Slices/newsSlice';
import Papa from 'papaparse';  // Import PapaParse
import { FaEdit } from 'react-icons/fa'; // Import edit icon
import Table from '../components/Payouts/Table';

const PayoutPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const authorStats = useSelector(selectAuthorStats);
  const user = useSelector((state: RootState) => state.auth);

  const [defaultRates, setDefaultRates] = useState({
    articleRate: parseFloat(localStorage.getItem('articleRate') || '20'),
  });

  const [authorRates, setAuthorRates] = useState<Record<string, { articleRate: number }>>(() => {
    const saved = localStorage.getItem('authorRates');
    return saved ? JSON.parse(saved) : {};
  });


  // Redirect non-admin users
  useEffect(() => {
    console.log(user);
    if (!user || user.role !== 'admin') {
      router.push('/unauthorized');
    }
  }, [user, router]);

  useEffect(() => {
    localStorage.setItem('articleRate', defaultRates.articleRate.toString());
  }, [defaultRates]);

  useEffect(() => {
    localStorage.setItem('authorRates', JSON.stringify(authorRates));
  }, [authorRates]);

  useEffect(() => {
    dispatch(fetchNews());
  }, [dispatch]);

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

    // Use PapaParse to convert data to CSV
    const csv = Papa.unparse(data);

    // Create a Blob from the CSV string and trigger a download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'payout_data.csv'); // Set the download filename
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
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Payout Calculator</h1>

      {/* Default Rate */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-10">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Default Rate Settings</h2>
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
              className="mt-1 px-3 py-2 border rounded-md shadow-sm w-40"
            />
          </label>
        </div>
      </div>

      {/* Export to CSV Button */}
      <div className="mt-6 text-right">
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700"
        >
          Export to CSV
        </button>
      </div>

      <Table updateRate={updateRate} authorStats={authorStats} getAuthorRate={getAuthorRate} calculatePayout={calculatePayout}/>

      {/* Total Summary */}
      <div className="mt-6 text-right text-lg text-gray-800 font-semibold">
        Total Payout:{' '}
        <span className="text-green-700">${totalPayout.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default PayoutPage;
