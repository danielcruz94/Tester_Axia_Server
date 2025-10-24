require('dotenv').config();
const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

const connectDB = async () => {
  const connectionString = process.env.MONGODB_URI;

  if (!connectionString) {
    console.error('❌ No se encontró la variable MONGODB_URI');
    process.exit(1); // Es buena práctica detener la app si no hay DB
  }

  // --- AÑADE ESTAS OPCIONES ---
  const options = {
    // Estas opciones son clave para mantener una conexión estable
    keepAlive: true,
    keepAliveInitialDelay: 300000, // Envía una señal cada 5 minutos (300000 ms)

    // Opciones recomendadas por Mongoose
    useNewUrlParser: true,
    useUnifiedTopology: true,

    // El timeout que ya tenías
    serverSelectionTimeoutMS: 10000,
  };
  // -------------------------

  try {
    // --- USA LAS OPCIONES EN LA CONEXIÓN ---
    await mongoose.connect(connectionString, options);
    console.log('✅ MongoDB conectado correctamente');
  } catch (error) {
    console.error('❌ Error al conectar MongoDB:', error.message);
    process.exit(1); // Detiene la aplicación si la conexión inicial falla
  }
};

module.exports = connectDB;