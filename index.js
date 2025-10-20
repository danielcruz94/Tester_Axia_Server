const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');


const connectDB = require('./dbConnection'); 
const clienteRoutes = require('./routes/clienteAxiaRoutes'); 

const app = express();

const corsOptions = {
  origin: '*', // permite todos los orígenes
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // encabezados permitidos
  credentials: true, // permite enviar cookies y credenciales
  optionsSuccessStatus: 204, // el código de respuesta para las preflight requests
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Asegúrate de que OPTIONS también esté habilitado


//app.use(cors());
app.use(express.json());

connectDB();

app.use('/api', clienteRoutes);

app.get('/', (req, res) => {
  res.send('Servidor funcionando');
});

if (process.env.NODE_ENV !== 'production') {
  // Solo escucha en local
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
  });
}

app.get('/favicon.png', (req, res) => {
  res.sendFile(path.join(__dirname, 'favicon.png'));
});
// Exporta siempre la app para Vercel
module.exports = app;
