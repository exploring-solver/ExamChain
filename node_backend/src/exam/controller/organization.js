const { Organization } = require("../models/Organization");
const { Exam } = require("../models/Exam");

// Get all organizations
const getAllOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.find({}).sort({ createdAt: -1 });
    res.status(200).json(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ 
      status: 500, 
      message: 'Error fetching organizations', 
      error: error.message 
    });
  }
};

// Get a specific organization by ID
const getOrganizationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to find by both _id and custom id field
    const organization = await Organization.findOne({
      $or: [{ _id: id }, { id: id }]
    });
    
    if (!organization) {
      return res.status(404).json({ 
        status: 404, 
        message: 'Organization not found' 
      });
    }
    
    res.status(200).json(organization);
  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(500).json({ 
      status: 500, 
      message: 'Error fetching organization', 
      error: error.message 
    });
  }
};

// Create a new organization
const createOrganization = async (req, res) => {
  try {
    const { id, name, share } = req.body;

    if (!name) {
      return res.status(400).json({
        status: 400,
        message: 'Organization name is required'
      });
    }

    // Check if organization with same name or id already exists
    const existingOrg = await Organization.findOne({
      $or: [
        { name: name },
        ...(id ? [{ id: id }] : [])
      ]
    });

    if (existingOrg) {
      return res.status(409).json({
        status: 409,
        message: 'Organization with this name or ID already exists'
      });
    }

    const organizationData = { name };
    if (id) organizationData.id = id;
    if (share) organizationData.share = share;

    const organization = new Organization(organizationData);
    await organization.save();

    res.status(201).json({
      message: 'Organization created successfully',
      organization: organization
    });

  } catch (error) {
    console.error('Error creating organization:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        status: 409,
        message: 'Organization with this name or ID already exists'
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        status: 400,
        message: 'Validation error',
        errors: error.errors
      });
    }
    
    res.status(500).json({ 
      status: 500, 
      message: 'Error creating organization', 
      error: error.message 
    });
  }
};

// Update an organization
const updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, share } = req.body;

    // Find organization by both _id and custom id field
    const organization = await Organization.findOne({
      $or: [{ _id: id }, { id: id }]
    });

    if (!organization) {
      return res.status(404).json({ 
        status: 404, 
        message: 'Organization not found' 
      });
    }

    // Check if new name conflicts with existing organizations
    if (name && name !== organization.name) {
      const existingOrg = await Organization.findOne({ 
        name: name, 
        _id: { $ne: organization._id } 
      });
      
      if (existingOrg) {
        return res.status(409).json({
          status: 409,
          message: 'Organization with this name already exists'
        });
      }
    }

    // Prepare update data
    const updateData = {};
    if (name) updateData.name = name;
    if (share !== undefined) updateData.share = share; // Allow clearing share by passing empty string

    const updatedOrganization = await Organization.findByIdAndUpdate(
      organization._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: 'Organization updated successfully',
      organization: updatedOrganization
    });

  } catch (error) {
    console.error('Error updating organization:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        status: 409,
        message: 'Organization with this name already exists'
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        status: 400,
        message: 'Validation error',
        errors: error.errors
      });
    }
    
    res.status(500).json({ 
      status: 500, 
      message: 'Error updating organization', 
      error: error.message 
    });
  }
};

// Delete an organization by ID
const deleteOrganization = async (req, res) => {
  try {
    const { id } = req.params;

    // Find organization by both _id and custom id field
    const organization = await Organization.findOne({
      $or: [{ _id: id }, { id: id }]
    });

    if (!organization) {
      return res.status(404).json({ 
        status: 404, 
        message: 'Organization not found' 
      });
    }

    // Check if organization is used in any exams
    const examsUsingOrg = await Exam.find({
      'sharesSubmitted.organizationId': organization._id
    });

    if (examsUsingOrg.length > 0) {
      return res.status(409).json({
        status: 409,
        message: `Cannot delete organization. It is associated with ${examsUsingOrg.length} exam(s). Please remove the organization from all exams first.`,
        associatedExams: examsUsingOrg.map(exam => ({
          examId: exam.examId,
          title: exam.title
        }))
      });
    }

    await Organization.findByIdAndDelete(organization._id);

    res.status(200).json({ 
      message: 'Organization deleted successfully',
      deletedOrganization: {
        id: organization.id,
        name: organization.name
      }
    });

  } catch (error) {
    console.error('Error deleting organization:', error);
    res.status(500).json({ 
      status: 500, 
      message: 'Error deleting organization', 
      error: error.message 
    });
  }
};

