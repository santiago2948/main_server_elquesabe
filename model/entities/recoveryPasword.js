const { createTransport } = require("nodemailer");

class RecoveryPass {
  constructor() {
    this.transporter = createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
          user: 'elquesabe04@gmail.com',
          pass: 'tdxe wjxg pkmi ychc'
      } 
    });
  }
  
  
  async sender(json) { 
    try {
        
        const resetLink = `http://localhost:3000/change-password?${json.token}`;

        const htmlBody = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reestablecimiento de contraseña</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f2f2f2;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 50px auto;
                background-color: #fff;
                border-radius: 10px;
                padding: 20px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
              h1 {
                color: #3D00B7;
                margin-bottom: 20px;
              }
              p {
                color: #000;
                margin-bottom: 20px;
              }
              .button {
                display: inline-block;
                background-color: #55ACEE;
                color: #fff;
                padding: 10px 20px;
                border: none;
                border-radius: 5px;
                text-decoration: none;
                cursor: pointer;
              }
              .button:hover {
                background-color: #007bb6;
              }

              .button::before {
                color: #fff;
              }    

              .button span {
                color: #fff;
              }

            </style>
          </head>
          <body>
            <div class="container">
              <h1>Restablecimiento de contraseña</h1>
              <h2>¡Hola! Recibimos una petición de restablecimiento de contraseña.</h2>
              <h2>A continuación, encontrarás los pasos para restablecer tu contraseña.</h2>
              <h3>Equipo El Que Sabe.</h3>
              <a href="${resetLink}" class="button">Click aquí para restablecer tu contraseña</a>
            </div>
            <div>
              <p>Si no hiciste esta petición, por favor haz caso omiso.</p>
              <p>El que sabe 2024</p>
            </div>
          </body>
          </html>
        `;

        const info = await this.transporter.sendMail({
            from: '"El Que Sabe"',
            to: json.email,
            subject: "Restablecimiento contraseña El Que Sabe",
            html: htmlBody,
        });

        console.log("ID del mensaje:", info.messageId);
        return info;
    } catch (error) {
        console.error("Error al enviar el correo electrónico:", error);
        throw error;
    }
  }
}

module.exports = RecoveryPass;
