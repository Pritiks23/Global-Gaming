# Global Gaming Leaderboard API

A simple, production-ready REST API for managing global gaming leaderboards with real-time rankings, built with Node.js, Express, and SQLite.

## Features

- **Real-time Score Updates**: Submit and update scores for users across multiple games
- **Efficient Leaderboard Queries**: Get top rankings with optimized database indexing
- **User Context**: View user rank with surrounding players
- **Zero-Configuration Database**: SQLite file-based database (no separate database server needed)
- **Scalable Architecture**: Designed for easy deployment and horizontal scaling
- **Persistent Storage**: SQLite for reliable data persistence
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
- That's it! No external database required!

### Option 1: Docker (Recommended for Production)

```bash
# Clone the repository
git clone https://github.com/Pritiks23/Global-Gaming.git
cd Global-Gaming

# Start the service
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop service
docker-compose down
```

The API will be available at `http://localhost:3000`

### Option 2: Local Development

```bash
# Install dependencies
npm install

# Copy environment file (optional - uses sensible defaults)
cp .env.example .env

# Start the application
npm start
```

The database file will be automatically created at `./data/leaderboard.sqlite`

## Environment Variables

The application works with sensible defaults. You can optionally create a `.env` file to customize:

```env
NODE_ENV=production
PORT=3000
DB_STORAGE=./data/leaderboard.sqlite
MAX_LEADERBOARD_SIZE=10000
```

## Deployment to DigitalOcean

### Using DigitalOcean App Platform (Easiest - Deploy in 5 minutes!)

1. **Create a new App** in DigitalOcean App Platform
2. **Connect your GitHub repository**
3. **Configure the app**:
   - Build Command: `npm install`
   - Run Command: `npm start`
   - HTTP Port: 3000
4. **Deploy** - That's it! No database setup needed!

The SQLite database file will be created automatically inside the container.

**Note**: For persistent data across deployments, consider mounting a volume for the `/app/data` directory.

### Using DigitalOcean Droplet with Docker (5-10 minutes)

```bash
# SSH into your droplet
ssh root@your-droplet-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
apt-get install docker-compose-plugin -y

# Clone your repository
git clone https://github.com/Pritiks23/Global-Gaming.git
cd Global-Gaming

# Start the service
docker compose up -d

# Check logs
docker compose logs -f
```

Your API is now live at `http://your-droplet-ip:3000`!

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
┌─────────────────────┐      
│   Express API       │      
│   (Node.js)         │      
└──────┬──────────────┘      
       │
       ▼
┌─────────────────────┐
│     SQLite          │
│  (File-based DB)    │
└─────────────────────┘
```

## Performance Considerations

- **Database Indexing**: Indexes on userId and totalScore for efficient queries
- **Query Optimization**: Efficient SQL queries with proper indexing
- **Rate Limiting**: 100 requests per minute per IP
- **File-Based Storage**: SQLite for zero-configuration database
- **Lightweight**: No external database dependencies

## Scalability

The API is designed for easy deployment and scalability:

1. **Stateless Design**: All application state stored in SQLite database
2. **Horizontal Scaling**: Run multiple API instances behind a load balancer with a shared database volume
3. **File-Based Database**: Easy to backup and migrate
4. **Zero External Dependencies**: No need for separate database servers
5. **Docker Ready**: Simple containerization for cloud deployment

**Note**: For very high-scale production workloads (100K+ users), consider migrating to PostgreSQL or MySQL with read replicas.

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

- Automated testing (Jest/Mocha for unit tests, Supertest for API tests)
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
