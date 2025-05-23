import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Select, MenuItem, Button,  Alert, Input } from '@material-tailwind/react';

const SubmitShareComponent = () => {
  const [examId, setExamId] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [share, setShare] = useState('');
  const [exams, setExams] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [alert, setAlert] = useState({ type: '', message: '' });

  useEffect(() => {
    const fetchExamsAndOrganizations = async () => {
      try {
        const [examsResponse, organizationsResponse] = await Promise.all([
          axios.get('http://localhost:5000/exam/exams'),
          axios.get('http://localhost:5000/exam/organizations')
        ]);
        setExams(examsResponse.data);
        setOrganizations(organizationsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchExamsAndOrganizations();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/exam/secrets/submit-share', {
        examId,
        organizationId,
        share
      });
      setAlert({ type: 'success', message: response.data.message });
    } catch (error) {
      setAlert({ type: 'error', message: error.response.data.message });
    }
  };

  return (
    <div className="p-4">
      {alert.message && (
        <Alert color={alert.type === 'success' ? 'green' : 'red'}>
          {alert.message}
        </Alert>
      )}
      <form onSubmit={handleSubmit} className='flex flex-col gap-2'>
        <Select label="Select Exam" value={examId} onChange={(e) => setExamId(e.target.value)}>
          {exams.map((exam) => (
            <MenuItem key={exam._id} value={exam._id}>{exam.title}</MenuItem>
          ))}
        </Select>
        <Select label="Select Organization" value={organizationId} onChange={(e) => setOrganizationId(e.target.value)}>
          {organizations.map((org) => (
            <MenuItem key={org._id} value={org._id}>{org.name}</MenuItem>
          ))}
        </Select>
        <Input
          label="Share"
          value={share}
          onChange={(e) => setShare(e.target.value)}
          required
          fullwidth="true"
          margin="normal"
        />
        <Button type="submit" color="blue" fullwidth="true">
          Submit Share
        </Button>
      </form>
    </div>
  );
};

export default SubmitShareComponent;
