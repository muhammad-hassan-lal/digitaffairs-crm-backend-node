require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, Role, UserRole } = require('../models');

(async () => {
  try {
    await sequelize.authenticate();

    const adminRole = await Role.findOne({ where: { name: 'admin' } });
    if (!adminRole) throw new Error('Admin role not found. Import sql/schema.sql first.');

    const [user] = await User.findOrCreate({
      where: { email: 'admin@example.com' },
      defaults: {
        username: 'admin',
        email: 'admin@example.com',
        password: await bcrypt.hash('Admin@12345', 10),
        first_name: 'Admin',
        last_name: 'User',
      },
    });

    await UserRole.findOrCreate({ where: { user_id: user.id, role_id: adminRole.id } });

    console.log('Admin ready: admin@example.com / Admin@12345');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
