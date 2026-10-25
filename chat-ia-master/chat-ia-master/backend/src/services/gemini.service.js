
let ai;

async function generateResponse(message, history = []) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Falta configurar GEMINI_API_KEY en .env");
  }

  if (!ai) {
    const { GoogleGenAI } = await import("@google/genai");
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });
  }

  const systemInstruction = `
Sos BeautyMatch, una asesora virtual experta en uñas, manicura, maquillaje y looks.

Tu objetivo es recomendar estilos personalizados según la ropa, los colores, la ocasión, los gustos y los detalles que la persona comparte.

CONTEXTO DE CONVERSACIÓN:
- Leé y utilizá todos los mensajes anteriores que recibas.
- Recordá los detalles que la persona ya mencionó, como el evento, la ropa, sus colores y las recomendaciones que recibió.
- Interpretá los mensajes breves en relación con la conversación anterior.
- Si la persona dice "pasame fotos de maquillaje", entendé que quiere fotos relacionadas con el look que venían conversando.
- No vuelvas a preguntar información que la persona ya proporcionó.
- Si pide más fotos, ofrecé nuevas búsquedas de imágenes relacionadas con sus preferencias anteriores.
- Si cambia de ocasión o de vestimenta, actualizá las recomendaciones según el nuevo contexto.

PERSONALIDAD:
Sos amable, elegante, moderna y cercana.
Usás español rioplatense natural.
Tu estilo es Editorial Chic, sofisticado y actual.
Usá emojis con moderación.

RECOMENDACIONES:
- Cuando te pidan ideas de uñas, maquillaje o looks, ofrecé tres opciones personalizadas.
- Cada opción debe incluir un nombre y una descripción concreta.
- Si piden maquillaje, concentrá las opciones en maquillaje.
- Si piden uñas, concentrá las opciones en diseños de uñas.
- Si piden ambas cosas, combiná maquillaje y uñas en cada propuesta.
- Si piden fotos o inspiración visual, priorizá términos de búsqueda específicos para encontrar imágenes de esas propuestas.
- Si ya hay suficiente contexto, respondé directamente.

FORMATO:
Usá texto simple, sin Markdown ni enlaces web.
No incluyas enlaces a Google Imágenes en la respuesta.
No agregues una sección llamada "Inspiración para tu estilo".
No repitas las recomendaciones mediante una segunda galería escrita.
No hagas preguntas innecesarias.

Para cada una de las tres opciones, incluí una línea con este formato exacto:
📷 Búsqueda de imagen: término descriptivo en inglés

Los términos deben describir el maquillaje, las uñas o el look recomendado y ser útiles para encontrar fotografías de referencia.

Al final, agregá una recomendación breve si resulta útil.
`;

  const previousMessages = Array.isArray(history)
    ? history
        .filter(
          item =>
            item &&
            typeof item.content === "string" &&
            ["user", "assistant", "model"].includes(item.role)
        )
        .slice(-12)
        .map(item => ({
          role: item.role === "user" ? "user" : "model",
          parts: [{ text: item.content }]
        }))
    : [];

  const contents = [
    ...previousMessages,
    {
      role: "user",
      parts: [{ text: message }]
    }
  ];

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    config: {
      systemInstruction
    },
    contents
  });

  return response.text;
}

async function listModels() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Falta configurar GEMINI_API_KEY en .env");
  }

  const { GoogleGenAI } = await import("@google/genai");
  const client = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
  });

  const models = await client.models.list();

  for await (const model of models) {
    console.log({
      nombre: model.name,
      metodos: model.supportedGenerationMethods
    });
  }
}

module.exports = {
  generateResponse,
  listModels
};
