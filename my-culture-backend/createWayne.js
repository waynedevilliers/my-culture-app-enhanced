import { User, sequelize } from "./db.js";

const createWayne = async () => {
  try {
    console.log('Creating Wayne user...');
    
    // Create Wayne user
    const wayneUser = await User.create({
      firstName: "Wayne",
      lastName: "Black",
      email: "wayne@black.com",
      password: "password",
      phoneNumber: "2345678901",
      role: "admin",
      newsletter: false,
    });

    console.log('✅ Wayne user created successfully!');
    console.log('📧 Email: wayne@black.com');
    console.log('🔑 Password: password');
    console.log('👤 Role: admin');
    
  } catch (error) {
    console.error('❌ Error creating Wayne user:', error.message);
    
    // If user already exists, just show login info
    if (error.message.includes('email must be unique')) {
      console.log('👤 Wayne user already exists!');
      console.log('📧 Email: wayne@black.com');
      console.log('🔑 Password: password');
    }
  } finally {
    await sequelize.close();
    console.log('Database connection closed.');
  }
};

createWayne();