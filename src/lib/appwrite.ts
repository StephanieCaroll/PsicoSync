import { Client, Account, Databases } from 'appwrite';

const client = new Client();

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

if (endpoint && projectId) {
  client
    .setEndpoint(endpoint)
    .setProject(projectId);
} else {
  console.warn("Variáveis do Appwrite não encontradas. Verifique seu arquivo .env.local");
}

export const account = new Account(client);
export const databases = new Databases(client);

export default client;