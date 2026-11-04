# Security checklist - Afta Delivery

Do these once, in this order. (Admin → 🔐 Security shows a live checklist of the same points.)

## Before going live
1. **Admin password**: log in, change the first password in Settings (long, unique), delete `instance/initial_admin_password.txt`.
2. **Two-step login**: Admin → Security → *Set up two-step login*. Save the backup codes. Optional rule for all admins: `REQUIRE_ADMIN_2FA=1`.
3. **HTTPS only** (Render / Cloudflare give it free) and set `SESSION_COOKIE_SECURE=1`.
4. **`SECRET_KEY`**: set a long random value in the hosting settings (e.g. `python -c "import secrets;print(secrets.token_urlsafe(48))"`).
   Anyone who knows it can forge login sessions - never put it in GitHub, chat or screenshots.
5. **`TRUST_PROXY=1`** only when the site is behind a proxy (Render, nginx, Cloudflare); leave it off otherwise.
6. **Database**: PostgreSQL via `DATABASE_URL`, strong password, not open to the internet. Daily `python backup.py`, copy the files OFF the server
   (they contain customer phones, addresses and payment receipts).
7. **SMS verification**: configure an SMS provider so customers confirm their phone (README → SMS).
8. **Alerts**: Settings → *Alerts to your phone* (Telegram bot). You are told about new admin logins from a new place,
   failed login bursts, new admins / 2-step changes, orders, payments and problems.

## Never
- commit `instance/`, `*.db`, `backups/`, `.env` to GitHub;
- share the admin login; create one account per person (Admin accounts);
- leave `ALLOW_GUEST_CHECKOUT` on unless you really want anonymous orders;
- use the same password as on other websites.

## Regularly
- `pip install pip-audit && pip-audit -r requirements.txt` (known vulnerable packages) and update.
- Look at **Change history** (Audit log) and **Notifications → 🔐** for anything you did not do.
- Compare *Money received* with the real bank statement; confirm a payment only after seeing the money.
- Test a backup restore once.

## What is already built in
Passwords are hashed; CSRF tokens on every form; login rate limits per phone/user and per IP; two-step login (TOTP) for admins;
secure/HttpOnly/SameSite cookies; clickjacking and content-type protection; uploaded images are verified and re-encoded;
payment receipts are private; order numbers and chat keys are unguessable; no raw SQL with user input; delivery needs the
customer's 4-digit code.

## Known limits (honest list)
- The page policy (CSP) still allows inline scripts, which weakens protection against a future XSS bug.
- Customers' receipts are checked by a human, not against the bank.
- Telegram bot token is stored in the database in plain text (admin-only, but a database leak would expose it).
- This code has not had an independent penetration test. Before the shop handles large amounts of money, ask a security professional to test it.

## Report a problem
Found a weakness? Tell the site owner privately - do not publish it.
