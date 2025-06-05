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
  Chip,
} from '@material-tailwind/react';
import {
  TrashIcon,
  KeyIcon,
  PencilIcon,
  EyeIcon,
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

export function OrganizationList() {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [open, setOpen] = useState(false);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Auto-hide alert after 5 seconds
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const confirmDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this organization?')) {
      handleDelete(id);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

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
      setAlert({ type: 'error', message: 'Error fetching organizations' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${config.baseURL}/exam/organizations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setAlert({ type: 'success', message: 'Organization deleted successfully!' });
        // Filter by both _id and id to handle different cases
        setOrganizations(organizations.filter(org => org._id !== id && org.id !== id));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete organization');
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
        fetchOrganizations(); // Refresh the list
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to clear share');
      }
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    }
  };
  
  const handleOpen = () => setOpen(!open);
  
  const handleListItemClick = (organization) => {
    setSelectedOrganization(organization);
    handleOpen();
  };

  const closeModal = () => {
    handleOpen();
    setSelectedOrganization(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
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
      
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h4" color="blue-gray">
          Registered Organizations
        </Typography>
        <Button onClick={fetchOrganizations} disabled={loading} size="sm">
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>
      
      <Card className="w-full max-w-2xl">
        <List>
          {organizations.length === 0 ? (
            <ListItem>
              <Typography color="gray" className="text-center w-full">
                {loading ? 'Loading organizations...' : 'No organizations found'}
              </Typography>
            </ListItem>
          ) : (
            organizations.map((organization) => (
              <ListItem
                key={organization._id}
                ripple={false}
                className="py-3 pr-1 pl-4 cursor-pointer hover:bg-gray-50"
                onClick={() => handleListItemClick(organization)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Typography variant="h6" color="blue-gray">
                      {organization.name}
                    </Typography>
                    <ShareStatusBadge hasShare={!!organization.share} />
                  </div>
                  <Typography variant="small" color="gray">
                    ID: {organization.id || organization._id}
                  </Typography>
                </div>
                
                <ListItemSuffix className="flex gap-1">
                  <IconButton
                    variant="text"
                    color="blue"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleListItemClick(organization);
                    }}
                    title="View Details"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </IconButton>
                  
                  {organization.share && (
                    <IconButton
                      variant="text"
                      color="orange"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearShare(organization._id);
                      }}
                      title="Clear Share"
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
                      // Use _id for deletion as it's more reliable
                      confirmDelete(organization._id);
                    }}
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

      <Dialog size="lg" open={open} handler={closeModal}>
        <DialogHeader>
          <div className="flex items-center gap-2">
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
                <Typography>{selectedOrganization.id || 'Auto-generated'}</Typography>
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
              
              {selectedOrganization.share ? (
                <div>
                  <Typography variant="h6" color="blue-gray">Share Data</Typography>
                  <TruncatedShare share={selectedOrganization.share} />
                  <div className="mt-2">
                    <Button
                      size="sm"
                      color="orange"
                      variant="outlined"
                      onClick={() => {
                        closeModal();
                        handleClearShare(selectedOrganization._id);
                      }}
                    >
                      Clear Share
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <Typography variant="h6" color="blue-gray">Share Data</Typography>
                  <Typography color="gray">No share assigned</Typography>
                </div>
              )}
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button color="blue-gray" onClick={closeModal}>
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}