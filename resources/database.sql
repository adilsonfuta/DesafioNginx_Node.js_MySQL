CREATE DATABASE IF NOT EXISTS fullcycle;
USE fullcycle;

CREATE TABLE IF NOT EXISTS people (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir alguns dados iniciais
INSERT INTO people (name) VALUES 
    ('João Silva'),
    ('Maria Santos'),
    ('Pedro Oliveira');