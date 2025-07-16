import { User, sequelize } from "./db.js";

const quickSeed = async () => {
  try {
    console.log('Creating admin user...');
    
    // Create admin user
    const adminUser = await User.create({
      firstName: "Admin",
      lastName: "User",
      email: "admin@admin.com",
      password: "password",
      phoneNumber: "1234567890",
      role: "admin",
      newsletter: true,
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@admin.com');
    console.log('🔑 Password: password');
    console.log('👤 Role: admin');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    
    // If user already exists, just show login info
    if (error.message.includes('email must be unique')) {
      console.log('👤 Admin user already exists!');
      console.log('📧 Email: admin@admin.com');
      console.log('🔑 Password: password');
    }
  } finally {
    await sequelize.close();
    console.log('Database connection closed.');
  }
};

quickSeed();