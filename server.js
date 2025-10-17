const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sizeOf = require('image-size');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

const port = process.env.PORT || 3000;
const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// Business constants
const SERVICE_FEE_PERCENTAGE = 0.05; // 5% service fee
const PAYMENT_PROCESSING_FEE_PERCENTAGE = 0.03; // 3% payment processing fee
const CHEF_RESPONSE_DEADLINE_HOURS = 24; // 1 day for chef response
const CANCELLATION_FEE_HOURS = 24; // 24 hours before event

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔗 Supabase URL:', supabaseUrl);
console.log('🔑 Supabase Key exists:', !!supabaseKey);

// Test Supabase connection
supabase.from('dietary_options').select('*').limit(1).then(({ data, error }) => {
  if (error) {
    console.error('❌ Supabase connection error:', error.message);
  } else {
    console.log('✅ Supabase connected successfully!');
  }
});

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again later.' }
});
app.use('/api/', limiter);

// --- Ensure upload directory exists ---
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const PROFILE_IMAGES_DIR = path.join(UPLOAD_DIR, 'profile_images');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(PROFILE_IMAGES_DIR)) fs.mkdirSync(PROFILE_IMAGES_DIR, { recursive: true });

// --- Multer Storage Configuration ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PROFILE_IMAGES_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage, 
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'));
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(UPLOAD_DIR));

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
}

// Public holidays for South Africa 2025
const publicHolidays = [
  '2025-01-01', '2025-03-21', '2025-04-18', '2025-04-21', '2025-04-27',
  '2025-05-01', '2025-06-16', '2025-08-09', '2025-09-24', '2025-12-16',
  '2025-12-25', '2025-12-26'
];

// --- UTILITY FUNCTIONS ---
const calculateServiceFee = (subtotal) => {
  return Math.round(subtotal * SERVICE_FEE_PERCENTAGE * 100) / 100;
};

const calculatePaymentProcessingFee = (subtotal) => {
  return Math.round(subtotal * PAYMENT_PROCESSING_FEE_PERCENTAGE * 100) / 100;
};

const calculateTotal = (subtotal) => {
  const serviceFee = calculateServiceFee(subtotal);
  const paymentProcessingFee = calculatePaymentProcessingFee(subtotal);
  return Math.round((subtotal + serviceFee + paymentProcessingFee) * 100) / 100;
};

const generateGoogleMapsUrl = (location) => {
  const address = `${location.street || ''}, ${location.suburb || ''}, ${location.city || ''}, South Africa`.replace(/^,\s*|,\s*$/g, '');
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
};

const isWithinCancellationWindow = (eventDate, eventTime) => {
  const eventDateTime = new Date(`${eventDate}T${eventTime}`);
  const now = new Date();
  const hoursUntilEvent = (eventDateTime - now) / (1000 * 60 * 60);
  return hoursUntilEvent <= CANCELLATION_FEE_HOURS;
};

const getHoursUntilEvent = (eventDate, eventTime) => {
  const eventDateTime = new Date(`${eventDate}T${eventTime}`);
  const now = new Date();
  return Math.round((eventDateTime - now) / (1000 * 60 * 60));
};

const isHoliday = (date) => {
  return publicHolidays.includes(date);
};

const calculateChefRate = (baseRate, eventDate, holidayMultiplier) => {
  if (isHoliday(eventDate)) {
    return baseRate * holidayMultiplier;
  }
  return baseRate;
};

const validateImageQuality = (filePath) => {
  try {
    const dimensions = sizeOf(filePath);
    const stats = fs.statSync(filePath);
    
    // Check minimum dimensions (1000px on shortest side)
    const shortestSide = Math.min(dimensions.width, dimensions.height);
    if (shortestSide < 1000) {
      return { approved: false, reason: 'Image must be at least 1000px on the shortest side' };
    }
    
    // Check file size (max 5MB)
    if (stats.size > 5 * 1024 * 1024) {
      return { approved: false, reason: 'Image must be less than 5MB' };
    }
    
    return { approved: true };
  } catch (error) {
    return { approved: false, reason: 'Invalid image file' };
  }
};

// Simple profanity filter
const containsProfanity = (text) => {
  const profanityList = ['damn', 'hell', 'shit', 'fuck', 'bitch', 'asshole']; // Basic list
  const lowerText = text.toLowerCase();
  return profanityList.some(word => lowerText.includes(word));
};

const filterProfanity = (text) => {
  if (containsProfanity(text)) {
    return text.replace(/\b(damn|hell|shit|fuck|bitch|asshole)\b/gi, '***');
  }
  return text;
};

// --- AUTHENTICATION MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }
    req.user = user;
    next();
  });
};

// --- ERROR HANDLING MIDDLEWARE ---
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

