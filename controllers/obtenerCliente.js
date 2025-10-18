const ExcelJS = require('exceljs');
const ClienteAxia = require('../models/ClienteAxia');


const obtenerClientePorCedulaEnJSON = async (req, res) => {
    try {
        const {
            cedula
        } = req.params;
        console.log(cedula)

        const cliente = await ClienteAxia.findOne({
            cedula
        });

        if (!cliente) {
            return res.status(404).json({
                message: 'Cliente no encontrado con esa cédula'
            });
        }

        await generarExcel(cliente, res);
    } catch (error) {

        res.status(500).json({
            message: 'Error al obtener el cliente',
            error: error.message
        });
    }
};


// Función para generar el archivo Excel


const generarExcel = async (cliente, res) => {
    const workbook = new ExcelJS.Workbook();


    // Función auxiliar para agregar filas si el campo es un array o valor
    const addArrayRows = (worksheet, sheetName, fieldName, array) => {
        if (array && Array.isArray(array)) {
            array.forEach(item => {
                worksheet.addRow([sheetName, fieldName, item || 'No disponible']);
            });
        } else {
            worksheet.addRow([sheetName, fieldName, array || 'No disponible']);
        }
    };


    // Crear la hoja "Datos Básicos"
    const hojaDatosBasicos = workbook.addWorksheet('Datos Básicos');
    hojaDatosBasicos.addRow(['Sexo', cliente.sexo]);
    hojaDatosBasicos.addRow(['nombre', cliente.nombre]);
    hojaDatosBasicos.addRow(['apellidos', cliente.apellidos]);
    hojaDatosBasicos.addRow(['cedula', cliente.cedula]);
    hojaDatosBasicos.addRow(['fechaNacimiento', cliente.fechaNacimiento]);
    hojaDatosBasicos.addRow(['lugarNacimiento', cliente.lugarNacimiento]);
    hojaDatosBasicos.addRow(['edad', cliente.edad]);
    hojaDatosBasicos.addRow(['direccionCasa', cliente.direccionCasa]);
    hojaDatosBasicos.addRow(['direccionOficina', cliente.direccionOficina]);
    hojaDatosBasicos.addRow(['celular', cliente.celular]);
    hojaDatosBasicos.addRow(['telefonoCasa', cliente.telefonoCasa]);
    hojaDatosBasicos.addRow(['telefonoOficina', cliente.telefonoOficina]);
    hojaDatosBasicos.addRow(['empresa', cliente.empresa]);
    hojaDatosBasicos.addRow(['cargo', cliente.cargo]);
    hojaDatosBasicos.addRow(['fechaIngreso', cliente.fechaIngreso]);
    hojaDatosBasicos.addRow(['tipoContratacion', cliente.tipoContratacion]);
    hojaDatosBasicos.addRow(['profesion', cliente.profesion]);
    hojaDatosBasicos.addRow(['universidad', cliente.universidad]);
    hojaDatosBasicos.addRow(['correoElectronico', cliente.correoElectronico]);
    hojaDatosBasicos.addRow(['declaranteRenta', cliente.declaranteRenta]);
    hojaDatosBasicos.addRow(['estadoCivil', cliente.estadoCivil]);


    // Crear la hoja "Seguridad Social"  
    if (cliente.seguridadsocial) {
        const hojaSeguridadSocial = workbook.addWorksheet('Seguridad Social');
        hojaSeguridadSocial.addRow(['Eps', cliente.seguridadsocial?.EPS || '']);
        hojaSeguridadSocial.addRow(['Medicina_prepagada', cliente.seguridadsocial?.Medicina_Prepagada || '']);
        hojaSeguridadSocial.addRow(['Arl', cliente.seguridadsocial?.ARL || '']);
        hojaSeguridadSocial.addRow(['Fondo_cesantias', cliente.seguridadsocial?.Fondo_Cesantias || '']);        
        hojaSeguridadSocial.addRow(['', '']);
        hojaSeguridadSocial.addRow(['Afp', cliente.seguridadsocial?.AFP || '']);
    }

    // Crear la hoja "Ingresos"
    console.log(cliente.ingresos)
    if (cliente.ingresos && typeof cliente.ingresos === 'object' && Object.keys(cliente.ingresos).length > 0) {
        const hojaIngresos = workbook.addWorksheet('Ingresos');
        let Arrayingresos = false;
        for (let tipoOtro in cliente.ingresos) {
            if (cliente.ingresos.hasOwnProperty(tipoOtro)) {
                let tipoOtroModificado = tipoOtro.replace(/[-_]/g, ' ');
                const valores = cliente.ingresos[tipoOtro];                
                if (Array.isArray(valores)) {
                    console.log(1)
                    valores.forEach((valor, index) => {
                        if (typeof valor === 'object') {
                            for (let key in valor) {
                                if (valor.hasOwnProperty(key)) {
                                    hojaIngresos.addRow([key.replace(/[-_]/g, ' '), Number(valor[key])]);
                                }
                            }
                        } else {
                            hojaIngresos.addRow([tipoOtroModificado, Number(valor)]);
                        }
                    });
                } else if (typeof valores === 'object' && Arrayingresos != true) {
                    Arrayingresos = true
                    for (let key in cliente.ingresos) {
                        const ingresos = cliente.ingresos[key];
                        const claves = Object.keys(ingresos);
                        const valores = Object.values(ingresos);
            
                        if (claves.length === valores.length) {
                            for (let i = 0; i < claves.length; i++) {                               

                                if(typeof(valores[i]) === 'string'){                                    
                                    hojaIngresos.addRow([claves[i].replace(/[-_]/g, ' '), Number(valores[i])]);
                                }                             

                            }
                        } else {
                            console.error("Las claves y los valores no coinciden en longitud para", key);
                        }
                    }
                } else if (typeof valores === 'string' || typeof valores === 'number') {
                    hojaIngresos.addRow([tipoOtroModificado, Number(valores)]);
                }
            }
        }
    }

    // Crear la hoja "Ahorro"    
    if (cliente.Ahorro && typeof cliente.Ahorro === 'object' && Object.keys(cliente.Ahorro).length > 0) {
        const hojaAhorro = workbook.addWorksheet('Ahorro');
        
        for (let tipoAhorro in cliente.Ahorro) {
            if (cliente.Ahorro.hasOwnProperty(tipoAhorro)) {
                let tipoAhorroModificado = tipoAhorro.replace(/[-_]/g, ' ');
    
                const valores = cliente.Ahorro[tipoAhorro];
                
                if (Array.isArray(valores)) {
                    valores.forEach((valor) => {
                        if (typeof valor === 'object') {
                            for (let key in valor) {
                                if (valor.hasOwnProperty(key)) {
                                    hojaAhorro.addRow([key.replace(/[-_]/g, ' '), Number(valor[key])]);
                                }
                            }
                        } else {
                            hojaAhorro.addRow([tipoAhorroModificado, Number(valor)]);
                        }
                    });
                } else if (typeof valores === 'object') {
                    for (let empresa in valores) {
                        if (valores.hasOwnProperty(empresa)) {
                            const clave = Object.keys(valores[empresa])[0].replace(/[-_]/g, ' ');
                            const valor = Object.values(valores[empresa])[0];
                            hojaAhorro.addRow([clave, Number(valor)]);
                        }
                    }
                } else if (typeof valores === 'string' || typeof valores === 'number') {
                    hojaAhorro.addRow([tipoAhorroModificado, Number(valores)]);
                }
            }
        }
    }  

    // Crear la hoja "Transporte"      
    if (cliente.Transporte && typeof cliente.Transporte === 'object' && Object.keys(cliente.Transporte).length > 0) {
        const hojaTransporte = workbook.addWorksheet('Transporte');
        
        for (let tipoTransporte in cliente.Transporte) {
            if (cliente.Transporte.hasOwnProperty(tipoTransporte)) {
                let tipoTransporteModificado = tipoTransporte.replace(/[-_]/g, ' ');
    
                const valores = cliente.Transporte[tipoTransporte];
                
                if (Array.isArray(valores)) {
                    valores.forEach((valor) => {
                        if (typeof valor === 'object') {
                            for (let key in valor) {
                                if (valor.hasOwnProperty(key)) {
                                    hojaTransporte.addRow([key.replace(/[-_]/g, ' '), Number(valor[key])]);
                                }
                            }
                        } else {
                            hojaTransporte.addRow([tipoTransporteModificado, Number(valor)]);
                        }
                    });
                } else if (typeof valores === 'object') {
                    for (let empresa in valores) {
                        if (valores.hasOwnProperty(empresa)) {
                            const clave = Object.keys(valores[empresa])[0].replace(/[-_]/g, ' ');
                            const valor = Object.values(valores[empresa])[0];
                            hojaTransporte.addRow([clave, Number(valor)]);
                        }
                    }
                } else if (typeof valores === 'string' || typeof valores === 'number') {
                    hojaTransporte.addRow([tipoTransporteModificado, Number(valores)]);
                }
            }
        }
    }    

    // Crear la hoja "gastosPersonales"
    if (cliente.gastosPersonales && typeof cliente.gastosPersonales === 'object' && Object.keys(cliente.gastosPersonales).length > 0) {
        const gastosPersonales = workbook.addWorksheet('Gastos Personales');
        
        for (let tipoGasto in cliente.gastosPersonales) {
            if (cliente.gastosPersonales.hasOwnProperty(tipoGasto)) {
                let tipoGastoModificado = tipoGasto.replace(/[-_]/g, ' ');
    
                const valores = cliente.gastosPersonales[tipoGasto];
                
                if (Array.isArray(valores)) {
                    valores.forEach((valor) => {
                        if (typeof valor === 'object') {
                            for (let key in valor) {
                                if (valor.hasOwnProperty(key)) {
                                    gastosPersonales.addRow([key.replace(/[-_]/g, ' '), Number(valor[key])]);
                                }
                            }
                        } else {
                            gastosPersonales.addRow([tipoGastoModificado, Number(valor)]);
                        }
                    });
                } else if (typeof valores === 'object') {
                    for (let empresa in valores) {
                        if (valores.hasOwnProperty(empresa)) {
                            const clave = Object.keys(valores[empresa])[0].replace(/[-_]/g, ' ');
                            const valor = Object.values(valores[empresa])[0];
                            gastosPersonales.addRow([clave, Number(valor)]);
                        }
                    }
                } else if (typeof valores === 'string' || typeof valores === 'number') {
                    gastosPersonales.addRow([tipoGastoModificado, Number(valores)]);
                }
            }
        }
    }
    
    // Crear la hoja "hogar"  
    if (cliente.hogar && typeof cliente.hogar === 'object' && Object.keys(cliente.hogar).length > 0) {
        const hogar = workbook.addWorksheet('hogar');
        
        for (let tipoHogar in cliente.hogar) {
            if (cliente.hogar.hasOwnProperty(tipoHogar)) {
                let tipoHogarModificado = tipoHogar.replace(/[-_]/g, ' ');
    
                const valores = cliente.hogar[tipoHogar];
                
                if (Array.isArray(valores)) {
                    valores.forEach((valor) => {
                        if (typeof valor === 'object') {
                            for (let key in valor) {
                                if (valor.hasOwnProperty(key)) {
                                    hogar.addRow([key.replace(/[-_]/g, ' '), Number(valor[key])]);
                                }
                            }
                        } else {
                            hogar.addRow([tipoHogarModificado, Number(valor)]);
                        }
                    });
                } else if (typeof valores === 'object') {
                    for (let empresa in valores) {
                        if (valores.hasOwnProperty(empresa)) {
                            const clave = Object.keys(valores[empresa])[0].replace(/[-_]/g, ' ');
                            const valor = Object.values(valores[empresa])[0];
                            hogar.addRow([clave, Number(valor)]);
                        }
                    }
                } else if (typeof valores === 'string' || typeof valores === 'number') {
                    hogar.addRow([tipoHogarModificado, Number(valores)]);
                }
            }
        }
    }    

    // Crear la hoja " Entretenimiento"   
    if (cliente.entretenimiento && typeof cliente.entretenimiento === 'object' && Object.keys(cliente.entretenimiento).length > 0) {
        const hojaentretenimiento = workbook.addWorksheet('Entretenimiento');
        
        for (let tipoEntretenimiento in cliente.entretenimiento) {
            if (cliente.entretenimiento.hasOwnProperty(tipoEntretenimiento)) {
                let tipoEntretenimientoModificado = tipoEntretenimiento.replace(/[-_]/g, ' ');
    
                const valores = cliente.entretenimiento[tipoEntretenimiento];
                
                if (Array.isArray(valores)) {
                    valores.forEach((valor) => {
                        if (typeof valor === 'object') {
                            for (let key in valor) {
                                if (valor.hasOwnProperty(key)) {
                                    hojaentretenimiento.addRow([key.replace(/[-_]/g, ' '), Number(valor[key])]);
                                }
                            }
                        } else {
                            hojaentretenimiento.addRow([tipoEntretenimientoModificado, Number(valor)]);
                        }
                    });
                } else if (typeof valores === 'object') {
                    for (let empresa in valores) {
                        if (valores.hasOwnProperty(empresa)) {
                            const clave = Object.keys(valores[empresa])[0].replace(/[-_]/g, ' ');
                            const valor = Object.values(valores[empresa])[0];
                            hojaentretenimiento.addRow([clave, Number(valor)]);
                        }
                    }
                } else if (typeof valores === 'string' || typeof valores === 'number') {
                    hojaentretenimiento.addRow([tipoEntretenimientoModificado, Number(valores)]);
                }
            }
        }
    } 

    // Crear la hoja "protecciones" 
    if (cliente.protecciones && typeof cliente.protecciones === 'object' && Object.keys(cliente.protecciones).length > 0) {
        const protecciones = workbook.addWorksheet('protecciones');
        
        for (let tipoProteccion in cliente.protecciones) {
            if (cliente.protecciones.hasOwnProperty(tipoProteccion)) {
                let tipoProteccionModificado = tipoProteccion.replace(/[-_]/g, ' ');
    
                const valores = cliente.protecciones[tipoProteccion];
                
                if (Array.isArray(valores)) {
                    valores.forEach((valor) => {
                        if (typeof valor === 'object') {
                            for (let key in valor) {
                                if (valor.hasOwnProperty(key)) {
                                    protecciones.addRow([key.replace(/[-_]/g, ' '), Number(valor[key])]);
                                }
                            }
                        } else {
                            protecciones.addRow([tipoProteccionModificado, Number(valor)]);
                        }
                    });
                } else if (typeof valores === 'object') {
                    for (let empresa in valores) {
                        if (valores.hasOwnProperty(empresa)) {
                            const clave = Object.keys(valores[empresa])[0].replace(/[-_]/g, ' ');
                            const valor = Object.values(valores[empresa])[0];
                            protecciones.addRow([clave, Number(valor)]);
                        }
                    }
                } else if (typeof valores === 'string' || typeof valores === 'number') {
                    protecciones.addRow([tipoProteccionModificado, Number(valores)]);
                }
            }
        }
    }    

    // Crear la hoja "Descuentos Nomina"    
    if (cliente.descuentosnomina && typeof cliente.descuentosnomina === 'object' && Object.keys(cliente.descuentosnomina).length > 0) {
        const hojaDescuentosNomina = workbook.addWorksheet('Descuentos Nomina');
        
        for (let tipoDescuento in cliente.descuentosnomina) {
            if (cliente.descuentosnomina.hasOwnProperty(tipoDescuento)) {
                let tipoDescuentoModificado = tipoDescuento.replace(/[-_]/g, ' ');
    
                const valores = cliente.descuentosnomina[tipoDescuento];
                
                if (Array.isArray(valores)) {
                    valores.forEach((valor) => {
                        if (typeof valor === 'object') {
                            for (let key in valor) {
                                if (valor.hasOwnProperty(key)) {
                                    hojaDescuentosNomina.addRow([key.replace(/[-_]/g, ' '), Number(valor[key])]);
                                }
                            }
                        } else {
                            hojaDescuentosNomina.addRow([tipoDescuentoModificado, Number(valor)]);
                        }
                    });
                } else if (typeof valores === 'object') {
                    for (let empresa in valores) {
                        if (valores.hasOwnProperty(empresa)) {
                            const clave = Object.keys(valores[empresa])[0].replace(/[-_]/g, ' ');
                            const valor = Object.values(valores[empresa])[0];
                            hojaDescuentosNomina.addRow([clave, Number(valor)]);
                        }
                    }
                } else if (typeof valores === 'string' || typeof valores === 'number') {
                    hojaDescuentosNomina.addRow([tipoDescuentoModificado, Number(valores)]);
                }
            }
        }
    }   

    // Crear la hoja " Educacion"
    if (cliente.educacion && typeof cliente.educacion === 'object' && Object.keys(cliente.educacion).length > 0) {
        const hojaeducacion = workbook.addWorksheet('Educacion');
        
        for (let tipoEducacion in cliente.educacion) {
            if (cliente.educacion.hasOwnProperty(tipoEducacion)) {
                let tipoEducacionModificado = tipoEducacion.replace(/[-_]/g, ' ');
    
                const valores = cliente.educacion[tipoEducacion];
                
                if (Array.isArray(valores)) {
                    valores.forEach((valor) => {
                        if (typeof valor === 'object') {
                            for (let key in valor) {
                                if (valor.hasOwnProperty(key)) {
                                    hojaeducacion.addRow([key.replace(/[-_]/g, ' '), Number(valor[key])]);
                                }
                            }
                        } else {
                            hojaeducacion.addRow([tipoEducacionModificado, Number(valor)]);
                        }
                    });
                } else if (typeof valores === 'object') {
                    for (let institucion in valores) {
                        if (valores.hasOwnProperty(institucion)) {
                            const clave = Object.keys(valores[institucion])[0].replace(/[-_]/g, ' ');
                            const valor = Object.values(valores[institucion])[0];
                            hojaeducacion.addRow([clave, Number(valor)]);
                        }
                    }
                } else if (typeof valores === 'string' || typeof valores === 'number') {
                    hojaeducacion.addRow([tipoEducacionModificado, Number(valores)]);
                }
            }
        }
    }   

    // Crear la hoja " Financieros"
    if (cliente.financieros && typeof cliente.financieros === 'object' && Object.keys(cliente.financieros).length > 0) {
        const hojafinancieros = workbook.addWorksheet('Financieros');
        
        for (let tipoFinanciero in cliente.financieros) {
            if (cliente.financieros.hasOwnProperty(tipoFinanciero)) {
                let tipoFinancieroModificado = tipoFinanciero.replace(/[-_]/g, ' ');
    
                const valores = cliente.financieros[tipoFinanciero];
                
                if (Array.isArray(valores)) {
                    valores.forEach((valor) => {
                        if (typeof valor === 'object') {
                            for (let key in valor) {
                                if (valor.hasOwnProperty(key)) {
                                    hojafinancieros.addRow([key.replace(/[-_]/g, ' '), Number(valor[key])]);
                                }
                            }
                        } else {
                            hojafinancieros.addRow([tipoFinancieroModificado, Number(valor)]);
                        }
                    });
                } else if (typeof valores === 'object') {
                    for (let empresa in valores) {
                        if (valores.hasOwnProperty(empresa)) {
                            const clave = Object.keys(valores[empresa])[0].replace(/[-_]/g, ' ');
                            const valor = Object.values(valores[empresa])[0];
                            hojafinancieros.addRow([clave, Number(valor)]);
                        }
                    }
                } else if (typeof valores === 'string' || typeof valores === 'number') {
                    hojafinancieros.addRow([tipoFinancieroModificado, Number(valores)]);
                }
            }
        }
    }    

    // Crear la hoja Ingresos Anuales  
    if (cliente.IngresosAnuales && typeof cliente.IngresosAnuales === 'object' && Object.keys(cliente.IngresosAnuales).length > 0) {
        const hojaAhorro = workbook.addWorksheet('Ingresos Anuales');
        for (let tipoIngreso in cliente.IngresosAnuales) {
            if (cliente.IngresosAnuales.hasOwnProperty(tipoIngreso)) {
                let tipoIngresoModificado = tipoIngreso.replace(/[-_]/g, ' ');
                const ingresos = cliente.IngresosAnuales[tipoIngreso];
                if (Array.isArray(ingresos)) {
                    ingresos.forEach((valor, index) => {
                        if (typeof valor === 'object') {
                            for (let key in valor) {
                                if (valor.hasOwnProperty(key)) {
                                    hojaAhorro.addRow([key.replace(/[-_]/g, ' '), Number(valor[key])]);
                                }
                            }
                        } else {
                            hojaAhorro.addRow([tipoIngresoModificado, Number(valor)]);
                        }
                    });
                } else if (typeof ingresos === 'object') {
                    for (let empresa in ingresos) {
                        if (ingresos.hasOwnProperty(empresa)) {
                            const clave = Object.keys(ingresos[empresa])[0].replace(/[-_]/g, ' ');
                            const valor = Object.values(ingresos[empresa])[0];
                            hojaAhorro.addRow([clave, Number(valor)]);
                        }
                    }
                } else if (typeof ingresos === 'string' || typeof ingresos === 'number') {
                    hojaAhorro.addRow([tipoIngresoModificado, Number(ingresos)]);
                }
            }
        }
    }

    // Crear la hoja "otros"
    if (cliente.otros && typeof cliente.otros === 'object' && Object.keys(cliente.otros).length > 0) {
        const hojaOtros = workbook.addWorksheet('otros');
        for (let tipoOtro in cliente.otros) {
            if (cliente.otros.hasOwnProperty(tipoOtro)) {
                let tipoOtroModificado = tipoOtro.replace(/[-_]/g, ' ');
                const valores = cliente.otros[tipoOtro];
                if (Array.isArray(valores)) {
                    valores.forEach((valor, index) => {
                        if (typeof valor === 'object') {
                            for (let key in valor) {
                                if (valor.hasOwnProperty(key)) {
                                    hojaOtros.addRow([key.replace(/[-_]/g, ' '), Number(valor[key])]);
                                }
                            }
                        } else {
                            hojaOtros.addRow([tipoOtroModificado, Number(valor)]);
                        }
                    });
                } else if (typeof valores === 'object') {
                    for (let empresa in valores) {
                        if (valores.hasOwnProperty(empresa)) {
                            const clave = Object.keys(valores[empresa])[0].replace(/[-_]/g, ' ');
                            const valor = Object.values(valores[empresa])[0];
                            hojaOtros.addRow([clave, Number(valor)]);
                        }
                    }
                } else if (typeof valores === 'string' || typeof valores === 'number') {
                    hojaOtros.addRow([tipoOtroModificado, Number(valores)]);
                }
            }
        }
    }

    // Crear la hoja "seguros" 
    if (cliente.seguros && typeof cliente.seguros === 'object' && Object.keys(cliente.seguros).length > 0) {
        const seguros = workbook.addWorksheet('seguros');
        for (let tipoSeguro in cliente.seguros) {
            if (cliente.seguros.hasOwnProperty(tipoSeguro)) {
                let tipoSeguroModificado = tipoSeguro.replace(/[-_]/g, ' ');
                const valores = cliente.seguros[tipoSeguro];
                if (Array.isArray(valores)) {
                    valores.forEach((valor, index) => {
                        if (typeof valor === 'object') {
                            for (let key in valor) {
                                if (valor.hasOwnProperty(key)) {
                                    seguros.addRow([key.replace(/[-_]/g, ' '), Number(valor[key])]);
                                }
                            }
                        } else {
                            seguros.addRow([tipoSeguroModificado, Number(valor)]);
                        }
                    });
                } else if (typeof valores === 'object') {
                    for (let empresa in valores) {
                        if (valores.hasOwnProperty(empresa)) {
                            const clave = Object.keys(valores[empresa])[0].replace(/[-_]/g, ' ');
                            const valor = Object.values(valores[empresa])[0];
                            seguros.addRow([clave, Number(valor)]);
                        }
                    }
                } else if (typeof valores === 'string' || typeof valores === 'number') {
                    seguros.addRow([tipoSeguroModificado, Number(valores)]);
                }
            }
        }
    }

    // Crear la hoja "AnualidadesFijas"   
    if (cliente.AnualidadesFijas && typeof cliente.AnualidadesFijas === 'object' && Object.keys(cliente.AnualidadesFijas).length > 0) {
        const AnualidadesFijas = workbook.addWorksheet('Anualidades Fijas');
        
        for (let tipoAnualidad in cliente.AnualidadesFijas) {
            if (cliente.AnualidadesFijas.hasOwnProperty(tipoAnualidad)) {
                let tipoAnualidadModificado = tipoAnualidad.replace(/_/g, ' ');
    
                const valores = cliente.AnualidadesFijas[tipoAnualidad];
                
                if (Array.isArray(valores)) {
                    valores.forEach((valor) => {
                        if (typeof valor === 'object') {
                            for (let key in valor) {
                                if (valor.hasOwnProperty(key)) {
                                    AnualidadesFijas.addRow([key.replace(/_/g, ' '), Number(valor[key])]);
                                }
                            }
                        } else {
                            AnualidadesFijas.addRow([tipoAnualidadModificado, Number(valor)]);
                        }
                    });
                } else if (typeof valores === 'object') {
                    for (let empresa in valores) {
                        if (valores.hasOwnProperty(empresa)) {
                            const clave = Object.keys(valores[empresa])[0].replace(/_/g, ' ');
                            const valor = Object.values(valores[empresa])[0];
                            AnualidadesFijas.addRow([clave, Number(valor)]);
                        }
                    }
                } else if (typeof valores === 'string' || typeof valores === 'number') {
                    AnualidadesFijas.addRow([tipoAnualidadModificado, Number(valores)]);
                }
            }
        }
    }    

    // Crear la hoja "AnualidadesPresupuestadas"
    if (cliente.AnualidadesPresupuestadas && typeof cliente.AnualidadesPresupuestadas === 'object' && Object.keys(cliente.AnualidadesPresupuestadas).length > 0) {
        const AnualidadesPresupuestadas = workbook.addWorksheet('Anualidades Presupuestadas');
        
        for (let tipoAnualidad in cliente.AnualidadesPresupuestadas) {
            if (cliente.AnualidadesPresupuestadas.hasOwnProperty(tipoAnualidad)) {
                let tipoAnualidadModificado = tipoAnualidad.replace(/_/g, ' ');
    
                const valores = cliente.AnualidadesPresupuestadas[tipoAnualidad];
                
                if (Array.isArray(valores)) {
                    valores.forEach((valor) => {
                        if (typeof valor === 'object') {
                            for (let key in valor) {
                                if (valor.hasOwnProperty(key)) {
                                    AnualidadesPresupuestadas.addRow([key.replace(/_/g, ' '), Number(valor[key])]);
                                }
                            }
                        } else {
                            AnualidadesPresupuestadas.addRow([tipoAnualidadModificado, Number(valor)]);
                        }
                    });
                } else if (typeof valores === 'object') {
                    for (let empresa in valores) {
                        if (valores.hasOwnProperty(empresa)) {
                            const clave = Object.keys(valores[empresa])[0].replace(/_/g, ' ');
                            const valor = Object.values(valores[empresa])[0];
                            AnualidadesPresupuestadas.addRow([clave, Number(valor)]);
                        }
                    }
                } else if (typeof valores === 'string' || typeof valores === 'number') {
                    AnualidadesPresupuestadas.addRow([tipoAnualidadModificado, Number(valores)]);
                }
            }
        }
    } 

    // Crear la hoja "Impuestos"    
    if (cliente.Impuestos && typeof cliente.Impuestos === 'object' && Object.keys(cliente.Impuestos).length > 0) {
        const Impuestos = workbook.addWorksheet('Impuestos');
        for (let tipoImpuesto in cliente.Impuestos) {
            if (cliente.Impuestos.hasOwnProperty(tipoImpuesto)) {
                let tipoImpuestoModificado = tipoImpuesto.replace(/[-_]/g, ' ');
                const valores = cliente.Impuestos[tipoImpuesto];
                if (Array.isArray(valores)) {
                    valores.forEach((valor, index) => {
                        if (typeof valor === 'object') {
                            for (let key in valor) {
                                if (valor.hasOwnProperty(key)) {
                                    Impuestos.addRow([key.replace(/[-_]/g, ' '), Number(valor[key])]);
                                }
                            }
                        } else {
                            Impuestos.addRow([tipoImpuestoModificado, Number(valor)]);
                        }
                    });
                } else if (typeof valores === 'object') {
                    for (let empresa in valores) {
                        if (valores.hasOwnProperty(empresa)) {
                            const clave = Object.keys(valores[empresa])[0].replace(/[-_]/g, ' ');
                            const valor = Object.values(valores[empresa])[0];
                            Impuestos.addRow([clave, Number(valor)]);
                        }
                    }
                } else if (typeof valores === 'string' || typeof valores === 'number') {
                    Impuestos.addRow([tipoImpuestoModificado, Number(valores)]);
                }
            }
        }
    }

 

    // Crear la hoja "activo Liquidos"
    if (cliente.activoLiquidos && typeof cliente.activoLiquidos === 'object' && cliente.activoLiquidos !== null && Object.keys(cliente.activoLiquidos).length > 0) {
        const activoLiquidos = workbook.addWorksheet('activo Liquidos');
        const claves = Object.keys(cliente.activoLiquidos);
        const valores = Object.values(cliente.activoLiquidos);
        for (let i = 0; i < claves.length; i++) {
            const clave = claves[i];
            const valor = valores[i];     
            const clavePartes = clave.replace(/_/g, ' ').split('-');
            const numero = isNaN(Number(valor)) ? 0 : Number(valor);
            if(clavePartes[0] === "Otros"){
                activoLiquidos.addRow([clavePartes[1], clavePartes[0], numero]); 
            }else{
               activoLiquidos.addRow([clavePartes[0], clavePartes[1], numero]);   
            }
          
        }
    }

    // Crear la hoja "activosProductivos"
    console.log(cliente.activosProductivos)
    if (cliente.activosProductivos && typeof cliente.activosProductivos === 'object' && Object.keys(cliente.activosProductivos).length > 0) {
        const activosProductivos = workbook.addWorksheet('activos Productivos');
        const clave = Object.keys(cliente.activosProductivos);
        const valor = Object.values(cliente.activosProductivos);
        for (let Index in clave) {
            if (clave[Index].replace(/_/g, ' ').split('-')[0] === "Otros") {
                activosProductivos.addRow([
                    clave[Index].replace(/_/g, ' ').split('-')[1],
                    clave[Index].replace(/_/g, ' ').split('-')[0],
                    Number(valor[Index])
                ]);
            } else {
                activosProductivos.addRow([
                    clave[Index].replace(/_/g, ' ').split('-')[0],
                    clave[Index].replace(/_/g, ' ').split('-')[1],
                    Number(valor[Index])
                ]);
            }
                    }
    }

    // Crear la hoja "activosImproductivos"
    if (cliente.activosImproductivos && typeof cliente.activosImproductivos === 'object' && Object.keys(cliente.activosImproductivos).length > 0) {
        const activosImproductivos = workbook.addWorksheet('activos Improductivos');
        const claves = Object.keys(cliente.activosImproductivos);
        const valores = Object.values(cliente.activosImproductivos);
        for (let Index in claves) {
            const [antesDelGuion, despuesDelGuion] = claves[Index].replace(/_/g, ' ').split('-');
            if (antesDelGuion === "Otros") {
                activosImproductivos.addRow([despuesDelGuion, antesDelGuion, Number(valores[Index])]);
            } else {
                activosImproductivos.addRow([antesDelGuion, despuesDelGuion, Number(valores[Index])]);
            }
        }
    }
   
    const ordenCampos = [
        'pasivo', 
        'saldoCapital', 
        'entidad', 
        'tasa', 
        'cuotasPendientes', 
        'cuotaMensual'
    ];

    function reorderMap(map) {
        const reorderedMap = new Map();
        ordenCampos.forEach((key) => {
            if (map.has(key)) {
                reorderedMap.set(key, map.get(key));
            }
        });
        return reorderedMap;
    }

    // Crear la hoja "Deudas Corto Plazo"
    if (cliente.DeudasCortoPlazo && Array.isArray(cliente.DeudasCortoPlazo) && JSON.stringify(cliente.DeudasCortoPlazo[0]) != '{}') {
        const hojaDeudasCortoPlazo = workbook.addWorksheet('Deudas Corto Plazo');
        let columnNumber = 1;

        cliente.DeudasCortoPlazo.forEach((valores) => {        
            const reorderedMap = reorderMap(valores);
            reorderedMap.forEach((subcampoArray, subcampo) => {
                hojaDeudasCortoPlazo.getCell(1, columnNumber).value = subcampo;
                let rowNumber = 2;            
                if (subcampo.toLowerCase() === 'tasa') {
                    if (!Array.isArray(subcampoArray)) {
                        subcampoArray = [subcampoArray];
                    }
                    subcampoArray.forEach((valor) => {
                        const numericValue = isNaN(valor) ? valor : Number(valor) / 100;
                        hojaDeudasCortoPlazo.getCell(rowNumber, columnNumber).value = numericValue;
                        hojaDeudasCortoPlazo.getCell(rowNumber, columnNumber).numFmt = '0.00%';
                        rowNumber++;
                    });
                } else {
                    if (!Array.isArray(subcampoArray)) {
                        subcampoArray = [subcampoArray];
                    }

                    subcampoArray.forEach((valor) => {
                        const numericValue = isNaN(valor) ? valor : Number(valor);
                        hojaDeudasCortoPlazo.getCell(rowNumber, columnNumber).value = numericValue;
                        rowNumber++;
                    });
                }

                columnNumber++;
            });
        });
    }

    // Crear la hoja "Deudas Largo Plazo"
    if (cliente.DeudasLargoPlazo && Array.isArray(cliente.DeudasLargoPlazo) && JSON.stringify(cliente.DeudasLargoPlazo[0]) != '{}') {
        const hojaDeudasLargoPlazo = workbook.addWorksheet('Deudas Largo Plazo');
        let columnNumber = 1;

        cliente.DeudasLargoPlazo.forEach((valores) => {     
            const reorderedMap = reorderMap(valores);
            reorderedMap.forEach((subcampoArray, subcampo) => {
                hojaDeudasLargoPlazo.getCell(1, columnNumber).value = subcampo;
                let rowNumber = 2;            
                if (subcampo.toLowerCase() === 'tasa') {
                    if (!Array.isArray(subcampoArray)) {
                        subcampoArray = [subcampoArray];
                    }
                    subcampoArray.forEach((valor) => {
                        const numericValue = isNaN(valor) ? valor : Number(valor) / 100;
                        hojaDeudasLargoPlazo.getCell(rowNumber, columnNumber).value = numericValue;
                        hojaDeudasLargoPlazo.getCell(rowNumber, columnNumber).numFmt = '0.00%';
                        rowNumber++;
                    });
                } else {
                    if (!Array.isArray(subcampoArray)) {
                        subcampoArray = [subcampoArray];
                    }

                    subcampoArray.forEach((valor) => {
                        const numericValue = isNaN(valor) ? valor : Number(valor);
                        hojaDeudasLargoPlazo.getCell(rowNumber, columnNumber).value = numericValue;
                        rowNumber++;
                    });
                }

                columnNumber++;
            });
        });
    }


    // Crear la hoja "Objetivos"    
    if (cliente.objetivos && Array.isArray(cliente.objetivos) && cliente.objetivos.length > 0) {
        const hojaObjetivos = workbook.addWorksheet('Objetivos');
        let columnNumber = 1;
    
        cliente.objetivos.forEach((valores) => {
            // Identificar si "valores" es un Map o un objeto convencional
            const iterable = valores instanceof Map ? Array.from(valores.entries()) : Object.entries(valores);
    
            iterable.forEach(([subcampo, subcampoArray]) => {
                hojaObjetivos.getCell(1, columnNumber).value = subcampo; // Encabezado
    
                let rowNumber = 2;
                // Si subcampoArray es un solo valor, conviértelo a array
                const valuesArray = Array.isArray(subcampoArray) ? subcampoArray : [subcampoArray];
    
                valuesArray.forEach((valor) => {
                    const numericValue = isNaN(valor) ? valor : Number(valor);
                    hojaObjetivos.getCell(rowNumber, columnNumber).value = numericValue;
                    rowNumber++;
                });
                columnNumber++;
            });
        });
    }
    
    

    // Establecer los encabezados para la descarga
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Cliente_Axia.xlsx`);

    // Escribir el archivo Excel a la respuesta
    await workbook.xlsx.write(res);
    console.log('Archivo Excel generado con éxito');
};


module.exports = obtenerClientePorCedulaEnJSON;