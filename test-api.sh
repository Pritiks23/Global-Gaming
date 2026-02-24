#!/bin/bash

# Global Gaming Leaderboard API - Test Script
# This script demonstrates all API endpoints

BASE_URL="http://localhost:3000"

echo "========================================="
echo "Global Gaming Leaderboard API Test"
echo "========================================="
echo ""

# Test 1: Health Check
echo "1. Health Check:"
curl -s ${BASE_URL}/health | jq .
echo ""

# Test 2: Get API Info
echo "2. API Information:"
curl -s ${BASE_URL}/ | jq .
echo ""

# Test 3: Submit Scores
echo "3. Submitting Scores:"
echo "   - Player A playing Tetris (5000 points)"
curl -s -X POST ${BASE_URL}/scores \
  -H "Content-Type: application/json" \
  -d '{"userId":"playerA","gameName":"tetris","score":5000}' | jq .
echo ""

echo "   - Player B playing Pac-Man (3000 points)"
curl -s -X POST ${BASE_URL}/scores \
  -H "Content-Type: application/json" \
  -d '{"userId":"playerB","gameName":"pac-man","score":3000}' | jq .
echo ""

echo "   - Player C playing Space Invaders (7500 points)"
curl -s -X POST ${BASE_URL}/scores \
  -H "Content-Type: application/json" \
  -d '{"userId":"playerC","gameName":"space-invaders","score":7500}' | jq .
echo ""

echo "   - Player A playing Pac-Man (3500 points) - Multiple games for same user"
curl -s -X POST ${BASE_URL}/scores \
  -H "Content-Type: application/json" \
  -d '{"userId":"playerA","gameName":"pac-man","score":3500}' | jq .
echo ""

# Test 4: Get Top 10
echo "4. Top 10 Leaderboard:"
curl -s ${BASE_URL}/leaderboard/top/10 | jq .
echo ""

# Test 5: Get Top 3
echo "5. Top 3 Leaderboard:"
curl -s ${BASE_URL}/leaderboard/top/3 | jq .
echo ""

# Test 6: User Context
echo "6. User Context (Player A with surroundings):"
curl -s ${BASE_URL}/leaderboard/user/playerA | jq .
echo ""

# Test 7: Stats
echo "7. Leaderboard Statistics:"
curl -s ${BASE_URL}/stats | jq .
echo ""

# Test 8: Error Handling - Invalid Input
echo "8. Error Handling - Invalid Score Submission:"
curl -s -X POST ${BASE_URL}/scores \
  -H "Content-Type: application/json" \
  -d '{"userId":"test"}' | jq .
echo ""

# Test 9: Error Handling - Non-existent User
echo "9. Error Handling - Non-existent User:"
curl -s ${BASE_URL}/leaderboard/user/nonexistent | jq .
echo ""

# Test 10: Error Handling - Invalid Count
echo "10. Error Handling - Invalid Count:"
curl -s ${BASE_URL}/leaderboard/top/abc | jq .
echo ""

echo "========================================="
echo "All tests completed!"
echo "========================================="
