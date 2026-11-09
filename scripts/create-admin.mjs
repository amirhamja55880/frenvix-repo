// Run:  node scripts/create-admin.mjs   (creates the admin, or resets its password)
import fs from "fs";
import readline from "readline/promises";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const env = {};
for (const l of fs.readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/)) {
  const i = l.indexOf("=");
  if (i > 0 && !l.trim().startsWith("#")) env[l.slice(0, i).trim()] = l.slice(i + 1).trim();
}
if (!env.MONGODB_URI) throw new Error("MONGODB_URI missing in .env.local");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const email = (await rl.question("Admin email: ")).trim().toLowerCase();
const password = await rl.question("Admin password (at least 10 characters): ");
rl.close();
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Invalid email");
if (password.length < 10) throw new Error("Password must be at least 10 characters");

await mongoose.connect(env.MONGODB_URI);
await mongoose.connection.collection("admins").updateOne(
  { email },
  { $set: { passwordHash: await bcrypt.hash(password, 12), updatedAt: new Date() }, $setOnInsert: { email, createdAt: new Date() } },
  { upsert: true }
);
console.log("Done. You can now log in at /admin/login");
await mongoose.disconnect();
