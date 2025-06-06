import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../../config';

const ResultsTable = ({ examId }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await axios.post(
          `${config.baseURL}/exam/results/calculate`,
          { examId },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        setResults(response.data.results || []);
      } catch (error) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    if (examId) fetchResults();
  }, [examId]);

  if (loading) return <div>Loading results...</div>;
  if (!results.length) return <div>No results found.</div>;

  return (
    <div className="w-[90%] m-auto py-6">
      <h2 className="text-xl font-bold mb-4">Exam Results</h2>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Student ID</th>
            <th className="border px-4 py-2">Correct</th>
            <th className="border px-4 py-2">Total</th>
            <th className="border px-4 py-2">Percentage</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <tr key={r.studentId}>
              <td className="border px-4 py-2">{r.studentId}</td>
              <td className="border px-4 py-2">{r.correct}</td>
              <td className="border px-4 py-2">{r.total}</td>
              <td className="border px-4 py-2">{r.percentage.toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;