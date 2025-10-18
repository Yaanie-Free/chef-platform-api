const express = require('express');
const { createServer } = require('http');
const WebSocket = require('ws');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const winston = require('winston');
const prometheus = require('prom-client');
const crypto = require('crypto');
const rateLimitRedis = require('rate-limit-redis');
const { createRateLimiter } = require('./lib/rateLimit');
const { loggerConfig } = require('./lib/logger');
const { setupSocketHandlers } = require('./lib/socketHandlers');

let redisClient = null;
if (process.env.REDIS_URL) {
  try {
    const redis = require('redis');
    redisClient = redis.createClient({ url: process.env.REDIS_URL });
    redisClient.connect().then(() => console.log('✅ Redis connected')).catch(() => console.warn('⚠️ Redis connection failed'));
  } catch (err) {
    console.warn('Redis not available:', err.message);
  }
}
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');
const sizeOf = require('image-size');
const DOMPurify = require('isomorphic-dompurify');
const { promisify } = require('util');
const cluster = require('cluster');
const os = require('os');

// Enhanced logging configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'chef-platform' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Create logs directory if it doesn't exist
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

// Enhanced Supabase configuration with connection pooling
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'x-application-name': 'chef-platform'
      }
    }
  }
);

// Business constants with validation
const BUSINESS_CONSTANTS = {
  SERVICE_FEE_PERCENTAGE: parseFloat(process.env.SERVICE_FEE_PERCENTAGE) || 10,
  PAYMENT_PROCESSING_FEE_PERCENTAGE: parseFloat(process.env.PAYMENT_PROCESSING_FEE_PERCENTAGE) || 2.9,
  MIN_BOOKING_HOURS: parseInt(process.env.MIN_BOOKING_HOURS) || 2,
  MAX_BOOKING_HOURS: parseInt(process.env.MAX_BOOKING_HOURS) || 12,
  CANCELLATION_HOURS: parseInt(process.env.CANCELLATION_HOURS) || 24,
  MAX_IMAGE_SIZE: parseInt(process.env.MAX_IMAGE_SIZE) || 5 * 1024 * 1024, // 5MB
  MAX_IMAGES_PER_CHEF: parseInt(process.env.MAX_IMAGES_PER_CHEF) || 10,
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  MIN_IMAGE_DIMENSIONS: {
    width: parseInt(process.env.MIN_IMAGE_WIDTH) || 300,
    height: parseInt(process.env.MIN_IMAGE_HEIGHT) || 300
  },
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 12
};

// Validate required environment variables
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

const app = express();
const httpServer = createServer(app);

// Enhanced middleware stack
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "wss:", "ws:"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false
}));

// Compression with sensible defaults and opt-out header
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

// CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting will be applied to API routes later

// Winston logger
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Performance monitoring
const register = new prometheus.Registry();
prometheus.collectDefaultMetrics({ register });

const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5]
});

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration.labels(req.method, req.route ? req.route.path : req.path, res.statusCode).observe(duration);
    const logData = { method: req.method, url: req.originalUrl, statusCode: res.statusCode, durationMs: Date.now() - start, requestId: req.id };
    if (res.statusCode >= 500) logger.error('request_failed', logData);
    else if (res.statusCode >= 400) logger.warn('request_warning', logData);
    else logger.info('request_success', logData);
  });
  next();
});

// Simple Redis response cache middleware (optional)
const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    if (!redisClient) return next();
    try {
      const key = `cache:${req.originalUrl}`;
      const cached = await redisClient.get(key);
      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(JSON.parse(cached));
      }
      res.sendResponse = res.json;
      res.json = (body) => {
        redisClient.setEx(key, duration, JSON.stringify(body)).catch(err => logger.warn('redis_set_failed', { err: err.message }));
        res.setHeader('X-Cache', 'MISS');
        res.sendResponse(body);
      };
      next();
    } catch (err) {
      logger.warn('cache_error', { err: err.message });
      next();
    }
  };
};

