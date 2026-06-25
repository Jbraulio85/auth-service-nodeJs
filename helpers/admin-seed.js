import {
  User,
  UserProfile,
  UserEmail,
  UserPasswordReset,
} from '../src/users/user.model.js';
import { Role, UserRole } from '../src/auth/role.model.js';
import { ADMIN_ROLE } from './role-constants.js';
import { hashPassword } from '../utils/password-utils.js';
import { generateUserId } from './uuid-generator.js';
import { sequelize } from '../configs/db.js';

const DEFAULT_ADMIN = {
  name: 'Admin',
  surname: 'User',
  username: 'admin',
  email: 'admin@ksports.local',
  password: 'Admin1234!',
  phone: '00000000',
};

export const seedAdminUser = async () => {
  const userCount = await User.count();
  if (userCount > 0) {
    return;
  }

  const adminRole = await Role.findOne({ where: { Name: ADMIN_ROLE } });
  if (!adminRole) {
    console.warn('ADMIN_ROLE not found. Skipping default admin seed.');
    return;
  }

  const transaction = await sequelize.transaction();

  try {
    const userId = generateUserId();
    const passwordHash = await hashPassword(DEFAULT_ADMIN.password);

    await User.create(
      {
        Id: userId,
        Name: DEFAULT_ADMIN.name,
        Surname: DEFAULT_ADMIN.surname,
        Username: DEFAULT_ADMIN.username,
        Email: DEFAULT_ADMIN.email,
        Password: passwordHash,
        Status: true,
      },
      { transaction }
    );

    await UserProfile.create(
      {
        Id: generateUserId(),
        UserId: userId,
        ProfilePicture: '',
        Phone: DEFAULT_ADMIN.phone,
      },
      { transaction }
    );

    await UserEmail.create(
      {
        Id: generateUserId(),
        UserId: userId,
        EmailVerified: true,
      },
      { transaction }
    );

    await UserPasswordReset.create(
      {
        Id: generateUserId(),
        UserId: userId,
      },
      { transaction }
    );

    await UserRole.create(
      {
        Id: generateUserId(),
        UserId: userId,
        RoleId: adminRole.Id,
      },
      { transaction }
    );

    await transaction.commit();
    console.log('Default admin user seeded successfully');
  } catch (error) {
    await transaction.rollback();
    console.error('Error seeding default admin user:', error.message);
    throw error;
  }
};
