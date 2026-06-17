import crypto from 'crypto';
import path from 'path';
import {
  findUserById,
  findUserByEmailOrUsername,
  updateUserProfilePicture,
} from './user-db.js';
import { uploadImage, deleteImage } from './cloudinary-service.js';
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

export const updateProfilePictureHelper = async (userId, filePath) => {
  const user = await findUserById(userId);
  if (!user) {
    const err = new Error('Usuario no encontrado');
    err.status = 404;
    throw err;
  }

  const ext = path.extname(filePath) || '.jpg';
  const randomHex = crypto.randomBytes(6).toString('hex');
  const cloudinaryFileName = `profile-${randomHex}${ext}`;
  const profilePictureToStore = await uploadImage(filePath, cloudinaryFileName);

  const previousPicture = user.UserProfile?.ProfilePicture ?? '';
  if (previousPicture && !String(previousPicture).includes('avatarDefault')) {
    await deleteImage(previousPicture);
  }

  await updateUserProfilePicture(userId, profilePictureToStore);
  return getUserProfileHelper(userId);
};
