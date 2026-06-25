# Embroidery Design Marketplace - Developer Guide & Onboarding Manual

This project is divided into two primary subfolders: `/backend` (Express.js API) and `/frontend` (React + Vite + Tailwind CSS app).

---

## 1. Database Setup

To configure the database:
1. Create a project at [Supabase Console](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Paste and run the entire contents of [supabase_schema.sql](file:///d:/weaving%20designs/supabase_schema.sql) file. This will automatically create:
   * Tables: `users`, `categories`, `designs`, `orders`, and `downloads`.
   * Trigger function: Auto-synchronizes new sign-ups from Supabase Auth into your public profiles table.
   * RLS policies: Protects categories, designs, and order logs.
   * Storage buckets: Configures public `previews` and private `original-files` folders.

---

## 2. Running Locally

### Backend API (`/backend`)
1. Open terminal and navigate to `/backend` directory.
2. Edit the `.env` file to replace default placeholders with actual credentials:
   ```env
   PORT=5000
   SUPABASE_URL=https://your-supabase-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   RAZORPAY_KEY_ID=rzp_test_your_razorpay_key
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
   JWT_SECRET=any_long_signing_secret_phrase
   ```
   > [!WARNING]
   > The `SUPABASE_SERVICE_ROLE_KEY` is highly sensitive. It is required by the backend to bypass RLS policies and generate secure, short-lived signed URLs for downloading private files. Do not expose it to the client.
3. Boot the API:
   ```bash
   npm run dev
   ```
   The API will listen at `http://localhost:5000` with hot-reloading enabled.

### Frontend Application (`/frontend`)
1. Open terminal and navigate to `/frontend` directory.
2. Edit the `.env` file to set your public client-side keys:
   ```env
   VITE_SUPABASE_URL=https://your-supabase-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your_public_anon_key_here
   ```
3. Boot the application dev server:
   ```bash
   npm run dev
   ```
   The server launches at `http://localhost:3000`. It contains a proxy route mapping `/api` directly to `http://localhost:5000` to avoid local dev CORS errors.

---

## 3. Sandbox Simulator Mode (Testing without Keys)

If you boot the frontend and backend without setting custom environment credentials, the application enters **Sandbox Mode**:
* **Catalog Browsing:** Populates the catalog with featured mock designs.
* **Authentication Shortcuts:** Use the developer quick-login buttons on the Login page:
  * **Customer:** `customer@example.com` (password: `user123`)
  * **Admin:** `gudurupavan0297@gmail.com` (password: `Ghjklasdf@1`)
* **Admin 2FA Challenge:** Scan the displayed QR Code with Google Authenticator or enter the sandbox passcode **`123456`**.
* **Payment Processing:** When checking out, a custom Simulator Modal overlay opens. Click **"Simulate Success"** to test successful Razorpay signature verification and order creation flows.
* **Private Download Delivery:** Direct raw files are protected. Successful checkout simulation unlocks the download button, letting you retrieve the mock file link.
