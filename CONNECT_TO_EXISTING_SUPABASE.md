# Connect to Your Existing Supabase Database

Since you already have a Supabase setup, here's how to connect to it and apply the database optimizations.

## 🔗 **Method 1: Using Supabase CLI (Recommended)**

### Step 1: Get Your Project Details
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **General**
4. Copy your **Project Reference ID** (looks like `abcdefghijklmnop`)

### Step 2: Authenticate with Supabase
```bash
# Option A: Using access token (recommended)
export SUPABASE_ACCESS_TOKEN="your_access_token_here"
supabase login

# Option B: Using project reference directly
supabase link --project-ref your_project_reference_id
```

### Step 3: Apply Optimizations
```bash
# Push the optimization script to your database
supabase db push

# Or run the SQL directly
supabase db reset --db-url "postgresql://postgres:[password]@[host]:5432/postgres"
```

## 🔗 **Method 2: Direct Database Connection**

### Step 1: Get Your Database Connection String
1. Go to your Supabase Dashboard
2. Select your project
3. Go to **Settings** → **Database**
4. Copy your **Connection String** (looks like `postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres`)

### Step 2: Connect and Run Optimizations
```bash
# Using psql (if available)
psql "your_connection_string_here" -f supabase_optimization_script.sql

# Or using any PostgreSQL client
# Copy and paste the SQL from supabase_optimization_script.sql
```

## 🔗 **Method 3: Using Supabase Dashboard SQL Editor**

### Step 1: Open SQL Editor
1. Go to your Supabase Dashboard
2. Select your project
3. Go to **SQL Editor**

### Step 2: Run Optimization Script
1. Copy the contents of `supabase_optimization_script.sql`
2. Paste into the SQL Editor
3. Click **Run** to execute

## 🔗 **Method 4: Using Environment Variables**

If you have your Supabase credentials as environment variables:

```bash
# Set your environment variables
export SUPABASE_URL="https://your-project-ref.supabase.co"
export SUPABASE_ANON_KEY="your_anon_key"
export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"

# Then use the Supabase CLI
supabase link --project-ref your_project_reference_id
```

## 📋 **What You Need**

To connect to your existing Supabase database, you'll need:

1. **Project Reference ID** - Found in your Supabase dashboard
2. **Access Token** - From your Supabase account settings
3. **Database Password** - From your Supabase project settings
4. **Project URL** - Your Supabase project URL

## ⚠️ **Important Notes**

### Before Running Optimizations:
1. **Backup your data** - Always backup before making changes
2. **Test in staging** - If possible, test on a staging environment first
3. **Check existing schema** - The script will create tables if they don't exist
4. **Review conflicts** - Some tables might already exist with different structures

### The Optimization Script Will:
- ✅ Create new tables if they don't exist
- ✅ Add indexes for performance
- ✅ Create functions for search and analytics
- ✅ Set up Row Level Security (RLS)
- ✅ Add sample data for testing
- ⚠️ **NOT modify existing data** (it's designed to be safe)

## 🚀 **Quick Start Commands**

Once you have your credentials:

```bash
# 1. Login to Supabase
supabase login

# 2. Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# 3. Check current status
supabase status

# 4. Apply optimizations
supabase db push

# 5. Test optimizations
supabase db reset --db-url "your_connection_string"
```

## 🔍 **Verify Connection**

After connecting, you can verify everything is working:

```sql
-- Check if you can connect
SELECT current_database(), current_user, version();

-- Check existing tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check if optimizations were applied
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'recipes', 'categories');
```

## 🆘 **Troubleshooting**

### Common Issues:

1. **Authentication Failed**
   - Check your access token
   - Make sure you have the right permissions

2. **Project Not Found**
   - Verify your project reference ID
   - Check if you're in the right organization

3. **Permission Denied**
   - Make sure you're using the service role key for database operations
   - Check your RLS policies

4. **Table Already Exists**
   - The script uses `CREATE TABLE IF NOT EXISTS` so it's safe
   - Existing data won't be modified

## 📞 **Need Help?**

If you run into any issues:

1. **Check the logs** - Use `supabase logs` to see what's happening
2. **Verify permissions** - Make sure you have the right access
3. **Test connection** - Try a simple query first
4. **Review the script** - The optimization script is designed to be safe

## 🎯 **Next Steps After Connection**

Once connected and optimized:

1. **Test the functions** - Run some sample queries
2. **Check performance** - Monitor query execution times
3. **Set up monitoring** - Use the monitoring script
4. **Add your data** - Start using the optimized database

---

**Ready to connect?** Choose your preferred method above and let's get your database optimized! 🚀