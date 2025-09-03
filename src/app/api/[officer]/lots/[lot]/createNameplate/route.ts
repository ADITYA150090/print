// // src/app/api/nameplates/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { MongoClient, Db } from 'mongodb';

// // MongoDB connection
// const MONGODB_URI = process.env.MONGODB_URI;
// const DB_NAME = process.env.MONGODB_DB_NAME || 'nameplate_db';

// if (!MONGODB_URI) {
//   throw new Error('Please define the MONGODB_URI environment variable');
// }

// let cachedClient: MongoClient | null = null;
// let cachedDb: Db | null = null;

// async function connectToDatabase() {
//   if (cachedClient && cachedDb) {
//     return { client: cachedClient, db: cachedDb };
//   }

//   const client = new MongoClient(MONGODB_URI!);
//   await client.connect();
//   const db = client.db(DB_NAME);

//   cachedClient = client;
//   cachedDb = db;

//   return { client, db };
// }

// // Interface for the nameplate document
// interface NameplateDocument {
//   rmo: string;
//   officer: string;
//   lot: string;
//   officer_name: string;
//   designation: string;
//   email: string;
//   mobile_number: string;
//   image_url: string;
//   verified: boolean;
//   created_at: string;
// }

// export async function POST(request: NextRequest) {
//   try {
//     // Parse the request body
//     const body: NameplateDocument = await request.json();

//     // Validate required fields
//     const requiredFields = ['rmo', 'officer', 'lot', 'officer_name', 'designation', 'email', 'mobile_number', 'image_url'];
//  const missingFields = requiredFields.filter(field => !body[field as keyof NameplateDocument]);

    
//     if (missingFields.length > 0) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           error: `Missing required fields: ${missingFields.join(', ')}` 
//         },
//         { status: 400 }
//       );
//     }

//     // Connect to MongoDB
//     const { db } = await connectToDatabase();
//     const collection = db.collection('nameplates');

//     // Insert the document
//     const result = await collection.insertOne({
//       ...body,
//       created_at: new Date().toISOString(),
//       verified: false,
//     });

//     return NextResponse.json({
//       success: true,
//       message: 'Nameplate saved successfully',
//       id: result.insertedId,
//       data: body
//     });

//   } catch (error: any) {
//     console.error('❌ API Error:', error);
    
//     return NextResponse.json(
//       { 
//         success: false, 
//         error: error.message || 'Internal server error',
//         details: process.env.NODE_ENV === 'development' ? error.stack : undefined
//       },
//       { status: 500 }
//     );
//   }
// }

// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const limit = parseInt(searchParams.get('limit') || '50');
//     const offset = parseInt(searchParams.get('offset') || '0');
//     const rmo = searchParams.get('rmo');
//     const officer = searchParams.get('officer');
//     const verified = searchParams.get('verified');

//     // Connect to MongoDB
//     const { db } = await connectToDatabase();
//     const collection = db.collection('nameplates');

//     // Build query filters
//     const filters: any = {};
//     if (rmo) filters.rmo = rmo;
//     if (officer) filters.officer = officer;
//     if (verified !== null) filters.verified = verified === 'true';

//     // Get documents with pagination
//     const documents = await collection
//       .find(filters)
//       .sort({ created_at: -1 })
//       .skip(offset)
//       .limit(limit)
//       .toArray();

//     const total = await collection.countDocuments(filters);

//     return NextResponse.json({
//       success: true,
//       data: documents,
//       pagination: {
//         total,
//         limit,
//         offset,
//         hasMore: offset + limit < total
//       }
//     });

//   } catch (error: any) {
//     console.error('❌ API Error:', error);
    
//     return NextResponse.json(
//       { 
//         success: false, 
//         error: error.message || 'Internal server error' 
//       },
//       { status: 500 }
//     );
//   }
// }

// src/app/api/nameplates/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb"; // your dbConnect file
import UnverifiedNameplate from "@/models/unverifiedNameplate";

// POST → Save a new unverified nameplate
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    // Required fields
    const requiredFields = [
      "theme",
      "background",
      "houseName",
      "ownerName",
      "address",
      "rmo",
      "officer",
      "lot",
      "officer_name",
      "email",
    ];

    const missing = requiredFields.filter((f) => !body[f]);
    if (missing.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing fields: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    const newNameplate = await UnverifiedNameplate.create(body);

    return NextResponse.json({
      success: true,
      message: "✅ Unverified nameplate saved",
      data: newNameplate,
    });
  } catch (err: any) {
    console.error("❌ POST error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// GET → Fetch unverified nameplates
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);

    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const rmo = searchParams.get("rmo");
    const officer = searchParams.get("officer");
    const verified = searchParams.get("verified");

    const filters: any = {};
    if (rmo) filters.rmo = rmo;
    if (officer) filters.officer = officer;
    if (verified !== null) filters.verified = verified === "true";

    const [records, total] = await Promise.all([
      UnverifiedNameplate.find(filters)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit),
      UnverifiedNameplate.countDocuments(filters),
    ]);

    return NextResponse.json({
      success: true,
      count: total,
      data: records,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (err: any) {
    console.error("❌ GET error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
