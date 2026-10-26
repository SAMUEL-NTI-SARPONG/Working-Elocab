const User = require("../models/User");
const Customer = require("../models/Customer");
const Driver = require("../models/Driver");
const { fail } = require("./errors");

const normalizePhone = (value) => {
  if (typeof value !== "string") return "";
  let phone = value.replace(/[\s()-]/g, "");
  if (phone.startsWith("+233")) phone = `0${phone.slice(4)}`;
  if (phone.startsWith("233") && phone.length === 12)
    phone = `0${phone.slice(3)}`;
  return phone;
};
const requirePhone = (value) => {
  const phone = normalizePhone(value);
  if (!/^\+?\d{10,15}$/.test(phone))
    throw fail(
      400,
      "Enter a valid phone number, including the country code if outside Ghana.",
    );
  return phone;
};
const createAccount = async (data, role) => {
  if (!["customer", "driver"].includes(role))
    throw fail(400, "Choose a customer or driver account.");
  const phoneNumber = requirePhone(data.phoneNumber);
  if (typeof data.name !== "string" || data.name.trim().length < 2)
    throw fail(400, "Enter your full name.");
  if (
    typeof data.password !== "string" ||
    data.password.length < 8 ||
    data.password.length > 72
  )
    throw fail(400, "Use a password with 8 to 72 characters.");
  if (await User.exists({ phoneNumber }))
    throw fail(
      409,
      role === "driver"
        ? "This phone number is already registered. Sign in to your existing account, or use a different phone number for a separate driver account."
        : "This phone number is already registered. Sign in to your existing account.",
    );
  // Validate the entire profile before persisting either side of the account.
  const user = new User({ phoneNumber, password: data.password, role });
  const profile =
    role === "customer"
      ? new Customer({
          userId: user._id,
          name: data.name.trim(),
          phoneNumber,
          city: data.city || "Kumasi",
          digitalAddress: data.digitalAddress || "N/A",
        })
      : new Driver({
          userId: user._id,
          name: data.name.trim(),
          baseLocation: data.baseLocation,
          carType: data.carType,
          carNumber: data.carNumber,
          licenseNumber: data.licenseNumber,
          numberOfSeats: data.seats ?? data.numberOfSeats,
          contactNumber: data.contactNumber
            ? requirePhone(data.contactNumber)
            : phoneNumber,
          isAvailable: false,
        });
  await profile.validate();
  await user.save(); // User's save hook is the single password-hashing boundary.
  try {
    await profile.save();
  } catch (error) {
    await User.findByIdAndDelete(user._id);
    throw error;
  }
  return { user, profile };
};
module.exports = { createAccount, normalizePhone, requirePhone };
