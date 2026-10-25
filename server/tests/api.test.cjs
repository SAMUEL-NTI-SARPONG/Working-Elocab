const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const { randomBytes } = require("node:crypto");
const path = require("node:path");
const mongoose = require("mongoose");
const { io } = require("../../client/node_modules/socket.io-client");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

test(
  "role access, accounts, booking lifecycle, notifications, archives, and sockets",
  { skip: !process.env.MONGODB_URI, timeout: 180000 },
  async (t) => {
    const dbName = `elocab_test_${randomBytes(6).toString("hex")}`;
    const uri = new URL(process.env.MONGODB_URI);
    uri.pathname = `/${dbName}`;
    const port = 5111;
    const password = "EloTest_2026!";
    const adminEmail = "test-admin@elocab.test";
    const child = spawn(process.execPath, ["server.js"], {
      cwd: path.join(__dirname, ".."),
      env: {
        ...process.env,
        VERCEL: "",
        NODE_ENV: "test",
        PORT: String(port),
        MONGODB_URI: uri.href,
        JWT_SECRET: randomBytes(32).toString("hex"),
        ADMIN_EMAIL: adminEmail,
        ADMIN_PASSWORD: password,
        ENABLE_ARCHIVE_SCHEDULER: "false",
        AUTH_RATE_LIMIT_MAX: "200",
        API_RATE_LIMIT_MAX: "2000",
      },
      stdio: "ignore",
    });
    t.after(async () => {
      child.kill();
      if (mongoose.connection.readyState) {
        assert.match(mongoose.connection.name, /^elocab_test_[a-f0-9]{12}$/);
        assert.equal(mongoose.connection.name, dbName);
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
      }
    });
    const request = async (url, method = "GET", data, token) => {
      const response = await fetch(`http://127.0.0.1:${port}${url}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
      });
      return { status: response.status, body: await response.json() };
    };
    let ready = false;
    for (let i = 0; i < 60; i++) {
      try {
        const r = await request("/api/health");
        if (r.body.dbConnected) {
          ready = true;
          break;
        }
      } catch {}
      await new Promise((r) => setTimeout(r, 500));
    }
    assert.ok(ready, "Test API must connect to the isolated database.");
    await mongoose.connect(uri.href);
    const User = require("../models/User");
    const Booking = require("../models/Booking");
    const Statistics = require("../models/Statistics");
    const customerData = {
      name: "Test Customer",
      phoneNumber: "0200000101",
      password,
      role: "customer",
      city: "Kumasi",
    };
    let customer, other, admin, driver, driverProfile, booking;
    await t.test(
      "registration rejects privilege escalation and invalid profiles",
      async () => {
        assert.equal(
          (
            await request("/api/auth/register", "POST", {
              ...customerData,
              role: "admin",
            })
          ).status,
          400,
        );
        assert.equal(
          (
            await request("/api/auth/register", "POST", {
              ...customerData,
              role: "driver",
            })
          ).status,
          400,
        );
        assert.equal(
          await User.countDocuments({ phoneNumber: customerData.phoneNumber }),
          0,
        );
        const r = await request("/api/auth/register", "POST", customerData);
        assert.equal(r.status, 201);
        customer = r.body;
        assert.equal(
          (await request("/api/auth/register", "POST", customerData)).status,
          409,
        );
        other = (
          await request("/api/auth/register", "POST", {
            ...customerData,
            name: "Another Customer",
            phoneNumber: "0200000102",
          })
        ).body;
        assert.equal(
          (
            await request("/api/auth/login", "POST", {
              phoneNumber: "+233200000101",
              password,
            })
          ).status,
          200,
        );
      },
    );
    await t.test(
      "admin bootstrap needs the right password; admin-created passwords work",
      async () => {
        assert.equal(
          (
            await request("/api/auth/admin/login", "POST", {
              email: adminEmail,
              password: "incorrect",
            })
          ).status,
          401,
        );
        assert.equal(await User.countDocuments({ role: "admin" }), 0);
        const r = await request("/api/auth/admin/login", "POST", {
          email: adminEmail,
          password,
        });
        assert.equal(r.status, 200);
        admin = r.body;
        const created = await request(
          "/api/admin/drivers",
          "POST",
          {
            name: "Test Driver",
            phoneNumber: "0200000103",
            password,
            baseLocation: "Kumasi",
            carType: "Toyota Vitz",
            carNumber: "TEST-100",
            licenseNumber: "TEST-L100",
            seats: 4,
          },
          admin.token,
        );
        assert.equal(created.status, 201);
        driverProfile = created.body.driver;
        const login = await request("/api/auth/login", "POST", {
          phoneNumber: "0200000103",
          password,
        });
        assert.equal(login.status, 200);
        driver = login.body;
        const createdCustomer = await request(
          "/api/admin/customers",
          "POST",
          { ...customerData, phoneNumber: "0200000104" },
          admin.token,
        );
        assert.equal(createdCustomer.status, 201);
        assert.equal(
          (
            await request("/api/auth/login", "POST", {
              phoneNumber: "0200000104",
              password,
            })
          ).status,
          200,
        );
      },
    );
    await t.test(
      "profile phone edits update the login identifier; role boundaries hold",
      async () => {
        assert.equal(
          (
            await request(
              "/api/customers/profile",
              "PUT",
              { phoneNumber: "0200000105" },
              customer.token,
            )
          ).status,
          200,
        );
        assert.equal(
          (
            await request("/api/auth/login", "POST", {
              phoneNumber: "0200000105",
              password,
            })
          ).status,
          200,
        );
        assert.equal(
          (
            await request("/api/auth/login", "POST", {
              phoneNumber: "0200000101",
              password,
            })
          ).status,
          401,
        );
        assert.equal(
          (await request("/api/bookings", "GET", undefined, customer.token))
            .status,
          403,
        );
        assert.equal(
          (
            await request(
              "/api/admin/drivers",
              "GET",
              undefined,
              customer.token,
            )
          ).status,
          403,
        );
        assert.equal((await request("/api/customers/profile")).status, 401);
        assert.equal(
          (
            await request(
              "/api/customers/bookings/not-an-id",
              "GET",
              undefined,
              customer.token,
            )
          ).status,
          400,
        );
      },
    );
    await t.test(
      "inactive drivers cannot sign in or reuse an old token",
      async () => {
        assert.equal(
          (
            await request(
              `/api/admin/drivers/${driverProfile._id}/toggle-status`,
              "PUT",
              {},
              admin.token,
            )
          ).status,
          200,
        );
        assert.equal(
          (
            await request("/api/auth/login", "POST", {
              phoneNumber: "0200000103",
              password,
            })
          ).status,
          403,
        );
        assert.equal(
          (
            await request(
              "/api/drivers/profile",
              "GET",
              undefined,
              driver.token,
            )
          ).status,
          401,
        );
        await request(
          `/api/admin/drivers/${driverProfile._id}/toggle-status`,
          "PUT",
          {},
          admin.token,
        );
      },
    );
    await t.test(
      "booking validation, ownership, assignment, and monotonic statuses",
      async () => {
        const data = {
          serviceType: "Dropping",
          dateTime: new Date(Date.now() + 86400000).toISOString(),
          pickupPoint: "KNUST",
          destination: "Kejetia",
          numberOfPeople: 2,
        };
        assert.equal(
          (
            await request(
              "/api/customers/bookings",
              "POST",
              { ...data, dateTime: "2020-01-01" },
              customer.token,
            )
          ).status,
          400,
        );
        assert.equal(
          (
            await request(
              "/api/customers/bookings",
              "POST",
              { ...data, numberOfPeople: 1.5 },
              customer.token,
            )
          ).status,
          400,
        );
        const r = await request(
          "/api/customers/bookings",
          "POST",
          data,
          customer.token,
        );
        assert.equal(r.status, 201);
        booking = r.body;
        assert.equal(
          (
            await request(
              `/api/customers/bookings/${booking._id}`,
              "GET",
              undefined,
              other.token,
            )
          ).status,
          403,
        );
        assert.equal(
          (
            await request(
              `/api/drivers/bookings/${booking._id}/accept`,
              "POST",
              {},
              driver.token,
            )
          ).status,
          403,
        );
        assert.equal(
          (
            await request(
              "/api/admin/bookings/assign",
              "POST",
              { bookingId: booking._id, driverId: driverProfile._id },
              admin.token,
            )
          ).status,
          409,
        );
        await request(
          "/api/drivers/toggle-availability",
          "POST",
          {},
          driver.token,
        );
        const assigned = await request(
          "/api/admin/bookings/assign",
          "POST",
          { bookingId: booking._id, driverId: driverProfile._id },
          admin.token,
        );
        assert.equal(assigned.status, 200);
        assert.equal(assigned.body.status, "assigned");
        assert.equal(
          (
            await request(
              `/api/drivers/bookings/${booking._id}/status`,
              "PUT",
              { status: "completed" },
              driver.token,
            )
          ).status,
          409,
        );
        assert.equal(
          (
            await request(
              `/api/drivers/bookings/${booking._id}/accept`,
              "POST",
              {},
              driver.token,
            )
          ).status,
          200,
        );
        for (const status of ["on-the-way", "picked-up", "completed"])
          assert.equal(
            (
              await request(
                `/api/drivers/bookings/${booking._id}/status`,
                "PUT",
                { status },
                driver.token,
              )
            ).status,
            200,
          );
        assert.equal(
          (
            await request(
              `/api/drivers/bookings/${booking._id}/status`,
              "PUT",
              { status: "completed" },
              driver.token,
            )
          ).status,
          409,
        );
        assert.equal(
          (
            await request(
              `/api/customers/bookings/${booking._id}/cancel`,
              "PUT",
              {},
              customer.token,
            )
          ).status,
          409,
        );
        const cancelled = await request(
          "/api/customers/bookings",
          "POST",
          { ...data, dateTime: new Date(Date.now() + 172800000).toISOString() },
          customer.token,
        );
        assert.equal(
          (
            await request(
              `/api/customers/bookings/${cancelled.body._id}/cancel`,
              "PUT",
              {},
              customer.token,
            )
          ).status,
          200,
        );
        const stats = await Statistics.getInstance();
        assert.equal(stats.totalBookingsAllTime, 2);
        assert.equal(stats.totalCompletedBookingsAllTime, 1);
        assert.equal(stats.totalCancelledBookingsAllTime, 1);
      },
    );
    await t.test(
      "notifications are scoped, readable, and bounded",
      async () => {
        const r = await request(
          "/api/notifications?limit=-1&page=-2",
          "GET",
          undefined,
          customer.token,
        );
        assert.equal(r.status, 200);
        assert.equal(r.body.page, 1);
        assert.ok(r.body.notifications.length <= 1);
        const id = r.body.notifications[0]._id;
        assert.equal(
          (
            await request(
              `/api/notifications/${id}/read`,
              "PUT",
              {},
              other.token,
            )
          ).status,
          404,
        );
        assert.equal(
          (
            await request(
              `/api/notifications/${id}/read`,
              "PUT",
              {},
              customer.token,
            )
          ).status,
          200,
        );
      },
    );
    await t.test(
      "competing assignments cannot double-book a driver",
      async () => {
        const details = {
          serviceType: "Dropping",
          dateTime: new Date(Date.now() + 7 * 86400000).toISOString(),
          pickupPoint: "Concurrency pickup",
          destination: "Concurrency destination",
          numberOfPeople: 2,
        };
        const a = await request(
          "/api/customers/bookings",
          "POST",
          details,
          customer.token,
        );
        const b = await request(
          "/api/customers/bookings",
          "POST",
          details,
          other.token,
        );
        const results = await Promise.all(
          [a, b].map((r) =>
            request(
              "/api/admin/bookings/assign",
              "POST",
              { bookingId: r.body._id, driverId: driverProfile._id },
              admin.token,
            ),
          ),
        );
        assert.deepEqual(results.map((r) => r.status).sort(), [200, 409]);
        assert.equal(
          await Booking.countDocuments({
            driverId: driverProfile._id,
            status: "assigned",
          }),
          1,
        );
      },
    );
    await t.test(
      "passwords are not rewritten by input sanitization",
      async () => {
        const literal = "  Space_safe_2026!  ";
        const r = await request("/api/auth/register", "POST", {
          ...customerData,
          phoneNumber: "0200000199",
          password: literal,
        });
        assert.equal(r.status, 201);
        assert.equal(
          (
            await request("/api/auth/login", "POST", {
              phoneNumber: "0200000199",
              password: literal,
            })
          ).status,
          200,
        );
        assert.equal(
          (
            await request("/api/auth/login", "POST", {
              phoneNumber: "0200000199",
              password: literal.trim(),
            })
          ).status,
          401,
        );
      },
    );
    await t.test(
      "unauthenticated sockets are rejected and authenticated users connect",
      async () => {
        const connect = (auth) =>
          new Promise((resolve) => {
            const socket = io(`http://127.0.0.1:${port}`, {
              auth,
              reconnection: false,
              timeout: 5000,
            });
            socket.once("connect", () => {
              socket.disconnect();
              resolve(true);
            });
            socket.once("connect_error", () => {
              socket.disconnect();
              resolve(false);
            });
          });
        assert.equal(await connect({}), false);
        assert.equal(await connect({ token: customer.token }), true);
      },
    );
    await t.test(
      "archives persist the exact snapshot before cleanup and can be downloaded again",
      async () => {
        await Booking.updateOne(
          { _id: booking._id },
          { createdAt: new Date(Date.now() - 100 * 86400000) },
        );
        const archived = await request(
          "/api/admin/archive/execute",
          "POST",
          {},
          admin.token,
        );
        assert.equal(archived.status, 200);
        assert.equal(archived.body.archived, 1);
        const list = await request(
          "/api/admin/archive/saved",
          "GET",
          undefined,
          admin.token,
        );
        assert.equal(list.body.length, 1);
        const saved = await request(
          `/api/admin/archive/saved/${list.body[0]._id}`,
          "GET",
          undefined,
          admin.token,
        );
        assert.equal(saved.body.bookings[0]._id, booking._id);
        assert.equal(await Booking.countDocuments({ _id: booking._id }), 0);
      },
    );
  },
);
