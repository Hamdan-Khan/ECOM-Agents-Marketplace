# Frontend Alignment Implementation Plan

This plan breaks down the work needed to connect the Next.js frontend (`@web`) to the real backend API (`@api`). Each task is small and focused for easy tracking and implementation.

---

## 1. API Service Layer

- [x] Create `services/api.ts` for all backend HTTP requests. _File created._
- [x] Add environment-based API URL support (`NEXT_PUBLIC_API_URL`). _Base URL is now environment-based._
- [x] Implement helper for attaching JWT to requests. _API service now attaches JWT automatically if present._
- [x] Standardize error handling and response parsing. _API service now has robust error handling and response parsing._
- [ ] Standardize error handling and response parsing.

---

## 2. Authentication

- [x] Refactor `/register` page to use `POST /users` (backend). _Registration now uses the real backend API._
- [x] Refactor `/login` page to use `POST /users/login` (backend). _Login now uses the real backend API and stores JWT/user in localStorage._
- [x] Store JWT securely (localStorage or cookie). _JWT and user are now stored in localStorage._
- [x] Create `contexts/auth-context.tsx` for auth state (user, token, login/logout). _Auth Context implemented._
- [x] Add logic to attach JWT to all protected API requests. _API service already attaches JWT._
- [x] Add logout functionality (clear token, reset state). _Logout is now available in the navbar and user session is cleared on logout._

---

## 3. Agents

- [x] Refactor `/agents` page to fetch from `GET /agents` (backend). _Agents page now uses real backend data._
- [x] Refactor `/agents/[id]` page to fetch from `GET /agents/:id`. _Agent details page is now fully integrated with the backend._
- [x] Remove all agent mock data. _All agent pages now use real backend data._

---

## 4. Cart & Checkout

- [x] Keep cart state local (for now). _Cart state remains local._
- [x] Refactor `/checkout` to:
  - [x] Create order via `POST /orders`.
  - [x] Process payment via `POST /payments`.
- [x] Refactor order confirmation to use real payment/order data. _Checkout now creates orders and payments using the real backend API._

---

## 5. Dashboard & Profile

- [x] Fetch user profile from `GET /users/profile`. _User profile fetching implemented._
- [x] Allow user to update profile via `PATCH /users/:id`. _Profile update implemented._
- [x] Fetch user orders from `GET /orders?userId=...`. _Dashboard now fetches and displays user orders from the backend._
- [x] Fetch purchased agents from backend (derived from orders). _Dashboard now uses real backend data for purchased agents._
- [x] Fetch user payments from `GET /payments/user/:userId`. _Dashboard now fetches and displays user payments from the backend._
- [x] Show subscriptions (filter orders by type). _Dashboard now displays subscriptions filtered from orders._

---

## 6. Admin Panel

- [ ] **(In Progress)** Admin dashboard: Fetch all users (`GET /users`), agents (`GET /agents`), orders (`GET /orders`), payments (`GET /payments`).
  - [x] Check admin role before fetching (redirect/block if not admin).
  - [x] Display each resource in a paginated, filterable table.
  - [x] Show loading and error states for each table.
  - [x] Remove all mock data.
- [x] Admin can delete/update users, agents, orders, payments (CRUD UI, real API).
- [x] Protect admin routes (redirect if not admin).

---

## 7. Order & Payment Details

- [x] Fetch order details (`GET /orders/:id`).
- [ ] Fetch payment details (`GET /payments/:id`).
- [x] Show order/payment details in dashboard/admin.

---

## 8. Agent CRUD (User & Admin)

- [x] List agents created by the user (`GET /agents?created_by=<userId>`)
- [x] Create agent (`POST /agents`)
- [x] Edit agent (`PATCH /agents/:id`) [only if created_by === user]
- [x] Delete agent (`DELETE /agents/:id`) [only if created_by === user]
- [x] **Admin Agent Management**
  - [x] Edit/delete any agent
  - [x] Add agent creation/update UI for admin/creators.

---

## 9. Error Handling & Edge Cases

- [x] Global 401/403 handling (redirect to login, show not authorized)
- [x] Graceful error UI for all API failures
- [ ] (Recommend: Backend should enforce ownership checks for agent update/delete)

---

## 10. Pagination & Filtering

- [ ] Pagination/filtering for all large tables (agents, orders, payments, users)

---

## 11. Polish & UX

- [ ] Loading states for all async actions
- [ ] Toasts/snackbars for all major actions
- [ ] Accessibility and mobile responsiveness

---

## 12. Final Polish & UX

- [ ] Show order/payment status in dashboard/admin.
- [ ] Display user role in profile/dashboard.
- [ ] Fetch and display token balance in dashboard/checkout.
- [ ] Add 404/not found pages for missing resources.
- [ ] Ensure all async fetches have loading states.
- [ ] Basic accessibility for all forms and components.
- [ ] Confirm mobile responsiveness for all pages.

---

**This updated plan ensures the frontend will be fully aligned and functional with the backend API, covering all user, admin, and edge case scenarios.**

**Tip:** Tackle one section at a time, commit after each task, and test thoroughly!
