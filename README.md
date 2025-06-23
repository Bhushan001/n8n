# AI Workflow App

A modern, full-stack AI workflow application built with Angular 19 and Spring Boot 3, featuring visual workflow design, execution monitoring, and AI-powered automation.

## 🚀 Features

- **Visual Workflow Designer**: Drag-and-drop interface for creating complex workflows
- **AI Integration**: Built-in AI agents for intelligent workflow automation
- **Real-time Execution**: Live monitoring of workflow executions with WebSocket support
- **User Authentication**: JWT-based authentication with refresh tokens
- **Role-based Access Control**: Multi-level user permissions
- **Workflow Versioning**: Track changes and rollback capabilities
- **Execution History**: Comprehensive logging and analytics
- **API Integration**: RESTful APIs with comprehensive Postman collection
- **Docker Support**: Containerized deployment with Docker Compose

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Angular 19    │    │  Spring Boot 3  │    │   PostgreSQL    │
│   Frontend      │◄──►│   Backend       │◄──►│   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   WebSocket     │    │   RabbitMQ      │    │   Redis Cache   │
│   Real-time     │    │   Message Queue │    │   (Optional)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **Angular 19** - Modern frontend framework
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **ngx-graph** - Graph visualization library
- **D3.js** - Data visualization

### Backend
- **Spring Boot 3.5.3** - Java application framework
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Database access layer
- **Spring WebSocket** - Real-time communication
- **PostgreSQL** - Primary database
- **RabbitMQ** - Message queuing
- **JWT** - Token-based authentication

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy and static file serving

## 📋 Prerequisites

- **Java 21** or higher
- **Node.js 18** or higher
- **PostgreSQL 15** or higher
- **Docker** and **Docker Compose** (for containerized deployment)
- **Maven** (for backend development)
- **Angular CLI** (for frontend development)

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd n8n
   ```

2. **Start the application stack**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:80
   - Backend API: http://localhost:8080
   - RabbitMQ Management: http://localhost:15672
   - PostgreSQL: localhost:5432

### Option 2: Local Development

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd core
   ```

2. **Configure database**
   - Create PostgreSQL database: `ai_workflow_db`
   - Update `src/main/resources/application.yml` with your database credentials

3. **Run the application**
   ```bash
   ./mvnw spring-boot:run
   ```

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ai-workflow-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:4200

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DB_USERNAME=postgres
DB_PASSWORD=password
DB_URL=jdbc:postgresql://localhost:5432/ai_workflow_db

# JWT
JWT_SECRET=your-256-bit-secret-key-here-make-it-long-and-secure
JWT_REFRESH_SECRET=your-refresh-secret-key-here-make-it-long-and-secure

# RabbitMQ
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USERNAME=guest
RABBITMQ_PASSWORD=guest

# Server
SERVER_PORT=8080
```

### Application Properties

Key configuration options in `core/src/main/resources/application.yml`:

```yaml
spring:
  security:
    jwt:
      expiration: 3600 # 1 hour
      refresh-expiration: 604800 # 7 days

app:
  workflow:
    max-nodes: 100
    max-execution-time: 300 # 5 minutes
```

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### Workflow Endpoints

- `GET /api/workflows` - Get all workflows
- `POST /api/workflows` - Create new workflow
- `GET /api/workflows/{id}` - Get workflow by ID
- `PUT /api/workflows/{id}` - Update workflow
- `DELETE /api/workflows/{id}` - Delete workflow
- `POST /api/workflows/{id}/run` - Execute workflow

### Execution Endpoints

- `GET /api/executions` - Get all executions
- `GET /api/executions/{id}` - Get execution by ID
- `POST /api/executions/{id}/cancel` - Cancel execution

## 🔐 Security

### Authentication Flow

1. User registers/logs in via `/api/auth/register` or `/api/auth/login`
2. Server returns JWT access token and refresh token
3. Client stores tokens securely (localStorage/sessionStorage)
4. Access token is included in Authorization header for API requests
5. When access token expires, refresh token is used to get new tokens

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

## 🧪 Testing

### Backend Tests

```bash
cd core
./mvnw test
```

### Frontend Tests

```bash
cd ai-workflow-frontend
npm test
```

### E2E Tests

```bash
cd ai-workflow-frontend
npm run e2e
```

## 📦 Deployment

### Production Deployment

1. **Build production images**
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

2. **Deploy with production configuration**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Environment-Specific Configurations

- **Development**: `docker-compose.yml`
- **Production**: `docker-compose.prod.yml`
- **Testing**: `docker-compose.test.yml`

## 🔍 Monitoring

### Health Checks

- Backend: `http://localhost:8080/actuator/health`
- Frontend: `http://localhost/health`

### Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the [Wiki](../../wiki) for detailed guides
- **Issues**: Report bugs and request features via [GitHub Issues](../../issues)
- **Discussions**: Join the community in [GitHub Discussions](../../discussions)

## 🗺️ Roadmap

- [ ] Advanced AI workflow suggestions
- [ ] Workflow templates and marketplace
- [ ] Multi-tenant support
- [ ] Advanced analytics and reporting
- [ ] Mobile application
- [ ] API rate limiting and quotas
- [ ] Workflow scheduling and automation
- [ ] Integration with external AI services

---

**Built with ❤️ using modern web technologies** 