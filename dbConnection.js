require('dotenv').config(); 
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

const connectDB = async () => {
    const connectionString = process.env.MONGODB_URI;
  
    if (!connectionString) {
      console.error('❌ No se encontró la variable MONGODB_URI');
      return;
    }
  
    try {
      // El único cambio está aquí, en las opciones que se pasan a connect()
      await mongoose.connect(connectionString, {
        // --- AÑADE SOLO ESTAS LÍNEAS PARA SOLUCIONAR EL PROBLEMA ---
        keepAlive: true,
        keepAliveInitialDelay: 300000,
        useNewUrlParser: true,         // Buena práctica recomendada
        useUnifiedTopology: true,    // Buena práctica recomendada
        // -----------------------------------------------------------------
        serverSelectionTimeoutMS: 10000, // Esta línea ya la tenías
      });
      console.log('✅ MongoDB conectado correctamente');
    } catch (error) {
      console.error('❌ Error al conectar MongoDB:', error.message);
    }
}

module.exports = connectDB;