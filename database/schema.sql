CREATE DATABASE IF NOT EXISTS hello_world
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE hello_world;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS countries (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  code CHAR(2) NOT NULL,
  latitude DECIMAL(9,6) NOT NULL,
  longitude DECIMAL(9,6) NOT NULL,
  description TEXT NOT NULL,
  image_url VARCHAR(600) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_countries_code (code),
  KEY idx_countries_name (name),
  CONSTRAINT chk_countries_latitude CHECK (latitude BETWEEN -90 AND 90),
  CONSTRAINT chk_countries_longitude CHECK (longitude BETWEEN -180 AND 180)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cities (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  country_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(160) NOT NULL,
  latitude DECIMAL(9,6) NOT NULL,
  longitude DECIMAL(9,6) NOT NULL,
  description TEXT NOT NULL,
  image_url VARCHAR(600) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cities_country_name (country_id, name),
  KEY idx_cities_name (name),
  CONSTRAINT fk_cities_country FOREIGN KEY (country_id) REFERENCES countries (id) ON DELETE RESTRICT,
  CONSTRAINT chk_cities_latitude CHECK (latitude BETWEEN -90 AND 90),
  CONSTRAINT chk_cities_longitude CHECK (longitude BETWEEN -180 AND 180)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS places (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  city_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(180) NOT NULL,
  category VARCHAR(32) NOT NULL,
  description TEXT NOT NULL,
  address VARCHAR(300) NOT NULL,
  latitude DECIMAL(9,6) NOT NULL,
  longitude DECIMAL(9,6) NOT NULL,
  image_url VARCHAR(600) NULL,
  rating DECIMAL(2,1) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_places_city_name (city_id, name),
  KEY idx_places_city_category (city_id, category),
  KEY idx_places_name (name),
  CONSTRAINT fk_places_city FOREIGN KEY (city_id) REFERENCES cities (id) ON DELETE CASCADE,
  CONSTRAINT chk_places_latitude CHECK (latitude BETWEEN -90 AND 90),
  CONSTRAINT chk_places_longitude CHECK (longitude BETWEEN -180 AND 180),
  CONSTRAINT chk_places_rating CHECK (rating IS NULL OR rating BETWEEN 0 AND 5),
  CONSTRAINT chk_places_category CHECK (category IN ('attractions', 'food', 'nature', 'beaches', 'culture', 'entertainment', 'shopping', 'hotels', 'scenic', 'activities'))
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS favorites (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  place_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_favorites_user_place (user_id, place_id),
  KEY idx_favorites_place (place_id),
  CONSTRAINT fk_favorites_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_favorites_place FOREIGN KEY (place_id) REFERENCES places (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS itineraries (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(160) NOT NULL,
  description TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_itineraries_user_created (user_id, created_at),
  CONSTRAINT fk_itineraries_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS itinerary_places (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  itinerary_id BIGINT UNSIGNED NOT NULL,
  place_id BIGINT UNSIGNED NOT NULL,
  visit_order INT UNSIGNED NOT NULL,
  notes VARCHAR(500) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_itinerary_visit_order (itinerary_id, visit_order),
  UNIQUE KEY uq_itinerary_place (itinerary_id, place_id),
  KEY idx_itinerary_places_place (place_id),
  CONSTRAINT fk_itinerary_places_itinerary FOREIGN KEY (itinerary_id) REFERENCES itineraries (id) ON DELETE CASCADE,
  CONSTRAINT fk_itinerary_places_place FOREIGN KEY (place_id) REFERENCES places (id) ON DELETE CASCADE
) ENGINE=InnoDB;
