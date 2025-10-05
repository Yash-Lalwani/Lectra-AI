const mongoose = require('mongoose');
const User = require('./models/User');

const createDemoAccounts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lectra');
    console.log('Connected to MongoDB');

    // Check if demo accounts already exist
    const teacher = await User.findOne({ email: 'teacher@demo.com' });
    const student = await User.findOne({ email: 'student@demo.com' });

    if (!teacher) {
      const newTeacher = new User({
        email: 'teacher@demo.com',
        password: 'password123',
        firstName: 'Demo',
        lastName: 'Teacher',
        role: 'teacher',
        isActive: true
      });
      await newTeacher.save();
      console.log('✅ Demo teacher account created: teacher@demo.com / password123');
    } else {
      console.log('ℹ️  Demo teacher already exists');
    }

    if (!student) {
      const newStudent = new User({
        email: 'student@demo.com',
        password: 'password123',
        firstName: 'Demo',
        lastName: 'Student',
        role: 'student',
        isActive: true
      });
      await newStudent.save();
      console.log('✅ Demo student account created: student@demo.com / password123');
    } else {
      console.log('ℹ️  Demo student already exists');
    }

    console.log('\n🎉 Demo accounts ready!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating demo accounts:', error);
    process.exit(1);
  }
};

createDemoAccounts();
