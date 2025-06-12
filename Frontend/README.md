# CivicBridgePulse Kenya

CivicBridgePulse Kenya is a comprehensive digital platform designed to bridge the policy-action divide and enhance civic participation in Kenya. The platform provides citizens with easy access to government policies, enables feedback submission, and facilitates transparent communication between the public and government institutions.

Demo video: https://share.vidyard.com/watch/xPaxnqYCvUeaCkq8iWzxQ6

Prototype design: https://www.canva.com/design/DAGqE4ZeFbA/OCDTbF5nrJjuvn2yDsHH5g/edit?utm_content=DAGqE4ZeFbA&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton 

## 🌟 Key Features

### Core Functionality
- **🏛️ Policy Access**: Browse and explore government policies with easy-to-understand summaries
- **💬 Citizen Feedback**: Submit feedback and opinions on policies and government initiatives
- **📊 Data Visualization**: Interactive charts and graphs showing policy engagement metrics
- **🔐 User Authentication**: Secure JWT-based authentication with role-based access control
- **📱 SMS Integration**: Real-time notifications via Africa's Talking API
- **🌐 Bilingual Support**: Full support for English and Kiswahili languages
- **📄 PDF Processing**: Automatic text extraction from policy documents
- **🔍 Search Functionality**: Full-text search across policy documents
- **📈 Analytics Dashboard**: Track user engagement with policies

### Security Features
- Password hashing with bcrypt
- JWT token expiration and refresh rotation
- Rate limiting (100 requests/minute)
- Input validation and sanitization
- Role-based access control (Citizen, Representative, Admin)
- Content Security Policy (CSP) and HTTPS enforcement

## 🏗️ System Architecture

```
Frontend (React.js) → API Gateway (Express.js) → Services Layer
                            ↓
                    Database Layer
                            ↓
          PostgreSQL + MongoDB + Redis
```

### Technology Stack

#### Frontend
- **Framework**: React.js 18.2.0
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Data Visualization**: D3.js
- **Internationalization**: i18next
- **PWA**: Workbox

#### Backend
- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Databases**: PostgreSQL, MongoDB, Redis
- **Authentication**: JSON Web Tokens (JWT)
- **SMS Integration**: Africa's Talking API
- **Translation**: Google Translate API

## 🚀 Getting Started

### Prerequisites

- Node.js (version 18.0 or higher)
- PostgreSQL 14+
- MongoDB 6+
- Redis 7+
- Docker (optional but recommended)
- Git

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone https://github.com/jmukamani/civicbridgeplus.git
   cd civicbridgeplus
   ```

2. **Start all services**
   ```bash
   docker-compose up --build
   ```

3. **Run database migrations**
   ```bash
   docker-compose exec backend npm run migrate
   ```

4. **Access the application**
   - Frontend: `http://localhost:5132`
   - Backend API: `http://localhost:3000`

### Manual Installation

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=3000
   JWT_SECRET=your_secure_jwt_secret
   JWT_REFRESH_SECRET=your_secure_refresh_secret
   POSTGRES_URL=postgres://user:password@localhost:5432/civicdb
   MONGODB_URL=mongodb://localhost:27017/civicdb
   REDIS_URL=redis://localhost:6379
   AFRICASTALKING_USERNAME=your_at_username
   AFRICASTALKING_API_KEY=your_at_api_key
   GOOGLE_TRANSLATE_API_KEY=your_google_api_key
   ```

4. **Start databases**
   ```bash
   docker-compose up -d postgres mongo redis
   ```

5. **Run migrations and start server**
   ```bash
   npm run migrate
   npm run seed
   npm run dev
   ```

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local`:
   ```env
   REACT_APP_API_BASE_URL=http://localhost:3000/api
   REACT_APP_ENVIRONMENT=development
   REACT_APP_ANALYTICS_ID=your-analytics-id
   ```

4. **Start development server**
   ```bash
   npm start
   ```

## 📁 Project Structure

