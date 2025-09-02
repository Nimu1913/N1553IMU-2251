-- Enable RLS on the tables
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.dealerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;


-- Dealerships table
CREATE TABLE IF NOT EXISTS dealerships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dealership_id UUID REFERENCES dealerships(id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  source VARCHAR(50),
  vehicle_interest TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  response_time_seconds INTEGER
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  dealership_id UUID REFERENCES dealerships(id) ON DELETE CASCADE,
  appointment_date TIMESTAMP WITH TIME ZONE,
  appointment_type VARCHAR(50) DEFAULT 'test_drive',
  status VARCHAR(50) DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert a test dealership
INSERT INTO dealerships (name, email, phone) 
VALUES ('Test Dealership', 'test@dealership.com', '555-0100')
ON CONFLICT DO NOTHING;


-- Create policies that allow all operations (temporary - refine later)
CREATE POLICY "Allow all operations on leads" ON public.leads
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on appointments" ON public.appointments
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on dealerships" ON public.dealerships
  FOR ALL USING (true) WITH CHECK (true);