// --- Ensure upload directory exists ---
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const PROFILE_IMAGES_DIR = path.join(UPLOAD_DIR, 'profile_images');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(PROFILE_IMAGES_DIR)) fs.mkdirSync(PROFILE_IMAGES_DIR, { recursive: true });

// --- Multer Storage Configuration ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PROFILE_IMAGES_DIR);
>>>>>>> e50b83c (commit)
  },
  crossOriginEmbedderPolicy: false
}));

app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Enhanced rate limiting with skip function
const limiter = rateLimit({
  windowMs: BUSINESS_CONSTANTS.RATE_LIMIT_WINDOW_MS,
  max: BUSINESS_CONSTANTS.RATE_LIMIT_MAX_REQUESTS,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(BUSINESS_CONSTANTS.RATE_LIMIT_WINDOW_MS / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(BUSINESS_CONSTANTS.RATE_LIMIT_WINDOW_MS / 1000)
    });
  }
});

app.use(limiter);

// Enhanced body parsing with size limits
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// Enhanced file upload configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: BUSINESS_CONSTANTS.MAX_IMAGE_SIZE,
    files: BUSINESS_CONSTANTS.MAX_IMAGES_PER_CHEF
  },
  fileFilter: (req, file, cb) => {
    if (BUSINESS_CONSTANTS.SUPPORTED_IMAGE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Only ${BUSINESS_CONSTANTS.SUPPORTED_IMAGE_TYPES.join(', ')} are allowed.`));
    }
  }
});

// Enhanced utility functions with caching
const calculateServiceFee = (amount) => {
  return Math.round(amount * (BUSINESS_CONSTANTS.SERVICE_FEE_PERCENTAGE / 100) * 100) / 100;
};

const calculatePaymentProcessingFee = (amount) => {
  return Math.round(amount * (BUSINESS_CONSTANTS.PAYMENT_PROCESSING_FEE_PERCENTAGE / 100) * 100) / 100;
};

const calculateTotal = (baseAmount) => {
  const serviceFee = calculateServiceFee(baseAmount);
  const processingFee = calculatePaymentProcessingFee(baseAmount);
  return Math.round((baseAmount + serviceFee + processingFee) * 100) / 100;
};

const generateGoogleMapsUrl = (address) => {
  const encodedAddress = encodeURIComponent(address);
  return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
};

const canCancelBooking = (bookingDate) => {
  const now = new Date();
  const booking = new Date(bookingDate);
  const hoursUntilBooking = (booking - now) / (1000 * 60 * 60);
  return hoursUntilBooking >= BUSINESS_CONSTANTS.CANCELLATION_HOURS;
};

const isPublicHoliday = (date) => {
  const holidays = [
    '2024-01-01', '2024-03-21', '2024-03-29', '2024-04-01',
    '2024-04-27', '2024-05-01', '2024-06-16', '2024-08-09',
    '2024-09-24', '2024-12-16', '2024-12-25', '2024-12-26'
  ];
  return holidays.includes(date.toISOString().split('T')[0]);
};

const validateImageQuality = async (buffer) => {
  try {
    const dimensions = sizeOf(buffer);
    return dimensions.width >= BUSINESS_CONSTANTS.MIN_IMAGE_DIMENSIONS.width &&
           dimensions.height >= BUSINESS_CONSTANTS.MIN_IMAGE_DIMENSIONS.height;
  } catch (error) {
    logger.error('Error validating image quality:', error);
    return false;
  }
};

const containsProfanity = (text) => {
  const profanityWords = ['badword1', 'badword2']; // Add your profanity filter
  const lowerText = text.toLowerCase();
  return profanityWords.some(word => lowerText.includes(word));
};

// Enhanced authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, BUSINESS_CONSTANTS.JWT_SECRET);
    
    // Verify user still exists in database
    const { data: user, error } = await supabase
      .from(decoded.userType === 'customer' ? 'customers' : 'chefs')
      .select('id, email, is_active')
      .eq('id', decoded.userId)
      .single();

    if (error || !user || !user.is_active) {
      return res.status(401).json({ error: 'Invalid or inactive user' });
    }

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      userType: decoded.userType
    };
    next();
  } catch (error) {
    logger.error('Token verification failed:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Enhanced validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Enhanced error handling middleware
const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error:', err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files' });
    }
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: 'Unexpected field' });
  }

  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Enhanced public routes
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Private Chef Platform API is working!', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    env: process.env.NODE_ENV || 'development'
  });
});
      logger.error('fetch_dietary_options_failed', { error: error.message });
      return res.status(500).json({ error: 'Failed to fetch dietary options.' });
    }

    res.json(data || []);
  } catch (error) {
    logger.error('fetch_dietary_options_exception', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch dietary options.' });
  }
});

// Metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    logger.error('metrics_error', { err: err.message });
    res.status(500).send('Failed to collect metrics');
  }
});

// Enhanced health check with database and memory/cpu checks
app.get('/health', async (req, res) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    checks: {}
  };

  try {
    const { data, error } = await supabase.from('dietary_options').select('id').limit(1);
    healthCheck.checks.database = error ? 'FAIL' : 'OK';
  } catch (err) {
    healthCheck.checks.database = 'FAIL';
  }

  const memUsage = process.memoryUsage();
  healthCheck.checks.memory = { used: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB', total: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB' };
  healthCheck.checks.cpu = process.cpuUsage();

  const statusCode = healthCheck.status === 'OK' ? 200 : 503;
  res.status(statusCode).json(healthCheck);
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('unhandled_error', { error: err.message, stack: err.stack, requestId: req.id });
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Validation failed', details: isDevelopment ? err.details : 'Invalid input' });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Authentication required' });
  }

  res.status(500).json({ error: 'Internal server error', message: isDevelopment ? err.message : 'Something went wrong' });
});

// --- PUBLIC ENDPOINTS ---

// Get dietary options
app.get('/api/dietary-options', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('dietary_options')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching dietary options:', error);
      return res.status(500).json({ error: 'Failed to fetch dietary options.' });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch dietary options.' });
  }
});

// Get cuisine categories
app.get('/api/cuisines', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('cuisine_categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching cuisine categories:', error);
      return res.status(500).json({ error: 'Failed to fetch cuisine categories.' });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch cuisine categories.' });
  }
});

// Get South African cities/regions
app.get('/api/regions', (req, res) => {
  const southAfricanCities = [
    'Cape Town', 'Johannesburg', 'Durban', 'Pretoria', 'Port Elizabeth',
    'Bloemfontein', 'East London', 'Pietermaritzburg', 'Nelspruit', 'Kimberley',
    'Polokwane', 'Rustenburg', 'Witbank', 'Klerksdorp', 'Welkom'
  ];
  
  res.json(southAfricanCities.sort());
});

// Search chefs by location and dietary requirements
app.get('/api/chefs/search', async (req, res) => {
  try {
    const { city, dietary_requirements, party_size, event_date } = req.query;
    
    let query = supabase
      .from('chefs')
      .select(`
        id, name, surname, bio, regions_served, max_travel_distance,
        dietary_specialties, profile_images, average_rating, total_reviews,
        holiday_rate_multiplier, created_at
      `);

    // Filter by city if provided
    if (city) {
      query = query.contains('regions_served', [city]);
    }

    // Filter by dietary requirements if provided
    if (dietary_requirements) {
      const dietaryArray = Array.isArray(dietary_requirements) 
        ? dietary_requirements 
        : dietary_requirements.split(',');
      
      query = query.overlaps('dietary_specialties', dietaryArray);
    }

    const { data: chefs, error } = await query;

    if (error) {
      console.error('Error searching chefs:', error);
      return res.status(500).json({ error: 'Failed to search chefs.' });
    }

    // Process chef data
    const processedChefs = (chefs || []).map(chef => ({
      ...chef,
      average_rating: chef.total_reviews >= 5 ? chef.average_rating : null,
      display_rating: chef.total_reviews >= 5,
      profile_image: chef.profile_images && chef.profile_images.length > 0 
        ? chef.profile_images[0].url 
        : null
    }));

    res.json(processedChefs);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to search chefs.' });
  }
});

// Get chef profile
app.get('/api/chefs/:id', async (req, res) => {
  try {
    const chefId = parseInt(req.params.id);
    
    const { data: chef, error } = await supabase
      .from('chefs')
      .select(`
        id, name, surname, bio, work_history, regions_served, 
        max_travel_distance, dietary_specialties, profile_images, 
        average_rating, total_reviews, holiday_rate_multiplier, created_at
      `)
      .eq('id', chefId)
      .single();

    if (error || !chef) {
      return res.status(404).json({ error: 'Chef not found.' });
    }

    // Process chef data
    const processedChef = {
      ...chef,
      average_rating: chef.total_reviews >= 5 ? chef.average_rating : null,
      display_rating: chef.total_reviews >= 5
    };

    res.json(processedChef);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch chef profile.' });
  }
});

// --- AUTHENTICATION ENDPOINTS ---

// Register customer
>>>>>>> e50b83c (commit)
app.post('/api/auth/customers/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
  body('first_name').trim().isLength({ min: 2, max: 50 }).escape(),
  body('last_name').trim().isLength({ min: 2, max: 50 }).escape(),
  body('phone').isMobilePhone('en-ZA'),
  body('date_of_birth').isISO8601().toDate()
], handleValidationErrors, async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone, date_of_birth } = req.body;

    // Sanitize inputs
    const sanitizedData = {
      email: DOMPurify.sanitize(email),
      first_name: DOMPurify.sanitize(first_name),
      last_name: DOMPurify.sanitize(last_name),
      phone: DOMPurify.sanitize(phone)
    };

    // Check for profanity
    if (containsProfanity(sanitizedData.first_name) || containsProfanity(sanitizedData.last_name)) {
      return res.status(400).json({ error: 'Invalid name content' });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('customers')
      .select('id')
      .eq('email', sanitizedData.email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, BUSINESS_CONSTANTS.BCRYPT_ROUNDS);

    // Create user
    const { data: newUser, error } = await supabase
      .from('customers')
      .insert([{
        email: sanitizedData.email,
        password_hash: hashedPassword,
        first_name: sanitizedData.first_name,
        last_name: sanitizedData.last_name,
        phone: sanitizedData.phone,
        date_of_birth: date_of_birth,
        is_active: true
      }])
      .select()
      .single();

    if (error) {
      logger.error('Customer registration error:', error);
      return res.status(500).json({ error: 'Registration failed' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email, 
        userType: 'customer' 
      },
      BUSINESS_CONSTANTS.JWT_SECRET,
      { expiresIn: BUSINESS_CONSTANTS.JWT_EXPIRES_IN }
    );

    logger.info(`New customer registered: ${newUser.email}`);
    res.status(201).json({
      message: 'Customer registered successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        userType: 'customer'
      }
    });
  } catch (error) {
    logger.error('Customer registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/chefs/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
  body('first_name').trim().isLength({ min: 2, max: 50 }).escape(),
  body('last_name').trim().isLength({ min: 2, max: 50 }).escape(),
  body('phone').isMobilePhone('en-ZA'),
  body('bio').trim().isLength({ min: 50, max: 1000 }).escape(),
  body('base_rate').isFloat({ min: 100, max: 5000 }),
  body('regions_served').isArray({ min: 1 }),
  body('dietary_specialties').isArray({ min: 1 })
], handleValidationErrors, async (req, res) => {
  try {
    const { 
      email, password, first_name, last_name, phone, bio, 
      base_rate, regions_served, dietary_specialties, 
      years_experience, culinary_training, certifications 
    } = req.body;

    // Sanitize inputs
    const sanitizedData = {
      email: DOMPurify.sanitize(email),
      first_name: DOMPurify.sanitize(first_name),
      last_name: DOMPurify.sanitize(last_name),
      phone: DOMPurify.sanitize(phone),
      bio: DOMPurify.sanitize(bio)
    };

    // Check for profanity
    if (containsProfanity(sanitizedData.first_name) || 
        containsProfanity(sanitizedData.last_name) || 
        containsProfanity(sanitizedData.bio)) {
      return res.status(400).json({ error: 'Invalid content detected' });
    }

    // Check if chef already exists
    const { data: existingChef } = await supabase
      .from('chefs')
      .select('id')
      .eq('email', sanitizedData.email)
      .single();

    if (existingChef) {
      return res.status(400).json({ error: 'Chef already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, BUSINESS_CONSTANTS.BCRYPT_ROUNDS);

    // Create chef
    const { data: newChef, error } = await supabase
      .from('chefs')
      .insert([{
        email: sanitizedData.email,
        password_hash: hashedPassword,
        first_name: sanitizedData.first_name,
        last_name: sanitizedData.last_name,
        phone: sanitizedData.phone,
        bio: sanitizedData.bio,
        base_rate: base_rate,
        regions_served: regions_served,
        dietary_specialties: dietary_specialties,
        years_experience: years_experience || 0,
        culinary_training: culinary_training || '',
        certifications: certifications || [],
        is_active: true,
        is_verified: false
      }])
      .select()
      .single();

    if (error) {
      logger.error('Chef registration error:', error);
      return res.status(500).json({ error: 'Registration failed' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newChef.id, 
        email: newChef.email, 
        userType: 'chef' 
      },
      BUSINESS_CONSTANTS.JWT_SECRET,
      { expiresIn: BUSINESS_CONSTANTS.JWT_EXPIRES_IN }
    );

    logger.info(`New chef registered: ${newChef.email}`);
    res.status(201).json({
      message: 'Chef registered successfully',
      token,
      user: {
        id: newChef.id,
        email: newChef.email,
        first_name: newChef.first_name,
        last_name: newChef.last_name,
        userType: 'chef'
      }
    });
  } catch (error) {
    logger.error('Chef registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/customers/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Sanitize email
    const sanitizedEmail = DOMPurify.sanitize(email);

    // Find user
    const { data: user, error } = await supabase
      .from('customers')
      .select('id, email, password_hash, first_name, last_name, is_active')
      .eq('email', sanitizedEmail)
      .single();

    if (error || !user || !user.is_active) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        userType: 'customer' 
      },
      BUSINESS_CONSTANTS.JWT_SECRET,
      { expiresIn: BUSINESS_CONSTANTS.JWT_EXPIRES_IN }
    );

    logger.info(`Customer login: ${user.email}`);
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        userType: 'customer'
      }
    });
  } catch (error) {
    logger.error('Customer login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/chefs/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Sanitize email
    const sanitizedEmail = DOMPurify.sanitize(email);

    // Find chef
    const { data: chef, error } = await supabase
      .from('chefs')
      .select('id, email, password_hash, first_name, last_name, is_active, is_verified')
      .eq('email', sanitizedEmail)
      .single();

    if (error || !chef || !chef.is_active) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, chef.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: chef.id, 
        email: chef.email, 
        userType: 'chef' 
      },
      BUSINESS_CONSTANTS.JWT_SECRET,
      { expiresIn: BUSINESS_CONSTANTS.JWT_EXPIRES_IN }
    );

    logger.info(`Chef login: ${chef.email}`);
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: chef.id,
        email: chef.email,
        first_name: chef.first_name,
        last_name: chef.last_name,
        is_verified: chef.is_verified,
        userType: 'chef'
      }
    });
  } catch (error) {
    logger.error('Chef login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/verify', authenticateToken, async (req, res) => {
  try {
    res.json({
      valid: true,
      user: req.user
    });
  } catch (error) {
    logger.error('Token verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Enhanced chef discovery with caching and pagination
app.get('/api/chefs', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      region, 
      specialty, 
      min_rate, 
      max_rate,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const offset = (page - 1) * limit;
    let query = supabase
      .from('chefs')
      .select(`
        id, first_name, last_name, bio, base_rate, regions_served, 
        dietary_specialties, years_experience, average_rating, 
        total_reviews, profile_images, is_verified, created_at
      `)
      .eq('is_active', true)
      .eq('is_verified', true);

    // Apply filters
    if (region) {
      query = query.contains('regions_served', [region]);
    }
    if (specialty) {
      query = query.contains('dietary_specialties', [specialty]);
    }
    if (min_rate) {
      query = query.gte('base_rate', parseFloat(min_rate));
    }
    if (max_rate) {
      query = query.lte('base_rate', parseFloat(max_rate));
    }

    // Apply sorting
    query = query.order(sort_by, { ascending: sort_order === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: chefs, error, count } = await query;

    if (error) {
      logger.error('Chef discovery error:', error);
      return res.status(500).json({ error: 'Failed to fetch chefs' });
    }

    res.json({
      chefs: chefs || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    logger.error('Chef discovery error:', error);
    res.status(500).json({ error: 'Failed to fetch chefs' });
  }
});

// Enhanced file upload endpoint
app.post('/api/chefs/profile/images', authenticateToken, upload.array('images', 10), async (req, res) => {
  try {
    if (req.user.userType !== 'chef') {
      return res.status(403).json({ error: 'Only chefs can upload images' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images provided' });
    }

    const uploadedImages = [];

    for (const file of req.files) {
      // Validate image quality
      const isValidQuality = await validateImageQuality(file.buffer);
      if (!isValidQuality) {
        return res.status(400).json({ 
          error: `Image ${file.originalname} does not meet minimum quality requirements` 
        });
      }

      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const fileName = `${req.user.id}_${Date.now()}_${Math.random().toString(36).substring(7)}${fileExtension}`;
      const filePath = path.join('uploads', 'chef-images', fileName);

      // Ensure directory exists
      const uploadDir = path.dirname(filePath);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Save file
      fs.writeFileSync(filePath, file.buffer);

      uploadedImages.push({
        filename: fileName,
        original_name: file.originalname,
        size: file.size,
        url: `/uploads/chef-images/${fileName}`,
        uploaded_at: new Date().toISOString()
      });
    }

    // Update chef profile with new images
    const { data: currentChef } = await supabase
      .from('chefs')
      .select('profile_images')
      .eq('id', req.user.id)
      .single();

    const existingImages = currentChef?.profile_images || [];
    const updatedImages = [...existingImages, ...uploadedImages];

    const { error: updateError } = await supabase
      .from('chefs')
      .update({ profile_images: updatedImages })
      .eq('id', req.user.id);

    if (updateError) {
      logger.error('Error updating chef images:', updateError);
      return res.status(500).json({ error: 'Failed to update profile images' });
    }

    logger.info(`Chef ${req.user.id} uploaded ${uploadedImages.length} images`);
    res.json({
      message: 'Images uploaded successfully',
      images: uploadedImages
    });
  } catch (error) {
    logger.error('Image upload error:', error);
    res.status(500).json({ error: 'Image upload failed' });
  }
});

// Enhanced booking creation
app.post('/api/bookings', authenticateToken, [
  body('chef_id').isUUID(),
  body('event_date').isISO8601().toDate(),
  body('event_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('duration_hours').isInt({ min: BUSINESS_CONSTANTS.MIN_BOOKING_HOURS, max: BUSINESS_CONSTANTS.MAX_BOOKING_HOURS }),
  body('guest_count').isInt({ min: 1, max: 50 }),
  body('event_address').trim().isLength({ min: 10, max: 500 }).escape(),
  body('special_requests').optional().trim().isLength({ max: 1000 }).escape(),
  body('dietary_requirements').optional().isArray(),
  body('menu_preferences').optional().isArray()
], handleValidationErrors, async (req, res) => {
  try {
    if (req.user.userType !== 'customer') {
      return res.status(403).json({ error: 'Only customers can create bookings' });
    }

    const {
      chef_id,
      event_date,
      event_time,
      duration_hours,
      guest_count,
      event_address,
      special_requests,
      dietary_requirements,
      menu_preferences
    } = req.body;

    // Sanitize inputs
    const sanitizedData = {
      event_address: DOMPurify.sanitize(event_address),
      special_requests: special_requests ? DOMPurify.sanitize(special_requests) : null
    };

    // Check for profanity
    if (sanitizedData.special_requests && containsProfanity(sanitizedData.special_requests)) {
      return res.status(400).json({ error: 'Invalid content in special requests' });
    }

    // Verify chef exists and is available
    const { data: chef, error: chefError } = await supabase
      .from('chefs')
      .select('id, first_name, last_name, base_rate, is_active, is_verified')
      .eq('id', chef_id)
      .eq('is_active', true)
      .eq('is_verified', true)
      .single();

    if (chefError || !chef) {
      return res.status(404).json({ error: 'Chef not found or not available' });
    }

    // Check if date is not in the past
    const eventDateTime = new Date(`${event_date}T${event_time}`);
    if (eventDateTime <= new Date()) {
      return res.status(400).json({ error: 'Event date must be in the future' });
    }

    // Check if it's not a public holiday (optional business rule)
    if (isPublicHoliday(eventDateTime)) {
      return res.status(400).json({ error: 'Bookings not available on public holidays' });
    }

    // Calculate pricing
    const baseAmount = chef.base_rate * guest_count * duration_hours;
    const serviceFee = calculateServiceFee(baseAmount);
    const processingFee = calculatePaymentProcessingFee(baseAmount);
    const totalAmount = calculateTotal(baseAmount);

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert([{
        customer_id: req.user.id,
        chef_id: chef_id,
        event_date: event_date,
        event_time: event_time,
        duration_hours: duration_hours,
        guest_count: guest_count,
        event_address: sanitizedData.event_address,
        special_requests: sanitizedData.special_requests,
        dietary_requirements: dietary_requirements || [],
        menu_preferences: menu_preferences || [],
        base_amount: baseAmount,
        service_fee: serviceFee,
        processing_fee: processingFee,
        total_amount: totalAmount,
        status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (bookingError) {
      logger.error('Booking creation error:', bookingError);
      return res.status(500).json({ error: 'Failed to create booking' });
    }

    logger.info(`New booking created: ${booking.id} for chef ${chef_id}`);
    res.status(201).json({
      message: 'Booking created successfully',
      booking: {
        id: booking.id,
        chef: {
          id: chef.id,
          name: `${chef.first_name} ${chef.last_name}`
        },
        event_date: booking.event_date,
        event_time: booking.event_time,
        duration_hours: booking.duration_hours,
        guest_count: booking.guest_count,
        total_amount: booking.total_amount,
        status: booking.status
      }
    });
  } catch (error) {
    logger.error('Booking creation error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// WebSocket server for real-time features (FREE alternative to Socket.IO)
const wss = new WebSocket.Server({ server: httpServer });

// Store active connections
const activeConnections = new Map();

wss.on('connection', (ws, req) => {
  const connectionId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
  activeConnections.set(connectionId, {
    ws,
    userId: null,
    userType: null,
    lastPing: Date.now()
  });

  logger.info(`New WebSocket connection: ${connectionId}`);

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'authenticate':
          await handleAuthentication(connectionId, data);
          break;
        case 'join_chat':
          await handleJoinChat(connectionId, data);
          break;
        case 'send_message':
          await handleSendMessage(connectionId, data);
          break;
        case 'typing':
          await handleTyping(connectionId, data);
          break;
        case 'ping':
          handlePing(connectionId);
          break;
        default:
          ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
      }
    } catch (error) {
      logger.error('WebSocket message error:', error);
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
    }
  });

  ws.on('close', () => {
    activeConnections.delete(connectionId);
    logger.info(`WebSocket connection closed: ${connectionId}`);
  });

  ws.on('error', (error) => {
    logger.error(`WebSocket error for connection ${connectionId}:`, error);
    activeConnections.delete(connectionId);
  });

  // Send welcome message
  ws.send(JSON.stringify({ 
    type: 'connected', 
    connectionId,
    message: 'Connected to ChefConnect' 
  }));
});

// WebSocket handlers
const handleAuthentication = async (connectionId, data) => {
  try {
    const { token } = data;
    const decoded = jwt.verify(token, BUSINESS_CONSTANTS.JWT_SECRET);
    
    const connection = activeConnections.get(connectionId);
    if (connection) {
      connection.userId = decoded.userId;
      connection.userType = decoded.userType;
      connection.lastPing = Date.now();
    }

    connection.ws.send(JSON.stringify({ 
      type: 'authenticated', 
      userId: decoded.userId,
      userType: decoded.userType 
    }));
  } catch (error) {
    connection.ws.send(JSON.stringify({ 
      type: 'auth_error', 
      message: 'Invalid token' 
    }));
  }
};

const handleJoinChat = async (connectionId, data) => {
  const connection = activeConnections.get(connectionId);
  if (!connection || !connection.userId) {
    connection.ws.send(JSON.stringify({ 
      type: 'error', 
      message: 'Authentication required' 
    }));
    return;
  }

  // Join chat room logic here
  connection.ws.send(JSON.stringify({ 
    type: 'joined_chat', 
    chatId: data.chatId 
  }));
};

const handleSendMessage = async (connectionId, data) => {
  const connection = activeConnections.get(connectionId);
  if (!connection || !connection.userId) {
    connection.ws.send(JSON.stringify({ 
      type: 'error', 
      message: 'Authentication required' 
    }));
    return;
  }

  // Broadcast message to all connections in the chat
  const message = {
    type: 'new_message',
    chatId: data.chatId,
    message: data.message,
    senderId: connection.userId,
    senderType: connection.userType,
    timestamp: new Date().toISOString()
  };

  // Broadcast to all connections
  activeConnections.forEach((conn, id) => {
    if (conn.ws.readyState === WebSocket.OPEN) {
      conn.ws.send(JSON.stringify(message));
    }
  });
};

const handleTyping = async (connectionId, data) => {
  const connection = activeConnections.get(connectionId);
  if (!connection || !connection.userId) {
    return;
  }

  // Broadcast typing indicator
  const typingMessage = {
    type: 'typing',
    chatId: data.chatId,
    userId: connection.userId,
    isTyping: data.isTyping
  };

  activeConnections.forEach((conn, id) => {
    if (id !== connectionId && conn.ws.readyState === WebSocket.OPEN) {
      conn.ws.send(JSON.stringify(typingMessage));
    }
  });
};

const handlePing = (connectionId) => {
  const connection = activeConnections.get(connectionId);
  if (connection) {
    connection.lastPing = Date.now();
    connection.ws.send(JSON.stringify({ type: 'pong' }));
  }
};

// Ping clients every 30 seconds to keep connections alive
setInterval(() => {
  activeConnections.forEach((connection, connectionId) => {
    if (connection.ws.readyState === WebSocket.OPEN) {
      connection.ws.send(JSON.stringify({ type: 'ping' }));
    } else {
      activeConnections.delete(connectionId);
    }
  });
}, 30000);

// Serve static files
app.use('/uploads', express.static('uploads'));

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;

// Cluster mode for better performance (FREE scaling)
if (cluster.isMaster && process.env.NODE_ENV === 'production') {
  const numCPUs = os.cpus().length;
  logger.info(`Master ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    logger.warn(`Worker ${worker.process.pid} died`);
    cluster.fork(); // Restart worker
  });
} else {
  httpServer.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    logger.info(`Worker ${process.pid} started`);
  });
}

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  httpServer.close(() => {
    logger.info('HTTP server closed');
    
    // Close WebSocket connections
    activeConnections.forEach((connection) => {
      connection.ws.close();
    });
    
    logger.info('WebSocket connections closed');
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = { app, httpServer, wss };