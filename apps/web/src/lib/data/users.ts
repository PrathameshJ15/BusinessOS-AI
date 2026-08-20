import { prisma } from '../prisma';

export interface UserSettingsInput {
  name?: string;
  email?: string;
  image?: string;
  avatarUrl?: string;
  phone?: string;
}

export async function getUserById(userId: string) {
  try {
    return await prisma.user.findUnique({
      where: { id: userId },
    });
  } catch (error) {
    console.error('[getUserById] Error:', error);
    return null;
  }
}

export async function updateUser(userId: string, input: UserSettingsInput) {
  const dataToUpdate: any = {};

  if (input.name !== undefined && input.name.trim() !== '') {
    dataToUpdate.name = input.name.trim();
  }

  if (input.email !== undefined && input.email.trim() !== '') {
    dataToUpdate.email = input.email.trim();
  }

  if (input.image !== undefined) {
    dataToUpdate.image = input.image.trim() || null;
  }

  if (input.avatarUrl !== undefined) {
    dataToUpdate.avatarUrl = input.avatarUrl.trim() || null;
  }

  if (input.phone !== undefined) {
    dataToUpdate.phone = input.phone.trim() || null;
  }

  return await prisma.user.update({
    where: { id: userId },
    data: dataToUpdate,
  });
}
