const User = require("../models/User");
const { hashPassword } = require("./password");

const normalizeEmail = (value) => (value || "").trim().toLowerCase();

const ensureAdminUser = async () => {
  const email = normalizeEmail(process.env.DEFAULT_ADMIN_EMAIL);
  const password = process.env.DEFAULT_ADMIN_PASSWORD || "";
  const firstName = process.env.DEFAULT_ADMIN_FIRST_NAME || "Store";
  const lastName = process.env.DEFAULT_ADMIN_LAST_NAME || "Admin";

  if (!email || !password) {
    return;
  }

  const existingUser = await User.findOne({ email }).select("+password");

  if (!existingUser) {
    const hashedPassword = await hashPassword(password);

    await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: "admin",
      isVerified: true,
    });

    console.log(`Default admin user created for ${email}`);
    return;
  }

  let didUpdate = false;

  if (existingUser.role !== "admin") {
    existingUser.role = "admin";
    didUpdate = true;
  }

  if (didUpdate) {
    await existingUser.save();
    console.log(`Existing user promoted to admin for ${email}`);
  }
};

module.exports = ensureAdminUser;
