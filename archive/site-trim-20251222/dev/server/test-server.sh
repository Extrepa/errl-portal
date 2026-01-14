#!/bin/bash
# Test script for Errl Studio upload server

echo "Starting upload server..."
node server/upload.js &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

# Wait for server to start
sleep 2

echo -e "\n=== Testing health endpoint ==="
curl -s http://localhost:5656/health | jq .

echo -e "\n=== Testing uploads list ==="
curl -s http://localhost:5656/uploads | jq .

echo -e "\n=== Creating test file ==="
echo "Hello from Errl Studio!" > /tmp/test-upload.txt

echo -e "\n=== Testing upload ==="
curl -s -F "file=@/tmp/test-upload.txt" http://localhost:5656/upload | jq .

echo -e "\n=== Checking uploads after test ==="
curl -s http://localhost:5656/uploads | jq .

echo -e "\n=== Stopping server ==="
kill $SERVER_PID
echo "Done!"
