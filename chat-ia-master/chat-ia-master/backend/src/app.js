require("dotenv").config();
//importamos Express
const express = require("express");
const cors = require("cors");

//importamos las rutas del chat
const chatRoutes = require("./routes/chat.routes");

//creamos nuestra aplicación
const app = express();

const PORT = 3000;

// Permitir peticiones desde el frontend- Configuración de CORS
app.use(cors());

//le dice a Express que pueda recibir información en formato JSON
app.use(express.json());
/* Por ejemplo, si recibimos un POST con el siguiente cuerpo:
{
    "message": "¿Qué es JavaScript?"
} 
el backend podrá leerlo
*/

// Rutas
app.use("/api/chat", chatRoutes);

// Ruta inicial
app.get("/", (req, res) => {
    res.json({
        message: "Backend Chat IA funcionando"
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});