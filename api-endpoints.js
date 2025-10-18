// Additional API endpoints to add to server.js

// --- CHAT ENDPOINTS ---

// Get conversations for a user
app.get('/api/chats', authenticateToken, async (req, res) => {
  try {
    const { data: conversations, error } = await supabase
      .from('chats')
      .select(`
        id, status, created_at, updated_at,
        customer:customers(id, name, surname, profile_image),
        chef:chefs(id, name, surname, profile_images),
        booking:bookings(id, event_date, event_time, status)
      `)
      .or(`customer_id.eq.${req.user.id},chef_id.eq.${req.user.id}`)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return res.status(500).json({ error: 'Failed to fetch conversations.' });
    }

    // Process conversations for display
    const processedConversations = conversations.map(conv => ({
      id: conv.id,
      status: conv.status,
      timestamp: conv.updated_at,
      clientName: req.user.user_type === 'customer' ? conv.chef?.name : conv.customer?.name,
      clientImage: req.user.user_type === 'customer' ? conv.chef?.profile_images?.[0]?.url : conv.customer?.profile_image,
      lastMessage: conv.last_message || 'No messages yet',
      unreadCount: conv.unread_count || 0,
      online: false, // This would be tracked via Socket.IO
      bookingStatus: conv.booking?.status
    }));

    res.json(processedConversations);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations.' });
  }
});

// Get messages for a specific chat
app.get('/api/chats/:chatId/messages', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return res.status(500).json({ error: 'Failed to fetch messages.' });
    }

    res.json(messages);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch messages.' });
  }
});

// --- CHEF DASHBOARD ENDPOINTS ---

// Get chef statistics
app.get('/api/chefs/stats', authenticateToken, async (req, res) => {
  try {
    if (req.user.user_type !== 'chef') {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const chefId = req.user.id;

    // Get booking statistics
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('status, total_amount, created_at')
      .eq('chef_id', chefId);

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      return res.status(500).json({ error: 'Failed to fetch booking statistics.' });
    }

    // Get review statistics
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('rating')
      .eq('chef_id', chefId);

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError);
      return res.status(500).json({ error: 'Failed to fetch review statistics.' });
    }

    // Get post statistics
    const { data: posts, error: postsError } = await supabase
      .from('chef_posts')
      .select('id, likes_count, comments_count')
      .eq('chef_id', chefId);

    if (postsError) {
      console.error('Error fetching posts:', postsError);
      return res.status(500).json({ error: 'Failed to fetch post statistics.' });
    }

    // Calculate statistics
    const totalBookings = bookings.length;
    const upcomingBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
    const monthlyRevenue = bookings
      .filter(b => {
        const bookingDate = new Date(b.created_at);
        const now = new Date();
        return bookingDate.getMonth() === now.getMonth() && bookingDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, b) => sum + (b.total_amount || 0), 0);

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
      : 0;

    const totalLikes = posts.reduce((sum, p) => sum + (p.likes_count || 0), 0);
    const totalPosts = posts.length;

    res.json({
      totalLikes,
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      totalBookings,
      upcomingBookings,
      completedBookings,
      totalRevenue,
      monthlyRevenue,
      totalPosts,
      profileViews: 0 // This would be tracked separately
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch chef statistics.' });
  }
});

