const nodemailer = require('nodemailer');

async function enviarCorreoConPDF(datos, pdfBuffer) {

    const { nombre, email, celular, recomendadoPor } = datos;


    const nombreLimpio = nombre.replace(/[^a-zA-Z0-9-_]/g, '_');

    console.log("🔹 Configurando transporter...");
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'teamtoriiapp@gmail.com',
            pass: 'smup asae jtrk izni',
        },
        tls: {
            rejectUnauthorized: false,
        },
        connectionTimeout: 15000,
    });

    const mailOptions = {
        from: '"Team Torii 👤" <teamtoriiapp@gmail.com>',
        to: 'daniel94cruz@gmail.com',
        subject: `Nuevo formulario de ${nombre}`,
        html: `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                <h2 style="color: #004aad;">📄 Nuevo Formulario Recibido</h2>
                <p><strong>Nombre:</strong> ${nombre}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Celular:</strong> ${celular}</p>
                <p><strong>Recomendado por:</strong> ${recomendadoPor}</p>
                <p>Se adjunta el formulario en formato PDF.</p>
            </div>
        `,
        attachments: [{
            filename: `Formulario_${nombreLimpio}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
        }],
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Correo enviado con éxito:", info);
    } catch (error) {
        console.error("❌ Error al enviar el correo:", error);
        throw error;
    }
}

// Exportar la función para usarla en otros archivos
module.exports = { enviarCorreoConPDF };
