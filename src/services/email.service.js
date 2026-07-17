import {
  transporter,
  validateMailerConfig,
} from "../config/mailer.js";

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character],
  );

export const sendVerificationEmail = async ({ email, name, token }) => {
  validateMailerConfig();

  if (!process.env.FRONTEND_URL) {
    throw new Error("La variable de entorno FRONTEND_URL no está definida");
  }

  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  const safeName = escapeHtml(name);
  const safeVerificationUrl = escapeHtml(verificationUrl);

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Verificá tu cuenta de AstroChat",
    text: `Hola ${name},\n\nVerificá tu cuenta de AstroChat ingresando al siguiente enlace:\n${verificationUrl}\n\nEl enlace vence en 24 horas.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #1f2937;">
        <h1>Hola ${safeName}</h1>
        <p>Para completar tu registro, verificá tu cuenta de AstroChat.</p>
        <p>
          <a
            href="${safeVerificationUrl}"
            style="display: inline-block; padding: 12px 20px; border-radius: 6px; background: #6366f1; color: #ffffff; text-decoration: none;"
          >Verificar mi cuenta</a>
        </p>
        <p>También podés copiar y pegar este enlace en tu navegador:</p>
        <p><a href="${safeVerificationUrl}">${safeVerificationUrl}</a></p>
        <p>El enlace vence en 24 horas.</p>
      </div>
    `,
  });
};
