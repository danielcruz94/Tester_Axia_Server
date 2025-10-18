const ClienteFormulario = require('../models/ClienteAxia');

// Controlador para obtener todos los datos de un cliente por cédula
const obtenerClientePorCedula = async (req, res) => {
  try {
    const { cedula } = req.params; // Obtener la cédula de los parámetros de la URL

    // Buscar el cliente por la cédula
    const cliente = await ClienteFormulario.findOne({ cedula: cedula });

    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // Retornar todos los datos del cliente
    res.status(200).json(cliente);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los datos del cliente', error: error.message });
  }
};

module.exports = obtenerClientePorCedula;
