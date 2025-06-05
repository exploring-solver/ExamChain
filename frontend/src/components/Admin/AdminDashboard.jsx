import React, { useState, useEffect } from 'react';
import { 
    Card, 
    Input, 
    Button, 
    Typography, 
    Alert, 
    Dialog, 
    DialogHeader, 
    DialogBody, 
    DialogFooter,
    Checkbox,
    Chip,
    List,
    ListItem,
    ListItemPrefix,
    IconButton,
    Spinner
} from "@material-tailwind/react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import config from '../../config';
import { OrganizationList } from './OrganizationList';
import { ExamsList } from './ExamsList';

const AdminDashboard = () => {
    // Exam creation states
    const [examId, setExamId] = useState('');
    const [examTitle, setExamTitle] = useState('');
    const [examContent, setExamContent] = useState('');
    const [selectedOrganizations, setSelectedOrganizations] = useState([]);
    const [threshold, setThreshold] = useState('');
    const [duration, setDuration] = useState('');
    const [startTime, setStartTime] = useState('');
    const [alert, setAlert] = useState(null);

    // Organization creation states
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [id, setId] = useState('');

    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);

    // Organization search states
    const [organizations, setOrganizations] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredOrganizations, setFilteredOrganizations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showOrgSelector, setShowOrgSelector] = useState(false);

    // Fetch organizations on component mount
    useEffect(() => {
        fetchOrganizations();
    }, []);

    // Filter organizations based on search term
    useEffect(() => {
        if (searchTerm) {
            const filtered = organizations.filter(org => 
                org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                org.id.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredOrganizations(filtered);
        } else {
            setFilteredOrganizations(organizations);
        }
    }, [searchTerm, organizations]);

    // Auto-hide alert after 5 seconds
    useEffect(() => {
        if (alert) {
            const timer = setTimeout(() => {
                setAlert(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [alert]);

    // Generate a unique exam ID
    const generateExamId = () => {
        return 'exam_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    };

    // Generate current datetime for startTime default
    const getCurrentDateTime = () => {
        const now = new Date();
        return now.toISOString().slice(0, 16); // Format for datetime-local input
    };

    const fetchOrganizations = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${config.baseURL}/exam/organizations`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setOrganizations(data);
                setFilteredOrganizations(data);
            } else {
                throw new Error('Failed to fetch organizations');
            }
        } catch (error) {
            setAlert({ type: 'error', message: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleOrganizationToggle = (org) => {
        setSelectedOrganizations(prev => {
            const isSelected = prev.some(selected => selected.id === org.id);
            if (isSelected) {
                return prev.filter(selected => selected.id !== org.id);
            } else {
                return [...prev, org];
            }
        });
    };

    const removeSelectedOrganization = (orgId) => {
        setSelectedOrganizations(prev => prev.filter(org => org.id !== orgId));
    };

    const handleCreateExam = async () => {
        try {
            if (selectedOrganizations.length === 0) {
                throw new Error('Please select at least one organization');
            }

            if (!threshold || parseInt(threshold) > selectedOrganizations.length) {
                throw new Error(`Threshold must be between 1 and ${selectedOrganizations.length}`);
            }

            if (!duration || parseInt(duration) <= 0) {
                throw new Error('Duration must be a positive number (minutes)');
            }

            if (!startTime) {
                throw new Error('Start time is required');
            }

            // Generate examId if not provided
            const finalExamId = examId || generateExamId();

            // Prepare organization IDs - handle both _id and id properties
            const organizationIds = selectedOrganizations.map(org => org._id || org.id);

            const requestBody = {
                examId: finalExamId,
                title: examTitle,
                content: examContent,
                organizationIds: organizationIds,
                threshold: parseInt(threshold, 10),
                duration: parseInt(duration, 10), // Duration in minutes
                startTime: new Date(startTime).toISOString(), // Convert to ISO string
            };

            console.log('Creating exam with data:', requestBody);

            const response = await fetch(`${config.baseURL}/exam/create-exam`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                const data = await response.json();
                setAlert({ 
                    type: 'success', 
                    message: `Exam created successfully! Exam ID: ${finalExamId} | Secret key: ${data.secretKey}` 
                });
                resetExamFields();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create exam');
            }
        } catch (error) {
            console.error('Error creating exam:', error);
            setAlert({ type: 'error', message: error.message });
        }
    };

    const handleCreateOrganization = async () => {
        try {
            if (password !== passwordConfirmation) {
                throw new Error('Passwords do not match');
            }

            const response = await fetch(`${config.baseURL}/users/api/v1/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password,
                    passwordConfirmation,
                    email,
                    name,
                    id,
                    role: 'ORGANIZATION',
                }),
            });

            if (response.ok) {
                setAlert({ type: 'success', message: 'Organization created successfully!' });
                resetOrganizationFields();
                fetchOrganizations(); // Refresh organization list
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create organization');
            }
        } catch (error) {
            setAlert({ type: 'error', message: error.message });
        }
    };

    const resetExamFields = () => {
        setExamId('');
        setExamTitle('');
        setExamContent('');
        setSelectedOrganizations([]);
        setThreshold('');
        setDuration('');
        setStartTime('');
        setSearchTerm('');
    };

    const resetOrganizationFields = () => {
        setUsername('');
        setPassword('');
        setPasswordConfirmation('');
        setEmail('');
        setName('');
        setId('');
    };

    const handleConfirm = () => {
        if (confirmAction === 'createExam') {
            handleCreateExam();
        } else if (confirmAction === 'createOrganization') {
            handleCreateOrganization();
        }
        setShowConfirmDialog(false);
    };

    const openConfirmDialog = (action) => {
        setConfirmAction(action);
        setShowConfirmDialog(true);
    };

    // Set default start time to current time when component mounts
    useEffect(() => {
        if (!startTime) {
            setStartTime(getCurrentDateTime());
        }
    }, []);

    return (
        <div className="w-full min-h-screen bg-white text-black p-8">
            <OrganizationList/>
            
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
            
            <div className='flex flex-col flex-wrap justify-between w-full md:flex-row gap-4'>
                <Card className="mb-8 p-6 flex-1">
                    <Typography variant="h4" color="blue-gray" className="mb-6">
                        Create Exam
                    </Typography>
                    <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
                        <Input
                            label="Exam ID (optional - will auto-generate if empty)"
                            size="lg"
                            value={examId}
                            onChange={(e) => setExamId(e.target.value)}
                            placeholder="Leave empty to auto-generate"
                        />
                        <Input
                            label="Exam Title"
                            size="lg"
                            value={examTitle}
                            onChange={(e) => setExamTitle(e.target.value)}
                            required
                        />
                        <Input
                            label="Exam Content"
                            size="lg"
                            value={examContent}
                            onChange={(e) => setExamContent(e.target.value)}
                            required
                        />
                        
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <Input
                                    label="Duration (minutes)"
                                    size="lg"
                                    type="number"
                                    min="1"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex-1">
                                <Input
                                    label="Start Time"
                                    size="lg"
                                    type="datetime-local"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        
                        {/* Organization Selection Section */}
                        <div className="space-y-2">
                            <Typography variant="h6" color="blue-gray">
                                Select Organizations
                            </Typography>
                            
                            {/* Selected Organizations Display */}
                            {selectedOrganizations.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {selectedOrganizations.map(org => (
                                        <Chip
                                            key={org.id}
                                            value={org.name}
                                            onClose={() => removeSelectedOrganization(org.id)}
                                            className="bg-blue-900"
                                        />
                                    ))}
                                </div>
                            )}
                            
                            <Button
                                variant="outlined"
                                className="w-full"
                                onClick={() => setShowOrgSelector(!showOrgSelector)}
                            >
                                {showOrgSelector ? 'Hide' : 'Show'} Organization List ({selectedOrganizations.length} selected)
                            </Button>
                            
                            {/* Organization Search and List */}
                            {showOrgSelector && (
                                <Card className="p-4 max-h-60 overflow-y-auto">
                                    <div className="mb-3">
                                        <Input
                                            label="Search organizations..."
                                            icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    
                                    {loading ? (
                                        <div className="flex justify-center p-4">
                                            <Spinner />
                                        </div>
                                    ) : (
                                        <List>
                                            {filteredOrganizations.map(org => (
                                                <ListItem key={org.id} className="p-2">
                                                    <ListItemPrefix>
                                                        <Checkbox
                                                            checked={selectedOrganizations.some(selected => selected.id === org.id)}
                                                            onChange={() => handleOrganizationToggle(org)}
                                                        />
                                                    </ListItemPrefix>
                                                    <div>
                                                        <Typography variant="h6" color="blue-gray">
                                                            {org.name}
                                                        </Typography>
                                                        <Typography variant="small" color="gray">
                                                            ID: {org.id}
                                                        </Typography>
                                                    </div>
                                                </ListItem>
                                            ))}
                                            {filteredOrganizations.length === 0 && (
                                                <Typography color="gray" className="text-center p-4">
                                                    No organizations found
                                                </Typography>
                                            )}
                                        </List>
                                    )}
                                </Card>
                            )}
                        </div>
                        
                        <div>
                            <Input
                                label={`Threshold (1-${selectedOrganizations.length || '?'})`}
                                size="lg"
                                type="number"
                                min="1"
                                max={selectedOrganizations.length || 1}
                                value={threshold}
                                onChange={(e) => setThreshold(e.target.value)}
                                required
                            />
                            <Typography variant="small" color="gray" className="mt-1">
                                Number of shares required to decrypt the exam
                            </Typography>
                        </div>
                        
                        <Button 
                            onClick={() => openConfirmDialog('createExam')} 
                            className="mt-4"
                            disabled={!examTitle || !examContent || selectedOrganizations.length === 0 || !threshold || !duration || !startTime}
                        >
                            Create Exam
                        </Button>
                    </form>
                </Card>

                <Card className="p-6 flex-1 max-w-md">
                    <Typography variant="h4" color="blue-gray" className="mb-6">
                        Create Organization
                    </Typography>
                    <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
                        <Input
                            label="Username"
                            size="lg"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <Input
                            label="Organization ID"
                            size="lg"
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                            required
                        />
                        <Input
                            label="Email"
                            size="lg"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Input
                            label="Organization Name"
                            size="lg"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <Input
                            label="Password"
                            size="lg"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <Input
                            label="Confirm Password"
                            size="lg"
                            type="password"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            required
                        />
                        <Button 
                            onClick={() => openConfirmDialog('createOrganization')} 
                            className="mt-4"
                            disabled={!username || !id || !email || !name || !password || !passwordConfirmation}
                        >
                            Create Organization
                        </Button>
                    </form>
                </Card>
            </div>

            <Dialog open={showConfirmDialog} handler={setShowConfirmDialog}>
                <DialogHeader>Confirmation</DialogHeader>
                <DialogBody>
                    Are you sure you want to proceed?
                    {confirmAction === 'createExam' && selectedOrganizations.length > 0 && (
                        <div className="mt-4">
                            <Typography variant="small" color="gray">
                                Selected Organizations: {selectedOrganizations.map(org => org.name).join(', ')}
                            </Typography>
                            <Typography variant="small" color="gray">
                                Threshold: {threshold} out of {selectedOrganizations.length}
                            </Typography>
                        </div>
                    )}
                </DialogBody>
                <DialogFooter>
                    <Button variant="text" color="red" onClick={() => setShowConfirmDialog(false)} className="mr-1">
                        Cancel
                    </Button>
                    <Button variant="gradient" color="green" onClick={handleConfirm}>
                        Confirm
                    </Button>
                </DialogFooter>
            </Dialog>
            <ExamsList/>
        </div>
    );
};

export default AdminDashboard;