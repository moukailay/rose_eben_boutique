-- Script d'initialisation pour Rose d'Eden Boutique
-- Ce script s'exécute automatiquement lors du premier démarrage de PostgreSQL

-- Afficher un message de début
\echo '======================================'
\echo 'Initialisation de la base de données Rose Eden'
\echo '======================================'

-- Créer l'utilisateur pour Medusa
CREATE USER medusa_user WITH PASSWORD 'medusa_password_dev_2024';

-- Créer la base de données pour la boutique
CREATE DATABASE rose_eden_db WITH 
    OWNER = medusa_user
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.utf8'
    LC_CTYPE = 'en_US.utf8'
    TEMPLATE = template0;

-- Donner tous les privilèges à medusa_user sur sa base
GRANT ALL PRIVILEGES ON DATABASE rose_eden_db TO medusa_user;

-- Se connecter à la base rose_eden_db pour les configurations suivantes
\c rose_eden_db

-- Créer le schéma public si nécessaire et donner les permissions
CREATE SCHEMA IF NOT EXISTS public;
GRANT ALL ON SCHEMA public TO medusa_user;
GRANT CREATE ON SCHEMA public TO medusa_user;

-- Message de confirmation
\echo '======================================'
\echo 'Base de données initialisée avec succès!'
\echo 'Utilisateur: medusa_user'
\echo 'Base de données: rose_eden_db'
\echo '======================================'
