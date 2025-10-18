const { Schema, model } = require('mongoose');

const MiniPlanSchema = new Schema({
  recomendadoPor: { type: String },
  nombre: { type: String },
  email: { type: String },
  celular: { type: String },
  nacimiento: { type: Date },
  empresa: { type: String },
  cargo: { type: String },
  afp: { type: String },
  semanasCotizadas: { type: String },
  edadPension: { type: Number },
  montoPension: { type: Number },

  objetivos: [{ type: String }],

  ingresoNetoMensual: { type: Number },
  ingresoTrimestral: { type: Number },
  ingresosAdicionales: { type: Number },
  primaAnual: { type: Number },
  bonificacionesAnuales: { type: Number },
  ahorroMensual: { type: Number },
  transporte: { type: Number },
  cuidadoPersonal: { type: Number },
  comidaOficina: { type: Number },
  gastosHogar: { type: Number },
  entretenimiento: { type: Number },
  segurosMensuales: { type: Number },
  cursos: { type: Number },
  hijos: { type: Number },
  segurosAnuales: { type: Number },
  anualidadesFijas: { type: Number },
  anualidadesVariables: { type: Number },
  impuestos: { type: Number },
  patrimonio: { type: Number },

seguroVida: { type: String, enum: ['Sí', 'No', ''], default: '' },
tieneHijosDependientes: { type: String, enum: ['Sí', 'No', ''], default: '' },
seguroIncapacidad: { type: String, enum: ['Sí', 'No', ''], default: '' },
polizaSalud: { type: String, enum: ['Sí', 'No', ''], default: '' },
fondoEmergencia: { type: String, enum: ['Sí', 'No', ''], default: '' },

  planB: { type: String },
  deuda: { type: Number },
  totalDeudasMensuales: { type: Number },
  otrosGastosMensuales: { type: Number }
});

// Configuración para transformar la salida JSON (quitar _id y __v, agregar id)
MiniPlanSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

const MiniPlan = model('MiniPlan', MiniPlanSchema);

module.exports = MiniPlan;
