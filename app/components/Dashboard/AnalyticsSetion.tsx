import React from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';

interface Article {
  content?: string;
  publishedAt: string;
}

interface AnalyticsSectionProps {
  articles: Article[];
  authorMap: Record<string, number>;
}

const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ articles, authorMap }) => {
  // Pie chart logic (based on types)
  const typeMap: Record<string, number> = {};
  const typeKeywords = ['business', 'tech', 'startup', 'india', 'international'];

  articles.forEach((article) => {
    const content = article.content?.toLowerCase() || '';
    const matched = typeKeywords.find((type) => content.includes(type));
    const type = matched || 'other';
    typeMap[type] = (typeMap[type] || 0) + 1;
  });

  const pieLabels = Object.keys(typeMap);
  const pieCounts = Object.values(typeMap);

  const pieData = {
    labels: pieLabels.map((label) => label.charAt(0).toUpperCase() + label.slice(1)),
    datasets: [
      {
        label: 'Article Types',
        data: pieCounts,
        backgroundColor: [
          '#3b82f6', // Blue
          '#10b981', // Green
          '#f59e0b', // Amber
          '#8b5cf6', // Violet
          '#ef4444', // Red
          '#6b7280', // Gray for other
        ],
      },
    ],
  };

  // Bar chart
  const topAuthors = Object.entries(authorMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const barData = {
    labels: topAuthors.map(([author]) => author),
    datasets: [
      {
        label: 'Top 5 Authors',
        data: topAuthors.map(([, count]) => count),
        backgroundColor: '#3b82f6',
      },
    ],
  };

  // Line chart (article count over time)
  const dateMap: Record<string, number> = {};
  articles.forEach((article) => {
    const date = new Date(article.publishedAt).toISOString().split('T')[0];
    dateMap[date] = (dateMap[date] || 0) + 1;
  });

  const sortedDates = Object.keys(dateMap).sort();
  const lineData = {
    labels: sortedDates,
    datasets: [
      {
        label: 'Articles Per Day',
        data: sortedDates.map((date) => dateMap[date]),
        borderColor: '#6366f1',
        backgroundColor: '#c7d2fe',
        tension: 0.3,
      },
    ],
  };

  return (
    <div>
      {/* Charts Section */}
      <div className="space-y-10">
        {/* Bar Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Top Authors</h2>
          <div className="h-[400px]">
            <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Article Type Distribution</h2>
          <div className="w-full max-w-sm mx-auto">
            <Pie data={pieData} options={{ responsive: true }} />
          </div>
        </div>

        {/* Line Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Article Trends</h2>
          <div className="h-[300px] overflow-x-auto">
            <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSection;
