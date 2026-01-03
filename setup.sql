-- Script de configuração do banco de dados MySQL para Levele
-- Este script cria as tabelas necessárias para o funcionamento do sistema na Hostinger

CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image TEXT,
    images JSON,
    videoUrl TEXT,
    slug VARCHAR(255) UNIQUE,
    category VARCHAR(100),
    stock INT DEFAULT 0,
    seo_title VARCHAR(255),
    seo_description TEXT,
    upsellProductId VARCHAR(255),
    orderBumpId VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(255) PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50) NOT NULL,
    customer_cpf VARCHAR(20),
    address_street VARCHAR(255) NOT NULL,
    address_number VARCHAR(50) NOT NULL,
    address_complement VARCHAR(255),
    address_neighborhood VARCHAR(255) NOT NULL,
    address_city VARCHAR(255) NOT NULL,
    address_state VARCHAR(2) NOT NULL,
    address_zipcode VARCHAR(20) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Novo',
    items JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS coupons (
    code VARCHAR(50) PRIMARY KEY,
    discountType VARCHAR(20) NOT NULL, -- percentage ou fixed
    value DECIMAL(10, 2) NOT NULL,
    minPurchase DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS abandoned_carts (
    id VARCHAR(255) PRIMARY KEY,
    productId VARCHAR(255),
    productName VARCHAR(255),
    variationId VARCHAR(255),
    variationName VARCHAR(255),
    customer_name VARCHAR(255),
    customer_phone VARCHAR(50),
    total DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'Pendente', -- Pendente ou Recuperado
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    metric_name VARCHAR(100) UNIQUE,
    metric_value INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inicializar métricas
INSERT IGNORE INTO analytics (metric_name, metric_value) VALUES ('visits', 0);
