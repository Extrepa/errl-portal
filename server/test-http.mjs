#!/usr/bin/env node
import http from 'http';
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('ok');
});
server.listen(5175, '127.0.0.1', () => {
  console.log('listening http://127.0.0.1:5175');
});
