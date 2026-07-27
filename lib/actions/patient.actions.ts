"use server";

import { Query } from "node-appwrite";
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
import { ID } from "node-appwrite";
import { createPatientSession } from "@/lib/auth/session";
import { emitEvent } from "@/lib/events/bus";
import { registerDomainEventHandlers } from "@/lib/events/handlers";
import { logger } from "@/lib/logger";
import { randomBytes } from "crypto";

registerDomainEventHandlers();

function generateTempPassword(): string {
  return `Cp!${randomBytes(12).toString("base64url")}`;
}

export const createUser = async (user: CreateUserParams) => {
  try {
    const newUser = await users.create(
      ID.unique(),
      user.email,
      undefined,
      generateTempPassword(),
      user.name
    );

    await createPatientSession({
      userId: newUser.$id,
      name: user.name,
      email: user.email,
    });

    return newUser;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error?.code === 409) {
      const documents = await users.list([Query.equal("email", [user.email])]);
      const existingUser = documents.users[0];
      if (existingUser) {
        await createPatientSession({
          userId: existingUser.$id,
          name: existingUser.name,
          email: existingUser.email,
        });
      }
      return existingUser || null;
    }
    logger.error("user.create.failed", { error: String(error) });
    return null;
  }
};

export const getUser = async (userId: string) => {
  try {
    const user = await users.get(userId);
    return parseStringify(user);
  } catch (error) {
    logger.error("user.get.failed", { userId, error: String(error) });
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

    await emitEvent("patient.registered", {
      userId: patient.userId,
      patientId: newPatient.$id,
      name: patient.name,
    });

    return parseStringify(newPatient);
  } catch (error) {
    logger.error("patient.register.failed", { error: String(error) });
  }
};

export const getPatient = async (userId: string) => {
  try {
    const patients = await databases.listDocuments(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      [Query.equal("userId", [userId]), Query.limit(1)]
    );

    return patients.documents.length > 0
      ? parseStringify(patients.documents[0])
      : null;
  } catch (error) {
    logger.error("patient.get.failed", { userId, error: String(error) });
  }
};

export const updatePatientProfile = async (
  patientId: string,
  patch: Record<string, unknown>
) => {
  try {
    const updated = await databases.updateDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      patientId,
      patch
    );
    return parseStringify(updated);
  } catch (error) {
    logger.error("patient.update.failed", { patientId, error: String(error) });
  }
};

export const searchPatients = async (query: string, limit = 20) => {
  try {
    const patients = await databases.listDocuments(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      [
        Query.or([
          Query.search("name", query),
          Query.search("email", query),
          Query.search("phone", query),
        ]),
        Query.limit(limit),
      ]
    );
    return parseStringify(patients.documents);
  } catch (error) {
    logger.error("patient.search.failed", { query, error: String(error) });
    return [];
  }
};
