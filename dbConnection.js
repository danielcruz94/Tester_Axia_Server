require('dotenv').config();
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

/**
 * Variable global para cachear la conexión a la base de datos.
 * Esto evita crear una nueva conexión en cada invocación de la función serverless.
 */
let cachedDb = null;

const connectDB = async () => {
  const connectionString = process.env.MONGODB_URI;

  if (!connectionString) {
    // En lugar de salir, lanzamos un error que Vercel puede manejar.
    throw new Error('No se encontró la variable MONGODB_URI');
  }

  // Si ya tenemos una conexión cacheada y lista, la reutilizamos.
  if (cachedDb) {
    console.log('🔄 Reutilizando conexión a MongoDB cacheada');
    return cachedDb;
  }

  // Opciones optimizadas para mantener la conexión viva
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    keepAlive: true, // ¡La solución a tu problema original!
    keepAliveInitialDelay: 300000,
    bufferCommands: false, // Desactiva el buffering de Mongoose si no hay conexión
  };

  try {
    console.log('🟡 Creando nueva conexión a MongoDB...');
    // Si no hay conexión cacheada, creamos una nueva.
    cachedDb = await mongoose.connect(connectionString, options);
    console.log('✅ MongoDB conectado correctamente');
    return cachedDb;
  } catch (error) {
    console.error('❌ Error al conectar MongoDB:', error.message);
    // Lanzamos el error para que la invocación de la función falle,
    // pero sin tumbar todo el proceso.
    throw error;
  }
};

module.exports = connectDB;