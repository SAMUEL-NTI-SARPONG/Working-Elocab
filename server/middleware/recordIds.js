module.exports = function recordIds(router) {
  for (const name of ["id", "bookingId", "driverId", "customerId"]) {
    router.param(name, (req, res, next, value) => {
      if (!/^[a-f0-9]{24}$/i.test(value))
        return res.status(400).json({ message: "Invalid record identifier." });
      next();
    });
  }
};
