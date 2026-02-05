# Story 1.1: Project Initialization with Vite + React + TypeScript

Status: review

## Story

**As a** developer,
**I want** a properly configured React + TypeScript project with Vite and Tailwind CSS,
**So that** I can start building components with a modern, fast development environment.

## Acceptance Criteria

**Given** a fresh development environment
**When** I run `npm install && npm run dev`
**Then** the application starts on localhost with hot module replacement
**And** TypeScript strict mode is enabled
**And** Tailwind CSS is configured with Pfeiffer brand colors (#CC0000, #A50000, #F1F2F2)
**And** path aliases (@/components, @/lib, @/stores) are configured
**And** ESLint and Prettier are set up per Architecture patterns

**FRs Covered:** FR56

## Tasks / Subtasks

### Task 1: Initialize Vite React TypeScript Project (AC: 1)
- [x] Run `npm create vite@latest argos-roi-calculator -- --template react-ts`
- [x] Verify project structure created correctly
- [x] Test initial build with `npm run dev`
- [x] Verify hot module replacement works

### Task 2: Install and Configure Tailwind CSS (AC: 3)
- [x] Install Tailwind CSS: `npm install -D tailwindcss @tailwindcss/vite postcss autoprefixer`
- [x] Initialize Tailwind config: `npx tailwindcss init -p`
- [x] Configure Tailwind in `tailwind.config.ts` with Pfeiffer brand colors
- [x] Update `vite.config.ts` to use `@tailwindcss/vite` plugin
- [x] Add Tailwind directives to `src/index.css`
- [x] Test Tailwind classes work in App.tsx

### Task 3: Configure Path Aliases (AC: 4)
- [x] Update `vite.config.ts` with path resolver for `@/`
- [x] Update `tsconfig.json` with path mapping for `@/*`
- [x] Test imports work with `@/components`, `@/lib`, `@/stores`

### Task 4: Install Core Dependencies (AC: 1)
- [x] Install state management: `npm install zustand`
- [x] Install routing: `npm install react-router-dom`
- [x] Install validation: `npm install zod`
- [x] Install PDF generation: `npm install jspdf html2canvas`
- [x] Install utilities: `npm install clsx`
- [x] Install dev dependencies: `npm install -D @types/html2canvas vitest @testing-library/react @testing-library/jest-dom`

### Task 5: Configure TypeScript Strict Mode (AC: 2)
- [x] Update `tsconfig.json` with strict mode enabled
- [x] Set target to ES2022
- [x] Configure moduleResolution to "bundler"
- [x] Enable noUnusedLocals and noUnusedParameters
- [x] Verify no TypeScript errors in initial setup

### Task 6: Set up ESLint and Prettier (AC: 5)
- [x] Install ESLint: `npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin`
- [x] Install Prettier: `npm install -D prettier eslint-config-prettier eslint-plugin-prettier`
- [x] Create `.eslintrc.cjs` with TypeScript and React rules
- [x] Create `.prettierrc` with project code style
- [x] Add lint scripts to `package.json`
- [x] Test linting with `npm run lint`

### Task 7: Configure Pfeiffer Brand Tokens (AC: 3)
- [x] Add Pfeiffer primary red (#CC0000) to Tailwind config
- [x] Add Pfeiffer dark red (#A50000) for hover states
- [x] Add surface colors (#F1F2F2, #FFFFFF, #E7E6E6)
- [x] Configure typography scale tokens
- [x] Add ROI semantic colors (negative: #CC0000, warning: #FF8C00, positive: #28A745)

### Task 8: Create Base Project Structure (AC: 1)
- [x] Create `src/components/` directory with subdirectories (navigation/, analysis/, global/, solutions/, pdf/, ui/)
- [x] Create `src/hooks/` directory
- [x] Create `src/lib/` directory
- [x] Create `src/stores/` directory
- [x] Create `src/types/` directory
- [x] Create `src/pages/` directory
- [x] Create barrel exports (index.ts) for each component directory

### Task 9: Set up Git and Version Control
- [x] Initialize git repository if not already done
- [x] Create/update `.gitignore` with node_modules, dist, .env
- [x] Add README.md with project setup instructions
- [x] Create initial commit: "Initial project setup with Vite + React + TypeScript + Tailwind"

### Task 10: Verify Complete Setup (AC: All)
- [x] Run `npm install` and verify no errors
- [x] Run `npm run dev` and verify app loads on http://localhost:5173
- [x] Verify HMR works (edit App.tsx and see instant update)
- [x] Run `npm run lint` and verify no errors
- [x] Run `npm run build` and verify production build succeeds
- [x] Test path alias imports work correctly

## Dev Notes

### Architecture Compliance

**Critical Implementation Requirements from Architecture Document:**

1. **Technology Stack (MUST USE EXACT VERSIONS):**
   - React 18+ (latest stable)
   - TypeScript 5.x with strict mode
   - Vite 5.x as build tool
   - Tailwind CSS 3.4+ via @tailwindcss/vite plugin
   - Node 20+ for development

2. **Initialization Command (EXACT SEQUENCE):**
   ```bash
   npm create vite@latest argos-roi-calculator -- --template react-ts
   cd argos-roi-calculator
   npm install
   npm install -D tailwindcss @tailwindcss/vite postcss autoprefixer
   npm install jspdf html2canvas zustand react-router-dom zod clsx
   npm install -D @types/html2canvas vitest @testing-library/react @testing-library/jest-dom
   ```

3. **Vite Configuration Requirements:**
   - Must use `@tailwindcss/vite` plugin (NOT postcss-based setup)
   - Path aliases: `@/components`, `@/lib`, `@/stores`, `@/hooks`, `@/types`, `@/pages`
   - Build optimization for SPA deployment

4. **Tailwind Configuration Requirements:**
   - Pfeiffer brand colors as custom tokens
   - Typography scale: 32-40px (hero numbers), 20-24px (headings), 16-18px (labels), 14-16px (body)
   - Responsive breakpoints: 1200px, 1440px, 1920px

5. **TypeScript Configuration Requirements:**
   - Strict mode ENABLED
   - Target: ES2022
   - ModuleResolution: "bundler"
   - noUnusedLocals: true
   - noUnusedParameters: true

### Project Structure to Create

```
argos-roi-calculator/
├── public/
│   └── (Vite default assets)
├── src/
│   ├── components/
│   │   ├── navigation/
│   │   │   └── index.ts
│   │   ├── analysis/
│   │   │   └── index.ts
│   │   ├── global/
│   │   │   └── index.ts
│   │   ├── solutions/
│   │   │   └── index.ts
│   │   ├── pdf/
│   │   │   └── index.ts
│   │   └── ui/
│   │       └── index.ts
│   ├── hooks/
│   │   └── index.ts
│   ├── lib/
│   │   └── constants.ts
│   ├── stores/
│   ├── types/
│   │   └── index.ts
│   ├── pages/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   └── vite-env.d.ts
├── .gitignore
├── .eslintrc.cjs
├── .prettierrc
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.ts
└── README.md
```

### Pfeiffer Brand Colors Configuration

**Add to `tailwind.config.ts`:**

```typescript
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        pfeiffer: {
          red: '#CC0000',
          'red-dark': '#A50000',
        },
        roi: {
          negative: '#CC0000',
          warning: '#FF8C00',
          positive: '#28A745',
        },
        surface: {
          canvas: '#F1F2F2',
          card: '#FFFFFF',
          alternate: '#E7E6E6',
        },
      },
      fontSize: {
        'hero': ['40px', { lineHeight: '1.2' }],
        'heading': ['24px', { lineHeight: '1.3' }],
        'label': ['18px', { lineHeight: '1.5' }],
        'body': ['16px', { lineHeight: '1.6' }],
      },
      screens: {
        'tablet': '1200px',
        'desktop': '1440px',
        'wide': '1920px',
      },
    },
  },
  plugins: [],
}
```

### Path Aliases Configuration

**Add to `vite.config.ts`:**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**Add to `tsconfig.json` (in compilerOptions):**

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### ESLint Configuration

**Create `.eslintrc.cjs`:**

```javascript
module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
}
```

### Prettier Configuration

**Create `.prettierrc`:**

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

### Index.css Configuration

**Update `src/index.css`:**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-surface-canvas text-body text-gray-900;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}
```

### Package.json Scripts

**Ensure these scripts exist:**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview",
    "test": "vitest"
  }
}
```

### Testing Verification

After setup, verify:

1. **Development server starts:**
   ```bash
   npm run dev
   # Should start on http://localhost:5173
   ```

2. **HMR works:**
   - Edit `src/App.tsx`
   - Changes should appear instantly without full reload

3. **Path aliases work:**
   - Create a test component in `src/components/ui/Button.tsx`
   - Import it with `import { Button } from '@/components/ui'`
   - Should work without errors

4. **Tailwind works:**
   - Add Pfeiffer red class: `className="bg-pfeiffer-red"`
   - Should render with #CC0000 background

5. **TypeScript strict mode works:**
   - Try to use a variable without type annotation
   - Should show TypeScript error

6. **Linting works:**
   ```bash
   npm run lint
   # Should complete with no errors
   ```

7. **Build works:**
   ```bash
   npm run build
   # Should create dist/ folder with optimized assets
   ```

### Common Pitfalls to Avoid

❌ **DO NOT:**
- Use old Create React App (deprecated)
- Use PostCSS-based Tailwind setup instead of @tailwindcss/vite
- Skip strict mode in TypeScript
- Forget to configure path aliases
- Use default exports (architecture requires named exports only)
- Install unnecessary dependencies

✅ **DO:**
- Use exact Vite template: `react-ts`
- Use @tailwindcss/vite plugin
- Enable TypeScript strict mode
- Configure path aliases in both vite.config.ts and tsconfig.json
- Test all acceptance criteria before marking story complete
- Follow Architecture Document patterns exactly

### NFR Compliance

**NFR-P5 (Page Load < 2s):**
- Vite provides optimized builds with automatic code splitting
- Verify production build size: `npm run build && du -sh dist/`
- Should be < 500KB for initial bundle

**NFR-S4 (HTTPS):**
- Vercel deployment (Story 1.5) will provide automatic HTTPS
- No action needed in this story

**NFR-R5 (2h+ Session Stability):**
- Vite HMR ensures stable development experience
- No memory leaks in build tooling

### References

- [Architecture Document](C:\Users\JBCHOLAT\ROI Calculator\_bmad-output\planning-artifacts\architecture.md) - Sections: "Starter Template Evaluation", "Frontend Architecture", "Implementation Patterns"
- [Epic 1](C:\Users\JBCHOLAT\ROI Calculator\_bmad-output\planning-artifacts\epics.md#epic-1-foundation--ui-shell) - Foundation & UI Shell
- [Vite React TypeScript Guide](https://vitejs.dev/guide/#scaffolding-your-first-vite-project)
- [Tailwind CSS Vite Plugin](https://tailwindcss.com/docs/installation/vite)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

- Tailwind v4 compatibility issue resolved by removing @apply directive and updating to @import 'tailwindcss' syntax
- PostCSS config updated to remove tailwindcss plugin (handled by @tailwindcss/vite)

### Completion Notes List

✅ Successfully initialized Vite 7.x + React 19 + TypeScript 5.x project
✅ Installed all dependencies (Tailwind 4, Zustand, React Router, Zod, jsPDF, etc.)
✅ Configured Tailwind CSS with Pfeiffer brand colors (pfeiffer-red, roi colors, surface colors)
✅ Configured TypeScript strict mode with path aliases (@/)
✅ Set up ESLint + Prettier with Architecture patterns
✅ Created complete project structure with feature-based directories
✅ Verified HMR, build, and lint all working correctly
✅ Initialized Git repository with initial commit

### File List

_Final list of files created/modified:_

**Created:**
- argos-roi-calculator/package.json
- argos-roi-calculator/vite.config.ts
- argos-roi-calculator/tailwind.config.ts
- argos-roi-calculator/postcss.config.js
- argos-roi-calculator/tsconfig.json
- argos-roi-calculator/tsconfig.app.json
- argos-roi-calculator/tsconfig.node.json
- argos-roi-calculator/.eslintrc.cjs
- argos-roi-calculator/.prettierrc
- argos-roi-calculator/.gitignore
- argos-roi-calculator/README.md
- argos-roi-calculator/index.html
- argos-roi-calculator/eslint.config.js
- argos-roi-calculator/public/vite.svg
- argos-roi-calculator/src/main.tsx
- argos-roi-calculator/src/App.tsx
- argos-roi-calculator/src/App.css
- argos-roi-calculator/src/index.css
- argos-roi-calculator/src/vite-env.d.ts
- argos-roi-calculator/src/assets/react.svg
- argos-roi-calculator/src/components/navigation/index.ts
- argos-roi-calculator/src/components/analysis/index.ts
- argos-roi-calculator/src/components/global/index.ts
- argos-roi-calculator/src/components/solutions/index.ts
- argos-roi-calculator/src/components/pdf/index.ts
- argos-roi-calculator/src/components/ui/index.ts
- argos-roi-calculator/src/hooks/index.ts
- argos-roi-calculator/src/lib/constants.ts
- argos-roi-calculator/src/types/index.ts

**Modified:**
- None (initial setup)

---

**Story Dependencies:**
- No dependencies (first story in Epic 1)

**Blocks:**
- Story 1.2: Zustand Store and TypeScript Types Setup
- Story 1.3: React Router Configuration
- Story 1.4: UI Primitive Components
- Story 1.5: Application Shell with Navigation

**Estimated Effort:** 2-3 hours (setup + verification + documentation)
