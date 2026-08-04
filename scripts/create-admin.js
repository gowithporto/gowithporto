// One-off bootstrap: creates (or promotes) an ADMIN user directly in MongoDB.
// Usage: node --env-file=.env.local scripts/create-admin.js <email> <password>
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

async function main() {
  const [, , email, password] = process.argv;
  if (!email || !password) {
    console.error("Usage: node --env-file=.env.local scripts/create-admin.js <email> <password>");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const User =
    mongoose.models.User ||
    mongoose.model(
      "User",
      new mongoose.Schema(
        {
          name: String,
          email: { type: String, unique: true, required: true },
          password: { type: String, select: false },
          role: { type: String, enum: ["USER", "ADMIN", "STORE_OWNER"], default: "USER" },
          image: String,
          credits: { type: Number, default: 0 },
          freeUsed: { type: Boolean, default: false },
        },
        { timestamps: true }
      )
    );

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.findOneAndUpdate(
    { email },
    { email, password: hashedPassword, role: "ADMIN" },
    { upsert: true, new: true }
  );

  console.log(`Admin user ready: ${user.email}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
