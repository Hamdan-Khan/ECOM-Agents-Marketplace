-- Users Table
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(10) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Agents Table
CREATE TABLE ai_agents (
  agent_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  subscription_price DECIMAL(10, 2),
  developer_id INTEGER REFERENCES users(user_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE orders (
  order_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) NOT NULL,
  agent_id INTEGER REFERENCES ai_agents(agent_id) NOT NULL,
  order_type VARCHAR(20) NOT NULL CHECK (order_type IN ('one-time', 'subscription')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('gateway', 'tokens')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tokens Table
CREATE TABLE tokens (
  token_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) NOT NULL,
  balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Token Purchases Table
CREATE TABLE token_purchases (
  purchase_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  tokens INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Token Usage Table
CREATE TABLE token_usage (
  usage_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) NOT NULL,
  tokens_used INTEGER NOT NULL,
  order_id INTEGER REFERENCES orders(order_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions Table
CREATE TABLE transactions (
  transaction_id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(order_id) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed')),
  gateway_response TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions Table
CREATE TABLE subscriptions (
  subscription_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) NOT NULL,
  agent_id INTEGER REFERENCES ai_agents(agent_id) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  next_billing_date DATE NOT NULL,
  payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('gateway', 'tokens')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_ai_agents_category ON ai_agents(category);
CREATE INDEX idx_ai_agents_developer ON ai_agents(developer_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_agent ON orders(agent_id);
CREATE INDEX idx_tokens_user ON tokens(user_id);
CREATE INDEX idx_transactions_order ON transactions(order_id);
CREATE INDEX idx_token_purchases_user ON token_purchases(user_id);
CREATE INDEX idx_token_usage_user ON token_usage(user_id);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_agent ON subscriptions(agent_id);
