const winston = require('winston');
const { createPrometheusMetrics } = require('prom-client');

// Prometheus metrics
const register = createPrometheusMetrics();

const httpRequestDuration = new register.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const httpRequestTotal = new register.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const activeConnections = new register.Gauge({
  name: 'websocket_connections_active',
  help: 'Number of active WebSocket connections'
});

const databaseQueryDuration = new register.Histogram({
  name: 'database_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1, 2, 5]
});

// Performance monitoring middleware
const performanceMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const labels = {
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode
    };
    
    httpRequestDuration.observe(labels, duration);
    httpRequestTotal.inc(labels);
  });
  
  next();
};

// Database query monitoring
const monitorDatabaseQuery = async (operation, table, queryFn) => {
  const start = Date.now();
  try {
    const result = await queryFn();
    const duration = (Date.now() - start) / 1000;
    databaseQueryDuration.observe({ operation, table }, duration);
    return result;
  } catch (error) {
    const duration = (Date.now() - start) / 1000;
    databaseQueryDuration.observe({ operation, table }, duration);
    throw error;
  }
};

module.exports = {
  register,
  performanceMiddleware,
  monitorDatabaseQuery,
  activeConnections
};