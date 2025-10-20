const PDFDocument = require('pdfkit');

const fs = require('fs');
const echarts = require('echarts');
const path = require('path');
const nodemailer = require('nodemailer');

const {
    createCanvas,
    registerFont
} = require('canvas');




const ChartDataLabels = require('chartjs-plugin-datalabels');
const {
    Chart,
    registerables
} = require('chart.js');
Chart.register(...registerables);
const MiniPlan = require('../models/ApiMiniPLan');


const robotoRegularPath = path.join(__dirname, '..', 'fonts', 'Roboto-Regular.ttf');
const robotoBoldPath = path.join(__dirname, '..', 'fonts', 'Roboto-Bold.ttf');
const robotoItalicPath = path.join(__dirname, '..', 'fonts', 'Roboto-Italic.ttf');
const robotoBoldItalicPath = path.join(__dirname, '..', 'fonts', 'Roboto-BoldItalic.ttf');

registerFont(robotoRegularPath, {
    family: 'Roboto'
});



const normalizarSegunEsquema = (data, schema) => {
    if (!schema || !schema.paths) {
        throw new Error('El esquema no está definido o no tiene paths');
    }



    const result = {};
    for (const key in schema.paths) {
        if (key === '_id' || key === '__v') continue;
        const tipo = schema.paths[key].instance;
        let valor = data[key];

        if (valor === undefined || valor === null || valor === '') {
            if (tipo === 'Number') valor = 0;
            else if (tipo === 'Boolean') valor = false;
            else valor = '';
        } else {
            switch (tipo) {
                case 'Number':
                    valor = parseFloat(valor);
                    if (isNaN(valor)) valor = 0;
                    break;
                case 'Boolean':
                    if (typeof valor === 'string') {
                        const valStr = valor.toLowerCase().trim();
                        valor = ['true', 'sí', 'si', 'yes'].includes(valStr);
                    } else {
                        valor = Boolean(valor);
                    }
                    break;
                case 'String':
                    valor = String(valor);
                    break;
            }
        }

        result[key] = valor;
    }
    return result;
};

