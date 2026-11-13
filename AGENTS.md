<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->

# Monorepo Code Organization & Architecture Rules

Strictly respect where code belongs in this workspace:

1. **`packages/shared` (@org/shared)**:
   - Universal TypeScript types, DTO contracts, enums, and pure universal algorithms (e.g., `generateSlug`, `formatBytes`, MIME type maps). Zero dependencies.
   - Both backend and frontend import from here.

2. **`packages/dal` (@org/dal)**:
   - Database schemas, Mongoose models, and query repositories (`AssetRepository`, `CategoryRepository`, `TagRepository`, etc.).
   - Exclusively imported by `@org/api`. NEVER import `@org/dal` in frontend applications or `@org/internal-sdk`.

3. **`packages/ui` (@org/ui)**:
   - Shared presentation components, design system primitives, and the **centralized notification/toaster system** (`notify`, `<Toaster />`, `ToastCard`).
   - NEVER create localized notification wrappers in `apps/`. All frontend apps must import `notify` from `@org/ui`.

4. **`packages/internal-sdk` (@org/internal-sdk)**:
   - Frontend API client (`api-client.ts`), React Query hooks (`useCategories`, `useTags`, `useUploadAsset`, etc.), auth providers, and **client-side utilities (`packages/internal-sdk/src/utils/`)**.
   - NEVER write inline helper functions (such as slug generation or image file readers) inside page files. Place them in SDK utils and import them.
   - NEVER make direct ad-hoc `axios` or `fetch` calls in React components. All API communication must go through SDK hooks.

5. **`apps/api` (@org/api)**:
   - NestJS modules, controllers, business services, guards, and Cloudflare R2 integration.

6. **`apps/admin` (@org/admin) & `apps/web` (@org/web)**:
   - Presentation pages, routing, layouts, and feature views. Consume `@org/ui`, `@org/internal-sdk`, and `@org/shared`.
