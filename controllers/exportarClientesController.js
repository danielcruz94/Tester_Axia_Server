const ExcelJS = require('exceljs');
const MiniPlan = require('../models/ApiMiniPLan');

const exportarClientes = async (req, res) => {
  try {
    const clientes = await MiniPlan.find();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Clientes MiniPlan');

    worksheet.columns = [
      { header: 'Recomendado Por', key: 'recomendadoPor', width: 20 },
      { header: 'Nombre', key: 'nombre', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Celular', key: 'celular', width: 15 },
      { header: 'Fecha de Nacimiento', key: 'nacimiento', width: 18 },
      { header: 'Empresa', key: 'empresa', width: 20 },
      { header: 'Cargo', key: 'cargo', width: 20 },
      { header: 'AFP', key: 'afp', width: 15 },
      { header: 'Semanas Cotizadas', key: 'semanasCotizadas', width: 18 },
      { header: 'Edad Pension', key: 'edadPension', width: 15 },
      { header: 'Monto Pensión', key: 'montoPension', width: 15 },
      { header: 'Objetivos', key: 'objetivos', width: 30 },
      { header: 'Ingreso Neto Mensual', key: 'ingresoNetoMensual', width: 20 },
      { header: 'Ingreso Trimestral', key: 'ingresoTrimestral', width: 20 },
      { header: 'Ingresos Adicionales', key: 'ingresosAdicionales', width: 20 },
      { header: 'Prima Anual', key: 'primaAnual', width: 15 },
      { header: 'Bonificaciones Anuales', key: 'bonificacionesAnuales', width: 20 },
      { header: 'Ahorro Mensual', key: 'ahorroMensual', width: 15 },
      { header: 'Transporte', key: 'transporte', width: 15 },
      { header: 'Cuidado Personal', key: 'cuidadoPersonal', width: 18 },
      { header: 'Comida Oficina', key: 'comidaOficina', width: 15 },
      { header: 'Gastos Hogar', key: 'gastosHogar', width: 15 },
      { header: 'Entretenimiento', key: 'entretenimiento', width: 15 },
      { header: 'Seguros Mensuales', key: 'segurosMensuales', width: 18 },
      { header: 'Cursos', key: 'cursos', width: 15 },
      { header: 'Hijos', key: 'hijos', width: 10 },
      { header: 'Seguros Anuales', key: 'segurosAnuales', width: 18 },
      { header: 'Anualidades Fijas', key: 'anualidadesFijas', width: 18 },
      { header: 'Anualidades Variables', key: 'anualidadesVariables', width: 20 },
      { header: 'Impuestos', key: 'impuestos', width: 15 },
      { header: 'Patrimonio', key: 'patrimonio', width: 15 },
      { header: 'Seguro Vida', key: 'seguroVida', width: 15 },
      { header: 'Tiene Hijos Dependientes', key: 'tieneHijosDependientes', width: 25 },
      { header: 'Seguro Incapacidad', key: 'seguroIncapacidad', width: 18 },
      { header: 'Póliza Salud', key: 'polizaSalud', width: 15 },
      { header: 'Fondo Emergencia', key: 'fondoEmergencia', width: 18 },
      { header: 'Plan B', key: 'planB', width: 15 },
      { header: 'Deuda', key: 'deuda', width: 15 },
      { header: 'Total Deudas Mensuales', key: 'totalDeudasMensuales', width: 20 },
      { header: 'Otros Gastos Mensuales', key: 'otrosGastosMensuales', width: 20 }
    ];

    // Aplica formato moneda a las columnas que quieres que se vean con $ y separadores
    const columnasMoneda = [
      'montoPension',
      'ingresoNetoMensual',
      'ingresoTrimestral',
      'ingresosAdicionales',
      'primaAnual',
      'bonificacionesAnuales',
      'ahorroMensual',
      'transporte',
      'cuidadoPersonal',
      'comidaOficina',
      'gastosHogar',
      'entretenimiento',
      'segurosMensuales',
      'cursos',
      'segurosAnuales',
      'anualidadesFijas',
      'anualidadesVariables',
      'impuestos',
      'patrimonio',
      'deuda',
      'totalDeudasMensuales',
      'otrosGastosMensuales'
    ];

    columnasMoneda.forEach(key => {
  worksheet.getColumn(key).numFmt = '"$"#,##0;[Red]\-"$"#,##0';
});

    clientes.forEach(cliente => {
      worksheet.addRow({
        recomendadoPor: cliente?.recomendadoPor || '',
        nombre: cliente?.nombre || '',
        email: cliente?.email || '',
        celular: cliente?.celular || '',
        nacimiento: cliente?.nacimiento ? new Date(cliente.nacimiento).toLocaleDateString() : '',
        empresa: cliente?.empresa || '',
        cargo: cliente?.cargo || '',
        afp: cliente?.afp || '',
        semanasCotizadas: cliente?.semanasCotizadas || '',
        edadPension: cliente?.edadPension ?? '',
        montoPension: cliente?.montoPension ?? 0,
        objetivos: cliente?.objetivos ? cliente.objetivos.join(', ') : '',
        ingresoNetoMensual: cliente?.ingresoNetoMensual ?? 0,
        ingresoTrimestral: cliente?.ingresoTrimestral ?? 0,
        ingresosAdicionales: cliente?.ingresosAdicionales ?? 0,
        primaAnual: cliente?.primaAnual ?? 0,
        bonificacionesAnuales: cliente?.bonificacionesAnuales ?? 0,
        ahorroMensual: cliente?.ahorroMensual ?? 0,
        transporte: cliente?.transporte ?? 0,
        cuidadoPersonal: cliente?.cuidadoPersonal ?? 0,
        comidaOficina: cliente?.comidaOficina ?? 0,
        gastosHogar: cliente?.gastosHogar ?? 0,
        entretenimiento: cliente?.entretenimiento ?? 0,
        segurosMensuales: cliente?.segurosMensuales ?? 0,
        cursos: cliente?.cursos ?? 0,
        hijos: cliente?.hijos ?? '',
        segurosAnuales: cliente?.segurosAnuales ?? 0,
        anualidadesFijas: cliente?.anualidadesFijas ?? 0,
        anualidadesVariables: cliente?.anualidadesVariables ?? 0,
        impuestos: cliente?.impuestos ?? 0,
        patrimonio: cliente?.patrimonio ?? 0,
        seguroVida: cliente?.seguroVida || '',
        tieneHijosDependientes: cliente?.tieneHijosDependientes || '',
        seguroIncapacidad: cliente?.seguroIncapacidad || '',
        polizaSalud: cliente?.polizaSalud || '',
        fondoEmergencia: cliente?.fondoEmergencia || 0,
        planB: cliente?.planB || '',
        deuda: cliente?.deuda ?? 0,
        totalDeudasMensuales: cliente?.totalDeudasMensuales ?? 0,
        otrosGastosMensuales: cliente?.otrosGastosMensuales ?? 0
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=clientes_miniplan.xlsx'
    );

    await workbook.xlsx.write(res);

  } catch (error) {
    console.error('Error al exportar clientes MiniPlan:', error);
    res.status(500).json({ error: 'Error al exportar los datos' });
  }
};

module.exports = { exportarClientes };
