# `@org/admin` — Developer Guide (Admin Management Console)

This application is the **administrative dashboard and management console** for your monorepo. It is built with **React 19**, **Vite**, **Tailwind CSS**, and **React Router DOM 7**.

---

## 📌 What is this application?

`@org/admin` provides a secure, role-protected interface for platform administrators to manage user accounts, oversee platform activity, and manage administrative settings.

---

## 🎯 What is its exact use?

1. **Dashboard & Metrics**: Monitor platform performance, active users, and system status (`/dashboard`).
2. **User Administration**: Inspect registered accounts, roles, verification status, and activity (`/users`).
3. **System Settings**: Configure administrative policies, security preferences, and environment parameters (`/settings`).
4. **Authentication**: Secure admin login flow integrated with Better Auth.

---

## ✍️ Monorepo Architectural Rules

- **Use `@org/ui` for Presentation**: All buttons, inputs, dialogs, popovers, badges, and tables must be imported from `@org/ui`.
- **Use `@org/internal-sdk` for Data & Auth**: Use `useAdminAuth`, `useUsers`, and auth hooks. Never make ad-hoc fetch or axios requests.
- **Centralized Toaster Notifications**: Always use `notify` from `@org/ui` (`notify.success`, `notify.error`, `notify.apiError`).

---

## 🏗️ Structure You Should Follow

```
apps/admin/src/
├── components/            # Admin-specific components (route guards, popovers)
│   ├── guest-route.tsx
│   ├── protected-route.tsx
│   └── profile-popover.tsx
├── layout/                # Layout shells
│   ├── auth-layout.tsx    # Admin login screen layout
│   └── dashboard-layout.tsx # Persistent sidebar, header, and content viewport
├── pages/                 # Admin view destinations
│   ├── auth/              # Admin login page
│   ├── dashboard/         # Metrics overview dashboard
│   ├── settings/          # System preferences & settings
│   └── users/             # User directory & permissions
├── app.tsx                # Route registry & guard hierarchy
├── index.css              # Global Tailwind CSS styling
└── main.tsx               # Application root mount & SDK Provider
```
