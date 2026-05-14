-- =====================================================
-- SETUP DATABASE - WEATHERAPP PRO
-- =====================================================

-- 1. Crear Base de Datos
CREATE DATABASE IF NOT EXISTS weather_app_db;
USE weather_app_db;

-- 2. Crear Usuario Administrador del Proyecto
-- Nota: En producción, cambia 'weather_pass_2026' por una clave fuerte
CREATE USER IF NOT EXISTS 'weather_user'@'localhost' IDENTIFIED BY 'weather_pass_2026';
GRANT ALL PRIVILEGES ON weather_app_db.* TO 'weather_user'@'localhost';
FLUSH PRIVILEGES;

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
