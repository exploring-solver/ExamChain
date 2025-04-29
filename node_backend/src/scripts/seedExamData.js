const mongoose = require('../../services/mongoose');
const { Exam } = require('../exam/models/Exam');
const { Question } = require('../exam/models/Question');
const { Organization } = require('../exam/models/Organization');
const { encrypt } = require('../exam/utils/questionEncrypt');
const { v4: uuidv4 } = require('uuid');

async function seedExamData() {
  try {
    // Clear existing data
    await Exam.deleteMany({});
    await Question.deleteMany({});

    // Get existing organizations
    const organizations = await Organization.find({});
    if (organizations.length === 0) {
      throw new Error('No organizations found. Please run the main seed script first.');
    }

    // Create sample exams
    const exams = await Exam.create([
      {
        examId: uuidv4(),
        title: 'Mathematics Final Exam 2025',
        encryptedContent: encrypt('Mathematics Final Examination Content', 'yourSecretKey'),
        threshold: 2,
        duration: 180, // 3 hours in minutes
        startTime: new Date('2025-05-01T09:00:00Z'),
        sharesSubmitted: [],
        questions: []
      },
      {
        examId: uuidv4(),
        title: 'Computer Science Fundamentals',
        encryptedContent: encrypt('Computer Science Examination Content', 'yourSecretKey'),
        threshold: 2,
        duration: 120, // 2 hours in minutes
        startTime: new Date('2025-05-02T09:00:00Z'),
        sharesSubmitted: [],
        questions: []
      }
    ]);

    // Create questions for each exam
    const mathQuestions = [
      {
        content: encrypt('What is the derivative of x²?', 'yourSecretKey'),
        options: {
          a: encrypt('2x', 'yourSecretKey'),
          b: encrypt('x', 'yourSecretKey'),
          c: encrypt('x²', 'yourSecretKey'),
          d: encrypt('2', 'yourSecretKey')
        },
        answer: encrypt('a', 'yourSecretKey'),
        examId: exams[0]._id,
        organizationId: organizations[0]._id,
        encrypted: true
      },
      {
        content: encrypt('Solve for x: 2x + 5 = 15', 'yourSecretKey'),
        options: {
          a: encrypt('5', 'yourSecretKey'),
          b: encrypt('10', 'yourSecretKey'),
          c: encrypt('7', 'yourSecretKey'),
          d: encrypt('8', 'yourSecretKey')
        },
        answer: encrypt('a', 'yourSecretKey'),
        examId: exams[0]._id,
        organizationId: organizations[0]._id,
        encrypted: true
      }
    ];

    const csQuestions = [
      {
        content: encrypt('What is Big O notation primarily used for?', 'yourSecretKey'),
        options: {
          a: encrypt('Memory allocation', 'yourSecretKey'),
          b: encrypt('Algorithm complexity analysis', 'yourSecretKey'),
          c: encrypt('Database indexing', 'yourSecretKey'),
          d: encrypt('Network protocols', 'yourSecretKey')
        },
        answer: encrypt('b', 'yourSecretKey'),
        examId: exams[1]._id,
        organizationId: organizations[1]._id,
        encrypted: true
      },
      {
        content: encrypt('What is a primary key in DBMS?', 'yourSecretKey'),
        options: {
          a: encrypt('Foreign key reference', 'yourSecretKey'),
          b: encrypt('Unique identifier', 'yourSecretKey'),
          c: encrypt('Index column', 'yourSecretKey'),
          d: encrypt('Null constraint', 'yourSecretKey')
        },
        answer: encrypt('b', 'yourSecretKey'),
        examId: exams[1]._id,
        organizationId: organizations[1]._id,
        encrypted: true
      }
    ];

    await Question.create([...mathQuestions, ...csQuestions]);

    // Update exams with question references
    const allQuestions = await Question.find({});
    for (const exam of exams) {
      const examQuestions = allQuestions.filter(q => q.examId.toString() === exam._id.toString());
      exam.questions = examQuestions.map(q => ({
        questionId: q._id.toString(),
        correctAnswer: q.answer
      }));
      await exam.save();
    }

    console.log('Exam data seeded successfully!');
    console.log('\nCreated Exams:');
    console.log(exams.map(exam => ({
      title: exam.title,
      examId: exam.examId,
      questionCount: exam.questions.length
    })));

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

seedExamData();