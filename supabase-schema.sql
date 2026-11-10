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

-- 3. PROFILES TABLE
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
-- SEED DATA: APPLIANCE CATEGORIES
-- ==============================================================================
INSERT INTO appliance_categories (id, name, tag, icon, description, display_order)
VALUES
    ('refrigeration', 'Refrigeration', 'REFRIGERATION', 'Snowflake', 'French-door, side-by-side, deep freezers and wine columns', 1),
    ('laundry', 'Laundry Care', 'LAUNDRY', 'Shirt', 'High-efficiency washers, steam dryers, stackable sets', 2),
    ('kitchen', 'Kitchen Cleaning', 'KITCHEN', 'Sparkles', 'Dishwashers, garbage disposals, and compact trash compactors', 3),
    ('cooking', 'Cooking Appliances', 'COOKING', 'Flame', 'Gas ranges, electric induction cooktops, wall ovens', 4),
    ('specialty', 'Specialty Appliances', 'SPECIALTY', 'Wine', 'Under-counter beverage centers, outdoor ice machines', 5)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- SEED DATA: SERVICES (FROM APEX APPLIANCE REPAIR WEBSITE)
-- ==============================================================================
INSERT INTO services (id, category_id, name, tag, short_desc, full_desc, diagnostic_fee, est_duration, warranty, badge, popular_brands, common_issues, rating, completed_repairs)
VALUES
    ('refrigerators', 'refrigeration', 'Refrigerators', 'REFRIGERATION', 'Cooling diagnostics, compressor servicing, coil cleaning, and seal replacement.', 'Comprehensive diagnostics and master repair for French-door, side-by-side, and built-in luxury refrigerators. We specialize in inverter compressors, thermistor sensors, dual evaporators, and electronic defrost systems.', 79.00, '45-90 Mins', '90-Day Guarantee', 'BEST-SELLER', '["Sub-Zero", "Samsung", "LG", "Whirlpool", "GE Profile", "KitchenAid", "Bosch", "Thermador"]'::jsonb, '["Not cooling properly or fluctuating temperature", "Leaking water under or inside refrigerator", "Loud humming, buzzing or clicking compressor", "Excessive frost build-up on back freezer wall", "Digital touch display error code"]'::jsonb, 4.95, 4120),
    ('washers', 'laundry', 'Washing Machines', 'LAUNDRY', 'Drum balance, pump drainage, leak elimination, and motor coupling repair.', 'Expert repair of high-efficiency front-load and heavy-duty top-load washing machines. From direct-drive motors and drain pump clogs to water inlet solenoids and main control PCB logic.', 79.00, '40-75 Mins', '90-Day Guarantee', 'SAME-DAY', '["LG", "Samsung", "Maytag", "Whirlpool", "Speed Queen", "Bosch", "Electrolux"]'::jsonb, '["Will not drain or stops mid-cycle", "Excessive shaking, banging or unbalanced spinning", "Door boot gasket leaking water onto floor", "Will not spin or drum does not rotate", "Error code (e.g. OE, 5E, UE, F21)"]'::jsonb, 4.92, 3840),
    ('dryers', 'laundry', 'Clothes Dryers', 'LAUNDRY', 'Heating element replacement, thermal fuse testing, rollers and belt renewal.', 'Gas and electric dryer troubleshooting. We clear safety thermal cutoffs, replace snapped drive belts, balance squeaking idler pulleys, and inspect exhaust airflow for maximum fire safety.', 79.00, '40-60 Mins', '90-Day Guarantee', 'SAME-DAY', '["Whirlpool", "Samsung", "Maytag", "LG", "GE", "Kenmore", "Amana"]'::jsonb, '["Tumbling but blowing no heat (cold air)", "Takes 2-3 cycles to dry clothes", "High-pitched screeching or thumping noise", "Shuts off unexpectedly after 5 minutes", "Will not turn on or start button unresponsive"]'::jsonb, 4.89, 2950),
    ('dishwashers', 'kitchen', 'Dishwashers', 'KITCHEN', 'Spray arm pressure, leak detection, heater element, and drain clearing.', 'Restore sparkling clean dishes with precision dishwasher repair. We service circulation wash impellers, float switch sensors, drain valves, door latches, and electronic control modules.', 79.00, '45-80 Mins', '90-Day Guarantee', 'POPULAR', '["Bosch", "KitchenAid", "Miele", "Whirlpool", "GE", "Samsung", "Cove"]'::jsonb, '["Dishes come out dirty or cloudy white film", "Water pooling at bottom after cycle ends", "Door latch not closing or leaking around frame", "Continuous draining noise or E15 error code", "Cycle stops midway and blinks warning"]'::jsonb, 4.91, 2610),
    ('ovens-ranges', 'cooking', 'Ovens & Ranges', 'COOKING', 'Igniter renewal, temperature sensor calibration, glass top restoration.', 'Gas burner solenoid repair, electric bake/broil elements, dual fuel valve diagnostics, and touch sensor thermostat recalibration for culinary appliances.', 79.00, '50-90 Mins', '90-Day Guarantee', 'PRECISION', '["Wolf", "Viking", "GE Profile", "Thermador", "Samsung", "Frigidaire", "JennAir"]'::jsonb, '["Oven temperature inconsistent or burns food", "Gas burner won''t ignite or continuously clicks", "Bake element doesn''t glow or heat up", "Self-clean latch stuck or error code F9", "Convection fan making loud grinding noise"]'::jsonb, 4.94, 2180),
    ('freezers', 'refrigeration', 'Deep Freezers', 'REFRIGERATION', 'Chest & upright temperature restoration, defrost timer & relay service.', 'Keep frozen goods safely protected. We repair sealed compressor loops, replace damaged magnetic door gaskets, and resolve auto-defrost heater failures.', 79.00, '45-80 Mins', '90-Day Guarantee', 'URGENT CARE', '["Frigidaire", "GE", "Whirlpool", "Haier", "Danby", "Kenmore"]'::jsonb, '["Food thawing or temperature rising above 0°F", "Thick ice sheets building on sides and lid", "Compressor clicking off immediately after start", "Alarm sounding continuously", "Water leaking on floor underneath unit"]'::jsonb, 4.88, 1420),
    ('microwaves', 'kitchen', 'Microwaves', 'KITCHEN', 'Magnetron replacement, high-voltage diode, turntable drive & door microswitches.', 'Over-the-range and built-in microwave repair. Safe high-voltage capacitor discharge, door interlock switch replacement, and ventilation motor servicing.', 79.00, '30-50 Mins', '90-Day Guarantee', 'SAME-DAY', '["Panasonic", "Sharp", "GE", "Whirlpool", "KitchenAid", "Samsung"]'::jsonb, '["Runs but does not heat food", "Turntable tray not rotating", "Sparking or arcing inside cavity", "Control keypad buttons not responding", "Shuts off after 2-3 seconds of run time"]'::jsonb, 4.85, 1190),
    ('disposals', 'kitchen', 'Garbage Disposals', 'PLUMBING & KITCHEN', 'Impeller de-jamming, watertight seal overhaul, splash guard renewal.', 'Rapid disposal restoration. We safely clear jammed grinding rings, repair undermount vibration leaks, and install heavy-duty multi-stage grind assemblies.', 79.00, '30-45 Mins', '90-Day Guarantee', 'QUICK FIX', '["InSinkErator", "Waste King", "Moen", "Kohler", "KitchenAid"]'::jsonb, '["Humming noise but blades won''t spin (jammed)", "Water leaking underneath kitchen sink cabinet", "Foul odor persists despite cleaning", "Disposal trips breaker or reset button immediately", "Drains very slowly or backs up into sink"]'::jsonb, 4.87, 1850),
    ('ice-makers', 'specialty', 'Dedicated Ice Makers', 'SPECIALTY', 'Harvest cycle repair, water inlet valve, freeze plate descaling.', 'Undercounter gourmet and clear ice machine repair. Circulation pump replacement, evaporator grid scale cleanup, and thermostatic harvest timing adjustments.', 79.00, '45-75 Mins', '90-Day Guarantee', 'SPECIALTY', '["Scotsman", "Sub-Zero", "KitchenAid", "Hoshizaki", "U-Line", "Whirlpool"]'::jsonb, '["Making hollow, small, or no ice cubes", "Water continuously running into bin", "Ice cubes taste strange or look cloudy", "Unit stops cycling or red service light on", "Freezer plate frosted over with solid ice block"]'::jsonb, 4.93, 890),
    ('wine-coolers', 'specialty', 'Wine Coolers & Cellars', 'SPECIALTY', 'Dual-zone cooling calibration, silent compressor dampening, humidity regulation.', 'Precision temperature and humidity preservation for high-end wine storage cabinets, multi-zone coolers, and custom residential cellar systems.', 79.00, '60-90 Mins', '90-Day Guarantee', 'LUXURY CARE', '["Sub-Zero", "EuroCave", "U-Line", "Thermador", "Marvel", "Liebherr"]'::jsonb, '["Zone temperature higher than thermostat setting", "Excessive vibration disturbing wine sediment", "Moisture or condensation on glass door", "Digital temperature display flashing warning", "Fan squealing or noisy air circulation"]'::jsonb, 4.97, 640)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- SEED DATA: TECHNICIANS
