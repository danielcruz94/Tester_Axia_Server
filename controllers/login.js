const ClienteFormulario = require('../models/ClienteAxia'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 

const SECRET_KEY = 'dgfghdgfdslkjhcsdg54v1df2g5vdf1vd152fdg13f5v4hb1fg2b65g1nb53fg13b5gf1vb53f1gv'; 

const loginCliente = async (req, res) => {
  try {
    const { username, password } = req.body; 
    
    // Convertir el correo ingresado a minúsculas para una comparación insensible a mayúsculas/minúsculas
    const correoUsuario = username.toLowerCase();

    // Buscar el cliente en la base de datos, convirtiendo también el correo almacenado en minúsculas
    const cliente = await ClienteFormulario.findOne({ correoElectronico: correoUsuario }); 
    
    if (!cliente) {
      return res.status(400).json({ valid: false, message: 'Usuario y contraseña incorrectos' });
    }

    // Comparar la contraseña ingresada con la almacenada en la base de datos
    const esContraseñaValida = await bcrypt.compare(password, cliente.contraseña); 
    
    if (!esContraseñaValida) {
      return res.status(400).json({ valid: false, message: 'Usuario y contraseña incorrectos' });
    }
   
    // Generar el token JWT
    const token = jwt.sign(
      { id: cliente._id, correoElectronico: cliente.correoElectronico }, 
      SECRET_KEY, 
      { expiresIn: '1h' } 
    );
   
    // Responder con la información del cliente y el token
    res.status(200).json({
      valid: true, 
      cedula: cliente.cedula,  
      token: token       
    });
  } catch (error) {
    res.status(500).json({ valid: false, message: 'Error al iniciar sesión', error: error.message });
  }
};

module.exports = loginCliente;
