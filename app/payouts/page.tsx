'use client';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { Article, fetchNews } from '../redux/Slices/newsSlice';

const selectAuthorStats = (state: RootState) => {
  const stats: Record<string, { articles: number }> = {};

  state.news.newsData.forEach((article: Article) => {
    const author = article.author?.trim() || 'Unknown';

    if (!stats[author]) stats[author] = { articles: 0 };
    stats[author]["articles"]++;
  });

  return Object.entries(stats).map(([name, counts]) => ({
    name,
    ...counts,
  }));
};

const PayoutPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const authorStats = useSelector(selectAuthorStats);

  const [defaultRates, setDefaultRates] = useState({
    articleRate: parseFloat(localStorage.getItem('articleRate') || '20'),
  });

  const [authorRates, setAuthorRates] = useState<
    Record<string, { articleRate: number; }>
  >(() => {
    const saved = localStorage.getItem('authorRates');
    return saved ? JSON.parse(saved) : {};
  });

  // Update localStorage when rates change
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
    return articles * articleRate
  };

  const totalPayout = authorStats.reduce(
    (sum, a) => sum + calculatePayout(a.name, a.articles),
    0
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Payout Calculator</h1>

      {/* Global Rate Settings */}
      <div className="flex flex-wrap gap-6 bg-white shadow rounded p-6 mb-8">
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Default Article Rate ($)</label>
          <input
            type="number"
            value={defaultRates.articleRate}
            onChange={(e) =>
              setDefaultRates({ ...defaultRates, articleRate: parseFloat(e.target.value) })
            }
            className="border rounded px-4 py-2 w-40 text-sm"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      {/* Author Payout Table */}
      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-6 py-3 font-medium text-gray-500 uppercase">Author</th>
              <th className="px-6 py-3 font-medium text-gray-500 uppercase">Articles</th>
              <th className="px-6 py-3 font-medium text-gray-500 uppercase">Rate/Article</th>
              <th className="px-6 py-3 font-medium text-gray-500 uppercase">Payout ($)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {authorStats.map(({ name, articles }) => {
              const rates = getAuthorRate(name);
              const payout = calculatePayout(name, articles);
              return (
                <tr key={name} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{name}</td>
                  <td className="px-6 py-4">{articles}</td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      value={rates.articleRate}
                      onChange={(e) =>
                        updateRate(name, 'articleRate', parseFloat(e.target.value))
                      }
                      className="w-20 border rounded px-2 py-1 text-sm"
                      min="0"
                    />
                  </td>
                  <td className="px-6 py-4 font-semibold text-green-700">
                    ${payout.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Total Summary */}
      <div className="mt-6 text-right text-gray-800 font-medium text-lg">
        Total Payout: <span className="text-green-600">${totalPayout.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default PayoutPage;
