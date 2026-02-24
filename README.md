# Global Gaming Leaderboard API

A scalable, production-ready REST API for managing global gaming leaderboards with real-time rankings, built with Node.js, Express, MongoDB, and Redis.

## Features

- **Real-time Score Updates**: Submit and update scores for users across multiple games
- **Efficient Leaderboard Queries**: Get top rankings with optimized database indexing
- **User Context**: View user rank with surrounding players
- **High Performance**: Redis caching for improved response times
- **Scalable Architecture**: Designed for horizontal scaling
- **Persistent Storage**: MongoDB for reliable data persistence
- **Security**: Rate limiting, helmet.js, input validation
- **Production Ready**: Docker containerization, health checks, graceful shutdown

## API Endpoints

### 1. Submit Score
```http
POST /scores
Content-Type: application/json

{
  "userId": "user123",
  "gameName": "space-invaders",
  "score": 1500
}
```

**Response:**
```json
{
  "message": "Score updated successfully",
  "data": {
    "userId": "user123",
    "gameName": "space-invaders",
    "score": 1500,
    "totalScore": 3500,
    "currentRank": 5
  }
}
```

### 2. Get Top X Users
```http
GET /leaderboard/top/10
```

**Response:**
```json
{
  "count": 10,
  "users": [
    {
      "rank": 1,
      "userId": "user456",
      "totalScore": 5000,
      "games": {
        "space-invaders": 2500,
        "pac-man": 2500
      }
    }
  ]
}
```

### 3. Get User Context
```http
GET /leaderboard/user/user123
```

**Response:**
```json
{
  "userAbove": {
    "rank": 4,
    "userId": "user789",
    "totalScore": 3600,
    "games": {...}
  },
  "currentUser": {
    "rank": 5,
    "userId": "user123",
    "totalScore": 3500,
    "games": {...}
  },
  "userBelow": {
    "rank": 6,
    "userId": "user101",
    "totalScore": 3400,
    "games": {...}
  }
}
```

### 4. Get Statistics
```http
GET /stats
```

## Quick Start

### Prerequisites
- Node.js 18+ or Docker
- MongoDB 6+ (or use Docker Compose)
- Redis 7+ (or use Docker Compose)

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/Pritiks23/Global-Gaming.git
cd Global-Gaming

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

The API will be available at `http://localhost:3000`

### Option 2: Local Development

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your MongoDB and Redis connection strings

# Start MongoDB and Redis (if not using Docker)
# Then start the application
npm start
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/gaming-leaderboard
REDIS_HOST=localhost
REDIS_PORT=6379
CACHE_TTL=300
MAX_LEADERBOARD_SIZE=10000
```

## Deployment to DigitalOcean

### Using DigitalOcean App Platform

1. **Create a new App** in DigitalOcean App Platform
2. **Connect your GitHub repository**
3. **Configure the app**:
   - Build Command: `npm install`
   - Run Command: `npm start`
   - HTTP Port: 3000
4. **Add MongoDB and Redis** as managed databases or components
5. **Set environment variables** in the App Platform dashboard
6. **Deploy**

### Using DigitalOcean Droplet with Docker

```bash
# SSH into your droplet
ssh root@your-droplet-ip

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
apt-get install docker-compose-plugin

# Clone your repository
git clone https://github.com/Pritiks23/Global-Gaming.git
cd Global-Gaming

# Create .env file with production settings
nano .env

# Start services
docker compose up -d

# Check logs
docker compose logs -f
```

### Using DigitalOcean Kubernetes

```bash
# Build and push Docker image
docker build -t your-registry/gaming-leaderboard:latest .
docker push your-registry/gaming-leaderboard:latest

# Apply Kubernetes manifests
kubectl apply -f k8s/
```

## Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│   Load Balancer     │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐      ┌──────────────┐
│   Express API       │◄────►│    Redis     │
│   (Node.js)         │      │   (Cache)    │
└──────┬──────────────┘      └──────────────┘
       │
       ▼
┌─────────────────────┐
│     MongoDB         │
│  (Persistence)      │
└─────────────────────┘
```

## Performance Considerations

- **Database Indexing**: Compound indexes on userId + gameName, descending index on totalScore
- **Caching Strategy**: Redis caching for top leaderboard queries (1-minute TTL)
- **Query Optimization**: Lean queries, field projection, limit results
- **Rate Limiting**: 100 requests per minute per IP
- **Connection Pooling**: MongoDB connection pooling enabled

## Scalability

The API is designed to scale horizontally:

1. **Stateless Design**: All application state stored in MongoDB/Redis
2. **Horizontal Scaling**: Run multiple API instances behind a load balancer
3. **Caching**: Redis for distributed caching across instances
4. **Database Sharding**: MongoDB can be sharded by userId for larger datasets
5. **Read Replicas**: Use MongoDB read replicas for read-heavy workloads

## Security Features

- Helmet.js for security headers
- Rate limiting to prevent abuse
- Input validation with Joi
- CORS enabled
- Environment variable configuration
- Non-root Docker user

## Monitoring

- Health check endpoint: `/health`
- Statistics endpoint: `/stats`
- Request logging with Morgan
- Docker health checks

## Testing the API

### Using cURL

```bash
# Submit a score
curl -X POST http://localhost:3000/scores \
  -H "Content-Type: application/json" \
  -d '{"userId":"player1","gameName":"tetris","score":5000}'

# Get top 10
curl http://localhost:3000/leaderboard/top/10

# Get user context
curl http://localhost:3000/leaderboard/user/player1

# Get stats
curl http://localhost:3000/stats
```

### Using Postman

Import the API endpoints into Postman:
- Base URL: `http://localhost:3000` or your deployed URL
- Use the endpoint documentation above

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# The server will restart automatically on file changes
```

## Project Structure

```
Global-Gaming/
├── src/
│   ├── config/          # Configuration files
│   ├── models/          # MongoDB models
│   ├── services/        # Business logic
│   ├── controllers/     # Request handlers
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   └── server.js        # Application entry point
├── docker-compose.yml   # Docker Compose configuration
├── Dockerfile           # Docker image definition
├── package.json         # Dependencies
└── README.md           # This file
```

## Future Enhancements

- WebSocket support for real-time updates
- Multi-region deployment
- Advanced analytics and insights
- User authentication and authorization
- Game-specific leaderboards
- Time-based leaderboards (daily, weekly, monthly)
- GraphQL API
- Admin dashboard

## License

ISC

## Support

For issues and questions, please open an issue on GitHub.
