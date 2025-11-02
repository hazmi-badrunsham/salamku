// src/appwrite.js
import { Client, Databases } from "appwrite";

const client = new Client();

client
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT.trim())
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const databases = new Databases(client);

export const DATABASE_ID = "6906fcb7002a522e7c96";
export const COLLECTION_ID = "messages_";