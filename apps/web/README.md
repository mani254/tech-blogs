# `@org/web` — Developer Guide (Next.js 15 Web Application)

This application is the **modern responsive frontend web application** for the TechBlogs monorepo. It is built with **Next.js 15 (App Router)**, **React 19**, **Tailwind CSS**, and **TanStack Query**.

---

## 📌 What is this application?

`@org/web` is the user-facing presentation layer of the Technical Blogging Platform. It renders fast, SEO-optimized web pages using Server and Client Components, manages application routing via Next.js App Router, and integrates seamlessly with `@org/ui` and `@org/internal-sdk`.

---

## 🎯 What is its exact use?

Use `@org/web` exclusively for public-facing page composition and user interaction:

1. **Page Composition**: Assemble full-screen application views by combining reusable UI primitives from `@org/ui` with data query hooks from `@org/internal-sdk`.
2. **App Router**: Map URL routes via file-system based routing in `src/app/` (`page.tsx`, `layout.tsx`, `(auth)/...`).
3. **Application Shells**: Implement persistent layouts, navigation bars, headers, and footers.

---

## ✍️ What should you write here?

When adding a new route or screen to the blogging platform, add your code to `src/app/`:

- **`src/app/<route>/page.tsx`**: Page components representing specific URL routes.
- **`src/app/<route>/layout.tsx`**: Layout components wrapping nested sub-routes.
- **`src/components/`**: Client or server presentation components specific to the web app.

### What should you NEVER write here?

- **No Direct Axios / Fetch Calls**: Never write raw `fetch()`, `axios.get()`, or ad-hoc TanStack Query `queryFn` implementations inside page components. Put all API calls and hooks in `@org/internal-sdk`.
- **No Reusable UI Primitives**: Do not define standard buttons, input fields, badges, or dialog primitives in this app. Put reusable primitives in `@org/ui`.
- **No Direct Database Imports**: NEVER import `@org/dal` in this application. All data must be fetched through `@org/internal-sdk` calling `@org/api`.

---

## 🏗️ Structure You Should Follow

```
apps/web/src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx         # Centered authentication layout shell
│   │   ├── login/page.tsx     # Sign-in page
│   │   ├── register/page.tsx  # 3-step OTP verified registration
│   │   └── forgot-password/page.tsx # Password reset page
│   ├── globals.css            # Tailwind directives & CSS variables
│   ├── layout.tsx             # Root layout with Providers, Navbar & Footer
│   └── page.tsx               # TechBlogs homepage & hero showcase
├── components/
│   ├── footer.tsx             # Shared web application footer
│   ├── navbar.tsx             # Navigation header with auth controls
│   └── providers.tsx          # Client SDK & Toaster provider wrapper
└── hooks/
    └── use-debounce.ts        # UI-specific debouncing hook
```
