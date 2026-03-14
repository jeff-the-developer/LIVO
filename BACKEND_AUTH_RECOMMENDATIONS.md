# Backend Authentication Architecture Recommendations

Based on a thorough review of the frontend authentication and onboarding flow, we have identified a potential security and data-integrity liability in the backend's current handling of user registrations (`POST /auth/register`).

## The Issue: Eager Database Inserts
Currently, the backend creates a new `users` row in the PostgreSQL database immediately when a user hits `POST /auth/register`, before their email/phone is verified via OTP.

**Risks of this approach:**
1. **Database Garbage/Clutter:** Bots or users abandoning the flow will leave thousands of unverified, orphaned tuples in the `users` table.
2. **Security & Zero-Trust:** Registering an entity before they have proven ownership of their identifier violates zero-trust principles and can lead to account enumeration attacks or denial-of-service (preventing the real owner from registering later).
3. **Frontend Sync Issues:** It complicates the frontend state machine. If an onboarding flow is interrupted, dealing with "half-created" users requires extensive bespoke logic.

## The Solution: Redis Ephemeral Caching
To align with standard production-ready architectures, we strongly request the backend team implements the following pattern:

1. **Step 1: Registration Request (`POST /auth/register`)**
   - **Do not** insert into PostgreSQL.
   - Generate the OTP.
   - Store the registration payload (`email`, `invite_code`, `OTP`, expiration timestamp) inside **Redis** with a TTL (e.g., 5-10 minutes).
   - Send the email.

2. **Step 2: OTP Verification (`POST /auth/verify-email`)**
   - Retrieve the cached payload from Redis using the provided email.
   - Verify the OTP matches.
   - **Only now**, `INSERT INTO users (...)` in PostgreSQL to formally create the identity.
   - Return success to allow the frontend to proceed to password setup.

3. **Step 3: User Profile Enhancements (`GET /user/profile` and login responses)**
   - Please add a `pin_enabled: boolean` indicating whether the user has successfully configured their 6-digit transaction PIN via `POST /auth/setup-pin`. 
   - This allows the frontend's `AppStack` router to programmatically trap new users in the onboarding funnel (`CreateUsernameScreen` -> `PINSetupScreen`) if they kill the app during registration and restart it later. Currently, we only check if `username` is empty.

Implementing these changes will guarantee high data integrity, eliminate garbage user accounts, and allow the frontend to safely enforce mandatory onboarding stages consistently.
