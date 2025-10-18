const ExcelJS = require('exceljs');
const ClienteAxia = require('../models/ClienteAxia');

const exportarClientesExcel = async (req, res) => {
    try {        
        const clientes = await ClienteAxia.find({}, {
            fecha: 1,
            nombre: 1,
            apellidos: 1,
            cedula: 1,
            fechaNacimiento: 1,
            celular: 1,
            correoElectronico: 1,
            edad: 1,
            empresa: 1,
            seguridadsocial: 1,  
            ingresos: 1,      
            asesor:1,      
            _id: 0
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Clientes');
       
        worksheet.columns = [
            { header: 'Fecha', key: 'fecha', width: 15 },
            { header: 'Nombre', key: 'nombre', width: 20 },
            { header: 'Apellido', key: 'apellidos', width: 20 },
            { header: 'Cédula', key: 'cedula', width: 15 },
            { header: 'Fecha Nacimiento', key: 'fechaNacimiento', width: 15 },
            { header: 'Celular', key: 'celular', width: 15 },
            { header: 'Correo Electrónico', key: 'correoElectronico', width: 25 },
            { header: 'Edad', key: 'edad', width: 10 },
            { header: 'Empresa', key: 'empresa', width: 20 },
            { header: 'Fondo de pensiones', key: 'seguridadsocialAFP', width: 20 },
            { header: 'Ingresos Mensuales', key: 'ingresos', width: 20 },
            { header: 'Asesor', key: 'asesor', width: 20 },
        ];

        
        const formatCurrency = (amount) => {
            const formatter = new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                minimumFractionDigits: 0, 
                maximumFractionDigits: 0, 
            });
            return formatter.format(amount); 
        };

        
        clientes.forEach(cliente => {            
            const fondoPensiones = cliente.seguridadsocial && cliente.seguridadsocial.AFP ? cliente.seguridadsocial.AFP : '';
           
            let ingresosTotal = 0;
            
            if (cliente.ingresos && typeof cliente.ingresos === 'object' && Object.keys(cliente.ingresos).length > 0) {
                for (let tipoOtro in cliente.ingresos) {
                    if (cliente.ingresos.hasOwnProperty(tipoOtro)) {
                        const valores = cliente.ingresos[tipoOtro];
                       
                        if (Array.isArray(valores)) {
                            valores.forEach((valor) => {
                                if (typeof valor === 'object') {
                                   
                                    for (let key in valor) {
                                        if (valor.hasOwnProperty(key)) {
                                            ingresosTotal += parseFloat(valor[key]) || 0;
                                        }
                                    }
                                } else {
                                    ingresosTotal += parseFloat(valor) || 0;
                                }
                            });
                        } else if (typeof valores === 'object') {
                        
                            for (let key in valores) {
                                ingresosTotal += parseFloat(valores[key]) || 0;
                            }
                        } else {                            
                            ingresosTotal += parseFloat(valores) || 0;
                        }
                    }
                }
            }
          

            worksheet.addRow({
                fecha: cliente.fecha ? cliente.fecha.toISOString().split('T')[0] : '',
                nombre: cliente.nombre || '',
                apellidos: cliente.apellidos || '',
                cedula: cliente.cedula || '',
                fechaNacimiento: cliente.fechaNacimiento ? cliente.fechaNacimiento.toISOString().split('T')[0] : '',
                celular: cliente.celular || '',
                correoElectronico: cliente.correoElectronico || '',
                edad: cliente.edad || '',
                empresa: cliente.empresa || '',
                seguridadsocialAFP: fondoPensiones,
                ingresos: formatCurrency(ingresosTotal)|| '',
                asesor: cliente.asesor || '',
            });
        });


        // Escribir el archivo en memoria
        const buffer = await workbook.xlsx.writeBuffer();

        // Configurar encabezados para la descarga del archivo Excel
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=clientesAxia.xlsx');

        // Enviar el archivo como respuesta
        res.send(buffer);

    } catch (error) {
        console.error('Error al generar el archivo Excel:', error);
        res.status(500).json({ error: 'Error al generar el archivo Excel' });
    }
};

module.exports = exportarClientesExcel;
