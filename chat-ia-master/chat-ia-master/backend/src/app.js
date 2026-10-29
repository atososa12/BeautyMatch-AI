
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const chatRoutes = require("./routes/chat.routes");

// Crear aplicación
const app = express();

// Configuración de middleware
app.use(cors());
app.use(express.json());

// Rutas del chatbot
app.use("/api/chat", chatRoutes);

// Ruta principal para comprobar el funcionamiento
app.get("/", (req, res) => {
    res.json({
        message: "Backend Chat IA funcionando"
    });
});

// Iniciar servidor cuando se ejecuta localmente
if (require.main === module) {
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
        console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    });
}

// Exportar la aplicación para Vercel
module.exports = app;
