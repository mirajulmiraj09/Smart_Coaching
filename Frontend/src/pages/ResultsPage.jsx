import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FiSearch, FiBarChart2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Loading from '../components/Loading';

const ResultsPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');

  useEffect(() => {
    fetchResults();
  }, [filterBy]);

  const fetchResults = async () => {
    try {
      const response = await api.get('/results/', {
        params: { filter: filterBy }
      });
      setResults(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter(result =>
    result.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.exam_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Results</h1>

      {/* Filters */}
      <div className="flex space-x-4">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search results..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value)}
          className="input-field w-48"
        >
          <option value="all">All Results</option>
          <option value="passed">Passed</option>
          <option value="failed">Failed</option>
          <option value="recent">Recent</option>
        </select>
      </div>

      {/* Results Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Student</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Exam</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Marks</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Percentage</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.map((result) => (
              <tr key={result.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-800">{result.student_name}</td>
                <td className="px-6 py-4 text-sm text-gray-800">{result.exam_name}</td>
                <td className="px-6 py-4 text-sm text-gray-800">
                  {result.marks_obtained}/{result.total_marks}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800">
                  <div className="flex items-center space-x-2">
                    <FiBarChart2 className="text-blue-600" />
                    {result.percentage}%
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    result.status === 'passed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {result.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{result.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsPage;
