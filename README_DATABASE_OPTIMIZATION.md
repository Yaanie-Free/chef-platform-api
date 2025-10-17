# Chef Platform Database Optimization

This repository contains a comprehensive database optimization solution for the Chef Platform API built on Supabase. The optimization includes performance tuning, scalability improvements, and monitoring tools.

## 🚀 Quick Start

### 1. Apply Database Optimizations

Run the main optimization script on your Supabase database:

```sql
-- Connect to your Supabase database and run:
\i supabase_optimization_script.sql
```

This will create:
- ✅ Optimized database schema
- ✅ Performance indexes
- ✅ Advanced search functions
- ✅ Recommendation system
- ✅ Analytics functions
- ✅ Materialized views
- ✅ Row Level Security (RLS) policies
- ✅ Sample data for testing

### 2. Set Up Monitoring

Run the monitoring script to enable database health monitoring:

```sql
-- Connect to your Supabase database and run:
\i database_monitoring_script.sql
```

This will create:
- ✅ Performance monitoring functions
- ✅ Health check functions
- ✅ Maintenance utilities
- ✅ Analytics and reporting tools

## 📊 Database Schema Overview

### Core Tables

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `profiles` | User profiles | Extends auth.users, chef verification |
| `recipes` | Recipe data | Full-text search, ratings, views |
| `recipe_ingredients` | Ingredient details | Normalized, searchable |
| `categories` | Recipe categories | Hierarchical structure |
| `cuisines` | Cuisine types | Regional classification |
| `dietary_tags` | Dietary restrictions | Allergen tracking |
| `recipe_ratings` | User ratings | 1-5 star system with reviews |
| `collections` | Recipe collections | User-created cookbooks |
| `user_follows` | Social following | Chef following system |
| `recipe_views` | Analytics tracking | View counting and analytics |
| `recipe_interactions` | User interactions | Likes, shares, bookmarks |

### Performance Features

- **Full-text search** with ranking
- **Advanced filtering** (category, cuisine, dietary, rating, time)
- **Recommendation system** (collaborative + content-based)
- **Materialized views** for popular content
- **Comprehensive indexing** strategy
- **Row Level Security** for data protection

## 🔍 Key Functions

### Search Functions

```sql
-- Advanced recipe search with filtering
SELECT * FROM search_recipes(
    search_query := 'pasta carbonara',
    category_ids := ARRAY['main-courses'::uuid],
    cuisine_ids := ARRAY['italian'::uuid],
    min_rating := 4.0,
    limit_count := 20
);

-- Get recipe recommendations for a user
SELECT * FROM get_recipe_recommendations(
    user_id := 'user-uuid-here',
    limit_count := 10
);

-- Get trending recipes
SELECT * FROM get_trending_recipes(
    time_period := '7 days',
    limit_count := 10
);
```

### Analytics Functions

```sql
-- Get user analytics
SELECT * FROM get_user_analytics('user-uuid-here');

-- Get recipe analytics
SELECT * FROM get_recipe_analytics('recipe-uuid-here');

-- Get platform growth metrics
SELECT * FROM get_platform_growth_metrics(30); -- Last 30 days
```

### Monitoring Functions

```sql
-- Check database health
SELECT * FROM check_database_health();

-- Get performance metrics
SELECT * FROM get_database_performance_metrics();

-- Get slow queries (requires pg_stat_statements)
SELECT * FROM get_slow_queries();

-- Get index usage statistics
SELECT * FROM get_index_usage_stats();
```

## 🛠️ Maintenance

### Daily Maintenance

```sql
-- Run daily maintenance
SELECT * FROM perform_database_maintenance();

-- Or use the automated function
SELECT run_daily_maintenance();
```

### Regular Tasks

1. **Weekly**: Refresh materialized views
2. **Monthly**: Clean up old analytics data
3. **Quarterly**: Review and optimize indexes
4. **As needed**: Monitor query performance

## 📈 Performance Optimizations

### Indexing Strategy

- **B-tree indexes** for exact matches and range queries
- **GIN indexes** for full-text search and array operations
- **Partial indexes** for filtered queries
- **Composite indexes** for multi-column queries

### Query Optimization

- **Full-text search** with ranking algorithms
- **Efficient pagination** with proper offset/limit
- **Optimized joins** with proper foreign key relationships
- **Materialized views** for expensive aggregations

### Caching Strategy

- **Materialized views** for popular content
- **Application-level caching** recommended for frequently accessed data
- **CDN integration** for static assets

## 🔒 Security Features

### Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

- **Public content** is viewable by everyone
- **Private content** is only accessible by owners
- **User-specific data** is protected by user ID
- **Admin functions** require proper authentication

### Data Protection

- **Encrypted connections** (Supabase handles this)
- **Input validation** through constraints
- **SQL injection protection** through parameterized queries
- **Access logging** through audit trails

## 📊 Monitoring and Analytics

### Performance Monitoring

- **Query execution time** tracking
- **Index usage** analysis
- **Database size** monitoring
- **Connection pool** health

### Business Analytics

- **User engagement** metrics
- **Content performance** tracking
- **Growth metrics** and trends
- **Popular content** identification

### Health Checks

- **Unused index** detection
- **Table maintenance** needs
- **Database size** warnings
- **Performance threshold** alerts

## 🚀 Deployment Guide

### 1. Production Setup

1. **Backup existing data** (if any)
2. **Run optimization script** during maintenance window
3. **Test all functions** with sample data
4. **Set up monitoring** and alerting
5. **Configure maintenance** schedules

### 2. Environment Variables

Ensure these are set in your Supabase project:

```env
# Database connection
DATABASE_URL=postgresql://...

# Optional: For advanced monitoring
PG_STAT_STATEMENTS=true
```

### 3. Monitoring Setup

1. **Enable pg_stat_statements** extension
2. **Set up regular monitoring** queries
3. **Configure alerting** for critical metrics
4. **Schedule maintenance** tasks

## 🔧 Troubleshooting

### Common Issues

1. **Slow queries**: Check index usage and query plans
2. **High memory usage**: Optimize connection pooling
3. **Lock contention**: Review transaction isolation levels
4. **Storage issues**: Clean up old data and optimize tables

### Performance Tuning

1. **Monitor query performance** regularly
2. **Adjust indexes** based on usage patterns
3. **Optimize materialized view** refresh schedules
4. **Scale resources** as needed

## 📚 Additional Resources

### Documentation

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Performance Tuning](https://www.postgresql.org/docs/current/performance-tips.html)
- [Database Indexing Best Practices](https://use-the-index-luke.com/)

### Monitoring Tools

- **Supabase Dashboard**: Built-in monitoring
- **pgAdmin**: Database administration
- **Grafana**: Advanced monitoring dashboards
- **Prometheus**: Metrics collection

## 🤝 Contributing

To contribute to this optimization:

1. **Test changes** thoroughly
2. **Document new functions** clearly
3. **Update monitoring** as needed
4. **Follow performance** best practices

## 📄 License

This optimization script is provided as-is for the Chef Platform project. Use and modify as needed for your specific requirements.

---

## 🎯 Next Steps

After applying these optimizations:

1. **Test the search functions** with your data
2. **Monitor query performance** and adjust as needed
3. **Set up regular maintenance** schedules
4. **Configure monitoring** and alerting
5. **Scale resources** based on usage patterns

The database is now optimized for performance, scalability, and maintainability! 🚀