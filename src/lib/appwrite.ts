
import { Client, Account, Databases } from 'appwrite';

const client = new Client();

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

if (endpoint && projectId) {
  client.setEndpoint(endpoint).setProject(projectId);
} else {
  console.warn("Variáveis do Appwrite não encontradas. Verifique o arquivo .env ou as configurações da Vercel.");
}

export const account = new Account(client);
export const databases = new Databases(client);

export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
export const PATIENTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_PATIENTS_COLLECTION_ID || '';

export default client;