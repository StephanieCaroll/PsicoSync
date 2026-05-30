import { account } from './appwrite';
import { ID } from 'appwrite';

export async function loginUser(email: string, password: string) {
  return await account.createEmailPasswordSession(email, password);
}

export async function registerUser(
  name: string,
  email: string,
  password: string
) {
  await account.create(ID.unique(), email, password, name);
  return await account.createEmailPasswordSession(email, password);
}

export async function logoutUser() {
  return await account.deleteSession('current');
}

export async function getCurrentUser() {
  try {
    return await account.get();
  } catch {
    return null;
  }
}