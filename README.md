# PhotoIdentifier Platform

An AI-powered photo identification and management platform built with Next.js 14, TypeScript, and Turborepo.

## 🚀 Features

- **Photo Upload & Management**: Upload and organize your photo collection
- **AI-Powered Identification**: Automatically identify objects, faces, and text in photos
- **Smart Search**: Search photos by content, tags, and metadata
- **Collections**: Organize photos into custom collections
- **Modern UI**: Beautiful, responsive interface built with Tailwind CSS
- **Dark Mode**: Automatic dark mode based on system preferences

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🎯 Getting Started

### Prerequisites

- Node.js 18+ (we recommend using [nvm](https://github.com/nvm-sh/nvm))
- npm, yarn, pnpm, or bun
- Docker and Docker Compose (for local database)
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/itsaslamopenclawdata/Super_Prismora.git
   cd Super_Prismora
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠 Development Setup

### Using Docker Compose (Recommended)

This is the easiest way to set up the full development environment with PostgreSQL and Redis.

1. **Start all services**
   ```bash
   docker-compose up -d
   ```

2. **Check service status**
   ```bash
   docker-compose ps
   ```

3. **View logs**
   ```bash
   docker-compose logs -f
   ```

4. **Stop services**
   ```bash
   docker-compose down
   ```

Services available:
- **Web App**: http://localhost:3000
- **Adminer (DB UI)**: http://localhost:8080
  - Server: `postgres`
  - Username: `photoidentifier`
  - Password: `photoidentifier_dev_password`
  - Database: `photoidentifier`

### Manual Setup (Without Docker)

1. **Install PostgreSQL**
   - macOS: `brew install postgresql`
   - Ubuntu: `sudo apt-get install postgresql`
   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/)

2. **Create database**
   ```sql
   CREATE DATABASE photoidentifier;
   ```

3. **Run initialization script**
   ```bash
   psql -U your_username -d photoidentifier -f scripts/init-db.sql
   ```

4. **Install Redis**
   - macOS: `brew install redis`
   - Ubuntu: `sudo apt-get install redis-server`
   - Windows: Use WSL or Docker

## 📁 Project Structure

```
Super_Prismora/
├── apps/
│   └── web/              # Next.js 14 web application
│       ├── app/          # App router pages
│       ├── components/   # React components
│       ├── lib/          # Utility libraries
│       └── styles/       # Global styles
├── packages/
│   ├── types/           # Shared TypeScript types
│   └── utils/           # Shared utility functions
├── scripts/             # Utility scripts
├── docker-compose.yml   # Docker services configuration
├── Dockerfile          # Docker image configuration
├── turbo.json          # Turborepo configuration
└── package.json        # Root package.json
```

## 🚦 Available Scripts

### Root Level Scripts

- `npm run dev` - Start development servers for all apps
- `npm run build` - Build all apps and packages
- `npm run lint` - Lint all packages
- `npm run test` - Run tests across all packages
- `npm run format` - Format code with Prettier
- `npm run clean` - Clean build artifacts

### Web App Scripts

- `cd apps/web && npm run dev` - Start Next.js dev server
- `cd apps/web && npm run build` - Build for production
- `cd apps/web && npm run lint` - Run ESLint
- `cd apps/web && npm run start` - Start production server

## ⚙️ Environment Variables

Create a `.env` file in the root directory (copy from `.env.example`):

### Required

```bash
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000/api
DATABASE_URL=postgresql://photoidentifier:password@localhost:5432/photoidentifier
REDIS_URL=redis://localhost:6379
```

### Optional (AI Services)

```bash
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
REPLICATE_API_TOKEN=your_replicate_api_token
```

### Optional (Storage)

```bash
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
S3_BUCKET=photoidentifier-uploads
```

### Optional (Authentication)

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

## 🚢 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to `main` branch

### Docker

```bash
# Build for production
docker build --target production -t photoidentifier .

# Run container
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL=your_prod_db_url \
  -e REDIS_URL=your_prod_redis_url \
  photoidentifier
```

### Manual

```bash
# Build
npm run build

# Start production server
npm run start
```

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm run lint`)
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow the existing code style (Prettier is configured)
- Write meaningful commit messages following [Conventional Commits](https://www.conventionalcommits.org/)
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Turborepo](https://turbo.build/repo)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)

## 📞 Support

For questions or issues, please open an issue on GitHub.

---

Built with ❤️ using [PhotoIdentifier](https://github.com/itsaslamopenclawdata/Super_Prismora)