const procesarMiniPlan = async (req, res) => {

    const Blue = "#203d5c";
    try {
        const datos = req.body;

        if (
            !datos ||
            Object.keys(datos).length === 0 ||
            Object.values(datos).every(v => v === '' || v === null || v === undefined)
        ) {
            return res.status(400).json({
                error: 'Por favor, complete el formulario antes de enviarlo.'
            });
        }

        //comentar en pruebas 
        const datosNormalizados = normalizarSegunEsquema(datos, MiniPlan.schema);
        const nuevoMiniPlan = new MiniPlan(datosNormalizados);
        await nuevoMiniPlan.save();
        const datosPlan = nuevoMiniPlan.toObject();

        // const datosPlan = normalizarSegunEsquema(datos, MiniPlan.schema);

        const gastosMensuales =
            (datosPlan.gastosHogar || 0) +
            (datosPlan.totalDeudasMensuales || 0) +
            (datosPlan.transporte || 0) +
            (datosPlan.cuidadoPersonal || 0) +
            (datosPlan.comidaOficina || 0) +
            (datosPlan.entretenimiento || 0) +
            (datosPlan.segurosMensuales || 0) +
            (datosPlan.ahorroMensual || 0) +
            (datosPlan.cursos || 0) +
            (datosPlan.hijos || 0) +
            (datosPlan.otrosGastosMensuales || 0);

        const formulaLibertad = (gastosMensuales * 12) / 0.06;
        
        const doc = new PDFDocument({
            margin: 0,
            size: 'A4'
        });


        doc.registerFont('Roboto', robotoRegularPath);
        doc.registerFont('Roboto-Bold', robotoBoldPath);
        doc.registerFont('Roboto-Italic', robotoItalicPath);
        doc.registerFont('Roboto-BoldItalic', robotoBoldItalicPath);

        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', async () => {
            const pdfData = Buffer.concat(buffers);
        
          
        
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'inline; filename="pagina1.pdf"',
                'Content-Length': pdfData.length,
            });
            res.send(pdfData);
        });

        // doc.end();
        

        const fondoPath = path.join(__dirname, 'assets', 'Axia_PPT.png');
        if (fs.existsSync(fondoPath)) {
            doc.image(fondoPath, 0, 0, {
                fit: [doc.page.width, doc.page.height]
            });
        }


        const DEBUG_GRID = false;
        if (DEBUG_GRID) {
            doc.lineWidth(0.5).fontSize(6).fillColor('gray');
            const pageWidth = doc.page.width;
            const pageHeight = doc.page.height;

            const STEP = 10;
            for (let x = 0; x <= pageWidth; x += STEP) {
                doc.moveTo(x, 0).lineTo(x, pageHeight).strokeColor('#e0e0e0').stroke();
                if (x % 50 === 0) doc.text(x, x + 2, 10);
            }
            for (let y = 0; y <= pageHeight; y += STEP) {
                doc.moveTo(0, y).lineTo(pageWidth, y).strokeColor('#e0e0e0').stroke();
                if (y % 50 === 0) doc.text(y, 2, y + 2);
            }
        }

        const DEBUG_AREAS = false;

        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;

        const LEFT = {
            x: 0,
            y: 400,
            width: pageWidth / 2,
            height: 200
        };
        const RIGHT = {
            x: pageWidth / 2,
            y: 400,
            width: pageWidth / 2,
            height: 200
        };

        if (DEBUG_AREAS) {
            doc.rect(LEFT.x, LEFT.y, LEFT.width, LEFT.height).stroke('red');
            doc.rect(RIGHT.x, RIGHT.y, RIGHT.width, RIGHT.height).stroke('blue');
        }

        const titulo = 'Objetivos de vida';
        doc.font('Roboto-Bold').fontSize(20).fillColor(Blue);
        const tituloW = doc.widthOfString(titulo);
        const tituloH = doc.currentLineHeight();
        const tituloX = LEFT.x + (LEFT.width - tituloW) / 2;
        const tituloY = LEFT.y + (LEFT.height - tituloH) / 2;
        doc.text(titulo, tituloX, tituloY);

        doc.font('Roboto').fontSize(12).fillColor('black');

        const lista = datosPlan.objetivos || [];
        const lineHeight = 18;
        const totalAlturaLista = lista.length * lineHeight;
        let startY = RIGHT.y + (RIGHT.height - totalAlturaLista) / 2;

        lista.forEach((obj) => {
            doc.text(`• ${obj}`, RIGHT.x + 20, startY, {
                width: RIGHT.width - 50
            });
            startY += lineHeight;
        });



        const label = 'Proyección de retiro';
        const labelFontSize = 30;

        const boxX = 0;
        const boxY = 590;
        const boxHeight = 40;

        doc.font('Roboto-Bold').fontSize(labelFontSize);

        doc.rect(boxX, boxY, doc.page.width, boxHeight).fill(Blue);

        doc.fillColor('white')
            .text(label, boxX, boxY + (boxHeight - doc.currentLineHeight()) / 2, {
                width: doc.page.width,
                align: 'center'
            });


        const label3 = 'Fórmula de la libertad financiera';
        const label3FontSize = 20;
        const box3X = 130;
        const box3Y = 660;
        const box3PaddingX = 12;
        const box3PaddingY = 6;

        doc.font('Roboto-Bold').fontSize(label3FontSize);
        const text3Width = doc.widthOfString(label3);
        const text3Height = doc.currentLineHeight();

        doc.font('Roboto-Bold')
            .fontSize(label3FontSize)
            .fillColor(Blue)
            .text(label3, box3X + box3PaddingX, box3Y + box3PaddingY);


        doc.fontSize(20).fillColor('black');


        doc.text(`(Gastos totales mensuales * 12) / 6% = Valor`, 100, 720, {
            width: 450
        });

        doc.text(
            `(${gastosMensuales.toLocaleString('es-CO')} * 12) / 6% = ${formulaLibertad.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  })}`,
            100,
            760, {
                width: 400
            }
        );



        // PAGINA 2 
        doc.addPage();


        if (DEBUG_GRID) {
            doc.lineWidth(0.5).fontSize(6).fillColor('gray');
            const pageWidth = doc.page.width;
            const pageHeight = doc.page.height;

            const STEP = 10;
            for (let x = 0; x <= pageWidth; x += STEP) {
                doc.moveTo(x, 0).lineTo(x, pageHeight).strokeColor('#e0e0e0').stroke();
                if (x % 50 === 0) doc.text(x, x + 2, 10);
            }
            for (let y = 0; y <= pageHeight; y += STEP) {
                doc.moveTo(0, y).lineTo(pageWidth, y).strokeColor('#e0e0e0').stroke();
                if (y % 50 === 0) doc.text(y, 2, y + 2);
            }
        }

        const monto = formulaLibertad.toLocaleString('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0,
        });

        const mensaje = `Este es el total del monto (${monto}) que deberías ahorrar para lograr tu libertad financiera.\n
Ánimo, tal vez la meta sea alta, pero sabemos que armando un portafolio de inversiones ganador lo lograrás.`;



        doc.font('Roboto')
            .fontSize(12)
            .fillColor('black')
            .text(mensaje, 50, 50, {
                width: 500,
                align: 'left'
            });


        doc.font('Roboto-Bold')
            .fontSize(10)
            .fillColor('white');

        const baseX = 50;
        const baseY = 130;
        const tableWidth = 200;
        const col1 = baseX + 150;
        const col2 = baseX + tableWidth - 10;


        const ingresoNeto = datosPlan.ingresoNetoMensual || 0;


