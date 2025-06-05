import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemSuffix,
  Card,
  IconButton,
  Typography,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Alert,
  Input,
  Chip,
  Badge,
} from '@material-tailwind/react';
import {
  TrashIcon,
  PencilIcon,
  EyeIcon,
  ClockIcon,
  LockClosedIcon,
  LockOpenIcon,
} from '@heroicons/react/24/outline';
import config from '../../config';

function ExamStatusBadge({ exam }) {
  const now = new Date();
  const startTime = new Date(exam.startTime);
  const endTime = new Date(startTime.getTime() + exam.duration * 60000);

  if (now < startTime) {
    return <Chip value="Upcoming" color="blue" size="sm" />;
  } else if (now >= startTime && now <= endTime) {
    return <Chip value="Active" color="green" size="sm" />;
  } else {
    return <Chip value="Ended" color="gray" size="sm" />;
  }
}

function DecryptionBadge({ isDecrypted }) {
  return (
    <Chip
      value={isDecrypted ? "Decrypted" : "Encrypted"}
      color={isDecrypted ? "red" : "green"}
      size="sm"
      icon={isDecrypted ? <LockOpenIcon className="h-3 w-3" /> : <LockClosedIcon className="h-3 w-3" />}
    />
  );
}

export function ExamsList() {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [editingExam, setEditingExam] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  // Edit form states
  const [editTitle, setEditTitle] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editThreshold, setEditThreshold] = useState('');

  useEffect(() => {
    fetchExams();
  }, []);

  // Auto-hide alert after 5 seconds
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.baseURL}/exam/exams`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setExams(data);
      } else {
        throw new Error('Failed to fetch exams');
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
      setAlert({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (examId) => {
    if (!window.confirm('Are you sure you want to delete this exam? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${config.baseURL}/exam/exams/${examId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setAlert({ type: 'success', message: 'Exam deleted successfully!' });
        setExams(exams.filter(exam => exam._id !== examId));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete exam');
      }
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    }
  };

  const handleEdit = (exam) => {
    setEditingExam(exam);
    setEditTitle(exam.title);
    setEditDuration(exam.duration.toString());
    setEditStartTime(new Date(exam.startTime).toISOString().slice(0, 16));
    setEditThreshold(exam.threshold.toString());
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`${config.baseURL}/exam/exams/${editingExam._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          title: editTitle,
          duration: parseInt(editDuration, 10),
          startTime: new Date(editStartTime).toISOString(),
          threshold: parseInt(editThreshold, 10),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAlert({ type: 'success', message: 'Exam updated successfully!' });
        setEditDialogOpen(false);
        fetchExams(); // Refresh the list
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update exam');
      }
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    }
  };

  const handleToggleDecryption = async (examId) => {
    try {
      const response = await fetch(`${config.baseURL}/exam/exams/${examId}/toggle-decryption`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAlert({ type: 'success', message: data.message });
        fetchExams(); // Refresh the list
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to toggle decryption');
      }
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    }
  };

  const handleView = (exam) => {
    setSelectedExam(exam);
    setViewDialogOpen(true);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="bg-white text-black p-8">
      {alert && (
        <Alert 
          color={alert.type === 'success' ? 'green' : 'red'} 
          className="mb-4"
          onClose={() => setAlert(null)}
          open={true}
        >
          {alert.message}
        </Alert>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h4" color="blue-gray">
          Exams Management
        </Typography>
        <Button onClick={fetchExams} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <Card className="w-full">
        <List>
          {exams.length === 0 ? (
            <ListItem>
              <Typography color="gray" className="text-center w-full">
                No exams found
              </Typography>
            </ListItem>
          ) : (
            exams.map((exam) => (
              <ListItem
                key={exam._id}
                ripple={false}
                className="py-3 pr-1 pl-4 border-b border-gray-200"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Typography variant="h6" color="blue-gray">
                      {exam.title}
                    </Typography>
                    <ExamStatusBadge exam={exam} />
                    <DecryptionBadge isDecrypted={exam.isDecrypted} />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>ID: {exam.examId}</span>
                    <span className="flex items-center gap-1">
                      <ClockIcon className="h-4 w-4" />
                      {formatDuration(exam.duration)}
                    </span>
                    <span>Threshold: {exam.threshold}</span>
                    <span>Start: {formatDateTime(exam.startTime)}</span>
                  </div>
                </div>
                
                <ListItemSuffix className="flex gap-1">
                  <IconButton
                    variant="text"
                    color="blue"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleView(exam);
                    }}
                    title="View Details"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </IconButton>
                  
                  <IconButton
                    variant="text"
                    color="amber"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(exam);
                    }}
                    title="Edit Exam"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </IconButton>
                  
                  <IconButton
                    variant="text"
                    color={exam.isDecrypted ? "green" : "red"}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleDecryption(exam._id);
                    }}
                    title={exam.isDecrypted ? "Mark as Encrypted" : "Mark as Decrypted"}
                  >
                    {exam.isDecrypted ? <LockOpenIcon className="h-4 w-4" /> : <LockClosedIcon className="h-4 w-4" />}
                  </IconButton>
                  
                  <IconButton
                    variant="text"
                    color="red"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(exam._id);
                    }}
                    title="Delete Exam"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </IconButton>
                </ListItemSuffix>
              </ListItem>
            ))
          )}
        </List>
      </Card>

      {/* View Dialog */}
      <Dialog size="lg" open={viewDialogOpen} handler={() => setViewDialogOpen(false)}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            {selectedExam?.title}
            {selectedExam && <ExamStatusBadge exam={selectedExam} />}
            {selectedExam && <DecryptionBadge isDecrypted={selectedExam.isDecrypted} />}
          </div>
        </DialogHeader>
        <DialogBody className="space-y-4">
          {selectedExam && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Typography variant="h6" color="blue-gray">Exam ID</Typography>
                <Typography>{selectedExam.examId}</Typography>
              </div>
              
              <div>
                <Typography variant="h6" color="blue-gray">Duration</Typography>
                <Typography>{formatDuration(selectedExam.duration)}</Typography>
              </div>
              
              <div>
                <Typography variant="h6" color="blue-gray">Start Time</Typography>
                <Typography>{formatDateTime(selectedExam.startTime)}</Typography>
              </div>
              
              <div>
                <Typography variant="h6" color="blue-gray">Threshold</Typography>
                <Typography>{selectedExam.threshold} shares required</Typography>
              </div>
              
              <div className="col-span-2">
                <Typography variant="h6" color="blue-gray">Shares Submitted</Typography>
                <Typography>{selectedExam.sharesSubmitted?.length || 0} of {selectedExam.threshold}</Typography>
              </div>
              
              {selectedExam.encryptedContent && (
                <div className="col-span-2">
                  <Typography variant="h6" color="blue-gray">Encrypted Content Preview</Typography>
                  <Typography className="font-mono text-sm bg-gray-100 p-2 rounded">
                    {selectedExam.encryptedContent.substring(0, 100)}...
                  </Typography>
                </div>
              )}
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button color="blue-gray" onClick={() => setViewDialogOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog size="md" open={editDialogOpen} handler={() => setEditDialogOpen(false)}>
        <DialogHeader>Edit Exam</DialogHeader>
        <DialogBody className="space-y-4">
          <Input
            label="Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Duration (minutes)"
              type="number"
              min="1"
              value={editDuration}
              onChange={(e) => setEditDuration(e.target.value)}
            />
            
            <Input
              label="Threshold"
              type="number"
              min="1"
              value={editThreshold}
              onChange={(e) => setEditThreshold(e.target.value)}
            />
          </div>
          
          <Input
            label="Start Time"
            type="datetime-local"
            value={editStartTime}
            onChange={(e) => setEditStartTime(e.target.value)}
          />
        </DialogBody>
        <DialogFooter className="space-x-2">
          <Button color="red" variant="text" onClick={() => setEditDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            color="green" 
            onClick={handleUpdate}
            disabled={!editTitle || !editDuration || !editStartTime || !editThreshold}
          >
            Update Exam
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}