# 🍽️ ChefConnect - Private Chef Platform

A comprehensive, **100% FREE-TO-RUN** private chef platform connecting customers with professional chefs in South Africa. Built with modern technologies and optimized for performance, scalability, and cost-effectiveness.

## ✨ Features

### 🎯 Core Features
- **🔍 Chef Discovery**: Advanced search and filtering system
- **💬 Real-time Chat**: WebSocket-based messaging (no Socket.IO needed!)
- **💳 Payment Processing**: Stripe integration for secure transactions
- **📱 Responsive Design**: Works perfectly on ALL devices
- **🔐 Authentication**: JWT-based secure user management
- **📊 Chef Dashboard**: Complete business management interface
- **📸 Image Upload**: Logo and profile image management
- **🔔 Notifications**: Real-time user notifications
- **⭐ Reviews & Ratings**: Customer feedback system

### 🚀 Performance Features
- **⚡ Ultra-Fast**: Optimized for speed and performance
- **📱 Universal Responsive**: Works on mobile, tablet, desktop, ultrawide
- **🔄 Real-time Updates**: WebSocket connections for instant updates
- **💾 Smart Caching**: Efficient data caching and optimization
- **🛡️ Security First**: Enterprise-level security measures
- **📈 Scalable**: Built to handle high traffic and growth

## 🆓 100% Free Services Used

- ✅ **Supabase** (Free tier: 50,000 database rows, 500MB storage)
- ✅ **Native WebSockets** (No Socket.IO needed!)
- ✅ **Vercel/Netlify** (Free hosting)
- ✅ **GitHub** (Free repository)
- ✅ **Cloudflare** (Free CDN & security)

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **WebSockets** (Native, no external dependencies)
- **Supabase** (PostgreSQL database)
- **JWT** authentication
- **Multer** for file uploads
- **Winston** for logging
- **Helmet** for security

### Frontend
- **Next.js 14** with React 18
- **Tailwind CSS** for styling
- **Radix UI** for components
- **Framer Motion** for animations
- **React Hook Form** for forms
- **React Query** for data fetching

### Infrastructure
- **Docker** for containerization
- **Nginx** for reverse proxy
- **Redis** for caching (optional)
- **Prometheus** for monitoring

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 8+
- Supabase account (free)

### 1. Clone Repository
```bash
git clone https://github.com/chefconnect/platform.git
cd platform
```

### 2. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd web
npm install
cd ..
```

### 3. Environment Setup
```bash
# Copy environment template
cp .env.local.example .env.local

# Edit environment variables
nano .env.local
```

### 4. Database Setup
```bash
# Run database migrations
npm run db:migrate

# Seed sample data (optional)
npm run db:seed
```

### 5. Start Development
```bash
# Start backend server
npm run dev

# In another terminal, start frontend
cd web
npm run dev
```

### 6. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🐳 Docker Deployment

### Development
```bash
# Build and run with Docker Compose
docker-compose up --build

# Run in background
docker-compose up -d
```

### Production
```bash
# Build production image
docker build -t chefconnect-platform .

# Run production container
docker run -p 3000:3000 chefconnect-platform
```

## 📱 Responsive Design

The platform is built with **universal responsive design** that works perfectly on:

- 📱 **Mobile Phones** (320px+)
- 📱 **Large Mobile** (425px+)
- 📱 **Tablets** (768px+)
- 💻 **Laptops** (1024px+)
- 🖥️ **Desktops** (1280px+)
- 🖥️ **Large Desktops** (1920px+)
- 🖥️ **Ultra-wide** (2560px+)
- 🖥️ **Dual Screens** and large displays

## 🔧 Configuration

### Environment Variables

```env
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Security
JWT_SECRET=your-super-secret-jwt-key
BCRYPT_ROUNDS=12

# Server
PORT=3000
NODE_ENV=production

# Features
ENABLE_CHAT=true
ENABLE_PAYMENTS=true
ENABLE_NOTIFICATIONS=true
```

### Business Configuration

```env
# Pricing
SERVICE_FEE_PERCENTAGE=10
PAYMENT_PROCESSING_FEE_PERCENTAGE=2.9

# Booking Rules
MIN_BOOKING_HOURS=2
MAX_BOOKING_HOURS=12
CANCELLATION_HOURS=24

