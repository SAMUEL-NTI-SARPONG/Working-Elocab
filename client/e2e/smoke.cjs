const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { randomBytes } = require("node:crypto");
const { chromium, expect: baseExpect } = require("@playwright/test");
const expect = baseExpect.configure({ timeout: 25000 });
const mongoose = require("../../server/node_modules/mongoose");
require("../../server/node_modules/dotenv").config({
  path: path.join(__dirname, "../../server/.env"),
});
const root = path.join(__dirname, "../..");
const output = path.join(root, "tmp/qa");

test(
  "ELOCAB public pages, role workflows, controls, and responsive layouts",
  { skip: !process.env.MONGODB_URI, timeout: 600000 },
  async (t) => {
    fs.mkdirSync(output, { recursive: true });
    const name = `elocab_test_${randomBytes(6).toString("hex")}`;
    const uri = new URL(process.env.MONGODB_URI);
    uri.pathname = `/${name}`;
    const secret = "EloBrowser_2026!";
    const adminEmail = "browser-admin@elocab.test";
    const api = "http://127.0.0.1:5112";
    const base = "http://127.0.0.1:5174";
    const server = spawn(process.execPath, ["server.js"], {
      cwd: path.join(root, "server"),
      env: {
        ...process.env,
        VERCEL: "",
        NODE_ENV: "test",
        PORT: "5112",
        MONGODB_URI: uri.href,
        JWT_SECRET: randomBytes(32).toString("hex"),
        ADMIN_EMAIL: adminEmail,
        ADMIN_PASSWORD: secret,
        CLIENT_URL: base,
        ENABLE_ARCHIVE_SCHEDULER: "false",
        AUTH_RATE_LIMIT_MAX: "500",
        API_RATE_LIMIT_MAX: "5000",
      },
      stdio: "ignore",
    });
    const vite = spawn(
      process.execPath,
      [
        path.join(root, "client/node_modules/vite/bin/vite.js"),
        "--host",
        "127.0.0.1",
        "--port",
        "5174",
        "--strictPort",
      ],
      {
        cwd: path.join(root, "client"),
        env: { ...process.env, VITE_API_URL: api },
        stdio: "ignore",
      },
    );
    let browser;
    t.after(async () => {
      if (browser) await browser.close();
      server.kill();
      server.unref();
      vite.kill();
      vite.unref();
      if (mongoose.connection.readyState) {
        assert.match(mongoose.connection.name, /^elocab_test_[a-f0-9]{12}$/);
        assert.equal(mongoose.connection.name, name);
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
      }
    });
    let ready = false;
    for (let i = 0; i < 80; i++) {
      try {
        const h = await (await fetch(`${api}/api/health`)).json();
        const v = await fetch(base);
        if (h.dbConnected && v.ok) {
          ready = true;
          break;
        }
      } catch {}
      await new Promise((r) => setTimeout(r, 500));
    }
    assert.ok(ready, "Isolated API and frontend must be ready.");
    await mongoose.connect(uri.href);
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      serviceWorkers: "block",
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.setDefaultTimeout(15000);
    const request = async (url, method = "GET", body, token) => {
      const r = await fetch(`${api}${url}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      });
      return { status: r.status, body: await r.json() };
    };
    const goto = async (url) => {
      await page.goto(base + url, { waitUntil: "domcontentloaded" });
      await expect(page.locator("h1")).toBeVisible();
    };
    const waitURL = (url) =>
      page.waitForURL(url, { waitUntil: "domcontentloaded" });
    const fill = async (label, value) =>
      page.getByLabel(label, { exact: true }).fill(value);
    const screenshot = async (name) =>
      page.screenshot({
        path: path.join(output, `${name}.png`),
        fullPage: true,
      });
    const login = async (role, phone) => {
      await goto(role === "admin" ? "/admin/login" : "/login");
      await fill(
        role === "admin" ? "Email address" : "Phone number",
        role === "admin" ? adminEmail : phone,
      );
      await fill("Password", secret);
      await page.getByRole("button", { name: "Sign in", exact: true }).click();
      await waitURL(`**/${role}/dashboard`);
      await expect(page.locator(".workspace-content h1")).toBeVisible();
      await expect(page.locator(".loading-state")).toHaveCount(0);
    };
    const logout = async () => {
      await page.getByRole("button", { name: "Sign out", exact: true }).click();
      await waitURL((url) => url.pathname.endsWith("/login"));
    };
    let customer, driver, admin, rideId;
    let broken = false;
    const step = (label, fn) =>
      t.test(label, { skip: broken }, async () => {
        try {
          await fn();
        } catch (e) {
          broken = true;
          await page
            .screenshot({
              path: path.join(output, "failure.png"),
              fullPage: true,
            })
            .catch(() => {});
          throw e;
        }
      });
    await step(
      "public navigation, route draft, registration, and booking submission",
      async () => {
        await goto("/");
        await screenshot("desktop-home");
        await expect(
          page.getByRole("link", { name: "Our services", exact: true }),
        ).toHaveAttribute("href", "/#services");
        await page
          .getByLabel("Pickup location", { exact: true })
          .fill("KNUST main gate");
        await page
          .getByLabel("Destination", { exact: true })
          .fill("Kejetia market");
        await page
          .getByRole("button", { name: "Let's find your ride" })
          .click();
        await waitURL("**/register?role=customer");
        await fill("Full name", "Browser Customer");
        await fill("Phone number", "0205550101");
        await fill("Password", secret);
        await fill("Confirm password", "not-matching");
        await page
          .getByRole("button", { name: "Show password", exact: true })
          .click();
        await expect(
          page.getByLabel("Password", { exact: true }),
        ).toHaveAttribute("type", "text");
        await page
          .getByRole("button", { name: "Create account", exact: true })
          .click();
        await expect(page.getByRole("alert")).toContainText("do not match");
        await fill("Confirm password", secret);
        await page
          .getByRole("button", { name: "Create account", exact: true })
          .click();
        await waitURL("**/customer/dashboard");
        await expect(
          page.getByLabel("Pickup point", { exact: true }),
        ).toHaveValue("KNUST main gate");
        await expect(
          page.getByLabel("Destination", { exact: true }),
        ).toHaveValue("Kejetia market");
        await page
          .getByRole("button", { name: "Hiring", exact: false })
          .click();
        await page
          .getByRole("button", { name: "Dropping", exact: false })
          .click();
        await fill(
          "Travel date & time",
          new Date(Date.now() + 86400000).toISOString().slice(0, 16),
        );
        await fill("Passengers", "2");
        await fill(
          "Anything else we should know?",
          "Meet by the main entrance.",
        );
        await screenshot("customer-book-desktop");
        await page.getByRole("button", { name: "Request my ride" }).click();
        await waitURL("**/customer/dashboard?tab=rides");
        await expect(page.locator(".ride-card")).toHaveCount(1);
        await page
          .getByRole("button", { name: "Details", exact: true })
          .click();
        await expect(page.getByRole("dialog")).toContainText(
          "Meet by the main entrance.",
        );
        await page.keyboard.press("Escape");
        await expect(page.getByRole("dialog")).not.toBeVisible();
        customer = (
          await request("/api/auth/login", "POST", {
            phoneNumber: "0205550101",
            password: secret,
          })
        ).body;
        rideId = (
          await request(
            "/api/customers/bookings",
            "GET",
            undefined,
            customer.token,
          )
        ).body[0]._id;
      },
    );
    await step(
      "customer profile save, phone sign-in, notifications, and sign-out",
      async () => {
        await goto("/customer/dashboard?tab=profile");
        await fill("Phone number", "0205550111");
        await page.getByRole("button", { name: "Save changes" }).click();
        await expect(
          page.getByText("Profile updated.", { exact: true }),
        ).toBeVisible();
        await page.getByRole("button", { name: /^Notifications/ }).click();
        await expect(page.getByRole("dialog")).toBeVisible();
        await page.getByRole("button", { name: "Mark all as read" }).click();
        await expect(
          page.getByRole("button", { name: "Mark all as read" }),
        ).toBeEnabled();
        await page.keyboard.press("Escape");
        await logout();
        await login("customer", "0205550111");
        await logout();
      },
    );
    await step(
      "driver registration, profile edits, and online toggle",
      async () => {
        await goto("/register?role=driver");
        await fill("Full name", "Browser Driver");
        await fill("Phone number", "0205550102");
        await fill("Base location", "Kumasi");
        await fill("Vehicle number", "TEST-BROWSER-1");
        await fill("Licence number", "TEST-BROWSER-L1");
        await fill("Password", secret);
        await fill("Confirm password", secret);
        await page
          .getByRole("button", { name: "Create account", exact: true })
          .click();
        await waitURL("**/driver/dashboard");
        await page.getByRole("switch", { name: "Driver availability" }).click();
        await expect(
          page.getByRole("switch", { name: "Driver availability" }),
        ).toHaveAttribute("aria-checked", "true");
        await goto("/driver/dashboard?tab=profile");
        await fill("Base location", "KNUST, Kumasi");
        await page.getByRole("button", { name: "Save changes" }).click();
        await expect(
          page.getByText("Profile updated.", { exact: true }),
        ).toBeVisible();
        driver = (
          await request("/api/auth/login", "POST", {
            phoneNumber: "0205550102",
            password: secret,
          })
        ).body;
        await logout();
      },
    );
    await step(
      "admin account creation, search, activation, assignment, and typed confirmation",
      async () => {
        await login("admin");
        admin = (
          await request("/api/auth/admin/login", "POST", {
            email: adminEmail,
            password: secret,
          })
        ).body;
        await screenshot("admin-overview-desktop");
        await goto("/admin/dashboard?tab=customers");
        await page
          .getByRole("button", { name: "Add customer", exact: true })
          .click();
        await fill("Full name", "Created Customer");
        await fill("Phone number", "0205550103");
        await fill("Temporary password", secret);
        await page
          .getByRole("button", { name: "Create customer", exact: true })
          .click();
        await expect(page.getByRole("dialog")).not.toBeVisible();
        await page.getByLabel("Search customers").fill("Created Customer");
        await expect(page.locator(".person-row")).toHaveCount(1);
        assert.equal(
          (
            await request("/api/auth/login", "POST", {
              phoneNumber: "0205550103",
              password: secret,
            })
          ).status,
          200,
        );
        await page
          .getByRole("button", { name: "Delete account", exact: true })
          .click();
        await expect(
          page
            .getByRole("button", { name: "Delete account", exact: true })
            .last(),
        ).toBeDisabled();
        await page
          .getByRole("button", { name: "Go back", exact: true })
          .click();
        await goto("/admin/dashboard?tab=drivers");
        await page
          .getByRole("button", { name: "Add driver", exact: true })
          .click();
        await fill("Full name", "Created Driver");
        await fill("Phone number", "0205550104");
        await fill("Base location", "Kumasi");
        await fill("Vehicle number", "TEST-BROWSER-2");
        await fill("Licence number", "TEST-BROWSER-L2");
        await fill("Temporary password", secret);
        await page
          .getByRole("button", { name: "Create driver", exact: true })
          .click();
        await expect(page.getByRole("dialog")).not.toBeVisible();
        const row = page
          .locator(".person-row")
          .filter({ hasText: "Created Driver" });
        await row
          .getByRole("button", { name: "Deactivate", exact: true })
          .click();
        await page
          .getByRole("button", { name: "Deactivate driver", exact: true })
          .click();
        await expect(row).toContainText("Inactive");
        await row
          .getByRole("button", { name: "Activate", exact: true })
          .click();
        await page
          .getByRole("button", { name: "Activate driver", exact: true })
          .click();
        await expect(row).toContainText("Offline");
        await goto("/admin/dashboard?tab=rides");
        await page
          .getByRole("button", { name: "Assign driver", exact: true })
          .click();
        await page
          .getByLabel("Available driver", { exact: true })
          .selectOption(driver.profile._id);
        await page
          .getByRole("dialog")
          .getByRole("button", { name: "Assign driver", exact: true })
          .click();
        await expect(page.getByRole("dialog")).not.toBeVisible();
        await expect(page.locator(".status-assigned")).toBeVisible();
        await screenshot("admin-rides-desktop");
        await logout();
      },
    );
    await step(
      "driver accepts and completes each ride stage; customer sees the update",
      async () => {
        await login("driver", "0205550102");
        await expect(page.locator(".ride-contact")).toContainText(
          "Browser Driver",
        );
        await screenshot("driver-rides-desktop");
        for (const label of [
          "Accept ride",
          "Start pickup",
          "Passenger picked up",
          "Complete ride",
        ]) {
          await page.getByRole("button", { name: label, exact: true }).click();
          await page
            .getByRole("dialog")
            .getByRole("button", { name: label, exact: true })
            .click();
          await expect(page.getByRole("dialog")).not.toBeVisible();
        }
        await goto("/driver/dashboard?tab=history");
        await expect(page.locator(".status-completed")).toBeVisible();
        await logout();
        await login("customer", "0205550111");
        await goto("/customer/dashboard?tab=rides");
        await expect(page.locator(".status-completed")).toBeVisible();
        await page.getByLabel("Search rides").fill("Kejetia");
        await expect(page.locator(".ride-card")).toHaveCount(1);
        await page
          .getByLabel("Filter rides by status")
          .selectOption("cancelled");
        await expect(
          page.getByRole("heading", { name: "No matching rides" }),
        ).toBeVisible();
        await page.getByRole("button", { name: "Clear filters" }).click();
        await expect(page.locator(".ride-card")).toHaveCount(1);
        await logout();
      },
    );
    await step(
      "archive preview, export, saved recovery, file viewer, and destructive control guards",
      async () => {
        await require("../../server/models/Booking").updateOne(
          { _id: rideId },
          { createdAt: new Date(Date.now() - 100 * 86400000) },
        );
        await login("admin");
        await goto("/admin/dashboard?tab=settings");
        await page
          .getByRole("button", { name: "Preview archive", exact: true })
          .click();
        await expect(page.getByRole("dialog")).toContainText("1 rides");
        await page.keyboard.press("Escape");
        await page
          .getByRole("button", { name: "Archive & download", exact: true })
          .click();
        const downloadPromise = page.waitForEvent("download");
        await page
          .getByRole("dialog")
          .getByRole("button", { name: "Archive and download", exact: true })
          .click();
        const download = await downloadPromise;
        const file = path.join(output, "test-archive.json");
        await download.saveAs(file);
        await expect(page.getByRole("dialog")).not.toBeVisible();
        await expect(
          page.getByRole("button", { name: "Download", exact: true }),
        ).toBeVisible();
        await page.getByLabel("Choose archive file").setInputFiles(file);
        await expect(page.getByRole("dialog")).toContainText("KNUST main gate");
        await page
          .getByRole("dialog")
          .getByLabel("Search rides")
          .fill("Kejetia");
        await expect(
          page.getByRole("dialog").locator(".ride-card"),
        ).toHaveCount(1);
        await page.keyboard.press("Escape");
        await page
          .getByRole("button", { name: "Reset statistics", exact: true })
          .click();
        await expect(
          page
            .getByRole("dialog")
            .getByRole("button", { name: "Reset statistics", exact: true }),
        ).toBeDisabled();
        await page.getByLabel("Type RESET to confirm").fill("RESET");
        await page
          .getByRole("dialog")
          .getByRole("button", { name: "Reset statistics", exact: true })
          .click();
        await expect(page.getByRole("dialog")).not.toBeVisible();
        await goto("/admin/dashboard?tab=customers");
        const row = page
          .locator(".person-row")
          .filter({ hasText: "Created Customer" });
        await row
          .getByRole("button", { name: "Delete account", exact: true })
          .click();
        await page.getByLabel("Type DELETE to confirm").fill("DELETE");
        await page
          .getByRole("dialog")
          .getByRole("button", { name: "Delete account", exact: true })
          .click();
        await expect(row).toHaveCount(0);
        await logout();
      },
    );
    await step(
      "mobile navigation, installation help, cancellation, and record cleanup",
      async () => {
        await page.setViewportSize({ width: 375, height: 812 });
        await goto("/");
        await page.getByRole("button", { name: "Open navigation" }).click();
        await page
          .locator("#site-mobile-menu")
          .getByRole("link", { name: "Our fleet" })
          .click();
        await expect(page.locator("#site-mobile-menu")).toHaveCount(0);
        await expect(
          page.getByRole("heading", { name: "Small trips. Big adventures." }),
        ).toBeInViewport();
        await page.getByRole("button", { name: "Get the ELOCAB app" }).click();
        await expect(page.getByRole("dialog")).toContainText(
          "Add to Home Screen",
        );
        await page.keyboard.press("Escape");
        await goto("/missing-page");
        await page.getByRole("link", { name: "Back to ELOCAB" }).click();
        await expect(page.locator("h1")).toContainText("A better way");
        const created = await request(
          "/api/customers/bookings",
          "POST",
          {
            serviceType: "Dropping",
            pickupPoint: "Cancellation pickup",
            destination: "Cancellation destination",
            numberOfPeople: 1,
            dateTime: new Date(Date.now() + 3 * 86400000).toISOString(),
          },
          customer.token,
        );
        assert.equal(created.status, 201);
        await login("customer", "0205550111");
        await goto("/customer/dashboard?tab=rides");
        await page
          .getByRole("button", { name: "Cancel ride", exact: true })
          .click();
        await page
          .getByRole("dialog")
          .getByRole("button", { name: "Go back" })
          .click();
        await page
          .getByRole("button", { name: "Cancel ride", exact: true })
          .click();
        await page
          .getByRole("dialog")
          .getByRole("button", { name: "Cancel ride", exact: true })
          .click();
        await expect(page.locator(".status-cancelled")).toBeVisible();
        await logout();
        await login("admin");
        await goto("/admin/dashboard?tab=settings");
        const recovered = page.waitForEvent("download");
        await page
          .getByRole("button", { name: "Download", exact: true })
          .click();
        assert.match((await recovered).suggestedFilename(), /^elocab-archive-/);
        for (const [label, word] of [
          ["Clear completed", "CLEAR"],
          ["Clear records", "CLEAR ALL"],
        ]) {
          await page.getByRole("button", { name: label, exact: true }).click();
          await page.getByLabel(`Type ${word} to confirm`).fill(word);
          await page
            .getByRole("dialog")
            .getByRole("button", { name: label, exact: true })
            .click();
          await expect(page.getByRole("dialog")).not.toBeVisible();
        }
        await logout();
      },
    );
    await step(
      "all public and dashboard states fit phone, tablet, and desktop widths",
      async () => {
        const sessions = {
          customer: (
            await request("/api/auth/login", "POST", {
              phoneNumber: "0205550111",
              password: secret,
            })
          ).body,
          driver,
          admin,
        };
        const checks = [];
        const controls = [];
        const inspectControls = async (url) => {
          const buttons = [];
          for (const element of await page.getByRole("button").all()) {
            if (!(await element.isVisible())) continue;
            const name =
              (await element.getAttribute("aria-label")) ||
              (await element.innerText());
            assert.ok(name.trim(), `Unnamed button on ${url}`);
            buttons.push(name.trim());
          }
          const links = await page
            .locator("a[href]")
            .evaluateAll((items) =>
              items.map((a) => ({
                label: a.getAttribute("aria-label") || a.textContent.trim(),
                href: a.getAttribute("href"),
              })),
            );
          for (const link of links)
            assert.match(
              link.href,
              /^(\/|#|https:\/\/|tel:|mailto:)/,
              `Invalid link on ${url}`,
            );
          controls.push({ url, buttons, links });
        };
        for (const width of [320, 375, 768, 1024, 1440, 1920]) {
          await page.setViewportSize({ width, height: 950 });
          for (const url of [
            "/",
            "/login",
            "/register",
            "/register?role=driver",
            "/admin/login",
            "/missing-page",
          ]) {
            await goto(url);
            await expect(page.locator("h1")).toHaveCount(1);
            assert.ok(
              await page.evaluate(
                () => document.documentElement.scrollWidth <= innerWidth + 1,
              ),
              `Public page overflow at ${width}: ${url}`,
            );
            checks.push({ width, url });
            if (width === 1440) await inspectControls(url);
            if (url === "/" && (width === 375 || width === 1440))
              await screenshot(width === 375 ? "phone-home" : "desktop-home");
          }
          for (const [role, tabs] of Object.entries({
            customer: ["book", "rides", "profile"],
            driver: ["rides", "history", "profile"],
            admin: ["overview", "rides", "drivers", "customers", "settings"],
          })) {
            const session = sessions[role];
            await page.evaluate((data) => {
              localStorage.setItem("elocab_user", JSON.stringify(data));
              localStorage.setItem("elocab_token", data.token);
            }, session);
            for (const tab of tabs) {
              const url = `/${role}/dashboard?tab=${tab}`;
              await goto(url);
              await expect(page.locator(".loading-state")).toHaveCount(0);
              assert.ok(
                await page.evaluate(
                  () => document.documentElement.scrollWidth <= innerWidth + 1,
                ),
                `Dashboard overflow at ${width}: ${url}`,
              );
              checks.push({ width, url });
              if (width === 1440) await inspectControls(url);
              if (width === 375 && ["book", "rides", "overview"].includes(tab))
                await screenshot(`phone-${role}-${tab}`);
            }
            await page.evaluate(() => localStorage.clear());
          }
        }
        fs.writeFileSync(
          path.join(output, "responsive-checks.json"),
          JSON.stringify(checks, null, 2),
        );
        fs.writeFileSync(
          path.join(output, "control-inventory.json"),
          JSON.stringify(controls, null, 2),
        );
      },
    );
    assert.deepEqual(errors, [], "No browser runtime errors should occur.");
  },
);
