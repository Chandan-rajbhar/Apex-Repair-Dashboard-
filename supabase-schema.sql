-- ==============================================================================
-- APEX APPLIANCE REPAIR - COMPLETE SUPABASE DATABASE SCHEMA & SEED DATA
-- Precision Diagnostics, Same-Day Dispatch, Certified Technicians
-- ==============================================================================

-- 1. EXTENSIONS & SETUP
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS & DOMAINS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'manager', 'dispatcher', 'technician');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM (
        'request_received', 
        'booking_confirmed', 
        'tech_assigned', 
        'on_the_way', 
        'diagnosis_in_progress', 
        'quote_approval_needed', 
        'repair_in_progress', 
        'completed', 
        'payment_done',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. USERS TABLE (SUPER ADMIN & ROLE-BASED ACCESS CONTROL)
-- Exactly as specified in Section 2 of requirements:
-- Columns: id (UUID PK references auth.users), full_name, email, role, is_active, created_at, updated_at
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'super_admin',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for high-performance role & email lookup
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Enable Row Level Security (RLS) on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to allow clean, idempotent execution
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile except role" ON public.users;
DROP POLICY IF EXISTS "Super admins can update any user" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated read users" ON public.users;
DROP POLICY IF EXISTS "Allow anon read users" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated insert own user" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated update own user" ON public.users;

-- Policy 1: Authenticated users can view user directory (High performance, ZERO recursion)
CREATE POLICY "Allow authenticated read users"
    ON public.users
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy 2: Anon read access for pre-auth status verification
CREATE POLICY "Allow anon read users"
    ON public.users
    FOR SELECT
    TO anon
    USING (true);

-- Policy 3: Authenticated users can insert their own record on registration
CREATE POLICY "Allow authenticated insert own user"
    ON public.users
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Policy 4: Authenticated users can update their own profile record
CREATE POLICY "Allow authenticated update own user"
    ON public.users
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Server-side role guard
CREATE OR REPLACE FUNCTION public.validate_user_role()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure role is always super_admin for portal accounts
    IF NEW.role IS NULL OR NEW.role = '' OR NEW.role = 'user' THEN
        NEW.role := 'super_admin';
    END IF;
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_validate_user_role ON public.users;
CREATE TRIGGER trg_validate_user_role
    BEFORE INSERT OR UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.validate_user_role();

-- Automatic Database Trigger on auth.users -> public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, full_name, email, role, is_active, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        'super_admin',
        TRUE,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        role = 'super_admin',
        is_active = TRUE,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Immediate Sync: Ensure any existing auth.users are placed into public.users as Super Admin
INSERT INTO public.users (id, full_name, email, role, is_active, created_at, updated_at)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
    email,
    'super_admin',
    TRUE,
    NOW(),
    NOW()
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
    role = 'super_admin',
    is_active = TRUE,
    updated_at = NOW();

-- Update all existing records to super_admin
UPDATE public.users SET role = 'super_admin', is_active = TRUE WHERE role != 'super_admin';

-- PROFILES TABLE (Legacy compatibility)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role DEFAULT 'admin',
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT DEFAULT 'Springfield',
    state TEXT DEFAULT 'IL',
    zip_code TEXT DEFAULT '62704',
    total_bookings INTEGER DEFAULT 0,
    lifetime_spend NUMERIC(10, 2) DEFAULT 0.00,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'vip', 'inactive')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. APPLIANCE CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS appliance_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tag TEXT NOT NULL,
    icon TEXT,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SERVICES TABLE
CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    category_id TEXT REFERENCES appliance_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    tag TEXT NOT NULL,
    short_desc TEXT,
    full_desc TEXT,
    diagnostic_fee NUMERIC(8, 2) DEFAULT 79.00,
    est_duration TEXT DEFAULT '45-90 Mins',
    warranty TEXT DEFAULT '90-Day Guarantee',
    badge TEXT DEFAULT 'SAME-DAY',
    image TEXT,
    popular_brands JSONB DEFAULT '[]'::jsonb,
    common_issues JSONB DEFAULT '[]'::jsonb,
    rating NUMERIC(3, 2) DEFAULT 4.90,
    completed_repairs INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TECHNICIANS TABLE
