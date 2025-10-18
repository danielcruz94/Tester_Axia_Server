const ClienteFormulario = require('../models/ClienteAxia');
const deepEqual = require('deep-equal');

const actualizarCliente = async (req, res) => {
  let cambiosRealizados = false;

  try {
    const { 
      DeudasCortoPlazo, DeudasLargoPlazo, objetivos, 
      datosMongo 
    } = req.body;

    const normalizarDeuda = (deuda) => {
      if (deuda && typeof deuda === 'string') {
        return [deuda];
      }
      if (deuda && Array.isArray(deuda)) {
        return deuda;
      }
      return [];
    };

    if (DeudasCortoPlazo) {
      req.body.DeudasCortoPlazo = {
        pasivo: normalizarDeuda(DeudasCortoPlazo.pasivo),
        saldoCapital: normalizarDeuda(DeudasCortoPlazo.saldoCapital),
        entidad: normalizarDeuda(DeudasCortoPlazo.entidad),
        tasa: normalizarDeuda(DeudasCortoPlazo.tasa),
        cuotasPendientes: normalizarDeuda(DeudasCortoPlazo.cuotasPendientes),
        cuotaMensual: normalizarDeuda(DeudasCortoPlazo.cuotaMensual)
      };
    }

    if (DeudasLargoPlazo) {
      req.body.DeudasLargoPlazo = {
        pasivo: normalizarDeuda(DeudasLargoPlazo.pasivo),
        saldoCapital: normalizarDeuda(DeudasLargoPlazo.saldoCapital),
        entidad: normalizarDeuda(DeudasLargoPlazo.entidad),
        tasa: normalizarDeuda(DeudasLargoPlazo.tasa),
        cuotasPendientes: normalizarDeuda(DeudasLargoPlazo.cuotasPendientes),
        cuotaMensual: normalizarDeuda(DeudasLargoPlazo.cuotaMensual)
      };
    }

    const cliente = await ClienteFormulario.findOne({ cedula: datosMongo.cedula });

    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    if (datosMongo.hasOwnProperty('fieldset') && cliente.fieldset !== datosMongo.fieldset) {
      cliente.fieldset = datosMongo.fieldset;
      cambiosRealizados = true;
    } else if (!datosMongo.hasOwnProperty('fieldset') && cliente.fieldset !== 0) {
      cliente.fieldset = 0;
      cambiosRealizados = true;
    }

    const actualizarDeudaIndividual = (deudaAntigua, deudaNueva) => {
      if (!deepEqual(deudaAntigua, deudaNueva)) {
        for (const campo in deudaAntigua) {
          if (deudaAntigua.hasOwnProperty(campo)) {
            delete deudaAntigua[campo];
          }
        }
        for (const campo in deudaNueva) {
          if (deudaNueva.hasOwnProperty(campo)) {
            deudaAntigua[campo] = deudaNueva[campo];
          }
        }
        cambiosRealizados = true;
      }
    };

    if (DeudasCortoPlazo) {
      const deudaCortoPlazo = cliente.DeudasCortoPlazo || {};
      actualizarDeudaIndividual(deudaCortoPlazo, req.body.DeudasCortoPlazo);
      cliente.DeudasCortoPlazo = deudaCortoPlazo;
    }

    if (DeudasLargoPlazo) {
      const deudaLargoPlazo = cliente.DeudasLargoPlazo || {};
      actualizarDeudaIndividual(deudaLargoPlazo, req.body.DeudasLargoPlazo);
      cliente.DeudasLargoPlazo = deudaLargoPlazo;
    }

    if (objetivos) {
      const objetivosAntiguos = cliente.objetivos || {};
      if (!deepEqual(objetivosAntiguos, objetivos)) {
        for (const campo in objetivosAntiguos) {
          if (objetivosAntiguos.hasOwnProperty(campo)) {
            delete objetivosAntiguos[campo];
          }
        }
        for (const campo in objetivos) {
          if (objetivos.hasOwnProperty(campo)) {
            objetivosAntiguos[campo] = objetivos[campo];
          }
        }
        cliente.objetivos = objetivosAntiguos;
        cambiosRealizados = true;
      }
    }

    Object.keys(req.body).forEach(key => {
      if (key !== 'cedula' && key !== 'contraseña' && key !== 'datosMongo') {
        if (req.body[key] !== undefined && req.body[key] !== null) {
          if (!deepEqual(cliente[key], req.body[key])) {
            cliente[key] = req.body[key];
            cambiosRealizados = true;
          }
        }
      }
    });

    if (cambiosRealizados) {
      await cliente.save();
      return res.status(200).json({
        message: 'Cliente actualizado exitosamente',
        cliente: cliente
      });
    }

    res.status(200).json({
      message: 'No hubo cambios en los datos del cliente',
      cliente: cliente
    });

  } catch (error) {
    console.error('Error al guardar el cliente:', error);
    res.status(500).json({ message: 'Error al actualizar el cliente', error: error.message });
  }
};

module.exports = actualizarCliente;
