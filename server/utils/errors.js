const fail = (status, message) => Object.assign(new Error(message), { status });
const sendError = (res, error) => {
  if (error.code === 11000) {
    const fields = error.keyPattern || error.keyValue || {};
    const message = fields.carNumber
      ? "This vehicle number is already registered. Check the number or contact ELOCAB if this is your vehicle."
      : fields.licenseNumber
        ? "This driving licence is already registered. Sign in to your existing driver account or contact ELOCAB."
        : fields.phoneNumber
          ? "This phone number is already registered. Sign in to your existing account."
          : "An account with those details already exists.";
    return res.status(409).json({ message });
  }
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({
      message:
        error.name === "CastError"
          ? "Invalid record identifier."
          : Object.values(error.errors)
              .map((e) => e.message)
              .join(" "),
    });
  }
  if (!error.status) console.error(error.name, error.message);
  return res.status(error.status || 500).json({
    message: error.status
      ? error.message
      : "Something went wrong. Please try again.",
  });
};
module.exports = { fail, sendError };