// Get chef posts
app.get('/api/chefs/posts', authenticateToken, async (req, res) => {
  try {
    if (req.user.user_type !== 'chef') {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const { data: posts, error } = await supabase
      .from('chef_posts')
      .select('*')
      .eq('chef_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      return res.status(500).json({ error: 'Failed to fetch posts.' });
    }

    res.json(posts);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch posts.' });
  }
});

// Create chef post
app.post('/api/chefs/posts', authenticateToken, [
  body('content').trim().isLength({ min: 1 }).withMessage('Content is required'),
  body('images').optional().isArray().withMessage('Images must be an array'),
  body('location').optional().trim(),
  body('tags').optional().isArray().withMessage('Tags must be an array')
], handleValidationErrors, async (req, res) => {
  try {
    if (req.user.user_type !== 'chef') {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const { content, images = [], location, tags = [] } = req.body;

    const { data: post, error } = await supabase
      .from('chef_posts')
      .insert([{
        chef_id: req.user.id,
        content: content.trim(),
        images,
        location: location?.trim() || null,
        tags,
        likes_count: 0,
        comments_count: 0
      }])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating post:', error);
      return res.status(500).json({ error: 'Failed to create post.' });
    }

    res.status(201).json(post);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to create post.' });
  }
});

// Delete chef post
app.delete('/api/chefs/posts/:postId', authenticateToken, async (req, res) => {
  try {
    if (req.user.user_type !== 'chef') {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const { postId } = req.params;

    const { error } = await supabase
      .from('chef_posts')
      .delete()
      .eq('id', postId)
      .eq('chef_id', req.user.id);

    if (error) {
      console.error('Error deleting post:', error);
      return res.status(500).json({ error: 'Failed to delete post.' });
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to delete post.' });
  }
});

// Update chef profile
app.put('/api/chefs/profile', authenticateToken, [
  body('name').optional().trim().isLength({ min: 1 }).withMessage('Name must not be empty'),
  body('surname').optional().trim().isLength({ min: 1 }).withMessage('Surname must not be empty'),
  body('bio').optional().trim().isLength({ min: 20 }).withMessage('Bio must be at least 20 characters'),
  body('work_history').optional().trim().isLength({ min: 10 }).withMessage('Work history must be at least 10 characters'),
  body('regions_served').optional().isArray().withMessage('Regions served must be an array'),
  body('max_travel_distance').optional().isInt({ min: 0, max: 500 }).withMessage('Max travel distance must be between 0-500 km'),
  body('dietary_specialties').optional().isArray().withMessage('Dietary specialties must be an array'),
  body('holiday_rate_multiplier').optional().isFloat({ min: 1, max: 5 }).withMessage('Holiday rate multiplier must be between 1-5'),
  body('base_rate').optional().isFloat({ min: 0 }).withMessage('Base rate must be a positive number')
], handleValidationErrors, async (req, res) => {
  try {
    if (req.user.user_type !== 'chef') {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const updateData = {};
    const allowedFields = [
      'name', 'surname', 'bio', 'work_history', 'regions_served',
      'max_travel_distance', 'dietary_specialties', 'holiday_rate_multiplier', 'base_rate'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const { data: chef, error } = await supabase
      .from('chefs')
      .update(updateData)
      .eq('id', req.user.id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating chef profile:', error);
      return res.status(500).json({ error: 'Failed to update profile.' });
    }

    res.json(chef);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// --- PAYMENT ENDPOINTS ---

// Create payment intent
app.post('/api/payments/create-intent', authenticateToken, [
  body('chefId').isInt({ min: 1 }).withMessage('Valid chef ID is required'),
  body('subtotal').isFloat({ min: 0 }).withMessage('Subtotal must be a positive number'),
  body('eventDate').isISO8601().withMessage('Valid event date is required'),
  body('partySize').isInt({ min: 1, max: 50 }).withMessage('Party size must be between 1-50')
], handleValidationErrors, async (req, res) => {
  try {
    const { chefId, subtotal, eventDate, partySize, paymentMethodId } = req.body;

    // Calculate fees
    const serviceFee = calculateServiceFee(subtotal);
    const paymentProcessingFee = calculatePaymentProcessingFee(subtotal);
    const total = calculateTotal(subtotal);

    // Create payment intent with Stripe
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Convert to cents
      currency: 'zar',
      metadata: {
        chefId,
        customerId: req.user.id,
        eventDate,
        partySize,
        subtotal,
        serviceFee,
        paymentProcessingFee
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent.' });
  }
});

// Confirm payment
app.post('/api/payments/confirm', authenticateToken, [
  body('paymentIntentId').trim().isLength({ min: 1 }).withMessage('Payment intent ID is required'),
  body('paymentMethodId').trim().isLength({ min: 1 }).withMessage('Payment method ID is required')
], handleValidationErrors, async (req, res) => {
  try {
    const { paymentIntentId, paymentMethodId } = req.body;

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      // Create booking record
      const bookingData = {
        customer_id: req.user.id,
        chef_id: paymentIntent.metadata.chefId,
        event_date: paymentIntent.metadata.eventDate,
        party_size: parseInt(paymentIntent.metadata.partySize),
        subtotal: parseFloat(paymentIntent.metadata.subtotal),
        service_fee: parseFloat(paymentIntent.metadata.serviceFee),
        payment_processing_fee: parseFloat(paymentIntent.metadata.paymentProcessingFee),
        total_amount: paymentIntent.amount / 100,
        payment_intent_id: paymentIntentId,
        status: 'confirmed'
      };

      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select('*')
        .single();

      if (bookingError) {
        console.error('Error creating booking:', bookingError);
        return res.status(500).json({ error: 'Failed to create booking.' });
      }

      res.json({
        success: true,
        booking,
        paymentIntent
      });
    } else {
      res.status(400).json({ error: 'Payment not completed.' });
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ error: 'Failed to confirm payment.' });
  }
});

// --- BOOKING ENDPOINTS ---

// Get chef availability
app.get('/api/chefs/:chefId/availability', async (req, res) => {
  try {
    const { chefId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required.' });
    }

    // Get existing bookings for the date
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('event_time, status')
      .eq('chef_id', chefId)
      .eq('event_date', date)
      .in('status', ['confirmed', 'pending']);

    if (error) {
      console.error('Error fetching availability:', error);
      return res.status(500).json({ error: 'Failed to fetch availability.' });
    }

    // Generate available time slots (every 2 hours from 10 AM to 10 PM)
    const availableTimes = [];
    const bookedTimes = bookings.map(b => b.event_time);
    
    for (let hour = 10; hour <= 22; hour += 2) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      if (!bookedTimes.includes(time)) {
        availableTimes.push(time);
      }
    }

    res.json({ availableTimes });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch availability.' });
  }
});

// Update booking status
app.put('/api/bookings/:bookingId/status', authenticateToken, [
  body('status').isIn(['confirmed', 'declined', 'completed', 'cancelled']).withMessage('Invalid status')
], handleValidationErrors, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    // Check if user has permission to update this booking
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (fetchError || !booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    // Check permissions
    if (req.user.user_type === 'customer' && booking.customer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    if (req.user.user_type === 'chef' && booking.chef_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const { data: updatedBooking, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating booking:', error);
      return res.status(500).json({ error: 'Failed to update booking.' });
    }

    res.json(updatedBooking);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to update booking.' });
  }
});

// --- REVIEW ENDPOINTS ---

// Get chef reviews
app.get('/api/chefs/:chefId/reviews', async (req, res) => {
  try {
    const { chefId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        id, rating, comment, created_at,
        customer:customers(id, name, surname, profile_image)
      `)
      .eq('chef_id', chefId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching reviews:', error);
      return res.status(500).json({ error: 'Failed to fetch reviews.' });
    }

    res.json(reviews);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
});

// Create review
app.post('/api/reviews', authenticateToken, [
  body('chefId').isInt({ min: 1 }).withMessage('Valid chef ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1-5'),
  body('comment').optional().trim().isLength({ max: 500 }).withMessage('Comment must be less than 500 characters')
], handleValidationErrors, async (req, res) => {
  try {
    if (req.user.user_type !== 'customer') {
      return res.status(403).json({ error: 'Only customers can create reviews.' });
    }

    const { chefId, rating, comment } = req.body;

    // Check if customer has a completed booking with this chef
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id')
      .eq('customer_id', req.user.id)
      .eq('chef_id', chefId)
      .eq('status', 'completed')
      .single();

    if (bookingError || !booking) {
      return res.status(400).json({ error: 'You can only review chefs you have booked with.' });
    }

    // Check if customer has already reviewed this chef
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('customer_id', req.user.id)
      .eq('chef_id', chefId)
      .single();

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this chef.' });
    }

    const { data: review, error } = await supabase
      .from('reviews')
      .insert([{
        customer_id: req.user.id,
        chef_id: chefId,
        rating,
        comment: comment?.trim() || null
      }])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating review:', error);
      return res.status(500).json({ error: 'Failed to create review.' });
    }

    // Update chef's average rating
    const { data: allReviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('chef_id', chefId);

    const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await supabase
      .from('chefs')
      .update({
        average_rating: Math.round(averageRating * 10) / 10,
        total_reviews: allReviews.length
      })
      .eq('id', chefId);

    res.status(201).json(review);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to create review.' });
  }
});

module.exports = {
  // Export all the endpoint functions if needed
};