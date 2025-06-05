const Bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../../../config');
const schemes = require('../models/mongoose');
const { Student } = require('../../exam/models/Student');
const { Organization } = require('../../exam/models/Organization');

const generateKeyPair = () => {
  return crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });
};

const encryptPrivateKey = (privateKey, secret) => {
  const cipher = crypto.createCipheriv('aes-256-cbc', secret);
  let encrypted = cipher.update(privateKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

const signUp = async (res, parameters) => {
  const {
    password,
    passwordConfirmation,
    email,
    username,
    name,
    lastName,
    role,
    enrollmentNumber, // specific to student
    examId, // specific to student
    id, // specific to organization
    share, // specific to organization
  } = parameters;

  if (password === passwordConfirmation) {
    const newUser = schemes.User({
      password: Bcrypt.hashSync(password, 10),
      email,
      username,
      name,
      lastName,
      role,
    });

    try {
      const savedUser = await newUser.save();

      if (role === 'STUDENT') {
        // const { publicKey, privateKey } = generateKeyPair();
        // const encryptedPrivateKey = encryptPrivateKey(privateKey, config.PRIVATE_KEY_SECRET);

        const newStudent = new Student({
          enrollmentNumber,
          name,
          examId
        });
        await newStudent.save();
      } else if (role === 'ORGANIZATION') {
        const newOrganization = new Organization({
          id,
          name,
        });
        await newOrganization.save();
      }

      const token = jwt.sign(
        { email, id: savedUser.id, username, role: savedUser.role },
        config.API_KEY_JWT,
        { expiresIn: config.TOKEN_EXPIRES_IN }
      );

      return res.status(201).json({ token });
    } catch (error) {
      return res.status(400).json({
        status: 400,
        message: error.message,
      });
    }
  }

  return res.status(400).json({
    status: 400,
    message: 'Passwords are different, try again!!!',
  });
};

const userDetails = async (res, parameters) => {
  const { userId } = parameters;

  try {
    // Fetch user details based on userId
    const user = await schemes.User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: 'User not found',
      });
    }

    // Return user details
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: 'Internal server error',
    });
  }
};

const login = async (res, parameters) => {
  const { emailOrUsername, password } = parameters;
  console.log('🔐 Login attempt for:', emailOrUsername);

  try {
    // Step 1: Check if user exists
    const user = await schemes.User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
    });

    if (!user) {
      console.warn('❌ User not found for:', emailOrUsername);
      return res.status(400).json({
        status: 400,
        message: 'User not found',
      });
    }

    console.log('✅ User found:', {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    });

    // Step 2: Verify password
    const passwordMatch = await Bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.warn('❌ Invalid password attempt for user:', user.username);
      return res.status(400).json({
        status: 400,
        message: 'Invalid password',
      });
    }

    console.log('🔓 Password verified for:', user.username);

    // Step 3: Generate JWT token
    const token = jwt.sign(
      { email: user.email, id: user.id, username: user.username, role: user.role },
      config.API_KEY_JWT,
      { expiresIn: config.TOKEN_EXPIRES_IN }
    );

    console.log('🪙 JWT token generated');

    // Step 4: Sanitize user data
    const { password: hashedPassword, ...sanitizedUser } = user.toObject();
    console.log('🧹 Sanitized user data ready to send:', sanitizedUser);

    // Step 5: Fetch additional details based on user role
    let additionalDetails = {};

    if (user.role === 'STUDENT') {
      console.log('👨‍🎓 Fetching student details...');
      
      // If you have a Student model, fetch student-specific data
      // const studentDetails = await schemes.Student.findOne({ userId: user._id });
      // if (studentDetails) {
      //   additionalDetails.studentDetails = studentDetails;
      // }
      
      // For now, we'll include basic student info
      additionalDetails.studentDetails = {
        enrollmentStatus: 'active', // You can fetch this from a Student model
        // Add other student-specific fields as needed
      };
      
      console.log('📚 Student details prepared');
    }

    if (user.role === 'ORGANIZATION') {
      console.log('🏢 Fetching organization details...');
      
      // Fetch organization details - assuming the user's email/username matches organization
      const organizationDetails = await Organization.findOne({
        $or: [
          { name: user.username },
          { name: user.name },
          // You might need to adjust this based on how organizations are linked to users
        ]
      });

      if (organizationDetails) {
        const { share, ...orgDetails } = organizationDetails.toObject();
        additionalDetails.organizationDetails = orgDetails;
        console.log('🏢 Organization details found:', orgDetails.name);
      } else {
        console.log('⚠️ No organization details found for user');
        additionalDetails.organizationDetails = null;
      }
    }

    // Step 6: Prepare response object
    const responseData = {
      token,
      user: sanitizedUser,
      ...additionalDetails
    };

    console.log('📦 Complete response prepared with additional details');

    // Final Response
    return res.status(200).json(responseData);

  } catch (error) {
    console.error('💥 Internal server error during login:', error);
    return res.status(500).json({
      status: 500,
      message: 'Internal server error',
    });
  }
};

const getStudentDetails = async (username) => {
  try {
    // Assuming you have a relationship between User and Student models
    const student = await Student.findOne({ username }).populate('examId');

    if (!student) {
      throw new Error('Student not found');
    }

    return student;
  } catch (error) {
    throw new Error(`Error fetching student details: ${error.message}`);
  }
};


module.exports = {
  signUp,
  login,
  userDetails,
  getStudentDetails
};
