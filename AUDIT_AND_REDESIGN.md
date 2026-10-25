# ELOCAB redesign and repair

Prepared October 25, 2026. Work is on `codex/project-preparation`.

## Interface

All seven application routes have been rebuilt: homepage, customer/driver sign-in, registration, admin sign-in, and the three role dashboards.

The dashboards include booking, ride lists and details, histories, profiles, admin overview, driver/customer management, and settings. Shared forms, buttons, navigation, cards, dialogs, status labels, and error/loading states carry the same navy/orange palette throughout.

Phone layouts use bottom navigation, stacked forms, and responsive cards. Tablets and larger displays adapt their navigation and content columns. Images and contact details retain ELOCAB's existing identity.

The homepage booking form carries its route into registration and booking. Driver sign-up opens the driver form directly. The admin entry is an ordinary accessible link. Search, status filters, installation help, typed deletion confirmations, and recoverable archive downloads are connected to real behavior.

## Backend corrections

| Finding                                                           | Correction                                                           |
| ----------------------------------------------------------------- | -------------------------------------------------------------------- |
| Public registration could request a privileged role               | Only customer and driver roles are accepted                          |
| Admin-created accounts had double-hashed passwords                | Account creation uses the User save hook exactly once                |
| Failed profiles could leave orphan accounts                       | Validate first, with cleanup if persistence fails                    |
| Inactive/deleted accounts could reuse tokens                      | Authentication and sockets verify an active account                  |
| Customer phone edits did not update sign-in                       | Profile and account identifiers stay synchronized                    |
| Generic booking endpoints exposed other people's rides            | Restricted to admins; role-specific routes enforce ownership         |
| Sockets trusted arbitrary user IDs and broadcast private bookings | JWT-authenticated rooms limit events to participants/admins          |
| Assignment skipped driver acceptance                              | Assignment creates the assigned state; the driver accepts            |
| Drivers could be unavailable, undersized, or double-booked        | Status/capacity checks and a serialized assignment transaction       |
| Repeated/out-of-order status updates changed statistics           | Valid state transitions and atomic conditional updates               |
| Cancellation missed counters                                      | Shared booking transition service updates cancellation counts        |
| Concurrent statistics saves could lose increments                 | Atomic per-day and lifetime increments                               |
| Archive cleanup could remove records outside its export           | Persist the snapshot first, then delete only its exported IDs        |
| Archives could be lost after download failure                     | Saved database archives can be downloaded again                      |
| Automatic cleanup relied on local server files                    | Persisted archives; monthly scheduling is opt-in on persistent hosts |
| Origin configuration was not enforced                             | CORS permits only configured origins                                 |
| Malformed IDs caused server errors                                | Validate record IDs before controller queries                        |
| Password sanitization could change the password                   | Password strings are preserved exactly                               |
| Sign-out could race with session restoration                      | In-flight session responses are version checked                      |
| Mutations during an active fetch could leave stale lists          | Coalesce and queue a follow-up refresh                               |
| Driver ride cards lacked populated vehicle details                | Role-specific booking responses include the assigned vehicle         |

## Verification

- Backend integration regression suite: 11 tests passed, including its parent scenario.
- Browser regression suite: 9 tests passed, including its parent scenario. Coverage includes public/account/role workflows, desktop and phone controls, booking cancellation and completion, account management, archives, and destructive confirmation guards.
- Responsive coverage: 17 page/states at 320, 375, 768, 1024, 1440, and 1920 pixels: 102 overflow checks.
- Visible button labels and link targets are inventoried during the browser suite.
- Production build passes with lazy-loaded routes. Main JS is approximately 293 kB minified, compared with the original 529 kB main bundle.
- Frontend and backend dependency audits report zero known vulnerabilities.
- Source is formatted with Prettier; whitespace validation passes.
- Test data uses dedicated temporary databases and synthetic accounts.

Local evidence is written to ignored `tmp/qa/`: screenshots, `responsive-checks.json`, and `control-inventory.json`. The suites are reproducible with the commands in the README.

## Runtime notes

The tested setup uses MongoDB Atlas and Chromium. Persistent Socket.IO connections require a persistent Node host; dashboard polling remains available when sockets are unavailable. Desktop alerts require the user's browser permission and operate while the application is open. Closed-app Web Push is not configured.

Automatic archiving is disabled by default and can be enabled with `ENABLE_ARCHIVE_SCHEDULER=true`. Deployment configuration must provide the current database credentials, private JWT secret, application admin credentials, and permitted frontend origins.

The 12ui design workflow was attempted but could not complete because of its authentication/service failures. The implemented design was completed directly using the existing brand and assets.

This revision is running locally for review. Deployment configuration and publishing are separate from these local changes.