# File Upload
MAX_IMAGE_SIZE=5242880
MAX_IMAGES_PER_CHEF=10
```

## 📊 Performance Optimizations

### Backend Optimizations
- **Cluster Mode**: Multi-process scaling
- **Connection Pooling**: Efficient database connections
- **Rate Limiting**: Prevents abuse
- **Compression**: Gzip compression
- **Caching**: Smart response caching
- **Logging**: Structured logging with Winston

### Frontend Optimizations
- **Code Splitting**: Dynamic imports
- **Image Optimization**: Next.js image optimization
- **Bundle Analysis**: Webpack bundle analyzer
- **Lazy Loading**: Component lazy loading
- **CDN Ready**: Static asset optimization

### Database Optimizations
- **Indexing**: Optimized database indexes
- **Query Optimization**: Efficient queries
- **Connection Pooling**: Supabase connection pooling
- **Caching**: Redis caching layer

## 🛡️ Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcrypt with configurable rounds
- **Input Validation**: Comprehensive input sanitization
- **Rate Limiting**: API rate limiting
- **CORS Protection**: Cross-origin request protection

### Data Protection
- **Input Sanitization**: DOMPurify for XSS protection
- **SQL Injection Prevention**: Parameterized queries
- **File Upload Security**: Type and size validation
- **HTTPS Enforcement**: SSL/TLS encryption
- **Security Headers**: Helmet.js security headers

### Monitoring & Logging
- **Structured Logging**: Winston logger
- **Error Tracking**: Comprehensive error handling
- **Health Checks**: Application health monitoring
- **Performance Metrics**: Request timing and monitoring

## 📈 Scalability Features

### Horizontal Scaling
- **Cluster Mode**: Multi-process scaling
- **Load Balancing**: Nginx load balancer
- **Database Scaling**: Supabase auto-scaling
- **CDN Integration**: Cloudflare CDN

### Vertical Scaling
- **Memory Optimization**: Efficient memory usage
- **CPU Optimization**: Multi-core utilization
- **Storage Optimization**: Efficient file storage
- **Network Optimization**: Connection pooling

## 🔄 Real-time Features

### WebSocket Implementation
- **Native WebSockets**: No external dependencies
- **Connection Management**: Efficient connection handling
- **Message Broadcasting**: Real-time message delivery
- **Heartbeat System**: Connection health monitoring
- **Reconnection Logic**: Automatic reconnection

### Real-time Features
- **Live Chat**: Instant messaging
- **Typing Indicators**: Real-time typing status
- **Notifications**: Push notifications
- **Status Updates**: Live status updates
- **Booking Updates**: Real-time booking changes

## 📱 Mobile Optimization

### Touch-Friendly Design
- **44px Touch Targets**: Minimum touch target size
- **Swipe Gestures**: Touch-friendly interactions
- **Responsive Typography**: Fluid text scaling
- **Adaptive Layouts**: Screen-size aware layouts

### Performance
- **Fast Loading**: Optimized for mobile networks
- **Offline Support**: Service worker caching
- **Progressive Enhancement**: Works without JavaScript
- **Battery Optimization**: Efficient resource usage

## 🎨 Design System

### Universal Components
- **Responsive Grid**: Flexible grid system
- **Fluid Typography**: Scalable text system
- **Adaptive Spacing**: Screen-size aware spacing
- **Touch Targets**: Accessibility-compliant targets

### Theme System
- **Dark/Light Mode**: Automatic theme switching
- **Custom Properties**: CSS custom properties
- **Consistent Colors**: Design system colors
- **Accessible Contrast**: WCAG compliant contrast

## 🚀 Deployment Options

### Free Hosting Options
1. **Vercel** (Frontend + API Routes)
2. **Netlify** (Frontend + Functions)
3. **Railway** (Full-stack)
4. **Render** (Full-stack)
5. **Heroku** (Full-stack)

### Self-Hosted Options
1. **Docker** (Local/Cloud)
2. **VPS** (DigitalOcean, Linode)
3. **Cloud** (AWS, GCP, Azure)
4. **Dedicated Server**

## 📊 Monitoring & Analytics

### Built-in Monitoring
- **Health Checks**: `/health` endpoint
- **Performance Metrics**: Request timing
- **Error Tracking**: Comprehensive error logging
- **Usage Statistics**: User activity tracking

### Optional Integrations
- **Google Analytics**: User behavior tracking
- **Sentry**: Error tracking and monitoring
- **Mixpanel**: User analytics
- **Prometheus**: Metrics collection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.chefconnect.co.za](https://docs.chefconnect.co.za)
- **Issues**: [GitHub Issues](https://github.com/chefconnect/platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/chefconnect/platform/discussions)
- **Email**: support@chefconnect.co.za

## 🎉 Acknowledgments

- **Supabase** for the amazing database platform
- **Vercel** for the excellent hosting platform
- **Tailwind CSS** for the utility-first CSS framework
- **Radix UI** for the accessible component primitives
- **Next.js** for the powerful React framework

---

**Built with ❤️ for the South African culinary community**

*ChefConnect - Connecting chefs with food lovers across South Africa* 🇿🇦