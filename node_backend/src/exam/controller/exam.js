const crypto = require('crypto');
const sss = require('shamirs-secret-sharing');
const { Exam } = require('../models/Exam');
const { Organization } = require('../models/Organization');
const { Question } = require('../models/Question');
const { decrypt } = require('../utils/questionEncrypt');
const  mongoose  = require('../../../services/mongoose');

const generateSecretKey = () => crypto.randomBytes(32).toString('hex');

const encryptContent = (content, key) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
  let encrypted = cipher.update(content, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + encrypted; // prepend iv to the encrypted content
};

const decryptContent = (encryptedContent, key) => {
  if (key.length !== 64) { // Hex string of 32 bytes should be 64 characters long
    throw new Error('Invalid key length');
  }
  const iv = Buffer.from(encryptedContent.slice(0, 32), 'hex'); // extract iv
  const encryptedText = encryptedContent.slice(32); // get encrypted text
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

// Create an exam
const createExam = async (req, res) => {
  const { examId, title, content, organizationIds, threshold, duration, startTime } = req.body;

  if (!examId || !duration || !startTime || !organizationIds || organizationIds.length === 0) {
    return res.status(400).json({
      status: 400,
      message: 'examId, duration, startTime, and organizationIds are required fields.'
    });
  }

  try {
    const secretKey = generateSecretKey();
    const encryptedContent = encryptContent(content, secretKey);
    const shares = sss.split(Buffer.from(secretKey, 'hex'), { shares: organizationIds.length, threshold });

    // Create the exam with organizations
    const exam = new Exam({
      examId,
      title,
      encryptedContent,
      threshold,
      sharesSubmitted: [],
      isDecrypted: false,
      duration,
      startTime,
      organizations: organizationIds, // Save assigned organizations
      status: 'created'
    });

    await exam.save();

    // Assign shares to organizations (store in their shares array)
    for (let i = 0; i < organizationIds.length; i++) {
      await Organization.findByIdAndUpdate(
        organizationIds[i],
        { $push: { shares: { examId: exam._id, share: shares[i].toString('hex') } } }
      );
    }

    res.status(201).json({
      message: '✅ Exam created successfully',
      examId: exam._id
    });

  } catch (error) {
    res.status(500).json({ status: 500, message: 'Internal server error', error });
  }
};



// Submit a share and decryption key
const submitShare = async (req, res) => {
  const { examId, organizationId, share } = req.body;

  try {
    if (!examId || !organizationId || !share) {
      return res.status(400).json({
        status: 400,
        message: 'Exam ID, organization ID, and share are required'
      });
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ status: 404, message: 'Exam not found' });
    }

    // Only allow assigned organizations to submit shares
    if (!exam.organizations.map(id => id.toString()).includes(organizationId.toString())) {
      return res.status(403).json({
        status: 403,
        message: 'Organization not assigned to this exam'
      });
    }

    // Convert organizationId to ObjectId for comparison and storage
    const orgObjectId = mongoose.Types.ObjectId(organizationId);

    // Check if organization already submitted a share for this exam
    const existingShare = exam.sharesSubmitted.find(
      s => s.organizationId.toString() === orgObjectId.toString()
    );
    
    if (existingShare) {
      return res.status(409).json({
        status: 409,
        message: 'Organization has already submitted a share for this exam'
      });
    }

    // Add the share to the exam using the ObjectId
    exam.sharesSubmitted.push({ 
      organizationId: orgObjectId, 
      share: share.trim() 
    });
    
    await exam.save();
    console.log('Shares Submitted:', exam.sharesSubmitted);

    // Check if the threshold is met
    if (exam.sharesSubmitted.length >= exam.threshold) {
      try {
        // Combine shares to reconstruct the secret key
        const shares = exam.sharesSubmitted.map(s => Buffer.from(s.share, 'hex'));
        console.log('Combining Shares:', shares);
        const secretKey = sss.combine(shares).toString('hex');
        console.log('Reconstructed Secret Key:', secretKey);

        // Verify key length (32 bytes = 64 hex characters for AES-256)
        if (secretKey.length !== 64) {
          console.warn(`Warning: Reconstructed key length is ${secretKey.length}, expected 64`);
        }

        // Decrypt the exam content
        const decryptedContent = decrypt(exam.encryptedContent, secretKey);
        console.log('Decrypted Content:', decryptedContent);

        // Update the exam as decrypted and store decrypted content
        exam.isDecrypted = true;
        exam.decryptedContent = decryptedContent;
        await exam.save();

        res.status(200).json({ 
          message: 'Threshold met! Exam decrypted successfully', 
          content: decryptedContent,
          examDecrypted: true,
          sharesSubmitted: exam.sharesSubmitted.length,
          threshold: exam.threshold
        });
      } catch (decryptError) {
        console.error('Error during decryption:', decryptError);
        res.status(500).json({
          status: 500,
          message: 'Error during decryption process',
          error: decryptError.message
        });
      }
    } else {
      res.status(200).json({ 
        message: 'Share submitted successfully', 
        remainingShares: exam.threshold - exam.sharesSubmitted.length,
        sharesSubmitted: exam.sharesSubmitted.length,
        threshold: exam.threshold,
        examDecrypted: false
      });
    }
  } catch (error) {
    console.error('Error during share submission:', error);
    res.status(500).json({ 
      status: 500, 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};

//TO share the questions with the answer given to the db with encryption and signed by their private key with their enrollment number


// Result calculator

//results getter

//upload the csv or excel file of roll numbers


const getExams = async (req, res) => {
  try {
    const exams = await Exam.find().sort({ createdAt: -1 });
    res.status(200).json(exams);
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ status: 500, message: 'Internal server error', error });
  }
};

