"use server";

import { ID } from "node-appwrite";
import {
  BUCKET_ID,
  DATABASE_ID,
  ENDPOINT,
  PATIENT_COLLECTION_ID,
  PROJECT_ID,
  databases,
  storage,
  users,
} from "../appwrite.config";
import { parseStringify } from "../utils";
import { InputFile } from "node-appwrite/file";

export const createUser = async (user: CreateUserParams) => {
  try {
    const newUser = await users.create(
      ID.unique(),
      user.email,
      undefined, // phone (skip if not using phone-based accounts)
      "StrongPassword123!", // ⚠️ Appwrite requires password
      user.name
    );

    return newUser; // ✅ return document
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error?.code === 409) {
      const documents = await users.list();
      const existingUser = documents.users.find((u) => u.email === user.email);
      return existingUser || null;
    }
    console.error("Error creating user:", error);
    return null;
  }
};

export const getUser = async (userId: string) => {
  try {
    const user = await users.get(userId);
    return parseStringify(user);
  } catch (error) {
    console.log(error);
  }
};

export const registerPatient = async ({
  identificationDocument,
  ...patient
}: RegisterUserParams) => {
  try {
    let file;
    if (identificationDocument) {
      const blobFile = identificationDocument?.get("blobFile") as Blob;
      const fileName = identificationDocument?.get("fileName") as string;

      const arrayBuffer = await blobFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const inputFile = InputFile.fromBuffer(buffer, fileName);

      file = await storage.createFile(BUCKET_ID!, ID.unique(), inputFile);
    }

    const newPatient = await databases.createDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      ID.unique(),
      {
        identificationDocumentId: file?.$id ?? null,
        identificationDocumentUrl: file?.$id
          ? `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file.$id}/view?project=${PROJECT_ID}`
          : null,
        ...patient,
        gender: patient.gender?.toLowerCase(),
      }
    );

    return parseStringify(newPatient);
  } catch (error) {
    console.error("An error occurred while creating a new patient:", error);
  }
};

export const getPatient = async (userId: string) => {
  try {
    const patients = await databases.listDocuments(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      [ /* filtering by userId works if you have a `userId` attribute in schema */ ]
    );

    return patients.documents.length > 0
      ? parseStringify(patients.documents[0])
      : null;
  } catch (error) {
    console.error("An error occurred while retrieving the patient details:", error);
  }
};
