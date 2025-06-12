# CivicBridge Plus Backend

A robust backend system for a civic engagement web application that bridges the policy-action divide. This API provides comprehensive functionality for user management, policy discussion, messaging, and analytics.

## 🚀 Features

### Core Functionality
- **User Authentication**: JWT-based authentication with refresh tokens
- **Role-Based Access Control**: Citizen, Representative, and Admin roles
- **Policy Management**: Create, read, update, and delete policy documents
- **PDF Processing**: Extract text from policy documents
- **Messaging System**: Threaded conversations with SMS notifications
- **Analytics Dashboard**: Track user engagement with policies
- **Search Functionality**: Full-text search across policy documents
- **Translation Service**: Multilingual support using Google Translate API
- **SMS Integration**: Africa's Talking API for notifications

### Security Features
- Password hashing with bcrypt
- JWT token expiration and refresh rotation
- Rate limiting (100 requests/minute)
- Input validation and sanitization
- Role-based access control
- Secure environment variable management

## 🛠 Technology Stack

### Core Technologies
- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Databases**:
  - PostgreSQL (relational data)
  - MongoDB (document storage)
  - Redis (session management)
- **Authentication**: JSON Web Tokens (JWT)

### Key Dependencies
```json
{
  "pg": "PostgreSQL client",
  "mongoose": "MongoDB ODM", 
  "redis": "Redis client",
  "jsonwebtoken": "JWT implementation",
  "bcrypt": "Password hashing",
  "@africastalking/africastalking": "SMS integration",
  "pdf-parse": "PDF text extraction",
  "express-rate-limit": "Rate limiting middleware",
  "jest": "Testing framework"
}
```

### Development Tools
- **Nodemon**: Auto-restart server during development
- **Prettier**: Code formatting
- **Supertest**: HTTP assertions for testing
- **Docker**: Containerization

## 🏗 System Architecture

```
Client App (Frontend)
         |
         v
   API Gateway (Express)
         |
    |----+----+----+----+
    |    |    |    |    |
   Auth User Policy Msg Analytics
Service Service Service Service Service
         |
         v
   Database Layer
         |
    |----+----+
    |    |    |
PostgreSQL MongoDB Redis
(Users,    (Policy  (Sessions,
Policies,  Content, Caching)
Messages)  Feedback)
```

## 📦 Installation

### Prerequisites
- Node.js v18+
- PostgreSQL 14+
- MongoDB 6+
- Redis 7+
- Docker (optional)

### Local Setup

```bash
# Clone the repository
git clone https://github.com/jmukamani/civicbridgeplus.git
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Update .env with your configuration values
nano .env

# Start databases using Docker
docker-compose up -d postgres mongo redis

# Run database migrations
npm run migrate

# Seed development data
npm run seed

# Start development server
npm run dev
```

### Docker Setup

```bash
# Build and start all services
docker-compose up --build

# Run migrations inside app container
docker-compose exec app npm run migrate

# Run tests
docker-compose exec app npm test
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Application
NODE_ENV=development
PORT=3000

# Authentication
JWT_SECRET=your_secure_jwt_secret
JWT_REFRESH_SECRET=your_secure_refresh_secret

# Databases
POSTGRES_URL=postgres://user:password@localhost:5432/civicdb
MONGODB_URL=mongodb://localhost:27017/civicdb
REDIS_URL=redis://localhost:6379

# Third-party Services
AFRICASTALKING_USERNAME=your_at_username
AFRICASTALKING_API_KEY=your_at_api_key
GOOGLE_TRANSLATE_API_KEY=your_google_api_key
```

### Project Structure

```
backend/
├── src/                    # Application source code
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Express middleware
│   ├── models/           # Database models
│   │   ├── postgres/     # PostgreSQL models
│   │   └── mongodb/      # MongoDB schemas
│   ├── routes/           # Express route definitions
│   ├── services/         # Business logic services
│   ├── utils/            # Utility functions
│   ├── app.js            # Express application
│   └── server.js         # Server entry point
├── docker/               # Docker configuration
│   ├── postgres/         # PostgreSQL init scripts
│   └── mongo/            # MongoDB init scripts
├── .github/workflows/    # CI/CD pipelines
├── migrations/           # Database migration scripts
├── tests/                # Test suites
├── Dockerfile           # Application Dockerfile
├── docker-compose.yml   # Multi-container setup
├── .env.example         # Environment variables template
├── .prettierrc          # Code formatting configuration
└── package.json         # Node.js dependencies
```

## 📖 API Documentation

### Authentication

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/auth/register` | POST | Register new user | Public |
| `/api/auth/login` | POST | Authenticate user | Public |
| `/api/auth/refresh` | POST | Refresh access token | Public |

#### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "phone": "+254700000000",
  "password": "securePassword123",
  "role": "citizen",
  "county": "Nairobi",
  "constituency": "Westlands"
}
```

### Policy Management

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/policies` | POST | Create new policy document | Admin |
| `/api/policies` | GET | List all policies | Public |
| `/api/policies/:id` | GET | Get policy details | Public |
| `/api/policies/:id` | PUT | Update policy document | Admin |
| `/api/policies/:id` | DELETE | Delete policy | Admin |

#### Create Policy
```bash
POST /api/policies
Content-Type: multipart/form-data

{
  "title": "Urban Development Plan",
  "category": "Infrastructure",
  "document": <PDF_FILE>
}
```

## 🗄 Database Schema

### PostgreSQL Models

#### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  hashed_password TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('citizen', 'rep', 'admin')),
  county VARCHAR(100),
  constituency VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Policies Table
```sql
CREATE TABLE policies (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### MongoDB Schemas

#### Policy Content Schema
```javascript
{
  policyId: { type: ObjectId, required: true },
  version: { type: Number, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm test -- unit

# Run integration tests only
npm test -- integration

# Run tests with coverage report
npm test -- --coverage
```

### Test Structure

```
tests/
├── unit/                 # Unit tests
│   ├── services/        # Service layer tests
│   ├── utils/           # Utility function tests
│   └── middleware/      # Middleware tests
├── integration/         # Integration tests
│   ├── auth/           # Authentication tests
│   ├── policies/       # Policy management tests
│   ├── messages/       # Messaging tests
│   └── analytics/      # Analytics tests
└── setup.js            # Test environment setup
```

### Test Coverage
We maintain 85%+ test coverage for all critical paths. Coverage reports are generated in the `coverage/` directory after running tests.

## 🚀 Deployment

### Docker Deployment

```bash
# Build the Docker image
docker build -t civic-bridge-backend .

# Run the container
docker run -d --name civic-app \
  -p 3000:3000 \
  --env-file .env \
  civic-bridge-backend
```

### CI/CD Pipeline

Our GitHub Actions workflow includes:

1. **Test**: Run unit and integration tests
2. **Build**: Create Docker container image
3. **Push**: Upload image to container registry
4. **Deploy (Staging)**: Deploy to staging environment
5. **Deploy (Production)**: Manual approval to production

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a new feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Create a new Pull Request

### Development Guidelines
- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
