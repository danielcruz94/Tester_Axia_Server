const { Schema, model } = require('mongoose');

// Esquema para ClienteAxias
const ClienteAxiasSchema = new Schema({
  // Datos generales
  asesor: { type: String, required: true },
  fecha: { type: Date, default: Date.now, required: true },
  sexo: { type: String, required: true },
  nombre: { type: String, required: true },
  apellidos: { type: String, required: true },
  cedula: { type: String, required: true, unique: true },  
  fechaNacimiento: { type: Date, required: true },
  lugarNacimiento: { type: String, required: true },
  edad: { type: Number, required: true },
  direccionCasa: { type: String, required: true },
  direccionOficina: { type: String, required: false },
  celular: { type: String, required: true },
  telefonoCasa: { type: String, required: false },
  telefonoOficina: { type: String, required: false },
  empresa: { type: String, required: false },
  cargo: { type: String, required: false },
  fechaIngreso: { type: Date, default: null },
  tipoContratacion: { type: String, required: false },
  profesion: { type: String, required: false },
  universidad: { type: String, required: false },
  correoElectronico: { type: String, required: true, unique: true },
  declaranteRenta: { type: String, required: true },
  estadoCivil: { type: String, required: true },
  contraseña: { type: String, required: true },

  // Secciones financieras (Mixed para estructuras dinámicas)
  seguridadsocial: { type: Schema.Types.Mixed, required: false },
  ingresos: { type: Schema.Types.Mixed, required: false },
  IngresosAnuales: { type: Schema.Types.Mixed, required: false },
  Ahorro: { type: Schema.Types.Mixed, required: false },
  Transporte: { type: Schema.Types.Mixed, required: false },
  gastosPersonales: { type: Schema.Types.Mixed, required: false },
  hogar: { type: Schema.Types.Mixed, required: false },
  entretenimiento: { type: Schema.Types.Mixed, required: false },
  protecciones: { type: Schema.Types.Mixed, required: false },
  descuentosnomina: { type: Schema.Types.Mixed, required: false },
  educacion: { type: Schema.Types.Mixed, required: false },
  financieros: { type: Schema.Types.Mixed, required: false },
  otros: { type: Schema.Types.Mixed, required: false },
  seguros: { type: Schema.Types.Mixed, required: false },
  AnualidadesFijas: { type: Schema.Types.Mixed, required: false },
  AnualidadesPresupuestadas: { type: Schema.Types.Mixed, required: false },
  Impuestos: { type: Schema.Types.Mixed, required: false },
  activoLiquidos: { type: Schema.Types.Mixed, required: false },
  activosProductivos: { type: Schema.Types.Mixed, required: false },
  activosImproductivos: { type: Schema.Types.Mixed, required: false },
  fieldset: { type: Schema.Types.Mixed, required: false, default: 0 },
  

  // Subdocumentos de objetivos y deudas
  DeudasCortoPlazo: { 
    type: [Map], 
    of: Schema.Types.Mixed, 
    required: false 
  },
  DeudasLargoPlazo: { 
    type: [Map], 
    of: Schema.Types.Mixed, 
    required: false 
  },
  objetivos: { 
    type: [Map], 
    of: Schema.Types.Mixed, 
    required: false 
  },

  // Datos adicionales
  datosMongo: {
    cedula: { type: String, required: false }  // Solo para comparación, no obligatorio
  }
});

// Middleware para no modificar campos existentes
ClienteAxiasSchema.pre('updateOne', function (next) {
  const update = this.getUpdate();
  
  // Campos que no deben ser modificados si ya existen
  const fieldsToKeep = [
    "seguridadsocial", "ingresos", "Ahorro", "Transporte", "gastosPersonales", "hogar", 
    "entretenimiento", "protecciones", "descuentosnomina", "educacion", "financieros", 
    "otros", "seguros", "AnualidadesFijas", "AnualidadesPresupuestadas", "Impuestos", 
    "activoLiquidos", "activosProductivos", "activosImproductivos", "objetivos", 
    "DeudasCortoPlazo", "DeudasLargoPlazo"
  ];

  // Solo actualizar los campos que están en el JSON (evitar que los otros campos se modifiquen)
  for (let field in update) {
    if (fieldsToKeep.includes(field)) {
      update[field] = { $setOnInsert: update[field] }; // No actualizar si ya existe
    }
  }
  
  next();
});

// Configuración para transformar los datos antes de enviarlos como respuesta (JSON)
ClienteAxiasSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

// Crear y exportar el modelo basado en el esquema
const ClienteAxias = model('ClienteAxias', ClienteAxiasSchema);

module.exports = ClienteAxias;
