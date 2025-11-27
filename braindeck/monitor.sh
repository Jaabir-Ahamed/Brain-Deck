#!/bin/bash
# Monitor upload status in real-time

UPLOAD_ID="${1:-}"

if [ -z "$UPLOAD_ID" ]; then
  echo "Usage: ./monitor.sh <upload-id>"
  echo ""
  echo "Finding recent uploads..."
  # Get upload ID from browser localStorage or recent uploads
  echo "Go to http://localhost:3000/uploads and check the browser console for upload IDs"
  echo "Or open DevTools > Application > Local Storage > store and look for 'uploads'"
  exit 1
fi

echo "🔄 Monitoring upload: $UPLOAD_ID"
echo "Press Ctrl+C to stop"
echo ""

while true; do
  clear
  echo "📊 Upload Status Monitor - $(date)"
  echo "================================"
  curl -s "http://localhost:3000/api/generate/status?uploadId=$UPLOAD_ID" | python3 -m json.tool 2>/dev/null || echo "Error fetching status"
  echo ""
  echo "Refreshing every 3 seconds... (Ctrl+C to stop)"
  sleep 3
done
