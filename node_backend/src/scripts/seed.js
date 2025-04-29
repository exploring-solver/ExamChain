const mongoose = require('../../services/mongoose');
const { User } = require('../users/models/mongoose');
const { Organization } = require('../exam/models/Organization');
const { Student } = require('../exam/models/Student');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

async function seedDatabase() {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Organization.deleteMany({});
    await Student.deleteMany({});

    // Create Admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      username: 'admin',
      name: 'Admin',
      lastName: 'User',
      email: 'admin@examchain.com',
      role: 'ADMIN',
      password: adminPassword
    });

    // Create Organizations
    const organizations = await Organization.create([
      {
        id: uuidv4(),
        name: 'Organization 1',
        share: 'share1'
      },
      {
        id: uuidv4(),
        name: 'Organization 2',
        share: 'share2'
      },
      {
        id: uuidv4(),
        name: 'Organization 3',
        share: 'share3'
      }
    ]);

    // Create Organization Users
    for (const org of organizations) {
      const orgPassword = await bcrypt.hash('org123', 10);
      await User.create({
        username: org.name.toLowerCase().replace(/\s+/g, ''),
        name: org.name,
        lastName: 'Admin',
        email: `${org.name.toLowerCase().replace(/\s+/g, '')}@examchain.com`,
        role: 'ORGANIZATION',
        password: orgPassword
      });
    }

    // Create Students
    const studentPassword = await bcrypt.hash('student123', 10);
    const students = [];
    for (let i = 1; i <= 5; i++) {
      const username = `student${i}`;
      const user = await User.create({
        username,
        name: `Student ${i}`,
        lastName: 'User',
        email: `${username}@examchain.com`,
        role: 'STUDENT',
        password: studentPassword
      });

      students.push(await Student.create({
        username: user.username,
        enrollmentNumber: `EN${2023}${i.toString().padStart(3, '0')}`,
        name: `Student ${i}`,
        examId: new mongoose.Types.ObjectId(), // Fixed ObjectId creation
      }));
    }

    console.log('Database seeded successfully!');
    console.log('\nLogin Credentials:');
    console.log('Admin:', { username: 'admin', password: 'admin123' });
    console.log('Organizations:', { username: 'organization1', password: 'org123' });
    console.log('Students:', { username: 'student1', password: 'student123' });

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.connection.close();  // Fixed disconnect method
  }
}

seedDatabase();