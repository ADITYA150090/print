import mongoose from "mongoose";

let isConnected = false; // Track connection state

export default async function dbConnect() {
  if (isConnected) return;

  if (!process.env.MONGODB_URI) {
    throw new Error("❌ MONGODB_URI is not defined in .env");
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "yourDatabaseName", // <-- change this to your DB name
    });

    isConnected = !!db.connections[0].readyState;
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    throw err;
  }
}