```
civicbridgeplus/
├── backend/                    # Backend API server
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── controllers/       # Route controllers
│   │   ├── middleware/        # Express middleware
│   │   ├── models/           # Database models
│   │   ├── routes/           # Express routes
│   │   ├── services/         # Business logic
│   │   └── utils/            # Utility functions
│   ├── migrations/           # Database migrations
│   ├── tests/               # Backend tests
│   └── docker-compose.yml   # Database services
├── frontend/                  # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── store/           # Redux store
│   │   ├── hooks/           # Custom React hooks
│   │   ├── locales/         # Translation files
│   │   ├── services/        # API service functions
│   │   └── utils/           # Helper functions
│   └── public/              # Static assets
├── docs/                     # Documentation
├── .github/workflows/        # CI/CD pipelines
└── README.md                # This file
```

## 🔗 API Documentation

### Authentication Endpoints

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/auth/register` | POST | Register new user | Public |
| `/api/auth/login` | POST | Authenticate user | Public |
| `/api/auth/refresh` | POST | Refresh access token | Public |

### Policy Management Endpoints

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/policies` | GET | List all policies | Public |
| `/api/policies` | POST | Create new policy | Admin |
| `/api/policies/:id` | GET | Get policy details | Public |
| `/api/policies/:id` | PUT | Update policy | Admin |
| `/api/policies/:id` | DELETE | Delete policy | Admin |

### Sample API Usage

**User Registration:**
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

**Policy Creation:**
```bash
POST /api/policies
Content-Type: multipart/form-data

{
  "title": "Urban Development Plan",
  "category": "Infrastructure",
  "document": <PDF_FILE>
}
```

## 🗄️ Database Schema

### PostgreSQL Tables

**Users Table:**
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

**Policies Table:**
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

### MongoDB Collections

**Policy Content Schema:**
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

**Backend Tests:**
```bash
cd backend
npm test                    # Run all tests
npm test -- unit          # Unit tests only
npm test -- integration   # Integration tests only
npm test -- --coverage    # With coverage report
```

**Frontend Tests:**
```bash
cd frontend
npm test                   # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage
```

### Test Coverage

We maintain 85%+ test coverage for all critical paths. Coverage reports are generated in the `coverage/` directory after running tests.

## 🌐 Internationalization

The application supports:
- **English** (default)
- **Kiswahili**

### Adding Translations

1. Add keys to `frontend/src/locales/en/common.json` and `frontend/src/locales/sw/common.json`
2. Use in components:

```javascript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t('welcome.title')}</h1>;
}
```

## 🚀 Deployment

### Azure Deployment (Recommended for Kenya)

The application is optimized for deployment in Azure's South Africa North region to minimize latency for Kenyan users.

**Deployment Architecture:**
```
Internet → Azure CDN → Azure Static Web Apps (Frontend)
                  ↓
              Azure App Service (Backend API)
                  ↓
              Azure Database for PostgreSQL
              Azure Cosmos DB (MongoDB API)
              Azure Cache for Redis
```

### CI/CD Pipeline

Our GitHub Actions workflow includes:

1. **Test Stage**: Run unit and integration tests
2. **Build Stage**: Create Docker containers
3. **Deploy Stage**: Deploy to staging/production environments
4. **Monitor Stage**: Run smoke tests and health checks

### Environment Configuration

Create environment-specific files:
- `.env.development`
- `.env.staging`
- `.env.production`

### Performance Targets

- **First Contentful Paint**: < 2 seconds
- **Time to Interactive**: < 5 seconds on 3G
- **Lighthouse PWA Score**: > 90
- **Accessibility Score**: > 95

## 🔐 Security & Compliance

### Security Features
- HTTPS enforcement across all environments
- JWT-based authentication with refresh tokens
- Rate limiting and input validation
- Role-based access control
- Regular security audits and dependency updates

### Kenya Data Protection Act Compliance
- Data residency requirements met
- Privacy policy implementation
- User consent management
- Data retention policies

### Government Standards
- WCAG 2.1 AA accessibility compliance
- Multi-language support verification
- Performance benchmarks adherence

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests and linting**
   ```bash
   # Backend
   cd backend && npm test && npm run lint
   
   # Frontend
   cd frontend && npm test && npm run lint
   ```
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style (ESLint/Prettier configurations)
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure accessibility compliance

## 🐛 Troubleshooting

### Common Issues

**Database Connection Issues:**
```bash
# Reset database containers
docker-compose down
docker-compose up -d postgres mongo redis
```

**Frontend Build Errors:**
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Backend Service Errors:**
```bash
# Check service logs
docker-compose logs backend
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


**Built with ❤️ for Kenya's digital governance future**