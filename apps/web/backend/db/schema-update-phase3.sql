-- API Keys Table
CREATE TABLE api_keys (
  key_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) NOT NULL,
  agent_id INTEGER REFERENCES ai_agents(agent_id) NOT NULL,
  api_key VARCHAR(64) NOT NULL,
  name VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  last_used TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);

-- Agent Usage Table
CREATE TABLE agent_usage (
  usage_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) NOT NULL,
  agent_id INTEGER REFERENCES ai_agents(agent_id) NOT NULL,
  api_key_id INTEGER REFERENCES api_keys(key_id),
  request_count INTEGER NOT NULL DEFAULT 1,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agent Integration Settings Table
CREATE TABLE agent_integration_settings (
  setting_id SERIAL PRIMARY KEY,
  agent_id INTEGER REFERENCES ai_agents(agent_id) NOT NULL,
  integration_type VARCHAR(50) NOT NULL,
  endpoint_url VARCHAR(255),
  documentation_url VARCHAR(255),
  request_format JSONB,
  response_format JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_api_keys_user ON api_keys(user_id);
CREATE INDEX idx_api_keys_agent ON api_keys(agent_id);
CREATE INDEX idx_agent_usage_user ON agent_usage(user_id);
CREATE INDEX idx_agent_usage_agent ON agent_usage(agent_id);
CREATE INDEX idx_agent_integration_settings_agent ON agent_integration_settings(agent_id);