// Get organization statistics
const getOrganizationStats = async (req, res) => {
  try {
    const totalOrganizations = await Organization.countDocuments();
    const organizationsWithShares = await Organization.countDocuments({ 
      share: { $exists: true, $ne: "" } 
    });
    const organizationsWithoutShares = totalOrganizations - organizationsWithShares;

    // Get organizations by share activity
    const recentOrganizations = await Organization.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name id createdAt');

    res.status(200).json({
      totalOrganizations,
      organizationsWithShares,
      organizationsWithoutShares,
      recentOrganizations
    });

  } catch (error) {
    console.error('Error fetching organization statistics:', error);
    res.status(500).json({ 
      status: 500, 
      message: 'Error fetching organization statistics', 
      error: error.message 
    });
  }
};

// Clear organization share
const clearOrganizationShare = async (req, res) => {
  try {
    const { id } = req.params;

    const organization = await Organization.findOne({
      $or: [{ _id: id }, { id: id }]
    });

    if (!organization) {
      return res.status(404).json({ 
        status: 404, 
        message: 'Organization not found' 
      });
    }

    organization.share = undefined;
    await organization.save();

    res.status(200).json({
      message: 'Organization share cleared successfully',
      organization: organization
    });

  } catch (error) {
    console.error('Error clearing organization share:', error);
    res.status(500).json({ 
      status: 500, 
      message: 'Error clearing organization share', 
      error: error.message 
    });
  }
};

// Bulk operations
const bulkDeleteOrganizations = async (req, res) => {
  try {
    const { organizationIds } = req.body;

    if (!organizationIds || !Array.isArray(organizationIds) || organizationIds.length === 0) {
      return res.status(400).json({
        status: 400,
        message: 'Array of organization IDs is required'
      });
    }

    // Check if any organizations are used in exams
    const organizations = await Organization.find({
      $or: [
        { _id: { $in: organizationIds } },
        { id: { $in: organizationIds } }
      ]
    });

    const orgObjectIds = organizations.map(org => org._id);
    
    const examsUsingOrgs = await Exam.find({
      'sharesSubmitted.organizationId': { $in: orgObjectIds }
    });

    if (examsUsingOrgs.length > 0) {
      return res.status(409).json({
        status: 409,
        message: `Cannot delete organizations. Some are associated with ${examsUsingOrgs.length} exam(s).`,
        associatedExams: examsUsingOrgs.map(exam => exam.examId)
      });
    }

    const result = await Organization.deleteMany({
      $or: [
        { _id: { $in: organizationIds } },
        { id: { $in: organizationIds } }
      ]
    });

    res.status(200).json({
      message: `${result.deletedCount} organizations deleted successfully`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Error bulk deleting organizations:', error);
    res.status(500).json({ 
      status: 500, 
      message: 'Error bulk deleting organizations', 
      error: error.message 
    });
  }
};

const getSharesForOrganization = async (req, res) => {
  const { organizationId } = req.params;
  try {
    const org = await Organization.findById(organizationId).populate('shares.examId');
    if (!org) return res.status(404).json({ message: 'Organization not found' });
    res.status(200).json({ shares: org.shares });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

module.exports = {
  getAllOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationStats,
  clearOrganizationShare,
  bulkDeleteOrganizations,
  getSharesForOrganization
};