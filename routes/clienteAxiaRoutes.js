const express = require('express');
const router = express.Router();

const crearCliente = require('../controllers/crearCliente');
const obtenerCliente = require('../controllers/obtenerCliente');
const login = require('../controllers/login');
const actualizarCliente = require('../controllers/actualizarcliente');
const obtenerFieldset = require('../controllers/fieldset');
const getAllClientes = require('../controllers/GetAllClientes');
const { procesarMiniPlan } = require('../controllers/miniplan');
const { exportarClientes } = require('../controllers/exportarClientesController');


// Ruta para crear un nuevo cliente
router.post('/clientes', crearCliente);
router.get('/clientes', getAllClientes);

// Ruta para obtener los datos de un cliente por su ID
router.get('/clientes/:cedula', obtenerCliente);

// Ruta para login
router.post('/login', login);

// Ruta para actualizar cliente
router.put('/actualizar', actualizarCliente);

// Ruta para obtener fieldset
router.get('/cliente/:cedula/fieldset', obtenerFieldset);

//Ruta Mini Plan Financiero
router.post('/miniplan', procesarMiniPlan);

//Ruta Mini Plan Financiero Descargar datos
router.get('/ClienteAxias', exportarClientes);


// ✅ Ruta keepalive para mantener el servidor activo
router.get('/keepalive', (req, res) => {
  res.status(200).send('✅ Server is awake!');
});

module.exports = router;