//comentario 

        const gastos = [{
                label: 'Transporte',
                value: datosPlan.transporte
            },
            {
                label: 'Gastos Personales',
                value: datosPlan.cuidadoPersonal + datosPlan.comidaOficina
            },
            {
                label: 'Hogar',
                value: datosPlan.gastosHogar
            },
            {
                label: 'Entretenimiento',
                value: datosPlan.entretenimiento
            },
            {
                label: 'Protecciones Personales',
                value: datosPlan.segurosMensuales
            },
            {
                label: 'Educación o gastos hijos',
                value: datosPlan.hijos
            },
             {
                label: 'Ahorro',
                value: datosPlan.ahorroMensual
            },
            {
                label: 'Servicio a la deuda',
                value: datosPlan.totalDeudasMensuales
            },
            {
                label: 'Otros',
                value: datosPlan.otrosGastosMensuales + datosPlan.cursos
            }
        ];

        let totalGastos = 0;

        gastos.forEach(g => {
            const value = g.value || 0;
            totalGastos += value;
        });

        const ratioDeudaIngresos = ingresoNeto > 0 ? datosPlan.totalDeudasMensuales / ingresoNeto : 0;

        let comentario = "";

        if (ratioDeudaIngresos === 0) {
            comentario = `No cuentas con endeudamiento, lo cual es favorable, ten presente invertir para lograr tus objetivos.`;
        } else if (ratioDeudaIngresos <= 0.3) {
            comentario = `Cuentas con un porcentaje bajo de endeudamiento, lo cual es aceptable.`;
        } else {
            comentario = `Cuentas con un porcentaje alto de endeudamiento, vale la pena que revises cómo bajar el porcentaje que estás destinando a tus deudas. No obstante, revisa otros indicadores como el endeudamiento en el patrimonio. Ten presente que las deudas buenas corresponden a un análisis diferente, ya que estás poniendo dinero en tu bolsillo después de haberte endeudado.`;
        }


        doc.fillColor('white').fontSize(10);

        doc.rect(baseX + 1, baseY + 38, 600, 290).fill("white");

        const cuadroAncho = 280;
        const basePosX = baseX + 271;
        const basePosY = baseY + 49;



        let padding = 20;

        doc.save()


            .fillColor(Blue)
            .rect(
                basePosX,
                basePosY,
                cuadroAncho,
                doc.fontSize(15).heightOfString(comentario, {
                    width: cuadroAncho - padding * 2
                }) + padding * 2
            )
            .fill()

            .strokeColor('gray')
            .lineWidth(1)
            .rect(
                basePosX,
                basePosY,
                cuadroAncho,
                doc.fontSize(15).heightOfString(comentario, {
                    width: cuadroAncho - padding * 2
                }) + padding * 2
            )
            .stroke()

            .restore();

        doc
            .fillColor('white')
            .fontSize(15)
            .text(comentario, basePosX + padding, basePosY + padding, {
                width: cuadroAncho - padding * 2,
            });




        let currentY = baseY + 10;
        const rectWidth = tableWidth + 20;
        const rectHeight = 25;
        const text = 'Presupuesto:';

        doc.rect(baseX, currentY, rectWidth, rectHeight).fill(Blue);
        doc.fillColor('white');

        doc.font('Roboto-Bold').fontSize(14).text(
            text,
            baseX,
            currentY + (rectHeight / 2) - 7, {
                width: rectWidth,
                align: 'center'
            }
        );


        currentY += 40;

        doc.fontSize(10).fillColor('#333333');

        doc.font('Roboto-Bold').fillColor("black").text('INGRESOS', baseX + 5, currentY + 4);

        let rowHeight = 18;
        doc.font('Roboto-Bold').fillColor("black").text('Ingresos mensuales', col1 + 20, currentY + 4);


        doc.lineWidth(0.8);
        doc.strokeColor('#cccccc');
        doc.rect(baseX, currentY - 2, col2 - baseX + 80, rowHeight).stroke();



        currentY += rowHeight;
        doc.font('Roboto-Bold').fillColor("black").text('TOTAL INGRESOS MENSUALES', baseX + 5, currentY + 5);
        doc.fillColor(ingresoNeto >= 0 ? 'green' : 'red').text(
            ingresoNeto.toLocaleString('es-CO', {
                style: 'currency',
                currency: 'COP',
                maximumFractionDigits: 0
            }),
            col2, currentY + 5
        );

        doc.rect(baseX, currentY - 2, col2 - baseX + 80, rowHeight).stroke();

        currentY += 40;
        doc.font('Roboto-Bold').fillColor("black").text('GASTOS', baseX + 5, currentY);
        currentY += rowHeight;



        gastos.forEach(g => {
            const value = g.value || 0;

            doc.font('Roboto').fillColor("black").text(`${g.label}:`, baseX + 5, currentY + 3);
            doc.fillColor('#000000').text(
                value.toLocaleString('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                    maximumFractionDigits: 0
                }),
                col2, currentY + 5
            );

            doc.strokeColor('#e0e0e0').rect(baseX, currentY - 2, col2 - baseX + 80, rowHeight).stroke();


            currentY += rowHeight;
        });

        doc.font('Roboto-Bold').fillColor("black").text('TOTAL GASTOS', baseX + 5, currentY + 5);
        doc.fillColor('#000000').text(
            totalGastos.toLocaleString('es-CO', {
                style: 'currency',
                currency: 'COP',
                maximumFractionDigits: 0
            }),
            col2, currentY + 5
        );
        doc.strokeColor('#cccccc').rect(baseX, currentY - 2, col2 - baseX + 80, rowHeight).stroke();

        currentY += 30;

        doc.rect(baseX + 1, currentY, tableWidth + 69, 20).fill('#ff9900');
        doc.font('Roboto-Bold').fillColor("black").text('INGRESOS - GASTOS:', baseX + 5, currentY + 5);
        doc.fillColor('#000000')
            .font('Roboto-Bold')
            .text(
                ` ${(ingresoNeto - totalGastos).toLocaleString('es-CO',{style:'currency',currency:'COP', maximumFractionDigits: 0})}`,
                col2,
                currentY + 5
            );


        const baseX2 = 50;
        const baseY2 = 500;
        const tableWidth2 = 250;
        const col1_2 = baseX2 + 150;
        const col2_2 = baseX2 + tableWidth2 - 10;
        const color = "#b88b4d";

        let currentY2 = baseY2;
        const rectWidth2 = tableWidth2 + 20;
        const rectHeight2 = 25;
        const text2 = 'Distribución de gastos mensuales';

        doc.rect(baseX2, currentY2, rectWidth2, rectHeight2).fill(color);

        doc.font('Roboto-Bold').fontSize(14).fillColor('white').text(
            text2,
            baseX2,
            currentY2 + (rectHeight2 / 2) - 7, {
                width: rectWidth2,
                align: 'center'
            }
        );

        doc.fontSize(10);

        const total = gastos.reduce((acc, item) => acc + item.value, 0);

        const colors = [
            '#4a90e2',
            '#50e3c2',
            '#f5a623',
            '#d0021b',
            '#8b572a',
            '#9b9b9b',
            '#7ed321',
            '#f8e71c',
            '#f749d1',
        ];



        const usedColors = colors.slice(0, gastos.length);

        const canvas = createCanvas(600, 600);
        const ctx = canvas.getContext('2d');

        const filteredData = gastos.filter(gasto => gasto.value > 0);

        const data = filteredData.map(gasto => ({
            name: gasto.label,
            value: gasto.value
        }));

        const option = {
            textStyle: {
                fontFamily: 'Roboto',
            },
            tooltip: {
                trigger: 'item',
                formatter: (params) => {
                    const percentage = (params.value / total) * 100;
                    return `${params.name}: ${params.value} (${percentage.toFixed(2)}%)`;
                },
                textStyle: {
                    fontFamily: 'Roboto',
                },
            },
            legend: {
                orient: 'horizontal',
                left: 'center',
                top: '00%',
                textStyle: {
                    fontFamily: 'Roboto',
                    fontSize: 20,
                    color: '#555'
                },
                data: filteredData.map(gasto => gasto.label)
            },
            series: [{
                name: 'Ingresos',
                type: 'pie',
                radius: '50%',
                label: {
                    show: true,
                    position: 'outside',
                    formatter: (params) => {
                        const percentage = (params.value / total) * 100;
                        return `${percentage.toFixed(2)}%`;
                    },
                    color: '#000',
                    fontSize: 20,
                    fontFamily: 'Roboto',
                },
                labelLine: {
                    show: true,
                    length: 20,
                    length2: 10
                },
                data: data,
                emphasis: {
                    label: {
                        show: true,
                        fontFamily: 'Roboto',
                        fontSize: '20',
                        fontWeight: 'bold',
                    }
                },
                itemStyle: {
                    borderRadius: 0,
                    borderColor: '#fff',
                    borderWidth: 1
                }
            }]
        };

        const myChart = echarts.init(canvas);
        myChart.setOption(option);

        const buffer = canvas.toBuffer('image/png');

        doc.image(buffer, baseX2 - baseX2 + 40, baseY2 + 40, {
            fit: [280, 280],
            align: 'center',
            valign: 'center',
        });




        const cuadroAncho2 = 280;
        const cuadroAlto2 = 290;
        const basePosX2 = baseX2 + 271;
        const basePosY2 = baseY2 + 39;


        const topGastos = gastos
            .filter(g => g.value > 0)
            .sort((a, b) => b.value - a.value)
            .slice(0, 3);


        const descripciones = topGastos.map(g => {
            const porcentaje = total > 0 ? ((g.value / total) * 100).toFixed(2) : 0;
            return `${g.label.toLowerCase()} con un ${porcentaje}%`;
        });


        let textoGastos = '';
        if (descripciones.length === 1) {
            textoGastos = descripciones[0];
        } else if (descripciones.length === 2) {
            textoGastos = `${descripciones[0]} y ${descripciones[1]}`;
        } else {
            textoGastos = `${descripciones[0]}, ${descripciones[1]} y ${descripciones[2]}`;
        }

        const comentarioFinal = `Los gastos que más influyen en tu presupuesto mensual son: ${textoGastos}.` +
            (datosPlan.ahorroMensual === 0 ?
                `\nNo se cuenta con un ahorro recurrente y esto puede llevar a endeudamiento y falta de liquidez.` :
                "");



        padding = 20;
        const textHeight3 = doc.font('Roboto-Bold').fontSize(15).heightOfString(comentarioFinal, {
            width: cuadroAncho2 - padding * 2,
            align: 'left',
        });

        doc
            .save()
            .fillColor(color)
            .rect(basePosX2, basePosY2, cuadroAncho2, textHeight3 + padding * 2)
            .fill()
            .strokeColor('#9f9f9f')
            .lineWidth(1)
            .rect(basePosX2, basePosY2, cuadroAncho2, textHeight3 + padding * 2)
            .stroke()
            .restore()
            .font('Roboto-Bold')
            .fontSize(15)
            .fillColor('white')
            .text(comentarioFinal, basePosX2 + padding, basePosY2 + padding, {
                width: cuadroAncho2 - padding * 2,
                align: 'left',
            });




        // PAGINA 3 
        doc.addPage();


        if (DEBUG_GRID) {
            doc.lineWidth(0.5).fontSize(6).fillColor('gray');
            const pageWidth = doc.page.width;
            const pageHeight = doc.page.height;

            const STEP = 10;
            for (let x = 0; x <= pageWidth; x += STEP) {
                doc.moveTo(x, 0).lineTo(x, pageHeight).strokeColor('#e0e0e0').stroke();
                if (x % 50 === 0) doc.text(x, x + 2, 10);
            }
            for (let y = 0; y <= pageHeight; y += STEP) {
                doc.moveTo(0, y).lineTo(pageWidth, y).strokeColor('#e0e0e0').stroke();
                if (y % 50 === 0) doc.text(y, 2, y + 2);
            }
        }

        const ingresosBaseX = 280;
        const ingresosBaseY = 30;
        const ingresosTableWidth = 300;
        const alto = 18;
        const ingresosColLabel = ingresosBaseX + 10;
        const ingresosColValue = ingresosBaseX + ingresosTableWidth - 10;


        const ingresosAnuales = (datosPlan.primaAnual || 0) + (datosPlan.bonificacionesAnuales || 0);
        const segurosVal = (datosPlan.segurosAnuales || 0);
        const anualidadesVal = (datosPlan.anualidadesVariables || 0);
        const impuestosVal = (datosPlan.impuestos || 0);

        const totalAnualidades = segurosVal + anualidadesVal + impuestosVal + (datosPlan.anualidadesFijas || 0);
        const diferenciaIngresos = ingresosAnuales - totalAnualidades;

        const provisionMensual = diferenciaIngresos < 0 ?
            diferenciaIngresos / 12 :
            0;



        function formatCurrency(value) {
            if (value < 0) {
                return `(${Math.abs(value).toLocaleString('es-CO')})`;
            }
            return value.toLocaleString('es-CO');
        }

        doc.fillColor(Blue).font('Roboto-Bold').fontSize(25).text('Ingresos anuales', ingresosBaseX - 230, ingresosBaseY + 140);

        doc.font('Roboto-Bold')
            .fontSize(8)
            .fillColor('white');


        let y = ingresosBaseY;
        doc.rect(ingresosBaseX, y, ingresosTableWidth, alto).fill(Blue).stroke();
        doc.fillColor('white').font('Roboto-Bold').text('INGRESOS', ingresosColLabel, y + 7);
        doc.text('Ingresos Anuales', ingresosColValue - 120, y + 7, {
            width: 110,
            align: 'right'
        });
        y += alto;


        doc.rect(ingresosBaseX, y, ingresosTableWidth, alto).fill(Blue).stroke();
        doc.fillColor('white').font('Roboto-Bold').text('TOTAL INGRESOS ANUALES', ingresosColLabel, y + 7);
        doc.text(`$ ${formatCurrency(ingresosAnuales)}`, ingresosColValue - 120, y + 7, {
            width: 110,
            align: 'right'
        });
        y += alto;


        doc.rect(ingresosBaseX, y, ingresosTableWidth, alto).fill(Blue).stroke();
        doc.fillColor('white').font('Roboto-Bold').text('EGRESOS ANUALES', ingresosColLabel, y + 7);
        doc.text('Ingresos Anuales', ingresosColValue - 120, y + 7, {
            width: 110,
            align: 'right'
        });
        y += alto;


        doc.rect(ingresosBaseX, y, ingresosTableWidth, alto).fill('white').stroke();
        doc.fillColor('black').font('Roboto').text('Seguros', ingresosColLabel, y + 7);
        doc.text(`$ ${formatCurrency(segurosVal)}`, ingresosColValue - 120, y + 7, {
            width: 110,
            align: 'right'
        });
        y += alto;


        doc.rect(ingresosBaseX, y, ingresosTableWidth, alto).fill('white').stroke();
        doc.fillColor('black').text('Anualidades Presupuestadas', ingresosColLabel, y + 7);
        doc.text(`$ ${formatCurrency(anualidadesVal)}`, ingresosColValue - 120, y + 7, {
            width: 110,
            align: 'right'
        });
        y += alto;

        doc.rect(ingresosBaseX, y, ingresosTableWidth, alto).fill('white').stroke();
        doc.fillColor('black').font('Roboto').text('Anualidades Fijas', ingresosColLabel, y + 7);
        doc.text(`$ ${formatCurrency(datosPlan.anualidadesFijas)}`, ingresosColValue - 120, y + 7, {
            width: 110,
            align: 'right'
        });
        y += alto;


        doc.rect(ingresosBaseX, y, ingresosTableWidth, alto).fill('white').stroke();
        doc.fillColor('black').text('Impuestos', ingresosColLabel, y + 7);
        doc.text(impuestosVal > 0 ? `$ ${formatCurrency(impuestosVal)}` : '-', ingresosColValue - 120, y + 7, {
            width: 110,
            align: 'right'
        });
        y += alto;


        doc.rect(ingresosBaseX, y, ingresosTableWidth, alto).fill(Blue).stroke();
        doc.fillColor('white').font('Roboto-Bold').text('TOTAL ANUALIDADES', ingresosColLabel, y + 7);
        doc.text(`$ ${formatCurrency(totalAnualidades)}`, ingresosColValue - 120, y + 7, {
            width: 110,
            align: 'right'
        });
        y += alto;


        doc.rect(ingresosBaseX, y, ingresosTableWidth, alto).fill(Blue).stroke();
        doc.fillColor('white').font('Roboto-Bold').text('INGRESOS ANUALES - TOTAL ANUALIDADES', ingresosColLabel, y + 7);
        doc.fillColor(diferenciaIngresos < 0 ? 'red' : 'white')
            .text(`$ ${formatCurrency(diferenciaIngresos)}`, ingresosColValue - 120, y + 7, {
                width: 110,
                align: 'right'
            });
        y += alto;


        doc.rect(ingresosBaseX, y, ingresosTableWidth, alto).fill(Blue).stroke();
        doc.fillColor('white').font('Roboto-Bold').text('PROVISIÓN MENSUAL', ingresosColLabel, y + 7);
        doc.fillColor(provisionMensual < 0 ? 'red' : 'white')
            .text(`$ ${formatCurrency(provisionMensual)}`, ingresosColValue - 120, y + 7, {
                width: 110,
                align: 'right'
            });



        doc.rect(0, y + 30, 450, 150)
            .lineWidth(1)
            .stroke(Blue);

        doc.fillColor('black')
            .font('Roboto')
            .fontSize(13)
            .text(
                'Recuerda revisar si tus ingresos anuales cubren tus gastos anuales. Si esto no sucede, vale la pena que provisiones estos gastos, ya que caes en el riesgo de tomar deudas para cubrirlos.',
                20,
                y + 40, {
                    width: 410
                }
            );

        if (ingresosAnuales > 0) {
            doc.text(
                '\nEstos ingresos podrían ser utilizados para provisionar tus extra a lo largo del año como impuestos, viajes, compras de Diciembre, entre otros, por esto, te recomiendo tener presente estos gastos y ahorrar este monto.', {
                    width: 410
                }
            );
        } else {
            doc.text(
                '\nTeniendo presente que no se reciben ingresos anuales como bonos o primas, vale la pena que provisiones tus extra a lo largo del año.', {
                    width: 410
                }
            );
        }




        doc.fillColor(Blue).font('Roboto-Bold').fontSize(25).text('Gastos anuales', ingresosBaseX + 90, ingresosBaseY + 350);

        doc.rect(ingresosBaseX - 120, y + 240, 450, 130)
            .fill(Blue)
            .lineWidth(1);

        doc.fillColor('white')
            .font('Roboto')
            .fontSize(13)
            .text(
                `Es importante provisionar tus gastos anuales para evitar
endeudamientos a corto plazo y vernos forzados a salir
de activos productivos por falta de liquidez en el
transcurso del año.`,
                ingresosBaseX - 100,
                y + 270, {
                    width: 410
                }
            );


        doc.rect(0, y + 400, 650, 40).fill(color).stroke();
        doc.fillColor('white')
            .font('Roboto-Bold')
            .fontSize(20)
            .text('Distribución de gastos anuales', ingresosBaseX - 150, y + 410);


        const egresosData = [{
                label: 'Seguros',
                value: segurosVal
            },
            {
                label: 'Anualidades Presupuestadas',
                value: anualidadesVal
            },
            {
                label: 'Anualidades Fijas',
                value: datosPlan.anualidadesFijas
            },
            {
                label: 'Impuestos',
                value: impuestosVal
            }
        ];

        const filteredLabels = egresosData.map(item => item.label);
        const filteredValues = egresosData.map(item => item.value);

        const legendColors = colors;

        const filteredColors = filteredValues.map((val, i) =>
            val === 0 ? '#eeeeee00' : colors[i]
        );

        const total2 = filteredValues.reduce((sum, val) => sum + val, 0);

        const canvas3 = createCanvas(600, 600);
        const ctx3 = canvas3.getContext('2d');

        const data3 = filteredLabels.map((label, i) => ({
            name: label,
            value: filteredValues[i],
            itemStyle: {
                color: filteredColors[i]
            }
        }));

        const option3 = {
            tooltip: {
                trigger: 'item',
                formatter: (params) => {
                    const percentage = total2 ? ((params.value / total2) * 100).toFixed(2) : '0.00';
                    return `${params.name}: $${params.value} (${percentage}%)`;
                }
            },
            legend: {
                orient: 'horizontal',
                left: 'center',
                top: '10%',
                textStyle: {
                    color: 'gray',
                    fontSize: 20,
                    fontFamily: 'Roboto',
                    fontWeight: 'normal',
                },
                itemWidth: 20,
                itemHeight: 15,
                itemGap: 10,
                data: filteredLabels.map((label, i) => ({
                    name: label,
                    textStyle: {
                        fontSize: 20,
                        color: '#555',
                        fontFamily: 'Roboto',
                    },
                }))
            },
            series: [{
                name: 'Ingresos',
                type: 'pie',
                radius: '50%',
                label: {
                    show: true,
                    formatter: (params) => {
                        const percent = total2 ? (params.value / total2) * 100 : 0;
                        if (percent === 0) return '';
                        if (Math.round(percent) === 100) return '100%';
                        return percent.toFixed(2) + '%';
                    },
                    color: 'black',
                    fontSize: 20,
                    fontWeight: 'normal',
                    position: 'outside',
                    fontFamily: 'Roboto',
                },
                labelLine: {
                    show: true,
                    length: 20,
                    length2: 10
                },
                data: data3,
                emphasis: {
                    label: {
                        show: true,
                        fontSize: '20',
                        fontWeight: 'bold',
                        fontFamily: 'Roboto',
                    }
                },
                itemStyle: {
                    borderRadius: 0,
                    borderColor: '#fff',
                    borderWidth: 0
                }
            }]
        };

        const myChart3 = echarts.init(canvas3);
        myChart3.setOption(option3);

        const buffer3 = canvas3.toBuffer('image/png');

        doc.image(buffer3, ingresosBaseX - ingresosBaseX + 20, y + 430, {
            fit: [250, 250],
            align: 'center',
            valign: 'center',
        });


        const mayorEgreso = egresosData.reduce((max, item) => item.value > max.value ? item : max, egresosData[0]);


        doc
            .save()
            .moveTo(ingresosBaseX, y + 470)
            .lineTo(ingresosBaseX, y + 450 + 130)
            .strokeColor('black')
            .lineWidth(1)
            .stroke()
            .restore()
            .font('Roboto')
            .fontSize(12)
            .fillColor('black')
            .text(
                `El gasto anual que genera un mayor impacto es el de ${mayorEgreso.label.toLowerCase()} y puedes verte en problemas si no tienes un plan para el pago de estas.`,
                ingresosBaseX + 10,
                y + 450 + 40, {
                    width: 280,
                    align: 'justify'
                }
            );




        // PAGINA 4 
        doc.addPage();


        if (DEBUG_GRID) {
            doc.lineWidth(0.5).fontSize(6).fillColor('black');
            const pageWidth = doc.page.width;
            const pageHeight = doc.page.height;

            const STEP = 10;
            for (let x = 0; x <= pageWidth; x += STEP) {
                doc.moveTo(x, 0).lineTo(x, pageHeight).strokeColor('#e0e0e0').stroke();
                if (x % 50 === 0) doc.text(x, x + 2, 10);
            }
            for (let y = 0; y <= pageHeight; y += STEP) {
                doc.moveTo(0, y).lineTo(pageWidth, y).strokeColor('#e0e0e0').stroke();
                if (y % 50 === 0) doc.text(y, 2, y + 2);
            }
        }

        const activosLiquidos = +(datosPlan.ahorroMensual || 0) +
            +(datosPlan.primaAnual || 0) +
            +(datosPlan.bonificacionesAnuales || 0);

        const activosProductivos = +(datosPlan.anualidadesFijas || 0) +
            +(datosPlan.anualidadesVariables || 0) +
            +(datosPlan.segurosAnuales || 0);

        const activosImproductivos = +(datosPlan.patrimonio || 0);

        const totalActivos = activosLiquidos + activosProductivos + activosImproductivos;

        const pasivos = +(datosPlan.deuda || 0) +
            +(datosPlan.totalDeudasMensuales || 0);

        const totalPatrimonio = totalActivos - pasivos;

        const relacionPasivosActivos = totalActivos > 0 ?
            ((pasivos / totalActivos) * 100).toFixed(0) + "%" :
            "0%";


        const baseX4 = 150;
        let currentY4 = 50;
        const tableWidth4 = 300;
        const rowHeight4 = 50;
        const Ptexto = 160;
        const fontSize = 15;

        const verticalPadding = (rowHeight4 - fontSize) / 2;
        const textY = currentY4 + verticalPadding;

        doc.rect(baseX4, currentY4, tableWidth4, rowHeight4).fill('#F9D570');

        doc.fillColor('black')
            .font('Roboto-Bold')
            .fontSize(fontSize)
            .text('RELACION PASIVOS / ACTIVOS', baseX4 + 10, textY);

        doc.fillColor('black')
            .fontSize(fontSize)
            .text(relacionPasivosActivos, baseX4 + Ptexto, textY, {
                width: 130,
                align: 'right'
            });

        currentY4 += rowHeight4 + 30;

        const boxHeight4 = 100;


        let textoExplicativo = '';

        const ratioPasivosActivos = totalActivos > 0 ? pasivos / totalActivos : 0;

        if (ratioPasivosActivos > 0.5) {
            textoExplicativo = 'Cuentas con un elevado nivel de endeudamiento, es importante que empieces a gestionar una estrategia de desmonte de deudas y a su vez generar inversiones para tener libertad financiera.';
        } else if (ratioPasivosActivos >= 0.3) {
            textoExplicativo = 'Cuentas con un nivel de endeudamiento aceptable, es importante buscar bajar la deuda y a su vez generar inversiones para tener libertad financiera.';
        } else {
            textoExplicativo = 'Cuentas con un nivel de endeudamiento adecuado, vale la pena comenzar muy pronto una estrategia de inversiones.';
        }

        padding = 20;

        const textHeight = doc
            .font('Roboto')
            .fontSize(10)
            .heightOfString(textoExplicativo, {
                width: tableWidth4 - padding * 2,
                align: 'justify',
            });

        const boxHeight2 = textHeight + padding * 2;

        doc
            .rect(baseX4, currentY4, tableWidth4, boxHeight2)
            .strokeColor(Blue)
            .lineWidth(1)
            .stroke();

        doc
            .fillColor('black')
            .font('Roboto')
            .fontSize(10)
            .text(textoExplicativo, baseX4 + padding, currentY4 + padding, {
                width: tableWidth4 - padding * 2,
                align: 'justify',
            });


        let baseX5 = 0;
        let currentY5 = currentY4 + 80;
        const tableWidth5 = 300;
        let rowHeight5 = 20;
        const colTipo = 100;
        const colCalif = 60;

        const text6 = 'Riesgos';

        doc.rect(baseX5, currentY5 + 40, 350, 40)
            .fillColor(Blue)
            .fill();

        doc.fillColor('white')
            .fontSize(20);

        const textWidth6 = doc.widthOfString(text6);
        const textHeight6 = doc.currentLineHeight();

        const x6 = baseX5 + (350 - textWidth6) / 2;
        const y6 = (currentY5 + 40) + (40 - textHeight6) / 2;

        doc.font("Roboto-Bold").fontSize(20).text(text6, x6, y6);


        baseX5 = 30;
        currentY5 = currentY4 + 210;

        doc.rect(baseX5, currentY5, tableWidth5, rowHeight5).fill(Blue);
        doc.fillColor('white').font('Roboto-Bold').fontSize(10);
        doc.text('Tipo de Riesgo', baseX5 + 5, currentY5 + 5, {
            width: colTipo,
            align: 'center'
        });
        doc.text('Calificación', baseX5 + colTipo + 5, currentY5 + 5, {
            width: colCalif,
            align: 'center'
        });
        doc.text('Comentarios', baseX5 + colTipo + colCalif + 5, currentY5 + 5, {
            width: tableWidth5 - colTipo - colCalif - 10,
            align: 'center'
        });

        currentY5 += rowHeight5;

        const riesgos = [{
                nombre: 'Riesgo vejez',
                color: datosPlan.planB && datosPlan.planB !== null ? 'red' : 'red',
                comentario: datosPlan.planB && datosPlan.planB !== null ?
                    'Es clave validar si el monto que estás ahorrando para tu pensión realmente te permitirá mantener tu estilo de vida al retirarte. Un buen plan de retiro necesita una base financiera sólida.' : 'No tener un plan B para tu pensión puede poner en riesgo tu bienestar futuro. Comienza a construir desde hoy un ahorro complementario que te permita retirarte con tranquilidad.'
            },
            {
                nombre: 'Riesgo de Vida',
                color: datosPlan.seguroVida === 'No' && datosPlan.tieneHijosDependientes === 'Sí' ?
                    'red' : datosPlan.seguroVida === 'No' && datosPlan.tieneHijosDependientes === 'No' ?
                    'yellow' : 'green',
                comentario: datosPlan.seguroVida === 'No' && datosPlan.tieneHijosDependientes === 'Sí' ?
                    'No contar con un seguro de vida teniendo hijos puede poner en riesgo la estabilidad financiera de tu familia en caso de una eventualidad para mantener la calidad de vida de tus seres queridos si tú llegas a faltar. Considera incluirlo dentro de tu planeación financiera cuanto antes.' : datosPlan.seguroVida === 'No' && datosPlan.tieneHijosDependientes === 'No' ?
                    'Aunque no tengas dependientes o personas a cargo, los seguros de vida pueden ser una herramienta estratégica. Actualmente existen opciones que no solo brindan protección, sino que también te ayudan a optimizar impuestos y planificar tu pensión. Evalúa cómo un seguro puede formar parte de tu estrategia financiera a largo plazo.' : 'Tienes un seguro de vida, lo cual es una excelente base para proteger a tus seres queridos.Revisa esta cobertura con detalle.'
            },
            {
                nombre: 'Riesgo de incapacidad',
                color: datosPlan.seguroIncapacidad === 'Sí' ? 'yellow' : 'red',
                comentario: datosPlan.seguroIncapacidad === 'Sí' ?
                    'Revisa las clausulas de tu seguro de incapacidad o valores de cobertura ya que a veces esto no es suficiente para protegerte si una enfermedad grave afecta tus finanzas.' : 'Tu capacidad de generar ingresos es uno de tus activos más valiosos. Un seguro de incapacidad te protege si por alguna razón no puedes seguir ejerciendo tu profesión'
            },
            {
                nombre: 'Riesgo de salud',
                color: datosPlan.polizaSalud === 'Sí' ? 'green' : 'yellow',
                comentario: datosPlan.polizaSalud === 'Sí' ?
                    'Excelente! Contar con un seguro de salud adicional demuestra una planificación financiera inteligente. Esta cobertura te permite acceder a mejores servicios.' : 'Depender únicamente del sistema de salud obligatorio puede no ser suficiente frente a una urgencia o una enfermedad de alto costo. Tener una cobertura adicional te da acceso más ágil y de mejor calidad a los servicios médicos. Proteger tu salud también es proteger tus finanzas.'
            },
            {
                nombre: 'Fondo de emergencia',
                color: datosPlan.fondoEmergencia === 'Sí' ? 'green' : 'red',
                comentario: datosPlan.fondoEmergencia === 'Sí' ?
                    '¡Muy bien! Tener un fondo de emergencia demuestra una excelente gestión financiera. Asegúrate de que ese fondo sea suficiente para cubrir al menos entre tres y seis meses de tus gastos fijos.' : 'No contar con un fondo de emergencia te deja expuesto a dificultades económicas en caso de imprevistos, como desempleo, enfermedad o una reparación urgente.'
            }
        ];


        rowHeight5 = 30;

        riesgos.forEach(r => {
            const paddingVertical = 10;

            const textHeightNombre = doc.heightOfString(r.nombre, {
                font: 'Roboto',
                fontSize: 8,
                width: colTipo
            });

            const rowHeight = textHeightNombre + paddingVertical * 2;

            doc.fillColor('black')
                .font('Roboto')
                .fontSize(8)
                .text(r.nombre, baseX5 + 5, currentY5 + rowHeight, {
                    width: colTipo,
                    align: 'center'
                });

            let colorFill = r.color === 'green' ? '#4CAF50' :
                r.color === 'yellow' ? '#FFEB3B' :
                '#F44336';

            const textHeightComentario = doc.heightOfString(r.comentario, {
                font: 'Roboto',
                fontSize: 8,
                width: tableWidth5 - colTipo - colCalif - 10
            });

            const rowHeightComentario = textHeightComentario + paddingVertical * 2;

            const finalRowHeight = Math.max(rowHeight, rowHeightComentario);

            doc.rect(baseX5 + colTipo + 5, currentY5 + 5, colCalif - 10, finalRowHeight - 5).fill(colorFill);

            doc.fillColor('black')
                .font('Roboto')
                .fontSize(8)
                .text(r.comentario, baseX5 + colTipo + colCalif + 5, currentY5 + paddingVertical, {
                    width: tableWidth5 - colTipo - colCalif - 10,
                    align: 'justify'
                });

            currentY5 += finalRowHeight;
        });



        const leyendaX = baseX5 + tableWidth5 + 20;
        let leyendaY = currentY5 - 150;
        const leyendaWidth = 200;
        const leyendaHeight = 15;
        const espacioEntreItems = 10;

        const leyenda = [{
                color: '#4CAF50',
                texto: '¡Lo estás haciendo muy bien! Vas por un excelente camino en este aspecto de tus finanzas.'
            },
            {
                color: '#FFEB3B',
                texto: 'Hay oportunidades de mejora. Estás en una zona intermedia y podrías fortalecer aún más esta área.'
            },
            {
                color: '#F44336',
                texto: 'Hay oportunidades de mejora. Estás en una zona intermedia y podrías fortalecer aún más esta área.'
            }
        ];

        let alturaTotal = (leyenda.length * (leyendaHeight + espacioEntreItems + 20)) + 30;

        doc.roundedRect(leyendaX - 10, leyendaY - 10, leyendaWidth + 100, alturaTotal, 10).fill(Blue);

        doc.fillColor('white')
            .font('Roboto-Bold')
            .fontSize(12)
            .text('Interpretación de colores:', leyendaX, leyendaY, {
                width: leyendaWidth,
                align: 'left'
            });

        leyendaY += 25;

        leyenda.forEach(item => {
            doc.circle(
                leyendaX + leyendaHeight / 2,
                leyendaY + leyendaHeight / 2,
                leyendaHeight / 2
            ).fill(item.color);

            doc.fillColor('white')
                .font('Roboto')
                .fontSize(9)
                .text(item.texto, leyendaX + leyendaHeight + 10, leyendaY - 2, {
                    width: leyendaWidth,
                    align: 'left'
                });

            leyendaY += leyendaHeight + espacioEntreItems + 20;
        });

        // PAGINA 5 - 
        doc.addPage();

        const fondoPath2 = path.join(__dirname, 'assets', '5.jpg');
        if (fs.existsSync(fondoPath2)) {
            doc.image(fondoPath2, 0, 0, {
                width: doc.page.width,
                height: doc.page.height
            });
        }




        doc.end();
    } catch (error) {
        console.error('❌ Error al procesar MiniPlan:', error);
        res.status(500).json({
            error: error.message || 'Error al procesar el formulario'
        });
    }
};

module.exports = {
    procesarMiniPlan
};