-- ==============================================================================
INSERT INTO technicians (id, name, email, phone, title, rating, completed_jobs, active_jobs, vehicle, photo_url, status, specialties, eta_minutes)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'Marcus Vance', 'marcus.v@apexrepair.com', '(877) 225-2046 ext 412', 'Senior Master Appliance Specialist', 4.98, 1422, 2, 'Ford Transit Master Van #TX-482', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', 'available', '["Refrigerators", "Wine Coolers", "Deep Freezers", "Sub-Zero Certified"]'::jsonb, 15),
    ('c2222222-2222-2222-2222-222222222222', 'Elena Rostova', 'elena.r@apexrepair.com', '(877) 225-2046 ext 105', 'Certified Laundry Specialist', 4.96, 980, 1, 'Mercedes Sprinter Van #IL-204', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80', 'on_job', '["Washing Machines", "Clothes Dryers", "Speed Queen Specialist"]'::jsonb, 25),
    ('c3333333-3333-3333-3333-333333333333', 'David Miller', 'david.m@apexrepair.com', '(877) 225-2046 ext 218', 'Master Gas & Cooking Technician', 4.94, 1150, 2, 'RAM ProMaster Van #TX-509', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', 'available', '["Ovens & Ranges", "Gas Igniters", "Microwaves", "Wolf Specialist"]'::jsonb, 10),
    ('c4444444-4444-4444-4444-444444444444', 'Sarah Chen', 'sarah.c@apexrepair.com', '(877) 225-2046 ext 302', 'Kitchen Systems Lead Diagnostics', 4.97, 840, 1, 'Nissan NV2500 Van #IL-311', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80', 'on_job', '["Dishwashers", "Garbage Disposals", "Ice Makers", "Bosch Master"]'::jsonb, 35),
    ('c5555555-5555-5555-5555-555555555555', 'Carlos Rodriguez', 'carlos.r@apexrepair.com', '(877) 225-2046 ext 114', 'Rapid Emergency Dispatcher & Tech', 4.92, 1310, 0, 'Chevy Express 2500 #TX-104', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', 'available', '["Same-Day Emergencies", "Electrical Systems", "Smart Appliances"]'::jsonb, 12)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- SEED DATA: CUSTOMERS
-- ==============================================================================
INSERT INTO customers (id, name, email, phone, address, city, state, zip_code, total_bookings, lifetime_spend, status, notes)
VALUES
    ('a1111111-1111-1111-1111-111111111111', 'Saurabh Yadav', 'demo@apex.com', '(877) 225-2046', '742 Evergreen Terr, Suite 4B', 'Springfield', 'IL', '62704', 3, 580.00, 'vip', 'Preferred technician: Marcus Vance. High-end kitchen suite.'),
    ('a2222222-2222-2222-2222-222222222222', 'Jennifer Lawrence', 'jennifer.l@gmail.com', '(312) 555-0142', '1240 N Lake Shore Dr, Apt 18A', 'Chicago', 'IL', '60610', 2, 420.00, 'active', 'Gate code #4492. Call 10 min prior to arrival.'),
    ('a3333333-3333-3333-3333-333333333333', 'Robert Kensington', 'robert.k@kensingtonlaw.com', '(217) 555-8910', '4801 Prairie View Way', 'Springfield', 'IL', '62711', 4, 1140.00, 'vip', 'Sub-Zero built-in refrigerator and wine cellar maintenance contract.'),
    ('a4444444-4444-4444-4444-444444444444', 'Amanda Miller', 'amanda.m@outlook.com', '(312) 555-7731', '892 W Armitage Ave', 'Chicago', 'IL', '60614', 1, 185.00, 'active', 'LG front load washer drain issue.'),
    ('a5555555-5555-5555-5555-555555555555', 'Marcus Holloway', 'marcus.h@bloomfield.org', '(217) 555-3214', '1520 Lincoln Ave', 'Springfield', 'IL', '62702', 1, 79.00, 'active', 'Gas range clicking igniter issue.')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- SEED DATA: SERVICE REQUESTS / BOOKINGS
-- ==============================================================================
INSERT INTO service_requests (id, booking_code, customer_id, customer_name, customer_email, customer_phone, address, appliance_id, appliance_name, brand, model_number, issue_description, is_emergency, preferred_date, preferred_time_slot, current_step, status, technician_id, technician_name, quote_amount, quote_status, diagnostic_fee, total_amount, payment_status, notes)
VALUES
    ('b1111111-1111-1111-1111-111111111111', 'AR-1024', 'a1111111-1111-1111-1111-111111111111', 'Saurabh Yadav', 'demo@apex.com', '(877) 225-2046', '742 Evergreen Terr, Suite 4B, Springfield, IL 62704', 'refrigerators', 'Refrigerator & Freezer', 'Samsung', 'RF28R7351SR French Door', 'Lower freezer compartment frost buildup & ice maker not cycling', true, CURRENT_DATE, '11:00 AM – 2:00 PM', 4, 'on_the_way', 'c1111111-1111-1111-1111-111111111111', 'Marcus Vance', 215.00, 'pending', 79.00, 294.00, 'unpaid', 'Emergency same-day priority dispatch. Technician en-route with replacement defrost heater and thermistor.'),
    ('b2222222-2222-2222-2222-222222222222', 'AR-1025', 'a2222222-2222-2222-2222-222222222222', 'Jennifer Lawrence', 'jennifer.l@gmail.com', '(312) 555-0142', '1240 N Lake Shore Dr, Apt 18A, Chicago, IL 60610', 'dishwashers', 'Dishwashers', 'Bosch', '800 Series SHP878ZD5N', 'E15 error code water leak sensor triggered in bottom basin', false, CURRENT_DATE, '2:00 PM – 5:00 PM', 3, 'tech_assigned', 'c4444444-4444-4444-4444-444444444444', 'Sarah Chen', 165.00, 'pending', 79.00, 244.00, 'unpaid', 'Technician assigned for afternoon service window.'),
    ('b3333333-3333-3333-3333-333333333333', 'AR-1026', 'a3333333-3333-3333-3333-333333333333', 'Robert Kensington', 'robert.k@kensingtonlaw.com', '(217) 555-8910', '4801 Prairie View Way, Springfield, IL 62711', 'wine-coolers', 'Wine Coolers & Cellars', 'Sub-Zero', 'UW-24 Built-In Undercounter', 'Upper zone temperature fluctuating between 58°F and 68°F', false, CURRENT_DATE + INTERVAL '1 day', '9:00 AM – 12:00 PM', 2, 'booking_confirmed', 'c1111111-1111-1111-1111-111111111111', 'Marcus Vance', 0.00, 'none', 79.00, 79.00, 'unpaid', 'Confirmed for tomorrow morning.'),
    ('b4444444-4444-4444-4444-444444444444', 'AR-1020', 'a4444444-4444-4444-4444-444444444444', 'Amanda Miller', 'amanda.m@outlook.com', '(312) 555-7731', '892 W Armitage Ave, Chicago, IL 60614', 'washers', 'Washing Machines', 'LG', 'WM4000HBA Front Load', 'OE Drain Error code - standing water in drum', false, CURRENT_DATE - INTERVAL '2 days', '2:00 PM – 5:00 PM', 9, 'payment_done', 'c2222222-2222-2222-2222-222222222222', 'Elena Rostova', 145.00, 'approved', 79.00, 224.00, 'paid', 'Pump replaced and cycle verified. Payment collected via credit card.'),
    ('b5555555-5555-5555-5555-555555555555', 'AR-1021', 'a5555555-5555-5555-5555-555555555555', 'Marcus Holloway', 'marcus.h@bloomfield.org', '(217) 555-3214', '1520 Lincoln Ave, Springfield, IL 62702', 'ovens-ranges', 'Ovens & Ranges', 'Wolf', 'GR366 Gas Range 36"', 'Front right burner igniter continuously clicking after burner is lit', false, CURRENT_DATE - INTERVAL '1 day', '10:00 AM – 1:00 PM', 8, 'completed', 'c3333333-3333-3333-3333-333333333333', 'David Miller', 120.00, 'approved', 79.00, 199.00, 'paid', 'Spark electrode module replaced. Gas safety inspection cleared.')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- SEED DATA: PAYMENTS
-- ==============================================================================
INSERT INTO payments (id, invoice_number, booking_id, customer_name, customer_email, amount, payment_method, status, transaction_id, paid_at)
VALUES
    ('d1111111-1111-1111-1111-111111111111', 'INV-2026-0891', 'b4444444-4444-4444-4444-444444444444', 'Amanda Miller', 'amanda.m@outlook.com', 224.00, 'Credit Card', 'paid', 'TXN-849201', NOW() - INTERVAL '2 days'),
    ('d2222222-2222-2222-2222-222222222222', 'INV-2026-0892', 'b5555555-5555-5555-5555-555555555555', 'Marcus Holloway', 'marcus.h@bloomfield.org', 199.00, 'Apple Pay', 'paid', 'TXN-912044', NOW() - INTERVAL '1 day'),
    ('d3333333-3333-3333-3333-333333333333', 'INV-2026-0893', 'b1111111-1111-1111-1111-111111111111', 'Saurabh Yadav', 'demo@apex.com', 79.00, 'Credit Card', 'paid', 'TXN-382910', NOW() - INTERVAL '3 hours')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- SEED DATA: PROMOTIONS
-- ==============================================================================
INSERT INTO promotions (id, code, title, description, discount_type, discount_value, min_spend, applicable_appliances, start_date, end_date, usage_limit, times_used, is_active)
VALUES
    ('e1111111-1111-1111-1111-111111111111', 'SPRING25', '$25 Off Precision Diagnostic', 'Enjoy $25 off diagnostic inspection when booking service this spring.', 'fixed', 25.00, 79.00, '["all"]'::jsonb, CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '60 days', 500, 78, true),
    ('e2222222-2222-2222-2222-222222222222', 'KITCHEN15', '15% Off Kitchen Appliance Repairs', 'Valid on Dishwashers, Ovens, Ranges and Refrigerators.', 'percentage', 15.00, 150.00, '["refrigerators", "dishwashers", "ovens-ranges"]'::jsonb, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '45 days', 250, 42, true),
    ('e3333333-3333-3333-3333-333333333333', 'EMERGENCY10', '$10 Off Urgent Weekend Surcharge', 'Discount on emergency same-day dispatch fee.', 'fixed', 10.00, 49.00, '["all"]'::jsonb, CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '90 days', 200, 93, true)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- SEED DATA: REVIEWS
-- ==============================================================================
INSERT INTO reviews (id, booking_id, customer_name, customer_email, appliance_name, rating, comment, technician_name, is_verified, is_published, review_date)
VALUES
    ('f1111111-1111-1111-1111-111111111111', 'b4444444-4444-4444-4444-444444444444', 'Amanda Miller', 'amanda.m@outlook.com', 'Washing Machines', 5, 'Elena was incredible! She diagnosed the drain pump issue within 10 minutes and had the replacement OEM part right in her van. Zero mess left behind.', 'Elena Rostova', true, true, CURRENT_DATE - INTERVAL '2 days'),
    ('f2222222-2222-2222-2222-222222222222', 'b5555555-5555-5555-5555-555555555555', 'Marcus Holloway', 'marcus.h@bloomfield.org', 'Ovens & Ranges', 5, 'David repaired our Wolf range perfectly. Very knowledgeable technician who tested all gas connections thoroughly. Highly recommended!', 'David Miller', true, true, CURRENT_DATE - INTERVAL '1 day'),
    ('f3333333-3333-3333-3333-333333333333', 'b1111111-1111-1111-1111-111111111111', 'Saurabh Yadav', 'demo@apex.com', 'Refrigerator & Freezer', 5, 'Outstanding service from Marcus. Live tracking showed his exact arrival time and he fixed our Samsung french door cooling issue on the spot.', 'Marcus Vance', true, true, CURRENT_DATE)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- SEED DATA: NOTIFICATIONS
-- ==============================================================================
INSERT INTO notifications (id, type, title, message, link, is_read)
VALUES
    ('g1111111-1111-1111-1111-111111111111', 'emergency', 'Urgent Dispatch Alert: AR-1024', 'Marcus Vance is en-route for Samsung French Door refrigerator repair. ETA 15 mins.', '/bookings', false),
    ('g2222222-2222-2222-2222-222222222222', 'quote', 'Quote Approval Pending: AR-1025', 'Bosch Dishwasher quote for $244.00 submitted for Jennifer Lawrence.', '/bookings', false),
    ('g3333333-3333-3333-3333-333333333333', 'payment', 'Payment Cleared: INV-2026-0891', '$224.00 received from Amanda Miller for Washer Drain Pump replacement.', '/payments', true),
    ('g4444444-4444-4444-4444-444444444444', 'technician', 'Daily Route Scheduled: Sarah Chen', '4 diagnostic visits assigned in Chicago North Shore corridor.', '/technicians', false)
ON CONFLICT (id) DO NOTHING;
