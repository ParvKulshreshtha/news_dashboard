import React, { useState } from 'react';
import { FaEdit } from 'react-icons/fa';

// Define the types for the props
interface AuthorStats {
  name: string;
  articles: number;
}

interface TableProps {
  authorStats: AuthorStats[];
  getAuthorRate: (name: string) => { articleRate: number };
  calculatePayout: (author: string, articles: number) => number;
  updateRate: (name: string, field: 'articleRate', value: number) => void;
}

const Table: React.FC<TableProps> = ({ authorStats, getAuthorRate, calculatePayout, updateRate }) => {
  const [editMode, setEditMode] = useState<null | string>(null); // Track the author currently being edited

  const handleEditClick = (name: string) => {
    setEditMode(prev => (prev ? null : name)); // Toggle edit mode for the clicked author
  };

  return (
    <div>
      {/* Author Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                Author
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                Articles
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                Rate / Article ($)
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                Payout
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {authorStats.map(({ name, articles }) => {
              const rates = getAuthorRate(name);
              const payout = calculatePayout(name, articles);
              return (
                <tr key={name} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-gray-800">{name}</td>
                  <td className="px-6 py-4 text-gray-700">{articles}</td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    {editMode === name ? (
                      <>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={rates.articleRate}
                          onChange={(e) =>
                            updateRate(name, 'articleRate', parseFloat(e.target.value))
                          }
                          className="border rounded-md px-3 py-1 w-24 text-sm"
                        />
                        <button
                          onClick={() => handleEditClick(name)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FaEdit />
                        </button>
                      </>
                    ) : (
                      <>
                        <span>{rates.articleRate}</span>
                        <button
                          onClick={() => handleEditClick(name)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FaEdit />
                        </button>
                      </>
                    )}
                  </td>
                  <td className="px-6 py-4 font-semibold text-green-600">
                    ${payout.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
