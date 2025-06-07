import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../../config';
import ResultsTable from './ResultsTable';

const AllExamsResultsPage = () => {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await axios.get(`${config.baseURL}/exam/exams`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setExams(response.data);
      } catch (error) {
        setExams([]);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  return (
    <div className="w-[90%] m-auto py-6">
      <h2 className="text-xl font-bold mb-4">All Exams</h2>
      {loading ? (
        <div>Loading exams...</div>
      ) : (
        <table className="min-w-full border mb-8">
          <thead>
            <tr>
              <th className="border px-4 py-2">Exam Title</th>
              <th className="border px-4 py-2">Exam ID</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((exam) => (
              <tr key={exam._id}>
                <td className="border px-4 py-2">{exam.title}</td>
                <td className="border px-4 py-2">{exam._id}</td>
                <td className="border px-4 py-2">{exam.status}</td>
                <td className="border px-4 py-2">
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                    onClick={() => setSelectedExamId(exam._id)}
                  >
                    View Results
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedExamId && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Results for Exam ID: {selectedExamId}</h3>
          <ResultsTable examId={selectedExamId} />
        </div>
      )}
    </div>
  );
};

export default AllExamsResultsPage;