'use client';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';

import {
  fetchNews,
  setAuthorFilter,
  setTypeFilter,
  setStartDateFilter,
  setEndDateFilter,
  setSortField,
  setSortDirection,
} from '../redux/Slices/newsSlice';

const selectFilteredArticles = (state: RootState) => {
    const { newsData=[], filters, sort } = state.news;
  
    const filtered = newsData?.filter((article) => {
      const matchesAuthor = filters.author
        ? article.author?.toLowerCase().includes(filters.author.toLowerCase())
        : true;
      const matchesType =
        filters.type === 'all' ||
        article.content?.toLowerCase().includes(filters.type);
      const articleDate = new Date(article.publishedAt).getTime();
      const matchesStart = filters.startDate
        ? articleDate >= new Date(filters.startDate).getTime()
        : true;
      const matchesEnd = filters.endDate
        ? articleDate <= new Date(filters.endDate).getTime()
        : true;
  
      return matchesAuthor && matchesType && matchesStart && matchesEnd;
    });
  
    const sorted = [...filtered].sort((a, b) => {
      let aVal, bVal;
  
      if (sort.field === 'publishedAt') {
        aVal = new Date(a.publishedAt).getTime();
        bVal = new Date(b.publishedAt).getTime();
      } else {
        aVal = (a[sort.field] || '').toLowerCase();
        bVal = (b[sort.field] || '').toLowerCase();
      }
  
      if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  
    return sorted;
  };
  

const ArticlesPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector((state: RootState) => state.news.loading);
  const error = useSelector((state: RootState) => state.news.error);
  const filters = useSelector((state: RootState) => state.news.filters);
  const sort = useSelector((state: RootState) => state.news.sort);
  const filteredArticles = useSelector(selectFilteredArticles);

  useEffect(() => {
    dispatch(fetchNews());
  }, [dispatch]);

  

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full mt-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mt-20">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Top News</h1>

      {/* Filter Controls */}
      <div className="mb-6 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Filter by author"
          value={filters.author}
          onChange={(e) => dispatch(setAuthorFilter(e.target.value))}
          className="border rounded px-3 py-2 text-sm"
        />

        <select
          value={filters.type}
          onChange={(e) => dispatch(setTypeFilter(e.target.value as 'all' | 'news' | 'blog'))}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="all">All Types</option>
          <option value="news">News</option>
          <option value="blog">Blog</option>
        </select>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">From:</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => dispatch(setStartDateFilter(e.target.value))}
            className="border rounded px-2 py-1 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">To:</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => dispatch(setEndDateFilter(e.target.value))}
            className="border rounded px-2 py-1 text-sm"
          />
        </div>
      </div>

      {/* Sort Controls */}
      <div className="mb-6 flex gap-4 items-center">
        <select
          value={sort.field}
          onChange={(e) => dispatch(setSortField(e.target.value as 'publishedAt' | 'title' | 'author'))}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="publishedAt">Sort by Date</option>
          <option value="title">Sort by Title</option>
          <option value="author">Sort by Author</option>
        </select>

        <select
          value={sort.direction}
          onChange={(e) => dispatch(setSortDirection(e.target.value as 'asc' | 'desc'))}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      {/* Articles Table */}
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Author
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Published
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredArticles.map((article) => (
              <tr key={article.url} className="hover:bg-gray-100 transition">
                <td className="px-6 py-4 whitespace-nowrap max-w-xs truncate">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {article.title}
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {article.source.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {article.author || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(article.publishedAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ArticlesPage;
