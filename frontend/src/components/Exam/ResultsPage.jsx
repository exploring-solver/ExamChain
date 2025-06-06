import React from 'react';
import { useParams } from 'react-router-dom';
import ResultsTable from './ResultsTable';

const ResultsPage = () => {
  const { examId } = useParams();
  return (
    <div>
      <ResultsTable examId={examId} />
    </div>
  );
};

export default ResultsPage;