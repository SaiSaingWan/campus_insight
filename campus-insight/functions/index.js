const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { FieldValue } = require("firebase-admin/firestore");
const express = require("express");
const cors = require("cors");

// Safely initialize Firebase Admin for both Local Dev and Render
let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // 1. Read JSON from Render Environment Variable
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (err) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT environment variable:", err.message);
  }
} else {
  // 2. Fallback to local file for local testing
  try {
    serviceAccount = require("./serviceAccountKey.json");
  } catch (err) {
    console.warn("serviceAccountKey.json not found locally.");
  }
}

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} else {
  // 3. Fallback for Firebase Emulator or default GCP credentials
  admin.initializeApp();
}

const db = admin.firestore();
const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

// API Key Middleware Verification
const authenticatePartner = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey || apiKey !== "ADVISING_PLATFORM_SECRET_KEY") {
    return res.status(401).json({ error: "Unauthorized access" });
  }
  next();
};

// Provider Endpoint
app.get("/api/v1/lecturers", authenticatePartner, async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: "Email parameter required" });
    }

    const snapshot = await db.collection("lecturers").where("email", "==", email).get();
    if (snapshot.empty) {
      return res.status(404).json({ error: "Lecturer not found" });
    }

    let lecturerData = {};
    snapshot.forEach(doc => { lecturerData = { id: doc.id, ...doc.data() }; });

    return res.status(200).json({ status: "success", data: lecturerData });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Webhook Receiver
app.post("/api/v1/webhooks/advising-event", async (req, res) => {
  try {
    const { eventId, eventType, lecturerEmail } = req.body;
    const signature = req.headers["x-signature"];

    if (!signature || signature !== "VERIFIED_SECRET_HASH") {
      return res.status(403).json({ error: "Invalid signature" });
    }

    const eventRef = db.collection("webhook_logs").doc(eventId);
    const eventDoc = await eventRef.get();

    if (eventDoc.exists) {
      return res.status(200).json({ message: "Event already processed (Idempotent)" });
    }

    await db.collection("advising_cache").doc(lecturerEmail).set({
      lastEvent: eventType,
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });

    await eventRef.set({
      eventId,
      eventType,
      lecturerEmail,
      receivedAt: FieldValue.serverTimestamp()
    });

    return res.status(200).json({ status: "Webhook received and logged successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Start standard Express server for Render hosting
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

exports.api = functions.https.onRequest(app);