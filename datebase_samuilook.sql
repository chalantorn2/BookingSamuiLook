CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  position VARCHAR(255),
  phone VARCHAR(50),
  role VARCHAR(50) NOT NULL DEFAULT 'viewer',
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  password_hash VARCHAR(255) NOT NULL,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  module VARCHAR(50) NOT NULL,
  item_id VARCHAR(255),
  details TEXT,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(100),
  email VARCHAR(255),
  contact_person VARCHAR(255),
  id_number VARCHAR(100),
  tax_id VARCHAR(100),
  type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE flight_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  supplier_id UUID REFERENCES suppliers(id),
  ticket_type VARCHAR(50) NOT NULL,
  booking_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  payment_status VARCHAR(50) NOT NULL DEFAULT 'unpaid',
  company_payment_method VARCHAR(50),
  company_payment_details TEXT,
  customer_payment_method VARCHAR(50),
  customer_payment_details TEXT,
  remarks TEXT,
  total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  vat_percent DECIMAL(5, 2) DEFAULT 0,
  vat_amount DECIMAL(12, 2) DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE passengers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flight_ticket_id UUID REFERENCES flight_tickets(id),
  name VARCHAR(255) NOT NULL,
  age VARCHAR(10),
  ticket_number VARCHAR(100),
  passport_number VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE flight_routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flight_ticket_id UUID REFERENCES flight_tickets(id),
  airline VARCHAR(100),
  flight_number VARCHAR(50),
  rbd VARCHAR(20),
  date DATE,
  origin VARCHAR(50),
  destination VARCHAR(50),
  departure_time VARCHAR(20),
  arrival_time VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE deposits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  supplier_id UUID REFERENCES suppliers(id),
  booking_type VARCHAR(50) NOT NULL,
  description TEXT,
  booking_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  payment_status VARCHAR(50) NOT NULL DEFAULT 'unpaid',
  deposit_payment_date DATE,
  full_payment_date DATE,
  submission_deadline DATE,
  company_payment_method VARCHAR(50),
  company_payment_details TEXT,
  customer_payment_method VARCHAR(50),
  customer_payment_details TEXT,
  reference TEXT,
  remarks TEXT,
  total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  deposit_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  vat_percent DECIMAL(5, 2) DEFAULT 0,
  vat_amount DECIMAL(12, 2) DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vouchers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  supplier_id UUID REFERENCES suppliers(id),
  voucher_type VARCHAR(50) NOT NULL,
  description TEXT,
  booking_date DATE NOT NULL,
  travel_date DATE,
  pickup_time VARCHAR(50),
  hotel VARCHAR(255),
  room_number VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  payment_status VARCHAR(50) NOT NULL DEFAULT 'unpaid',
  company_payment_method VARCHAR(50),
  company_payment_details TEXT,
  customer_payment_method VARCHAR(50),
  customer_payment_details TEXT,
  reference TEXT,
  remarks TEXT,
  total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  vat_percent DECIMAL(5, 2) DEFAULT 0,
  vat_amount DECIMAL(12, 2) DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE other_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  supplier_id UUID REFERENCES suppliers(id),
  service_type VARCHAR(50) NOT NULL,
  description TEXT,
  booking_date DATE NOT NULL,
  service_date DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  payment_status VARCHAR(50) NOT NULL DEFAULT 'unpaid',
  company_payment_method VARCHAR(50),
  company_payment_details TEXT,
  customer_payment_method VARCHAR(50),
  customer_payment_details TEXT,
  reference TEXT,
  remarks TEXT,
  total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  vat_percent DECIMAL(5, 2) DEFAULT 0,
  vat_amount DECIMAL(12, 2) DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE service_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID NOT NULL,
  service_type VARCHAR(50) NOT NULL,
  passenger_type VARCHAR(50) NOT NULL,
  net_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  sale_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  quantity INT NOT NULL DEFAULT 1,
  total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  payment_terms INT NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'unpaid',
  payment_date DATE,
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  discount_percent DECIMAL(5, 2) DEFAULT 0,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  vat_percent DECIMAL(5, 2) DEFAULT 0,
  vat_amount DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  sales_person VARCHAR(255),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id),
  item_type VARCHAR(50) NOT NULL,
  item_id UUID NOT NULL,
  description TEXT NOT NULL,
  details TEXT,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_number VARCHAR(50) UNIQUE NOT NULL,
  invoice_id UUID REFERENCES invoices(id),
  customer_id UUID REFERENCES customers(id),
  receipt_date DATE NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_details TEXT,
  amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'completed',
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_number VARCHAR(50) UNIQUE NOT NULL,
  original_service_type VARCHAR(50) NOT NULL,
  original_service_id UUID NOT NULL,
  customer_id UUID REFERENCES customers(id),
  refund_date DATE NOT NULL,
  refund_method VARCHAR(50) NOT NULL,
  refund_details TEXT,
  reason TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);