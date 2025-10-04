# KU Term Summary

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
</p>

<p align="center">
  <img src="https://img.shields.io/github/license/The1Re/KU-Term-Summary" alt="License" />
  <img src="https://img.shields.io/github/stars/The1Re/KU-Term-Summary" alt="Stars" />
  <img src="https://img.shields.io/github/forks/The1Re/KU-Term-Summary" alt="Forks" />
  <img src="https://img.shields.io/github/issues/The1Re/KU-Term-Summary" alt="Issues" />
</p>

## 📋 Description

## ✨ Features

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- Docker and Docker Compose

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/The1Re/KU-Term-Summary.git
   cd KU-Term-Summary
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment setup**

   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

4. **Start the database**

   ```bash
   docker-compose up -d
   ```

5. **Run database migrations**

   ```bash
   npx prisma migrate dev
   ```

6. **Seed the database (optional)**

   ```bash
   npm run prisma:seed
   ```

7. **Start the development server**
   ```bash
   npm run start:dev
   ```

The application will be available at `http://localhost:3000`

📖 **API Documentation**: `http://localhost:3000/docs`

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run start:dev          # Start in watch mode
npm run start:debug        # Start with debugging

# Production
npm run build              # Build the application
npm run start:prod         # Start production server

# Testing
npm run test               # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run tests with coverage
npm run test:e2e           # Run end-to-end tests

# Code Quality
npm run lint               # Run ESLint
npm run format             # Format code with Prettier

# Database
npm run prisma:seed        # Seed database
npx prisma studio          # Open Prisma Studio
npx prisma migrate dev     # Run migrations
```

## 📁 Project Structure

```
src/
├── main.ts                      # Application entry point
├── core
│   ├── config/                  # Configuration files
│   │   └── env.ts               # Environment configuration
│   └── database/                # Database configuration
│       ├── database.module.ts
│       └── database.service.ts
└── modules/                     # Feature modules (to be expanded)
    ├── ...
    └── app.module.ts            # Root application module

prisma/
├── schema.prisma                # Database schema
├── migrations/                  # Database migrations
├── seed.ts                      # Database seeding
└── schema/                      # Schema files
    └── students.prisma

test/                            # Test e2e files
├── app.e2e-spec.ts
└── jest-e2e.json
```

## 🔧 Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) - A progressive Node.js framework
- **Language**: [TypeScript](https://www.typescriptlang.org/) - JavaScript with static type definitions
- **Database**: [MySQL](https://www.mysql.com/) - Relational database
- **ORM**: [Prisma](https://www.prisma.io/) - Next-generation Node.js and TypeScript ORM
- **Validation**: [class-validator](https://github.com/typestack/class-validator) - Decorator-based validation
- **Documentation**: [Swagger](https://swagger.io/) - API documentation
- **Testing**: [Jest](https://jestjs.io/) - JavaScript testing framework
- **Containerization**: [Docker](https://www.docker.com/) - Container platform

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guide](./CONTRIBUTING.md) for details on our development process, coding standards, and how to submit pull requests.

### Quick Contribution Steps

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
