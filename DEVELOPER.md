# Developer Documentation

Detailed documentation for developers working on the PhotoIdentifier platform.

## Table of Contents

- [Architecture](#architecture)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

## 🏗️ Architecture

### Monorepo Structure

This project uses **Turborepo** for monorepo management. It enables:

- Shared packages across applications
- Efficient caching and builds
- Parallel task execution
- Consistent tooling

### Package Dependencies

```
@photoidentifier/web
  └── @photoidentifier/utils
      └── @photoidentifier/types
```

- **@photoidentifier/types**: Shared TypeScript type definitions
- **@photoidentifier/utils**: Shared utility functions and helpers
- **@photoidentifier/web**: Next.js 14 web application

### Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS with custom design tokens
- **Linting**: ESLint with TypeScript ESLint plugin
- **Formatting**: Prettier
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Build Tool**: Turborepo
- **Container**: Docker

### Design System

The platform uses a custom design system with:

- **Color Tokens**: Primary, secondary, neutral, and semantic colors
- **Typography Tokens**: Font sizes, weights, and families
- **Spacing Tokens**: Consistent spacing scale (4px base unit)
- **Component Tokens**: Border radius, shadows, transitions

Design tokens are defined in `apps/web/styles/design-tokens.css` and consumed by Tailwind CSS.

## 💻 Development Workflow

### Setting Up Your Development Environment

1. **Clone and setup**
   ```bash
   git clone https://github.com/itsaslamopenclawdata/Super_Prismora.git
   cd Super_Prismora
   npm install
   cp .env.example .env
   ```

2. **Start services with Docker**
   ```bash
   docker-compose up -d
   ```

3. **Run database migrations**
   ```bash
   # Automatically run by docker-compose on first start
   # Or manually:
   psql -U photoidentifier -d photoidentifier -f scripts/init-db.sql
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

### Adding a New Page

1. Create a new directory in `apps/web/app/`
2. Add a `page.tsx` file
3. The route will automatically be available at `/your-page`

Example:
```typescript
// apps/web/app/new-page/page.tsx
export default function NewPage() {
  return <div>New Page Content</div>;
}
```

### Adding a New Shared Type

1. Edit `packages/types/src/index.ts`
2. Add your interface or type
3. It will automatically be available in all apps

Example:
```typescript
export interface MyType {
  id: string;
  name: string;
}
```

### Adding a New Shared Utility

1. Edit `packages/utils/src/index.ts`
2. Add your function
3. Export it from the file

Example:
```typescript
export function myUtility(value: string): string {
  return value.toUpperCase();
}
```

### Working with Environment Variables

Import the `getEnv` function from `@photoidentifier/utils`:

```typescript
import { getEnv } from '@photoidentifier/utils';

const env = getEnv();
console.log(env.nodeEnv); // 'development' | 'production' | 'test'
```

### Database Access (Coming Soon)

We'll be adding database access patterns in future tracks. For now, the database schema is defined in `scripts/init-db.sql`.

## 📏 Coding Standards

### TypeScript

- Use strict TypeScript configuration
- Avoid `any` type (use `unknown` if necessary)
- Define proper return types for functions
- Use interfaces for object shapes

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
}

function getUser(id: string): User | undefined {
  // Implementation
}

// ❌ Bad
function getUser(id: any): any {
  // Implementation
}
```

### React/Next.js

- Use functional components with hooks
- Use the App Router (pages in `app/` directory)
- Avoid class components
- Use TypeScript props

```typescript
// ✅ Good
interface Props {
  title: string;
  onClick: () => void;
}

export function Button({ title, onClick }: Props) {
  return <button onClick={onClick}>{title}</button>;
}

// ❌ Bad
class Button extends Component {
  render() {
    return <button>{this.props.title}</button>;
  }
}
```

### Styling

- Use Tailwind CSS classes
- Prefer utility classes over custom CSS
- Use design tokens when possible

```typescript
// ✅ Good
<div className="bg-primary-500 text-white p-4 rounded-lg">

// ❌ Bad
<div style={{ backgroundColor: '#0ea5e9', color: 'white' }}>
```

### Naming Conventions

- **Files**: kebab-case (`my-component.tsx`)
- **Components**: PascalCase (`MyComponent`)
- **Functions**: camelCase (`myFunction`)
- **Constants**: UPPER_SNAKE_CASE (`API_URL`)
- **Types/Interfaces**: PascalCase (`User`, `PhotoMetadata`)

### Git Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: fix bug in existing feature
docs: update documentation
style: formatting changes
refactor: code refactoring
test: add or update tests
chore: build process or auxiliary tool changes
```

Examples:
```bash
git commit -m "feat: add photo upload page"
git commit -m "fix: resolve memory leak in image processing"
git commit -m "docs: update API documentation"
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests for specific package
cd apps/web && npm test

# Run tests in watch mode
npm run test -- --watch
```

### Writing Tests (Coming Soon)

We'll be adding comprehensive test coverage in future tracks. Stay tuned!

## 🔍 Troubleshooting

### Port Already in Use

If port 3000 is already in use:
```bash
# Find the process using the port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### Database Connection Issues

1. Check if PostgreSQL is running:
   ```bash
   docker-compose ps postgres
   ```

2. Check database logs:
   ```bash
   docker-compose logs postgres
   ```

3. Restart the database:
   ```bash
   docker-compose restart postgres
   ```

### Redis Connection Issues

1. Check if Redis is running:
   ```bash
   docker-compose ps redis
   ```

2. Test Redis connection:
   ```bash
   docker-compose exec redis redis-cli ping
   # Should respond with "PONG"
   ```

### Build Errors

If you encounter build errors:

1. Clean build artifacts:
   ```bash
   npm run clean
   ```

2. Clear Turborepo cache:
   ```bash
   rm -rf .turbo
   ```

3. Reinstall dependencies:
   ```bash
   rm -rf node_modules apps/*/node_modules packages/*/node_modules
   npm install
   ```

### TypeScript Errors

If TypeScript shows errors:

1. Check your imports match the exported types
2. Ensure you're using the correct path aliases (`@photoidentifier/types`, `@photoidentifier/utils`)
3. Verify your tsconfig.json is correct

## ❓ FAQ

### Q: Why use Turborepo?

A: Turborepo provides:
- Faster builds through intelligent caching
- Parallel task execution
- Shared dependencies across packages
- Consistent tooling and configurations

### Q: Can I use yarn or pnpm instead of npm?

A: Yes! The project supports npm, yarn, pnpm, and bun. Just use your preferred package manager for all commands.

### Q: How do I add a new dependency?

A: For package-specific dependencies:
```bash
cd apps/web
npm install package-name
```

For shared dependencies (used across multiple packages):
```bash
npm install -w package-name
```

### Q: What are the design tokens?

A: Design tokens are CSS custom properties that define:
- Colors (primary, secondary, neutral, semantic)
- Typography (sizes, weights, families)
- Spacing (scale and layout)
- Border radius, shadows, transitions

They're defined in `apps/web/styles/design-tokens.css` and used by Tailwind CSS.

### Q: How do I deploy to production?

A: See the [README.md](README.md#deployment) section for detailed deployment instructions.

### Q: Where can I find the API documentation?

A: API documentation will be added in future tracks as we build out the backend services.

### Q: How do I reset the database?

A:
```bash
# Stop services
docker-compose down

# Remove volumes (this deletes all data)
docker volume rm super_prismora_postgres_data super_prismora_redis_data

# Start services again
docker-compose up -d
```

### Q: Can I contribute?

A: Absolutely! Please see the [Contributing](README.md#contributing) section in the README.

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [React Documentation](https://react.dev)

---

Happy coding! 🚀
