const ClienteFormulario = require('../models/ClienteAxia'); 
const bcrypt = require('bcryptjs');

const crearCliente = async (req, res) => {
  try {
    const {
      asesor,
      fecha,
      sexo,
      nombre,
      apellidos,
      cedula,
      fechaNacimiento,
      lugarNacimiento,
      edad,
      direccionCasa,
      direccionOficina,
      celular,
      telefonoCasa,
      telefonoOficina,
      empresa,
      cargo,
      fechaIngreso,
      tipoContratacion,
      profesion,
      universidad,
      correoElectronico,
      declaranteRenta,
      estadoCivil,
      contraseña
    } = req.body;

    // Verificar si ya existe un cliente con la misma cédula
    const clienteExistente = await ClienteFormulario.findOne({ cedula });
    if (clienteExistente) {
      return res.status(400).json({ message: 'El usuario con esta cédula ya está registrado' });
    }

    // Verificar si ya existe un cliente con el mismo correo electrónico
    const correoExistente = await ClienteFormulario.findOne({ correoElectronico });
    if (correoExistente) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
    }

    // Validar y asignar fecha de nacimiento (null si inválida)
    let fechaNacimientoDate = new Date(fechaNacimiento);
    if (!fechaNacimiento || isNaN(fechaNacimientoDate.getTime())) {
      fechaNacimientoDate = null;
    }

    // Validar y asignar fecha de ingreso (null si inválida)
    let fechaIngresoDate = new Date(fechaIngreso);
    if (!fechaIngreso || isNaN(fechaIngresoDate.getTime())) {
      fechaIngresoDate = null;
    }

    // Encriptar la contraseña antes de guardarla
    const contraseñaEncriptada = await bcrypt.hash(contraseña, 10);

    // Crear nueva instancia del cliente
    const nuevoCliente = new ClienteFormulario({
      fecha: fecha || new Date(), // Si no viene, usar fecha actual
      asesor,
      sexo,
      nombre,
      apellidos,
      cedula,
      fechaNacimiento: fechaNacimientoDate,
      lugarNacimiento,
      edad,
      direccionCasa,
      direccionOficina,
      celular,
      telefonoCasa,
      telefonoOficina,
      empresa,
      cargo,
      fechaIngreso: fechaIngresoDate,
      tipoContratacion,
      profesion,
      universidad,
      correoElectronico,
      declaranteRenta,
      estadoCivil,
      contraseña: contraseñaEncriptada
    });

    // Guardar en la base de datos
    await nuevoCliente.save();

    // Respuesta exitosa
    res.status(201).json({
      message: 'Cliente creado con éxito',
      cedula: nuevoCliente.cedula
    });

  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({
      message: 'Error al crear el cliente',
      error: error.message
    });
  }
};

module.exports = crearCliente;