// Get a specific exam by ID
const getExamById = async (req, res) => {
  try {
    const { id } = req.params;
    const exam = await Exam.findById(id);
    
    if (!exam) {
      return res.status(404).json({ 
        status: 404, 
        message: 'Exam not found' 
      });
    }
    
    res.status(200).json(exam);
  } catch (error) {
    console.error('Error fetching exam:', error);
    res.status(500).json({ status: 500, message: 'Internal server error', error });
  }
};

// Update an exam
const updateExam = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, duration, startTime, threshold, organizationIds } = req.body;
    
    const exam = await Exam.findById(id);
    if (!exam) {
      return res.status(404).json({ 
        status: 404, 
        message: 'Exam not found' 
      });
    }

    // Prepare update object
    const updateData = {};
    if (title) updateData.title = title;
    if (duration) updateData.duration = parseInt(duration, 10);
    if (startTime) updateData.startTime = new Date(startTime);
    if (threshold) updateData.threshold = parseInt(threshold, 10);

    // If organizationIds are being updated, we need to regenerate shares
    if (organizationIds && organizationIds.length > 0) {
      // Validate threshold against new organization count
      const newThreshold = threshold || exam.threshold;
      if (newThreshold > organizationIds.length) {
        return res.status(400).json({
          status: 400,
          message: `Threshold (${newThreshold}) cannot be greater than number of organizations (${organizationIds.length})`
        });
      }

      // Note: In a real implementation, you'd need to handle share redistribution
      // This is complex because it requires the original secret key
      // For now, we'll just update the threshold and warn about share redistribution
      console.warn('⚠️ Organization list updated - manual share redistribution may be required');
    }

    const updatedExam = await Exam.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: 'Exam updated successfully',
      exam: updatedExam
    });

  } catch (error) {
    console.error('Error updating exam:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        status: 400, 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    res.status(500).json({ status: 500, message: 'Internal server error', error });
  }
};

// Delete an exam
const deleteExam = async (req, res) => {
  try {
    const { id } = req.params;
    
    const exam = await Exam.findById(id);
    if (!exam) {
      return res.status(404).json({ 
        status: 404, 
        message: 'Exam not found' 
      });
    }

    // Optional: Clear shares from organizations
    // This depends on your business logic - you might want to keep shares
    // or clear them when an exam is deleted
    try {
      // Find organizations that might have shares for this exam
      // Note: This is a simplified approach - in production you'd want
      // a more robust way to track which organizations have shares for which exams
      await Organization.updateMany(
        { share: { $exists: true } },
        { $unset: { share: "" } }
      );
    } catch (shareError) {
      console.warn('Warning: Could not clear organization shares:', shareError);
      // Continue with exam deletion even if share clearing fails
    }

    await Exam.findByIdAndDelete(id);

    res.status(200).json({
      message: 'Exam deleted successfully',
      examId: exam.examId
    });

  } catch (error) {
    console.error('Error deleting exam:', error);
    res.status(500).json({ status: 500, message: 'Internal server error', error });
  }
};

// Get exam statistics
const getExamStats = async (req, res) => {
  try {
    const totalExams = await Exam.countDocuments();
    const activeExams = await Exam.countDocuments({ 
      startTime: { $lte: new Date() },
      $expr: { 
        $lt: [
          new Date(), 
          { $add: ["$startTime", { $multiply: ["$duration", 60000] }] }
        ] 
      }
    });
    const upcomingExams = await Exam.countDocuments({ 
      startTime: { $gt: new Date() } 
    });
    const decryptedExams = await Exam.countDocuments({ isDecrypted: true });

    res.status(200).json({
      totalExams,
      activeExams,
      upcomingExams,
      decryptedExams,
      encryptedExams: totalExams - decryptedExams
    });

  } catch (error) {
    console.error('Error fetching exam statistics:', error);
    res.status(500).json({ status: 500, message: 'Internal server error', error });
  }
};

// Toggle exam decryption status (for testing purposes)
const toggleExamDecryption = async (req, res) => {
  try {
    const { id } = req.params;
    
    const exam = await Exam.findById(id);
    if (!exam) {
      return res.status(404).json({ 
        status: 404, 
        message: 'Exam not found' 
      });
    }

    exam.isDecrypted = !exam.isDecrypted;
    await exam.save();

    res.status(200).json({
      message: `Exam ${exam.isDecrypted ? 'decrypted' : 'encrypted'} successfully`,
      exam: exam
    });

  } catch (error) {
    console.error('Error toggling exam decryption:', error);
    res.status(500).json({ status: 500, message: 'Internal server error', error });
  }
};

const startExam = async (req, res) => {
  const { examId } = req.body;
  try {
    const exam = await Exam.findByIdAndUpdate(
      examId,
      { status: 'started', startTime: new Date() },
      { new: true }
    );
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    res.status(200).json({ message: 'Exam started', exam });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

module.exports = {
  createExam,
  submitShare,
  getExams,
  getExamById,
  updateExam,
  deleteExam,
  getExamStats,
  toggleExamDecryption,
  decryptContent,
  decrypt,
  encryptContent,
  startExam,
};
