import {
  findUserById,
  findUserByEmailOrUsername,
  updateUserProfilePicture,
} from './user-db.js';
import {
  uploadImageFromMulterFile,
  deleteImage,
} from './cloudinary-service.js';
import { buildUserResponse } from '../utils/user-helpers.js';

export const getUserProfileHelper = async (userId) => {
  const user = await findUserById(userId);
  if (!user) {
    const err = new Error('Usuario no encontrado');
    err.status = 404;
    throw err;
  }
  return buildUserResponse(user);
};

export const getUserProfileByUsernameHelper = async (username) => {
  const user = await findUserByEmailOrUsername(username.trim());
  if (!user) {
    const err = new Error('Usuario no encontrado');
    err.status = 404;
    throw err;
  }
  return buildUserResponse(user);
};

export const updateProfilePictureHelper = async (userId, file) => {
  const user = await findUserById(userId);
  if (!user) {
    const err = new Error('Usuario no encontrado');
    err.status = 404;
    throw err;
  }

  const profilePictureToStore = await uploadImageFromMulterFile(file);

  const previousPicture = user.UserProfile?.ProfilePicture ?? '';
  if (previousPicture && !String(previousPicture).includes('avatarDefault')) {
    await deleteImage(previousPicture);
  }

  await updateUserProfilePicture(userId, profilePictureToStore);
  return getUserProfileHelper(userId);
};
