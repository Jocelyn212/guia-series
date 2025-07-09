#!/bin/bash

# Test script para verificar el endpoint de autenticación

echo "Iniciando servidor de desarrollo..."
cd /Users/jocelyncastro/Desktop/WebSeries/guia-series

# Iniciar servidor en segundo plano
npm run dev &
DEV_PID=$!

# Esperar a que el servidor esté listo
sleep 10

echo "Probando endpoint de autenticación..."

# Crear un usuario admin temporal para pruebas
echo "Creando usuario admin temporal..."
node -e "
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

async function createTestUser() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/webseries');
  await client.connect();
  
  const db = client.db('webseries');
  const users = db.collection('users');
  
  // Verificar si existe el usuario admin
  const existingUser = await users.findOne({ username: 'admin' });
  
  if (!existingUser) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await users.insertOne({
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      createdAt: new Date()
    });
    console.log('Usuario admin creado');
  } else {
    console.log('Usuario admin ya existe');
  }
  
  await client.close();
}

createTestUser().catch(console.error);
"

# Prueba 1: Probar el endpoint de autenticación
echo "Probando login con credenciales admin/admin123..."
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  -v \
  http://localhost:4321/api/auth

echo ""
echo "Prueba completada"

# Limpiar
kill $DEV_PID
