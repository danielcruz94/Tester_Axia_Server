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

    // 🔍 1. Validar campos obligatorios
    const camposObligatorios = {
      nombre,
      apellidos,
      cedula,
      fechaNacimiento,
      lugarNacimiento,
      edad,
      direccionCasa,
      celular,
      sexo,
      universidad,
      correoElectronico,
      declaranteRenta,
      estadoCivil,
      contraseña,
      asesor
    };

    for (const [campo, valor] of Object.entries(camposObligatorios)) {
      if (!valor || valor === '') {
        return res.status(400).json({
          message: `El campo '${campo}' es obligatorio.`,
          field: campo
        });
      }
    }

    // 🧾 2. Validar formato del correo
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexCorreo.test(correoElectronico)) {
      return res.status(400).json({
        message: 'El formato del correo electrónico no es válido.',
        field: 'correoElectronico'
      });
    }

    // 🔐 3. Validar longitud mínima de contraseña
    if (contraseña.length < 1) {
      return res.status(400).json({
        message: 'La contraseña es muy corta.',
        field: 'contraseña'
      });
    }

    // 🧍 4. Verificar si ya existe un cliente con la misma cédula
    const clienteExistente = await ClienteFormulario.findOne({ cedula });
    if (clienteExistente) {
      return res.status(409).json({
        message: 'Ya existe un cliente registrado con esta cédula.',
        field: 'cedula'
      });
    }

    // ✉️ 5. Verificar si ya existe un cliente con el mismo correo electrónico
    const correoExistente = await ClienteFormulario.findOne({ correoElectronico });
    if (correoExistente) {
      return res.status(409).json({
        message: 'El correo electrónico ya está registrado.',
        field: 'correoElectronico'
      });
    }

    // 📅 6. Validar fechas
    const fechaNacimientoDate = new Date(fechaNacimiento);
    const fechaIngresoDate = fechaIngreso ? new Date(fechaIngreso) : null;

    if (isNaN(fechaNacimientoDate.getTime())) {
      return res.status(400).json({
        message: 'La fecha de nacimiento no es válida.',
        field: 'fechaNacimiento'
      });
    }

    if (fechaIngreso && isNaN(fechaIngresoDate.getTime())) {
      return res.status(400).json({
        message: 'La fecha de ingreso no es válida.',
        field: 'fechaIngreso'
      });
    }

    // 🔒 7. Encriptar la contraseña
    const contraseñaEncriptada = await bcrypt.hash(contraseña, 10);

    // 🆕 8. Crear nueva instancia del cliente
    const nuevoCliente = new ClienteFormulario({
      fecha: fecha || new Date(),
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

    // 💾 9. Guardar en la base de datos
    await nuevoCliente.save();

    // ✅ 10. Respuesta exitosa
    return res.status(201).json({
      message: 'Cliente creado con éxito.',
      cedula: nuevoCliente.cedula,
      nombreCompleto: `${nuevoCliente.nombre} ${nuevoCliente.apellidos}`
    });

  } catch (error) {
    console.error('Error al crear cliente:', error);

    // ⚠️ Respuesta genérica de error del servidor
    return res.status(500).json({
      message: 'Ocurrió un error inesperado al crear el cliente. Intenta nuevamente.',
      error: error.message
    });
  }
};

module.exports = crearCliente;
