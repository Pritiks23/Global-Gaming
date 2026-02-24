# Quick Start Guide

Get the Global Gaming Leaderboard API up and running in under 2 minutes!

## Prerequisites

- Docker and Docker Compose installed
- OR Node.js 18+
- **That's it! No external databases needed!**

## Option 1: Docker (Recommended - 1 minute setup)

```bash
# 1. Clone the repository
git clone https://github.com/Pritiks23/Global-Gaming.git
cd Global-Gaming

# 2. Start the service
docker compose up -d

# 3. Test immediately
curl http://localhost:3000/health

# 4. Submit your first score
curl -X POST http://localhost:3000/scores \
  -H "Content-Type: application/json" \
  -d '{"userId":"player1","gameName":"tetris","score":5000}'

# 5. View the leaderboard
curl http://localhost:3000/leaderboard/top/10
```

That's it! Your API is running at `http://localhost:3000`

## Option 2: Local Development (Even Faster!)

```bash
# 1. Clone and install
git clone https://github.com/Pritiks23/Global-Gaming.git
cd Global-Gaming
npm install

# 2. Start the application (no setup needed!)
npm start

# 3. Test
curl http://localhost:3000/health
```

The SQLite database is created automatically at `./data/leaderboard.sqlite`

## Quick API Test

Run the included test script:

```bash
./test-api.sh
```

## API Endpoints

- `POST /scores` - Submit a score
- `GET /leaderboard/top/:count` - Get top X users
- `GET /leaderboard/user/:userId` - Get user rank and surroundings
- `GET /stats` - Get statistics
- `GET /health` - Health check

## Example Usage

### Submit a Score
```bash
curl -X POST http://localhost:3000/scores \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "player123",
    "gameName": "fortnite",
    "score": 8500
  }'
```

### Get Top 10 Players
```bash
curl http://localhost:3000/leaderboard/top/10
```

### Get User Context
```bash
curl http://localhost:3000/leaderboard/user/player123
```

## Stop Services

```bash
# Stop Docker services
docker compose down

# Stop local Node.js server
# Press Ctrl+C in the terminal
```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed DigitalOcean deployment instructions.

## Documentation

- [README.md](README.md) - Complete documentation
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Technical details

## Support

For issues or questions, open an issue on GitHub.

---

**🎮 Happy Gaming! 🏆**