// --- HEALTH CHECK ---
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/test', (req, res) => {
  res.json({ 
    message: 'Private Chef Platform API is working!', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
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
app.post('/api/auth/customers/register', [
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('surname').trim().isLength({ min: 1 }).withMessage('Surname is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('cell_number').isMobilePhone('en-ZA').withMessage('Valid South African cell number is required'),
  body('location').isObject().withMessage('Location is required'),
  body('location.city').trim().isLength({ min: 1 }).withMessage('City is required'),
  body('dietary_requirements').isArray().withMessage('Dietary requirements must be an array')
], handleValidationErrors, async (req, res) => {
  try {
    const { name, surname, email, password, cell_number, location, dietary_requirements } = req.body;

    // Check if customer already exists
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingCustomer) {
      return res.status(409).json({ error: 'Customer with this email already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create customer
    const { data: customer, error } = await supabase
      .from('customers')
      .insert([{
        name: name.trim(),
        surname: surname.trim(),
        email: email.toLowerCase(),
        password_hash: hashedPassword,
        cell_number,
        location,
        dietary_requirements: dietary_requirements || []
      }])
      .select('id, name, surname, email, cell_number, location, dietary_requirements, created_at')
      .single();

    if (error) {
      console.error('Error creating customer:', error);
      return res.status(500).json({ error: 'Failed to create customer account.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: customer.id, user_type: 'customer', email: customer.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Customer account created successfully',
      token,
      user: {
        ...customer,
        user_type: 'customer'
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to create customer account.' });
  }
});

// Login customer
app.post('/api/auth/customers/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 1 }).withMessage('Password is required')
], handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find customer
    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !customer) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, customer.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: customer.id, user_type: 'customer', email: customer.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password hash from response
    const { password_hash, ...customerData } = customer;

    res.json({
      message: 'Login successful',
      token,
      user: {
        ...customerData,
        user_type: 'customer'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed.' });
  }
});

// Register chef
app.post('/api/auth/chefs/register', [
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('surname').trim().isLength({ min: 1 }).withMessage('Surname is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('cell_number').isMobilePhone('en-ZA').withMessage('Valid South African cell number is required'),
  body('work_history').trim().isLength({ min: 10 }).withMessage('Work history must be at least 10 characters'),
  body('bio').trim().isLength({ min: 20 }).withMessage('Bio must be at least 20 characters'),
  body('regions_served').isArray({ min: 1 }).withMessage('At least one region must be served'),
  body('max_travel_distance').isInt({ min: 0, max: 500 }).withMessage('Max travel distance must be between 0-500 km'),
  body('dietary_specialties').isArray().withMessage('Dietary specialties must be an array'),
  body('holiday_rate_multiplier').isFloat({ min: 1, max: 5 }).withMessage('Holiday rate multiplier must be between 1-5')
], handleValidationErrors, async (req, res) => {
  try {
    const { 
      name, surname, email, password, cell_number, work_history, bio, 
      regions_served, max_travel_distance, dietary_specialties, holiday_rate_multiplier 
    } = req.body;

    const { data: existingChef } = await supabase
      .from('chefs')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingChef) {
      return res.status(409).json({ error: 'Chef with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const { data: chef, error } = await supabase
      .from('chefs')
      .insert([{
        name: name.trim(),
        surname: surname.trim(),
        email: email.toLowerCase(),
        password_hash: hashedPassword,
        cell_number,
        work_history: work_history.trim(),
        bio: bio.trim(),
        regions_served: regions_served || [],
        max_travel_distance: parseInt(max_travel_distance),
        dietary_specialties: dietary_specialties || [],
        holiday_rate_multiplier: parseFloat(holiday_rate_multiplier),
        profile_images: [],
        average_rating: 0,
        total_reviews: 0
      }])
      .select(`
        id, name, surname, email, cell_number, work_history, bio,
        regions_served, max_travel_distance, dietary_specialties,
        holiday_rate_multiplier, profile_images, average_rating,
        total_reviews, created_at
      `)
      .single();

    if (error) {
      console.error('Error creating chef:', error);
      return res.status(500).json({ error: 'Failed to create chef account.' });
    }

    const token = jwt.sign(
      { id: chef.id, user_type: 'chef', email: chef.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Chef account created successfully',
      token,
      user: {
        ...chef,
        user_type: 'chef'
      }
    });
  } catch (error) {
    console.error('Chef registration error:', error);
    res.status(500).json({ error: 'Failed to create chef account.' });
  }
});

// Login chef
app.post('/api/auth/chefs/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 1 }).withMessage('Password is required')
], handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: chef, error } = await supabase
      .from('chefs')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !chef) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const validPassword = await bcrypt.compare(password, chef.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: chef.id, user_type: 'chef', email: chef.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password_hash, ...chefData } = chef;

    res.json({
      message: 'Login successful',
      token,
      user: {
        ...chefData,
        user_type: 'chef'
      }
    });
  } catch (error) {
    console.error('Chef login error:', error);
    res.status(500).json({ error: 'Login failed.' });
  }
});

// Token verification
app.get('/api/auth/verify', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    let userData;
    if (decoded.user_type === 'customer') {
      const { data } = await supabase
        .from('customers')
        .select('id, name, surname, email, cell_number, location, dietary_requirements, created_at')
        .eq('id', decoded.id)
        .single();
      userData = data;
    } else if (decoded.user_type === 'chef') {
      const { data } = await supabase
        .from('chefs')
        .select(`
          id, name, surname, email, cell_number, work_history, bio,
          regions_served, max_travel_distance, dietary_specialties,
          holiday_rate_multiplier, profile_images, average_rating,
          total_reviews, created_at
        `)
        .eq('id', decoded.id)
        .single();
      userData = data;
    }

    if (!userData) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({
      valid: true,
      user: {
        ...userData,
        user_type: decoded.user_type
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Token verification failed.' });
  }
});

// Profile endpoints
app.get('/api/customers/profile', authenticateToken, async (req, res) => {
  try {
    if (req.user.user_type !== 'customer') {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const { data: customer, error } = await supabase
      .from('customers')
      .select('id, name, surname, email, cell_number, location, dietary_requirements, created_at')
      .eq('id', req.user.id)
      .single();

    if (error || !customer) {
      return res.status(404).json({ error: 'Customer not found.' });
    }

    res.json(customer);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch customer profile.' });
  }
});

app.get('/api/chefs/profile', authenticateToken, async (req, res) => {
  try {
    if (req.user.user_type !== 'chef') {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const { data: chef, error } = await supabase
      .from('chefs')
      .select(`
        id, name, surname, email, cell_number, work_history, bio,
        regions_served, max_travel_distance, dietary_specialties,
        holiday_rate_multiplier, profile_images, average_rating,
        total_reviews, created_at
      `)
      .eq('id', req.user.id)
      .single();

    if (error || !chef) {
      return res.status(404).json({ error: 'Chef not found.' });
    }

    res.json(chef);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch chef profile.' });
  }
});

// Upload chef profile images
app.post('/api/chefs/profile/images', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    if (req.user.user_type !== 'chef') {
      return res.status(403).json({ error: 'Access denied.' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded.' });
    }

    const processedImages = [];
    const rejectedImages = [];

    for (const file of req.files) {
      const validation = validateImageQuality(file.path);
      
      if (validation.approved) {
        const imageData = {
          url: `/uploads/profile_images/${file.filename}`,
          alt_text: req.body.alt_text || `${req.user.name} chef work`,
          caption: req.body.caption || '',
          approved: true,
          uploaded_at: new Date().toISOString()
        };
        processedImages.push(imageData);
      } else {
        rejectedImages.push({
          filename: file.originalname,
          reason: validation.reason
        });
        fs.unlinkSync(file.path);
      }
    }

    if (processedImages.length === 0) {
      return res.status(400).json({ 
        error: 'No images met quality requirements.',
        rejected: rejectedImages
      });
    }

    const { data: chef, error: fetchError } = await supabase
      .from('chefs')
      .select('profile_images')
      .eq('id', req.user.id)
      .single();

    if (fetchError) {
      return res.status(500).json({ error: 'Failed to fetch chef profile.' });
    }

    const updatedImages = [...(chef.profile_images || []), ...processedImages];
    
    const { data: updatedChef, error: updateError } = await supabase
      .from('chefs')
      .update({ profile_images: updatedImages })
      .eq('id', req.user.id)
      .select('profile_images')
      .single();

    if (updateError) {
      console.error('Error updating chef images:', updateError);
      return res.status(500).json({ error: 'Failed to save images.' });
    }

    res.json({
      message: 'Images uploaded successfully',
      uploaded: processedImages,
      rejected: rejectedImages,
      total_images: updatedChef.profile_images.length
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to upload images.' });
  }
});

// Booking endpoints
app.post('/api/bookings', authenticateToken, [
  body('chef_id').isInt({ min: 1 }).withMessage('Valid chef ID is required'),
  body('event_date').isISO8601().withMessage('Valid event date is required'),
  body('event_time').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid event time is required (HH:MM)'),
  body('party_size').isInt({ min: 1, max: 50 }).withMessage('Party size must be between 1-50'),
  body('dietary_requirements').isArray().withMessage('Dietary requirements must be an array'),
  body('customer_supplies_tools').isBoolean().withMessage('Customer supplies tools must be boolean'),
  body('event_location').isObject().withMessage('Event location is required'),
  body('event_location.street').trim().isLength({ min: 1 }).withMessage('Street address is required'),
  body('event_location.city').trim().isLength({ min: 1 }).withMessage('City is required')
], handleValidationErrors, async (req, res) => {
  try {
    if (req.user.user_type !== 'customer') {
      return res.status(403).json({ error: 'Only customers can create bookings.' });
    }

    const { 
      chef_id, event_date, event_time, party_size, dietary_requirements, 
      customer_supplies_tools, event_location, special_requests 
    } = req.body;

    const eventDateTime = new Date(`${event_date}T${event_time}`);
    if (eventDateTime <= new Date()) {
      return res.status(400).json({ error: 'Event date must be in the future.' });
    }

    const { data: chef, error: chefError } = await supabase
      .from('chefs')
      .select('id, name, surname, regions_served')
      .eq('id', chef_id)
      .single();

    if (chefError || !chef) {
      return res.status(404).json({ error: 'Chef not found.' });
    }

    const { data: booking, error } = await supabase
      .from('bookings')
      .insert([{
        customer_id: req.user.id,
        chef_id,
        event_date,
        event_time,
        party_size,
        dietary_requirements: dietary_requirements || [],
        customer_supplies_tools,
        event_location,
        special_requests: special_requests || '',
        status: 'pending',
        google_maps_url: generateGoogleMapsUrl(event_location)
      }])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating booking:', error);
      return res.status(500).json({ error: 'Failed to create booking.' });
    }

    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .insert([{
        booking_id: booking.id,
        customer_id: req.user.id,
        chef_id,
        status: 'active'
      }])
      .select('id')
      .single();

    if (!chatError && chat) {
      await supabase
        .from('messages')
        .insert([{
          chat_id: chat.id,
          sender_id: req.user.id,
          sender_type: 'customer',
          message: `New booking request created for ${event_date} at ${event_time}. Party size: ${party_size}`,
          is_automated: true
        }]);
    }

    res.status(201).json({
      message: 'Booking created successfully',
      booking: {
        ...booking,
        chef: {
          id: chef.id,
          name: chef.name,
          surname: chef.surname
        },
        chat_id: chat?.id
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to create booking.' });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('authenticate', (token) => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.userId = decoded.id;
      socket.userType = decoded.user_type;
      socket.join(`user_${decoded.id}`);
      console.log(`User ${decoded.id} (${decoded.user_type}) authenticated on socket ${socket.id}`);
    } catch (error) {
      console.log('Socket authentication failed:', error.message);
      socket.emit('auth_error', { error: 'Invalid token' });
    }
  });

  socket.on('join_chat', (chatId) => {
    if (!socket.userId) {
      socket.emit('error', { error: 'Authentication required' });
      return;
    }
    
    socket.join(`chat_${chatId}`);
    console.log(`User ${socket.userId} joined chat ${chatId}`);
    
    socket.to(`chat_${chatId}`).emit('user_joined_chat', {
      userId: socket.userId,
      userType: socket.userType
    });
  });

  socket.on('send_message', async (data) => {
    try {
      if (!socket.userId) {
        socket.emit('error', { error: 'Authentication required' });
        return;
      }

      const { chatId, message } = data;
      
      if (!chatId || !message || message.trim().length === 0) {
        socket.emit('error', { error: 'Chat ID and message are required' });
        return;
      }

      const filteredMessage = filterProfanity(message.trim());

      const messageData = {
        id: Date.now(),
        sender_id: socket.userId,
        sender_type: socket.userType,
        message: filteredMessage,
        timestamp: new Date().toISOString(),
        is_automated: false
      };

      io.to(`chat_${chatId}`).emit('new_message', messageData);
      
    } catch (error) {
      console.error('Socket message error:', error);
      socket.emit('error', { error: 'Failed to send message' });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large. Maximum size is 5MB.' });
  }
  
  if (err.message && err.message.includes('Only image files')) {
    return res.status(400).json({ error: err.message });
  }
  
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    available_endpoints: {
      health: 'GET /health',
      test: 'GET /test',
      auth: 'POST /api/auth/*',
      bookings: 'GET|POST /api/bookings/*',
      chats: 'GET|POST /api/chats/*',
      public: 'GET /api/dietary-options, /api/cuisines, /api/regions, /api/chefs/search'
    }
  });
});

console.log('Server setup complete. Starting server...');

module.exports = { app, httpServer, io, supabase };

if (require.main === module) {
  httpServer.listen(port, () => {
    console.log(`Private Chef Platform API running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Health check: http://localhost:${port}/health`);
    console.log(`Test endpoint: http://localhost:${port}/test`);
  });
}