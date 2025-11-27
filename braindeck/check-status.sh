#!/bin/bash
# Quick check of upload status

source .env.local 2>/dev/null

echo "📊 Checking upload status..."
echo ""

# Use curl to check via API
curl -s "http://localhost:3000/api/uploads?userId=$(psql "$DATABASE_URL" -t -c "SELECT id FROM auth.users LIMIT 1" 2>/dev/null | xargs)" 2>/dev/null | python3 -m json.tool 2>/dev/null || echo "Could not fetch via API"
