-- =====================================================
-- SETUP DATABASE - WEATHERAPP PRO
-- =====================================================

-- 1. Base de Datos
-- En Aiven, la base de datos 'defaultdb' ya está creada y en uso por defecto.
-- No necesitamos ejecutar CREATE DATABASE ni USE.

-- 2. Usuario
-- En Aiven, el usuario 'avnadmin' ya está creado y configurado.
-- No necesitamos ejecutar CREATE USER ni GRANT.

-- 3. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url LONGTEXT, -- Soporte para Base64 o URLs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. Tabla de Preferencias de Usuario
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id INT PRIMARY KEY,
    theme ENUM('light', 'dark') DEFAULT 'dark',
    language ENUM('es', 'en') DEFAULT 'es',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Tabla de Ciudades Favoritas
CREATE TABLE IF NOT EXISTS favorite_cities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_city_user (user_id, name) -- Evitar duplicados por usuario
) ENGINE=InnoDB;

-- =====================================================
-- DML - Datos de Prueba iniciales (Opcional)
-- =====================================================
-- El sistema de registro de la App se encargará de insertar datos reales.
