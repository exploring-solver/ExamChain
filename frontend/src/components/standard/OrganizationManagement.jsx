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
  Checkbox,
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
  Spinner,
} from '@material-tailwind/react';
import {
  TrashIcon,
  PencilIcon,
  EyeIcon,
  KeyIcon,
  PlusIcon,
  XMarkIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import config from '../../config';
import TruncatedShare from '../Utils/TruncatedShare';

function ShareStatusBadge({ hasShare }) {
  return (
    <Chip
      value={hasShare ? "Has Share" : "No Share"}
      color={hasShare ? "green" : "gray"}
      size="sm"
      icon={<KeyIcon className="h-3 w-3" />}
    />
  );
}

export function OrganizationManagement() {
  const [activeTab, setActiveTab] = useState("list");
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [editingOrganization, setEditingOrganization] = useState(null);
  
  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  // Form states for editing
  const [editName, setEditName] = useState('');
  const [editId, setEditId] = useState('');
  const [editShare, setEditShare] = useState('');

  // Form states for creating
  const [createName, setCreateName] = useState('');
  const [createId, setCreateId] = useState('');
  const [createShare, setCreateShare] = useState('');

  // Bulk selection
  const [selectedOrganizations, setSelectedOrganizations] = useState([]);
  const [bulkMode, setBulkMode] = useState(false);

  const tabsData = [
    {
      label: "Organizations",
      value: "list",
      icon: BuildingOfficeIcon,
    },
    {
      label: "Statistics",
      value: "statistics",
      icon: ChartBarIcon,
    },
  ];

  useEffect(() => {
    fetchOrganizations();
    fetchStats();
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
      } else {
        throw new Error('Failed to fetch organizations');
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      setAlert({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${config.baseURL}/exam/organizations/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleDelete = async (orgId) => {
    if (!window.confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${config.baseURL}/exam/organizations/${orgId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setAlert({ type: 'success', message: 'Organization deleted successfully!' });
        setOrganizations(organizations.filter(org => org._id !== orgId && org.id !== orgId));
        fetchStats();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete organization');
      }
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    }
  };

  const handleCreate = async () => {
    try {
      if (!createName.trim()) {
        throw new Error('Organization name is required');
      }

      const requestBody = {
        name: createName.trim(),
      };

      if (createId.trim()) {
        requestBody.id = createId.trim();
      }

      if (createShare.trim()) {
        requestBody.share = createShare.trim();
      }

      const response = await fetch(`${config.baseURL}/exam/organizations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        setAlert({ type: 'success', message: 'Organization created successfully!' });
        setCreateDialogOpen(false);
        resetCreateForm();
        fetchOrganizations();
        fetchStats();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create organization');
      }
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    }
  };

  const handleEdit = (org) => {
    setEditingOrganization(org);
    setEditName(org.name);
    setEditId(org.id || '');
    setEditShare(org.share || '');
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`${config.baseURL}/exam/organizations/${editingOrganization._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          name: editName.trim(),
          share: editShare.trim(),
        }),
      });

      if (response.ok) {
        setAlert({ type: 'success', message: 'Organization updated successfully!' });
        setEditDialogOpen(false);
        fetchOrganizations();
        fetchStats();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update organization');
      }
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    }
  };

  const handleClearShare = async (orgId) => {
    if (!window.confirm('Are you sure you want to clear this organization\'s share?')) {
      return;
    }

    try {
      const response = await fetch(`${config.baseURL}/exam/organizations/${orgId}/clear-share`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setAlert({ type: 'success', message: 'Organization share cleared successfully!' });
        fetchOrganizations();
        fetchStats();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to clear share');
      }
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedOrganizations.length === 0) {
      setAlert({ type: 'error', message: 'No organizations selected' });
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedOrganizations.length} organization(s)?`)) {
      return;
    }

    try {
      const response = await fetch(`${config.baseURL}/exam/organizations/bulk-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          organizationIds: selectedOrganizations
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAlert({ type: 'success', message: data.message });
        setSelectedOrganizations([]);
        setBulkMode(false);
        fetchOrganizations();
        fetchStats();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete organizations');
      }
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    }
  };

  const handleView = (org) => {
    setSelectedOrganization(org);
    setViewDialogOpen(true);
  };

  const handleBulkSelection = (orgId, checked) => {
    if (checked) {
      setSelectedOrganizations(prev => [...prev, orgId]);
    } else {
      setSelectedOrganizations(prev => prev.filter(id => id !== orgId));
    }
  };

  const resetCreateForm = () => {
    setCreateName('');
    setCreateId('');
    setCreateShare('');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const StatCard = ({ title, value, color = "blue" }) => (
    <Card className="p-4">
      <Typography variant="h6" color="blue-gray" className="mb-2">
        {title}
      </Typography>
      <Typography variant="h3" color={color}>
        {value}
      </Typography>
    </Card>
  );

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
          Organization Management
        </Typography>
        <div className="flex gap-2">
          <Button onClick={fetchOrganizations} disabled={loading} size="sm">
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button 
            onClick={() => setCreateDialogOpen(true)} 
            className="flex items-center gap-2"
            size="sm"
          >
            <PlusIcon className="h-4 w-4" />
            Add Organization
          </Button>
        </div>
      </div>

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
          <TabPanel value="list" className="p-0 mt-6">
            <Card className="w-full">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <Typography variant="h6" color="blue-gray">
                    Organizations ({organizations.length})
                  </Typography>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={bulkMode ? "filled" : "outlined"}
                      onClick={() => {
                        setBulkMode(!bulkMode);
                        setSelectedOrganizations([]);
                      }}
                    >
                      {bulkMode ? 'Exit Bulk Mode' : 'Bulk Actions'}
                    </Button>
                    {bulkMode && selectedOrganizations.length > 0 && (
                      <Button
                        size="sm"
                        color="red"
                        onClick={handleBulkDelete}
                      >
                        Delete Selected ({selectedOrganizations.length})
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              <List>
                {organizations.length === 0 ? (
                  <ListItem>
                    <Typography color="gray" className="text-center w-full">
                      No organizations found
                    </Typography>
                  </ListItem>
                ) : (
                  organizations.map((organization) => (
                    <ListItem
                      key={organization._id}
                      ripple={false}
                      className="py-3 pr-1 pl-4 border-b border-gray-200"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {bulkMode && (
                          <Checkbox
                            checked={selectedOrganizations.includes(organization._id)}
                            onChange={(e) => handleBulkSelection(organization._id, e.target.checked)}
                          />
                        )}
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Typography variant="h6" color="blue-gray">
                              {organization.name}
                            </Typography>
                            <ShareStatusBadge hasShare={!!organization.share} />
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>ID: {organization.id || organization._id}</span>
                            {organization.createdAt && (
                              <span>Created: {formatDate(organization.createdAt)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <ListItemSuffix className="flex gap-1">
                        <IconButton
                          variant="text"
                          color="blue"
                          size="sm"
                          onClick={() => handleView(organization)}
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </IconButton>
                        
                        <IconButton
                          variant="text"
                          color="amber"
                          size="sm"
                          onClick={() => handleEdit(organization)}
                          title="Edit Organization"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </IconButton>
                        
                        {organization.share && (
                          <IconButton
                            variant="text"
                            color="orange"
                            size="sm"
                            onClick={() => handleClearShare(organization._id)}
                            title="Clear Share"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </IconButton>
                        )}
                        
                        <IconButton
                          variant="text"
                          color="red"
                          size="sm"
                          onClick={() => handleDelete(organization._id)}
                          title="Delete Organization"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </IconButton>
                      </ListItemSuffix>
                    </ListItem>
                  ))
                )}
              </List>
            </Card>
          </TabPanel>

          <TabPanel value="statistics" className="p-0 mt-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <Typography variant="h5" color="blue-gray">
                  Organization Statistics
                </Typography>
                <Button onClick={fetchStats} size="sm">
                  Refresh Stats
                </Button>
              </div>

              {stats ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard title="Total Organizations" value={stats.totalOrganizations} color="blue" />
                  <StatCard title="With Shares" value={stats.organizationsWithShares} color="green" />
                  <StatCard title="Without Shares" value={stats.organizationsWithoutShares} color="gray" />
                </div>
              ) : (
                <div className="flex justify-center p-8">
                  <Spinner className="h-8 w-8" />
                </div>
              )}

              {stats?.recentOrganizations && stats.recentOrganizations.length > 0 && (
                <Card className="p-6">
                  <Typography variant="h6" color="blue-gray" className="mb-4">
                    Recently Added Organizations
                  </Typography>
                  <List>
                    {stats.recentOrganizations.map((org) => (
                      <ListItem key={org._id} className="py-2">
                        <div className="flex-1">
                          <Typography variant="h6" color="blue-gray">
                            {org.name}
                          </Typography>
                          <Typography variant="small" color="gray">
                            ID: {org.id} • Added: {formatDate(org.createdAt)}
                          </Typography>
                        </div>
                      </ListItem>
                    ))}
                  </List>
                </Card>
              )}
            </div>
          </TabPanel>
        </TabsBody>
      </Tabs>

      {/* View Dialog */}
      <Dialog size="lg" open={viewDialogOpen} handler={() => setViewDialogOpen(false)}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <BuildingOfficeIcon className="h-6 w-6" />
            {selectedOrganization?.name}
            {selectedOrganization && <ShareStatusBadge hasShare={!!selectedOrganization.share} />}
          </div>
        </DialogHeader>
        <DialogBody className="space-y-4">
          {selectedOrganization && (
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Typography variant="h6" color="blue-gray">Organization Name</Typography>
                <Typography>{selectedOrganization.name}</Typography>
              </div>
              
              <div>
                <Typography variant="h6" color="blue-gray">Organization ID</Typography>
                <Typography>{selectedOrganization.id || selectedOrganization._id}</Typography>
              </div>
              
              <div>
                <Typography variant="h6" color="blue-gray">Database ID</Typography>
                <Typography className="font-mono text-sm">{selectedOrganization._id}</Typography>
              </div>
              
              {selectedOrganization.createdAt && (
                <div>
                  <Typography variant="h6" color="blue-gray">Created At</Typography>
                  <Typography>{formatDate(selectedOrganization.createdAt)}</Typography>
                </div>
              )}
              
              <div>
                <Typography variant="h6" color="blue-gray">Share Status</Typography>
                <div className="mt-2">
                  <ShareStatusBadge hasShare={!!selectedOrganization.share} />
                </div>
              </div>
              
              {selectedOrganization.share && (
                <div>
                  <Typography variant="h6" color="blue-gray">Share Data</Typography>
                  <TruncatedShare share={selectedOrganization.share} />
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
        <DialogHeader>Edit Organization</DialogHeader>
        <DialogBody className="space-y-4">
          <Input
            label="Organization Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
          />
          
          <Input
            label="Organization ID"
            value={editId}
            onChange={(e) => setEditId(e.target.value)}
            disabled
            helperText="Organization ID cannot be changed"
          />
          
          <Input
            label="Share (optional)"
            value={editShare}
            onChange={(e) => setEditShare(e.target.value)}
            placeholder="Enter share data or leave empty"
          />
        </DialogBody>
        <DialogFooter className="space-x-2">
          <Button color="red" variant="text" onClick={() => setEditDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            color="green" 
            onClick={handleUpdate}
            disabled={!editName.trim()}
          >
            Update Organization
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Create Dialog */}
      <Dialog size="md" open={createDialogOpen} handler={() => setCreateDialogOpen(false)}>
        <DialogHeader>Create New Organization</DialogHeader>
        <DialogBody className="space-y-4">
          <Input
            label="Organization Name"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            required
          />
          
          <Input
            label="Organization ID (optional)"
            value={createId}
            onChange={(e) => setCreateId(e.target.value)}
            placeholder="Auto-generated if empty"
          />
          
          <Input
            label="Share (optional)"
            value={createShare}
            onChange={(e) => setCreateShare(e.target.value)}
            placeholder="Enter share data or leave empty"
          />
        </DialogBody>
        <DialogFooter className="space-x-2">
          <Button 
            color="red" 
            variant="text" 
            onClick={() => {
              setCreateDialogOpen(false);
              resetCreateForm();
            }}
          >
            Cancel
          </Button>
          <Button 
            color="green" 
            onClick={handleCreate}
            disabled={!createName.trim()}
          >
            Create Organization
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}