'use client';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { fetchNews, setAuthorFilter, setTypeFilter, setStartDateFilter, setEndDateFilter, setSortField } from '../redux/Slices/newsSlice';

// Category Tabs
const categoryTabs = ['All', 'India', 'Business', 'Tech', 'Startup', 'International'];

// Filter + Sort + Pagination logic
const selectFilteredArticles = (state: RootState) => {
  const { newsData = [], filters, sort } = state.news;

  const filtered = newsData.filter((article) => {
    const matchesAuthor = filters.author
      ? article.author?.toLowerCase().includes(filters.author.toLowerCase())
      : true;
    const matchesType =
      filters.type === 'all' || article.content?.toLowerCase().includes(filters.type);
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

    switch (sort.field) {
      case 'publishedAt_desc':
        aVal = new Date(b.publishedAt).getTime();
        bVal = new Date(a.publishedAt).getTime();
        break;
      case 'publishedAt_asc':
        aVal = new Date(a.publishedAt).getTime();
        bVal = new Date(b.publishedAt).getTime();
        break;
      case 'title_asc':
        aVal = a.title?.toLowerCase() || '';
        bVal = b.title?.toLowerCase() || '';
        break;
      case 'title_desc':
        aVal = b.title?.toLowerCase() || '';
        bVal = a.title?.toLowerCase() || '';
        break;
      case 'author_asc':
        aVal = a.author?.toLowerCase() || '';
        bVal = b.author?.toLowerCase() || '';
        break;
      case 'author_desc':
        aVal = b.author?.toLowerCase() || '';
        bVal = a.author?.toLowerCase() || '';
        break;
      default:
        return 0;
    }

    if (aVal < bVal) return -1;
    if (aVal > bVal) return 1;
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

  const [selectedTab, setSelectedTab] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchNews());
  }, [dispatch]);

  useEffect(() => {
    if (selectedTab === 'All') {
      dispatch(setTypeFilter('all'));
    } else {
      dispatch(setTypeFilter(selectedTab.toLowerCase()));
    }
  }, [selectedTab, dispatch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, selectedTab, sort]);

  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const changePage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const openOffcanvas = (article: any) => {
    setSelectedArticle(article);
    setIsOffcanvasOpen(true);
  };

  const closeOffcanvas = () => {
    setIsOffcanvasOpen(false);
    setSelectedArticle(null);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Top News</h1>

      {/* Category Tabs */}
      <div className="flex gap-4 mb-6 overflow-x-auto">
        {categoryTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition 
              ${selectedTab === tab ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Filters + Sort */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Filters</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <input
            type="text"
            value={filters.author}
            onChange={(e) => dispatch(setAuthorFilter(e.target.value))}
            placeholder="Filter by author"
            className="border rounded-md px-3 py-2 text-sm shadow-sm"
          />
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => dispatch(setStartDateFilter(e.target.value))}
            className="border rounded-md px-3 py-2 text-sm shadow-sm"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => dispatch(setEndDateFilter(e.target.value))}
            className="border rounded-md px-3 py-2 text-sm shadow-sm"
          />
          <select
            value={sort.field}
            onChange={(e) => dispatch(setSortField(e.target.value))}
            className="border rounded-md px-3 py-2 text-sm shadow-sm"
          >
            <option value="" disabled>Sort</option>
            <option value="publishedAt_desc">Date: Newest First</option>
            <option value="publishedAt_asc">Date: Oldest First</option>
            <option value="title_asc">Title: A-Z</option>
            <option value="title_desc">Title: Z-A</option>
            <option value="author_asc">Author: A-Z</option>
            <option value="author_desc">Author: Z-A</option>
          </select>
        </div>
      </div>

      {/* Articles Table */}
      <div className="overflow-x-auto rounded-lg shadow bg-white mb-6">
        {paginatedArticles.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p className="text-lg font-medium">No articles found with current filters.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Source</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Author</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Published</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedArticles.map((article) => (
                <tr key={article.url} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => openOffcanvas(article)}>
                  <td className="px-6 py-4 max-w-xs truncate text-blue-600 hover:underline">{article.title}</td>
                  <td className="px-6 py-4 text-gray-700">{article.source.name}</td>
                  <td className="px-6 py-4 text-gray-700">{article.author || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-500">{new Date(article.publishedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-4">
        <button onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 border rounded disabled:opacity-50">&larr;</button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => changePage(i + 1)}
            className={`px-3 py-1 rounded border ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white'}`}
          >
            {i + 1}
          </button>
        ))}
        <button onClick={() => changePage(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 border rounded disabled:opacity-50">&rarr;</button>
      </div>

      {/* Offcanvas */}
      {isOffcanvasOpen && selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="fixed right-0 top-0 w-1/3 h-full bg-white shadow-xl p-6">
            <button onClick={closeOffcanvas} className="absolute top-4 right-4 text-gray-500">Close</button>
            <h2 className="text-2xl font-bold mb-4">{selectedArticle.title}</h2>
            <p className="text-gray-700 mb-2"><strong>Source:</strong> {selectedArticle.source.name}</p>
            <p className="text-gray-700 mb-2"><strong>Author:</strong> {selectedArticle.author || 'N/A'}</p>
            <p className="text-gray-500 mb-4"><strong>Published:</strong> {new Date(selectedArticle.publishedAt).toLocaleString()}</p>
            <p className="text-gray-800">{selectedArticle.content}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticlesPage;
