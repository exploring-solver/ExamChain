import React, { useEffect, useState } from 'react';
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
  Input,
  Select,
  Option,
  Alert,
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
  Chip,
  Textarea,
  Progress,
  Badge,
} from "@material-tailwind/react";
import {
  TrashIcon,
  PencilIcon,
  EyeIcon,
  PlusIcon,
  KeyIcon,
  LockClosedIcon,
  LockOpenIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  QuestionMarkCircleIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import config from '../../config';

const OrganizationDashboard = () => {
  const [activeTab, setActiveTab] = useState("exams");

  // Data states
  const [questions, setQuestions] = useState([]);
  const [exams, setExams] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);

  // Dialog states
  const [showCreateQuestionDialog, setShowCreateQuestionDialog] = useState(false);
  const [showDecryptDialog, setShowDecryptDialog] = useState(false);
  const [showSubmitShareDialog, setShowSubmitShareDialog] = useState(false);
  const [showExamDetailDialog, setShowExamDetailDialog] = useState(false);

  // Form states
  const [decryptionKey, setDecryptionKey] = useState('');
  const [shareData, setShareData] = useState('');
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  // New question form
  const [newQuestion, setNewQuestion] = useState({
    content: '',
    options: { a: '', b: '', c: '', d: '' },
    answer: '',
    organizationId: '',
    examId: '',
    encryptionKey: '',
  });

  const tabsData = [
    {
      label: "Available Exams",
      value: "exams",
      icon: DocumentTextIcon,
    },
    {
      label: "Questions",
      value: "questions",
      icon: QuestionMarkCircleIcon,
    },
    {
      label: "Organizations",
      value: "organizations",
      icon: BuildingOfficeIcon,
    },
  ];

  useEffect(() => {
    fetchInitialData();
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

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchQuestions(),
        fetchExams(),
        fetchOrganizations()
      ]);
    } catch (error) {
      setAlert({ type: 'error', message: 'Error loading data' });
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`${config.baseURL}/exam/questions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const fetchExams = async () => {
    try {
      const response = await fetch(`${config.baseURL}/exam/exams`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setExams(data);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const response = await fetch(`${config.baseURL}/exam/organizations`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  // Get current organization ID from localStorage or user context
  const getCurrentOrganizationId = () => {
    // Try multiple possible sources for organization ID
    const orgId = localStorage.getItem('organizationId') ||
      localStorage.getItem('orgId') ||
      localStorage.getItem('user_organization_id');

    if (!orgId) {
      setAlert({ type: 'error', message: 'Organization ID not found. Please log in again.' });
      return null;
    }
    return orgId;
  };

  const handleSubmitShare = async () => {
    if (!selectedExam || !shareData.trim()) {
      setAlert({ type: 'error', message: 'Please provide valid share data' });
      return;
    }

    const organizationId = getCurrentOrganizationId();
    if (!organizationId) return;

    try {
      const response = await fetch(`${config.baseURL}/exam/api/v2/secrets/submit-share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          examId: selectedExam._id,
          organizationId: organizationId,
          share: shareData.trim()
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAlert({ type: 'success', message: data.message });
        setShowSubmitShareDialog(false);
        setShareData('');
        fetchExams(); // Refresh exams to see updated share status
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit share');
      }
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    }
  };

  const handleDecryptQuestions = async () => {
    if (!selectedExam) {
      setAlert({ type: 'error', message: 'Please select an exam first' });
      return;
    }

    try {
      const response = await fetch(`${config.baseURL}/exam/api/v2/secrets/decrypt-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          threshold: selectedExam.threshold
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAlert({ type: 'success', message: data.message });
        fetchQuestions(); // Refresh questions to see decrypted content
        fetchExams(); // Refresh exams
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to decrypt questions');
      }
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    }
  };

  const handleCreateQuestion = async () => {
    if (!newQuestion.content || !newQuestion.examId || !newQuestion.answer) {
      setAlert({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    const organizationId = getCurrentOrganizationId();
    if (!organizationId) return;

    try {
      // Set the current organization as the creator
      const questionData = {
        ...newQuestion,
        organizationId: organizationId
      };

      // Debug: Log the data being sent
      console.log('Question data being sent:', questionData);
      console.log('Answer value:', questionData.answer);
      console.log('Answer type:', typeof questionData.answer);

      // Ensure answer is one of the valid enum values
      if (!['a', 'b', 'c', 'd'].includes(questionData.answer)) {
        console.error('Invalid answer value:', questionData.answer);
        setAlert({ type: 'error', message: 'Answer must be one of: a, b, c, d' });
        return;
      }

      const response = await fetch(`${config.baseURL}/exam/api/v2/question/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(questionData),
      });

      if (response.ok) {
        setAlert({ type: 'success', message: 'Question created successfully!' });
        setShowCreateQuestionDialog(false);
        resetNewQuestion();
        fetchQuestions();
      } else {
        const errorData = await response.json();
        console.error('Server error response:', errorData);
        throw new Error(errorData.message || 'Failed to create question');
      }
    } catch (error) {
      console.error('Error creating question:', error);
      setAlert({ type: 'error', message: error.message });
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      const response = await fetch(`${config.baseURL}/exam/questions/${questionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setAlert({ type: 'success', message: 'Question deleted successfully!' });
        fetchQuestions();
      } else {
        throw new Error('Failed to delete question');
      }
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    }
  };

  const handleDecryptSingleQuestion = async () => {
    if (!selectedQuestion || !decryptionKey.trim()) {
      setAlert({ type: 'error', message: 'Please provide a valid decryption key' });
      return;
    }

    try {
      const response = await fetch(`${config.baseURL}/exam/api/v2/question/decrypt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          questionId: selectedQuestion._id,
          decryptionKey: decryptionKey.trim()
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedQuestion({
          ...selectedQuestion,
          content: data.content,
          options: data.options,
          answer: data.answer,
          encrypted: false
        });
        setAlert({ type: 'success', message: 'Question decrypted successfully!' });
        setShowDecryptDialog(false);
        setDecryptionKey('');
        fetchQuestions();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to decrypt question');
      }
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    }
  };

  const resetNewQuestion = () => {
    setNewQuestion({
      content: '',
      options: { a: '', b: '', c: '', d: '' },
      answer: '',
      organizationId: '',
      examId: '',
      encryptionKey: '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewQuestion(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOptionChange = (option, value) => {
    setNewQuestion(prev => ({
      ...prev,
      options: {
        ...prev.options,
        [option]: value
      }
    }));
  };

  const getExamStatus = (exam) => {
    const now = new Date();
    const startTime = new Date(exam.startTime);
    const endTime = new Date(startTime.getTime() + exam.duration * 60000);

    if (now < startTime) {
      return { status: "Upcoming", color: "blue" };
    } else if (now >= startTime && now <= endTime) {
      return { status: "Active", color: "green" };
    } else {
      return { status: "Ended", color: "gray" };
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getShareProgress = (exam) => {
    return (exam.sharesSubmitted?.length || 0) / exam.threshold * 100;
  };

  return (
    <div className="w-full min-h-screen bg-white text-black p-8">
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

      <Typography variant="h2" color="blue-gray" className="mb-8">
        Organization Dashboard
      </Typography>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <TabsHeader className="rounded-none border-b border-blue-gray-50 bg-transparent p-0">
          {tabsData.map(({ label, value, icon }) => (
            <Tab
              key={value}
              value={value}
              onClick={() => setActiveTab(value)}
              className={activeTab === value ? "text-gray-900" : ""}
            >
              <div className="flex items-center gap-2">
                {React.createElement(icon, { className: "w-5 h-5" })}
                {label}
              </div>
            </Tab>
          ))}
        </TabsHeader>

        <TabsBody>
          {/* Exams Tab */}
          <TabPanel value="exams" className="p-0 mt-6">
            <Card className="w-full">
              <div className="p-4 border-b border-gray-200">
                <Typography variant="h5" color="blue-gray">
                  Available Exams ({exams.length})
                </Typography>
              </div>

              <List>
                {exams.length === 0 ? (
                  <ListItem>
                    <Typography color="gray" className="text-center w-full">
                      No exams found
                    </Typography>
                  </ListItem>
                ) : (
                  exams.map((exam) => {
                    const examStatus = getExamStatus(exam);
                    const shareProgress = getShareProgress(exam);

                    return (
                      <ListItem
                        key={exam._id}
                        ripple={false}
                        className="py-4 pr-1 pl-4 border-b border-gray-200"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Typography variant="h6" color="blue-gray">
                              {exam.title}
                            </Typography>
                            <Chip
                              value={examStatus.status}
                              color={examStatus.color}
                              size="sm"
                            />
                            <Chip
                              value={exam.isDecrypted ? "Decrypted" : "Encrypted"}
                              color={exam.isDecrypted ? "red" : "green"}
                              size="sm"
                              icon={exam.isDecrypted ? <LockOpenIcon className="h-3 w-3" /> : <LockClosedIcon className="h-3 w-3" />}
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>ID: {exam.examId}</span>
                              <span>Duration: {formatDuration(exam.duration)}</span>
                              <span>Start: {formatDateTime(exam.startTime)}</span>
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between items-center">
                                <Typography variant="small" color="gray">
                                  Shares: {exam.sharesSubmitted?.length || 0} / {exam.threshold}
                                </Typography>
                                <Typography variant="small" color="gray">
                                  {Math.round(shareProgress)}%
                                </Typography>
                              </div>
                              <Progress value={shareProgress} color={shareProgress === 100 ? "green" : "blue"} />
                            </div>
                          </div>
                        </div>

                        <ListItemSuffix className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outlined"
                            onClick={() => {
                              setSelectedExam(exam);
                              setShowExamDetailDialog(true);
                            }}
                          >
                            View Details
                          </Button>

                          <Button
                            size="sm"
                            color="blue"
                            onClick={() => {
                              setSelectedExam(exam);
                              setShowSubmitShareDialog(true);
                            }}
                            disabled={shareProgress === 100}
                          >
                            Submit Share
                          </Button>
                        </ListItemSuffix>
                      </ListItem>
                    );
                  })
                )}
              </List>
            </Card>
          </TabPanel>

          {/* Questions Tab */}
          <TabPanel value="questions" className="p-0 mt-6">
            <Card className="w-full">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <Typography variant="h5" color="blue-gray">
                  Questions ({questions.length})
                </Typography>
                <Button
                  color="blue"
                  onClick={async () => {
                    const organizationId = localStorage.getItem('organizationId');
                    const decryptionKey = prompt('Enter the decryption key for all questions:');
                    if (!decryptionKey) return;
                    try {
                      const response = await fetch(`${config.baseURL}/exam/api/v2/question/decrypt-all`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        },
                        body: JSON.stringify({
                          organizationId,
                          examId: selectedExam._id,
                          decryptionKey,
                        }),
                      });
                      const data = await response.json();
                      if (response.ok) {
                        setAlert({ type: 'success', message: data.message });
                        fetchQuestions();
                      } else {
                        setAlert({ type: 'error', message: data.message || 'Failed to decrypt all questions' });
                      }
                    } catch (error) {
                      setAlert({ type: 'error', message: error.message });
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <KeyIcon className="h-4 w-4" />
                  Decrypt All Questions
                </Button>
                <Button
                  onClick={() => setShowCreateQuestionDialog(true)}
                  className="flex items-center gap-2"
                  size="sm"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Question
                </Button>
              </div>

              <List>
                {questions.length === 0 ? (
                  <ListItem>
                    <Typography color="gray" className="text-center w-full">
                      No questions found
                    </Typography>
                  </ListItem>
                ) : (
                  questions.map((question) => (
                    <ListItem
                      key={question._id}
                      ripple={false}
                      className="py-3 pr-1 pl-4 border-b border-gray-200 cursor-pointer"
                      onClick={() => setSelectedQuestion(question)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Typography variant="h6" color="blue-gray" className="truncate">
                            {question.encrypted ?
                              question.content.slice(0, 50) + '...' :
                              question.content.slice(0, 100) + (question.content.length > 100 ? '...' : '')
                            }
                          </Typography>
                          <Chip
                            value={question.encrypted ? "Encrypted" : "Decrypted"}
                            color={question.encrypted ? "red" : "green"}
                            size="sm"
                            icon={question.encrypted ? <LockClosedIcon className="h-3 w-3" /> : <LockOpenIcon className="h-3 w-3" />}
                          />
                        </div>
                        <Typography variant="small" color="gray">
                          Organization: {question.organizationId} • Exam: {question.examId}
                        </Typography>
                      </div>

                      <ListItemSuffix className="flex gap-1">
                        {question.encrypted && (
                          <IconButton
                            variant="text"
                            color="blue"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedQuestion(question);
                              setShowDecryptDialog(true);
                            }}
                            title="Decrypt Question"
                          >
                            <KeyIcon className="h-4 w-4" />
                          </IconButton>
                        )}

                        <IconButton
                          variant="text"
                          color="red"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteQuestion(question._id);
                          }}
                          title="Delete Question"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </IconButton>
                      </ListItemSuffix>
                    </ListItem>
                  ))
                )}
              </List>
            </Card>

            {/* Selected Question Details */}
            {selectedQuestion && (
              <Card className="mt-6 p-6">
                <div className="flex justify-between items-start mb-4">
                  <Typography variant="h5" color="blue-gray">
                    Question Details
                  </Typography>
                  <Button
                    variant="text"
                    color="red"
                    onClick={() => setSelectedQuestion(null)}
                    size="sm"
                  >
                    Close
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <Typography variant="h6" color="blue-gray">Content:</Typography>
                    <Typography>{selectedQuestion.content}</Typography>
                  </div>

                  <div>
                    <Typography variant="h6" color="blue-gray">Options:</Typography>
                    {Object.entries(selectedQuestion.options || {}).map(([key, value]) => (
                      <Typography key={key} variant="body2" color="blue-gray">
                        {key.toUpperCase()}: {value}
                      </Typography>
                    ))}
                  </div>

                  <div>
                    <Typography variant="h6" color="blue-gray">Answer:</Typography>
                    <Typography>{selectedQuestion.answer}</Typography>
                  </div>

                  <div className="flex gap-4">
                    <div>
                      <Typography variant="h6" color="blue-gray">Organization ID:</Typography>
                      <Typography>{selectedQuestion.organizationId}</Typography>
                    </div>
                    <div>
                      <Typography variant="h6" color="blue-gray">Exam ID:</Typography>
                      <Typography>{selectedQuestion.examId}</Typography>
                    </div>
                  </div>

                  {selectedQuestion.encrypted && (
                    <Button
                      color="blue"
                      onClick={() => setShowDecryptDialog(true)}
                      className="flex items-center gap-2"
                    >
                      <KeyIcon className="h-4 w-4" />
                      Decrypt Question
                    </Button>
                  )}
                </div>
              </Card>
            )}
          </TabPanel>

          {/* Organizations Tab */}
          <TabPanel value="organizations" className="p-0 mt-6">
            <Card className="w-full">
              <div className="p-4 border-b border-gray-200">
                <Typography variant="h5" color="blue-gray">
                  Organizations ({organizations.length})
                </Typography>
              </div>

              <List>
                {organizations.map((org) => (
                  <ListItem
                    key={org._id}
                    ripple={false}
                    className="py-3 pr-1 pl-4 border-b border-gray-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Typography variant="h6" color="blue-gray">
                          {org.name}
                        </Typography>
                        <Chip
                          value={org.share ? "Has Share" : "No Share"}
                          color={org.share ? "green" : "gray"}
                          size="sm"
                          icon={<KeyIcon className="h-3 w-3" />}
                        />
                      </div>
                      <Typography variant="small" color="gray">
                        ID: {org.id || org._id}
                      </Typography>
                    </div>
                  </ListItem>
                ))}
              </List>
            </Card>
          </TabPanel>
        </TabsBody>
      </Tabs>

      {/* Submit Share Dialog */}
      <Dialog size="md" open={showSubmitShareDialog} handler={() => setShowSubmitShareDialog(false)}>
        <DialogHeader>Submit Share for Exam</DialogHeader>
        <DialogBody>
          {selectedExam && (
            <div className="space-y-4">
              <div>
                <Typography variant="h6" color="blue-gray">Exam: {selectedExam.title}</Typography>
                <Typography variant="small" color="gray">
                  Shares submitted: {selectedExam.sharesSubmitted?.length || 0} / {selectedExam.threshold}
                </Typography>
              </div>

              <Textarea
                label="Your Share Data"
                value={shareData}
                onChange={(e) => setShareData(e.target.value)}
                placeholder="Enter your organization's share data here..."
                rows={4}
              />
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={() => {
              setShowSubmitShareDialog(false);
              setShareData('');
            }}
          >
            Cancel
          </Button>
          <Button color="green" onClick={handleSubmitShare}>
            Submit Share
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Decrypt Question Dialog */}
      <Dialog size="md" open={showDecryptDialog} handler={() => setShowDecryptDialog(false)}>
        <DialogHeader>Decrypt Question</DialogHeader>
        <DialogBody>
          <Input
            label="Decryption Key"
            value={decryptionKey}
            onChange={(e) => setDecryptionKey(e.target.value)}
            placeholder="Enter the decryption key..."
          />
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={() => {
              setShowDecryptDialog(false);
              setDecryptionKey('');
            }}
          >
            Cancel
          </Button>
          <Button color="blue" onClick={handleDecryptSingleQuestion}>
            Decrypt
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Exam Detail Dialog */}
      <Dialog size="lg" open={showExamDetailDialog} handler={() => setShowExamDetailDialog(false)}>
        <DialogHeader>Exam Details</DialogHeader>
        <DialogBody>
          {selectedExam && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Typography variant="h6" color="blue-gray">Title</Typography>
                  <Typography>{selectedExam.title}</Typography>
                </div>

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

                <div>
                  <Typography variant="h6" color="blue-gray">Status</Typography>
                  <div className="flex gap-2">
                    <Chip
                      value={getExamStatus(selectedExam).status}
                      color={getExamStatus(selectedExam).color}
                      size="sm"
                    />
                    <Chip
                      value={selectedExam.isDecrypted ? "Decrypted" : "Encrypted"}
                      color={selectedExam.isDecrypted ? "red" : "green"}
                      size="sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Typography variant="h6" color="blue-gray">Share Progress</Typography>
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <Typography variant="small" color="gray">
                      {selectedExam.sharesSubmitted?.length || 0} of {selectedExam.threshold} shares submitted
                    </Typography>
                    <Typography variant="small" color="gray">
                      {Math.round(getShareProgress(selectedExam))}%
                    </Typography>
                  </div>
                  <Progress value={getShareProgress(selectedExam)} color={getShareProgress(selectedExam) === 100 ? "green" : "blue"} />
                </div>
              </div>

              {selectedExam.sharesSubmitted?.length >= selectedExam.threshold && (
                <div className="flex gap-2">
                  <Button
                    color="green"
                    onClick={handleDecryptQuestions}
                    className="flex items-center gap-2"
                  >
                    <LockOpenIcon className="h-4 w-4" />
                    Decrypt Questions
                  </Button>


                </div>
              )}
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button color="blue-gray" onClick={() => setShowExamDetailDialog(false)}>
            Close
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Create Question Dialog */}
      <Dialog size="lg" open={showCreateQuestionDialog} handler={() => setShowCreateQuestionDialog(false)}>
        <DialogHeader>Create New Question</DialogHeader>
        <DialogBody className="space-y-4 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Select Exam"
              value={newQuestion.examId}
              onChange={(value) => handleInputChange({ target: { name: 'examId', value } })}
            >
              {exams.map((exam) => (
                <Option key={exam._id} value={exam._id}>
                  {exam.title}
                </Option>
              ))}
            </Select>

            <Select
              label="Select Organization"
              value={newQuestion.organizationId}
              onChange={(value) => handleInputChange({ target: { name: 'organizationId', value } })}
            >
              {organizations.map((org) => (
                <Option key={org._id} value={org._id}>
                  {org.name}
                </Option>
              ))}
            </Select>
          </div>

          <Textarea
            label="Question Content"
            name="content"
            value={newQuestion.content}
            onChange={handleInputChange}
            rows={3}
          />

          <div className="grid grid-cols-2 gap-4">
            {['a', 'b', 'c', 'd'].map((option) => (
              <Input
                key={option}
                label={`Option ${option.toUpperCase()}`}
                value={newQuestion.options[option]}
                onChange={(e) => handleOptionChange(option, e.target.value)}
              />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Correct Answer"
              value={newQuestion.answer}
              onChange={(value) => handleInputChange({ target: { name: 'answer', value } })}
            >
              {['a', 'b', 'c', 'd'].map((option) => (
                <Option key={option} value={option}>
                  Option {option.toUpperCase()}
                </Option>
              ))}
            </Select>

            <Input
              label="Encryption Key"
              name="encryptionKey"
              value={newQuestion.encryptionKey}
              onChange={handleInputChange}
              placeholder="Optional encryption key"
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={() => {
              setShowCreateQuestionDialog(false);
              resetNewQuestion();
            }}
          >
            Cancel
          </Button>
          <Button
            color="green"
            onClick={handleCreateQuestion}
            disabled={!newQuestion.content || !newQuestion.examId || !newQuestion.organizationId}
          >
            Create Question
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default OrganizationDashboard;