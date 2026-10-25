//este archivo sirve para manejar las solicitudes de chat y generar respuestas utilizando la API de Gemini de Google.
const { GoogleGenAI } = require("@google/genai");
// Configuración de la instancia de GoogleGenAI con la clave de API almacenada en las variables de entorno
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});
// Exportación de la función que maneja las solicitudes HTTP
module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        message: "Método no permitido"
      });
    }

    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "El mensaje no puede estar vacío."
      });
    }
    // Llamada a la API de Gemini para generar contenido basado en el mensaje recibido
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      config: {
        systemInstruction: `
          Sos un experto en Inversiones Inmobiliarias.

          Explicá los conceptos de forma clara y sencilla.
          Utilizá ejemplos prácticos.
          Respondé siempre en español.
        `
      },
      contents: message
    });

    return res.status(200).json({
      success: true,
      response: response.text
    });

  } catch (error) {
    console.error("Error al consultar Gemini:", error);

    return res.status(500).json({
      success: false,
      message: "No se pudo obtener una respuesta de la IA."
    });
  }
};