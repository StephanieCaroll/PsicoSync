export const ENV = {
  // Configurações do Appwrite
  appwriteEndpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT as string,
  appwriteProjectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID as string,
  appwriteDatabaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string,
  
  // Coleções Base
  patientsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_PATIENTS_COLLECTION_ID as string,
  notesCollectionId: process.env.NEXT_PUBLIC_APPWRITE_NOTES_COLLECTION_ID as string,
  appointmentsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_APPOINTMENTS_COLLECTION_ID as string,

  // Novas Coleções (Módulos Psicológicos)
  salaEsperaCollectionId: process.env.NEXT_PUBLIC_APPWRITE_SALA_ESPERA_COLLECTION_ID as string,
  anamnesesCollectionId: process.env.NEXT_PUBLIC_APPWRITE_ANAMNESES_COLLECTION_ID as string,
  testesCollectionId: process.env.NEXT_PUBLIC_APPWRITE_TESTES_COLLECTION_ID as string,
  diarioCollectionId: process.env.NEXT_PUBLIC_APPWRITE_DIARIO_COLLECTION_ID as string,
  listaEsperaCollectionId: process.env.NEXT_PUBLIC_APPWRITE_LISTA_ESPERA_COLLECTION_ID as string,
  lembretesCollectionId: process.env.NEXT_PUBLIC_APPWRITE_LEMBRETES_COLLECTION_ID as string,
  assinaturasCollectionId: process.env.NEXT_PUBLIC_APPWRITE_ASSINATURAS_COLLECTION_ID as string,
  bibliotecaCollectionId: process.env.NEXT_PUBLIC_APPWRITE_BIBLIOTECA_COLLECTION_ID as string,
  recibosCollectionId: process.env.NEXT_PUBLIC_APPWRITE_RECIBOS_COLLECTION_ID as string,
  supervisaoCollectionId: process.env.NEXT_PUBLIC_APPWRITE_SUPERVISAO_COLLECTION_ID as string,
};