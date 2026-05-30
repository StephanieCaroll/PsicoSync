import { ID } from 'appwrite';
import { account, databases } from './appwrite';

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COL_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!;

export async function registerUser(
  name: string,
  email: string,
  password: string,
  crp: string,
  phone: string,
  specialty: string
) {
 
  const user = await account.create(ID.unique(), email, password, name);

  await account.createEmailPasswordSession(email, password);

  await databases.createDocument(
    DB_ID,
    COL_ID,
    ID.unique(), 
    {
      userId: user.$id,
      name: name,
      email: email,
      crp: crp,
      phone: phone,
      specialty: specialty,
    }
  );

  return user;
}

export async function loginUser(email: string, password: string) {
  
  try {
    await account.deleteSession('current');
  } catch (err) {
    
  }

  return await account.createEmailPasswordSession(email, password);
}

export async function logoutUser() {
  try {
    return await account.deleteSession('current');
  } catch (err) {
    return null;
  }
}

export async function getCurrentUser() {
  try {
    return await account.get();
  } catch (err) {
    return null;
  }
}