CREATE TABLE IF NOT EXISTS technicians (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT NOT NULL,
    title TEXT DEFAULT 'Master Certified Technician',
    rating NUMERIC(3, 2) DEFAULT 4.95,
    completed_jobs INTEGER DEFAULT 0,
    active_jobs INTEGER DEFAULT 0,
    vehicle TEXT,
    photo_url TEXT,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'on_job', 'on_leave', 'off_duty')),
    specialties JSONB DEFAULT '[]'::jsonb,
    eta_minutes INTEGER DEFAULT 15,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SERVICE REQUESTS / BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS service_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_code TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    address TEXT NOT NULL,
    appliance_id TEXT REFERENCES services(id) ON DELETE SET NULL,
    appliance_name TEXT NOT NULL,
    brand TEXT,
    model_number TEXT,
    issue_description TEXT NOT NULL,
    is_emergency BOOLEAN DEFAULT FALSE,
    preferred_date DATE NOT NULL,
    preferred_time_slot TEXT NOT NULL,
    current_step INTEGER DEFAULT 1 CHECK (current_step BETWEEN 1 AND 9),
    status booking_status DEFAULT 'request_received',
    technician_id UUID REFERENCES technicians(id) ON DELETE SET NULL,
    technician_name TEXT,
    quote_amount NUMERIC(10, 2) DEFAULT 0.00,
    quote_status TEXT DEFAULT 'pending' CHECK (quote_status IN ('none', 'pending', 'approved', 'declined')),
    diagnostic_fee NUMERIC(8, 2) DEFAULT 79.00,
    total_amount NUMERIC(10, 2) DEFAULT 79.00,
    payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'refunded')),
    notes TEXT,
    timeline JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES service_requests(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    technician_id UUID REFERENCES technicians(id) ON DELETE SET NULL,
    scheduled_date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'rescheduled', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. PRICING & SERVICE CHARGES TABLE
CREATE TABLE IF NOT EXISTS pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id TEXT REFERENCES services(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    category TEXT NOT NULL,
    diagnostic_fee NUMERIC(8, 2) DEFAULT 79.00,
    base_labor_rate NUMERIC(8, 2) DEFAULT 120.00,
    emergency_fee NUMERIC(8, 2) DEFAULT 49.00,
    parts_estimate_min NUMERIC(8, 2) DEFAULT 40.00,
    parts_estimate_max NUMERIC(8, 2) DEFAULT 250.00,
    warranty_months INTEGER DEFAULT 3,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. PAYMENTS & TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT UNIQUE NOT NULL,
    booking_id UUID REFERENCES service_requests(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    amount NUMERIC(10, 2) NOT NULL,
    payment_method TEXT DEFAULT 'Credit Card' CHECK (payment_method IN ('Credit Card', 'Debit Card', 'Apple Pay', 'Cash', 'Check', 'Financing')),
    status TEXT DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'refunded', 'failed')),
    transaction_id TEXT,
    paid_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. PROMOTIONS & OFFERS TABLE
CREATE TABLE IF NOT EXISTS promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    discount_type TEXT DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(8, 2) NOT NULL,
    min_spend NUMERIC(8, 2) DEFAULT 0.00,
    applicable_appliances JSONB DEFAULT '["all"]'::jsonb,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    usage_limit INTEGER DEFAULT 100,
    times_used INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. REVIEWS & FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES service_requests(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    appliance_name TEXT NOT NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    technician_name TEXT,
    is_verified BOOLEAN DEFAULT TRUE,
    is_published BOOLEAN DEFAULT TRUE,
    review_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT DEFAULT 'booking' CHECK (type IN ('emergency', 'booking', 'quote', 'payment', 'technician', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_service_requests_customer ON service_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_tech ON service_requests(technician_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_emergency ON service_requests(is_emergency);
CREATE INDEX IF NOT EXISTS idx_appointments_tech_date ON appointments(technician_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(is_read);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE appliance_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users & anon (configured with proper keys) to read and operate
DO $$ BEGIN
    CREATE POLICY "Allow public read access to categories" ON appliance_categories FOR SELECT USING (true);
    CREATE POLICY "Allow public read access to services" ON services FOR SELECT USING (true);
    CREATE POLICY "Allow full access for service operations" ON service_requests FOR ALL USING (true);
    CREATE POLICY "Allow full access for customers" ON customers FOR ALL USING (true);
    CREATE POLICY "Allow full access for technicians" ON technicians FOR ALL USING (true);
    CREATE POLICY "Allow full access for appointments" ON appointments FOR ALL USING (true);
    CREATE POLICY "Allow full access for pricing" ON pricing FOR ALL USING (true);
    CREATE POLICY "Allow full access for payments" ON payments FOR ALL USING (true);
    CREATE POLICY "Allow full access for promotions" ON promotions FOR ALL USING (true);
    CREATE POLICY "Allow full access for reviews" ON reviews FOR ALL USING (true);
    CREATE POLICY "Allow full access for notifications" ON notifications FOR ALL USING (true);
    CREATE POLICY "Allow full access for profiles" ON profiles FOR ALL USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- ==============================================================================
-- END OF SCHEMA DEFINITION (ZERO STATIC / SEED DATA)
-- The database is ready for real Supabase authentication, live records,
-- and Super Admin role management.
-- ==============================================================================
