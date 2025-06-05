const mongoose = require('../../../services/mongoose');

const Question = mongoose.model(
  'Question',
  {
    content: {
      type: String,
      required: true,
    },
    options: {
      a: { type: String, required: true },
      b: { type: String, required: true },
      c: { type: String, required: true },
      d: { type: String, required: true },
    },
    answer: {
      type: String,
      required: true,
      enum: ['a', 'b', 'c', 'd'],
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    encrypted: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    // Additional metadata
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    category: {
      type: String,
      default: 'general',
    },
    points: {
      type: Number,
      default: 1,
      min: 1,
    },
    timeLimit: {
      type: Number, // in seconds
      default: 60,
    },
    explanation: {
      type: String,
      default: '',
    },
    tags: [{
      type: String,
    }],
    // Encryption metadata
    encryptionMethod: {
      type: String,
      default: 'aes-256-cbc',
    },
    // Question status
    isActive: {
      type: Boolean,
      default: true,
    },
    // Statistics
    timesUsed: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
    },
  },
  'questions',
);

// Add indexes for better query performance
Question.schema.index({ examId: 1 });
Question.schema.index({ organizationId: 1 });
Question.schema.index({ encrypted: 1 });
Question.schema.index({ isActive: 1 });
Question.schema.index({ createdAt: -1 });

// Pre-save middleware to update the updatedAt field
Question.schema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for question summary
Question.schema.virtual('summary').get(function() {
  const maxLength = 100;
  return this.content.length > maxLength 
    ? this.content.substring(0, maxLength) + '...'
    : this.content;
});

// Instance method to check if question belongs to an organization
Question.schema.methods.belongsToOrganization = function(organizationId) {
  return this.organizationId.toString() === organizationId.toString();
};

// Instance method to check if question belongs to an exam
Question.schema.methods.belongsToExam = function(examId) {
  return this.examId.toString() === examId.toString();
};

// Static method to find questions by multiple criteria
Question.schema.statics.findByCriteria = function(criteria) {
  const query = {};
  
  if (criteria.examId) query.examId = criteria.examId;
  if (criteria.organizationId) query.organizationId = criteria.organizationId;
  if (criteria.encrypted !== undefined) query.encrypted = criteria.encrypted;
  if (criteria.isActive !== undefined) query.isActive = criteria.isActive;
  if (criteria.difficulty) query.difficulty = criteria.difficulty;
  if (criteria.category) query.category = criteria.category;
  
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to get question statistics
Question.schema.statics.getStatistics = async function() {
  const totalQuestions = await this.countDocuments();
  const encryptedQuestions = await this.countDocuments({ encrypted: true });
  const decryptedQuestions = totalQuestions - encryptedQuestions;
  const activeQuestions = await this.countDocuments({ isActive: true });
  const inactiveQuestions = totalQuestions - activeQuestions;
  
  const difficultyDistribution = await this.aggregate([
    { $group: { _id: '$difficulty', count: { $sum: 1 } } }
  ]);
  
  const categoryDistribution = await this.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);
  
  return {
    totalQuestions,
    encryptedQuestions,
    decryptedQuestions,
    activeQuestions,
    inactiveQuestions,
    difficultyDistribution,
    categoryDistribution
  };
};

module.exports = {
  Question,
};