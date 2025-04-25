'use client';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { fetchNews, Article, selectAuthorStats } from '../redux/Slices/newsSlice';
import { Bar, Line, Pie } from 'react-chartjs-2';

import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  TimeScale,
} from 'chart.js';
import AnalyticsSetion from '../components/Dashboard/AnalyticsSetion';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  TimeScale
);

const Dashboard = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const articles = useSelector((state: RootState) => state.news.newsData);
  const user = useSelector((state: RootState) => state.auth);
  const authorStats = useSelector(selectAuthorStats);

  useEffect(() => {
    if (!token) router.push('/login');
  }, [token, router]);

  useEffect(() => {
    dispatch(fetchNews());
  }, [dispatch]);

  useEffect(() => {
    console.log(localStorage.getItem('token'), user);
  }, []);

  // Stats calculation
  const authorMap: Record<string, number> = {};
  let blogCount = 0;
  let newsCount = 0;

  articles.forEach((article: Article) => {
    const author = article.author?.trim() || 'Unknown';
    const isBlog = article.content?.toLowerCase().includes('blog');
    if (isBlog) blogCount++;
    else newsCount++;

    authorMap[author] = (authorMap[author] || 0) + 1;
  });

  const totalArticles = articles.length;
  const uniqueAuthors = Object.keys(authorMap).length;
  const getAuthorRate = (name: string) => {
    const authorRates = JSON.parse(localStorage.getItem('authorRates') || '{}');
    const defaultRates = { articleRate: parseFloat(localStorage.getItem('articleRate') || '20') };
    return authorRates[name] || defaultRates;
  };

  const calculatePayout = (author: string, articles: number) => {
    const { articleRate } = getAuthorRate(author);
    return articles * articleRate;
  };

  const totalPayout = authorStats?.reduce(
    (sum, a) => sum + calculatePayout(a.name, a.articles),
    0
  );

  return (
    <div className=" bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Overview</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition duration-300">
          <p className="text-sm text-gray-500 mb-1">Total Articles</p>
          <p className="text-2xl font-bold text-blue-600">{totalArticles}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition duration-300">
          <p className="text-sm text-gray-500 mb-1">Unique Authors</p>
          <p className="text-2xl font-bold text-purple-600">{uniqueAuthors}</p>
        </div>
        {user.role === 'admin' && (
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition duration-300">
            <p className="text-sm text-gray-500 mb-1">Estimated Payouts</p>
            <p className="text-2xl font-bold text-yellow-600">${totalPayout.toLocaleString()}</p>
          </div>
        )}
      </div>

      {/* Analytics Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <AnalyticsSetion articles={articles} authorMap={authorMap} />
      </div>

    </div>
  );
};

export default Dashboard;
