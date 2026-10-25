# Cómo funciona nuestra aplicación Chat IA

## 1. Objetivo

Nuestra aplicación permite que un usuario escriba una pregunta en un
chat y reciba una respuesta generada por Gemini. Para lograrlo,
intervienen el frontend, una API, el modelo de IA y la plataforma
Vercel.

La idea principal es separar las responsabilidades: la interfaz se
encarga de mostrar el chat, la API recibe y procesa la solicitud, Gemini
genera la respuesta y Vercel aloja la aplicación.

## 2. Diagrama general del funcionamiento

``` text
┌─────────────────────────────┐
│ 1. USUARIO                  │
│ Escribe una pregunta        │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ 2. FRONTEND: carpeta public │
│ HTML: estructura            │
│ CSS: diseño                 │
│ JavaScript: captura mensaje │
└──────────────┬──────────────┘
               │
               │ fetch("/api/chat")
               │ HTTP POST + JSON
               ▼
┌─────────────────────────────┐
│ 3. API: api/chat.js         │
│ Recibe y valida el mensaje  │
│ Consulta al modelo Gemini   │
└──────────────┬──────────────┘
               │
               │ Solicitud a Gemini
               ▼
┌─────────────────────────────┐
│ 4. MODELO DE IA: Gemini     │
│ Procesa el mensaje y genera │
│ una respuesta               │
└──────────────┬──────────────┘
               │
               │ Respuesta del modelo
               ▼
┌─────────────────────────────┐
│ 5. API                      │
│ Devuelve JSON al frontend   │
└──────────────┬──────────────┘
               │
               │ Respuesta HTTP
               ▼
┌─────────────────────────────┐
│ 6. FRONTEND                 │
│ JavaScript muestra el texto │
│ en el chat                  │
└─────────────────────────────┘
```

**Recorrido resumido:** usuario → frontend → API → Gemini → API →
frontend → usuario.

## 3. ¿Qué función cumple cada parte?

  -------------------------------------------------------------------------
  Elemento                  Función                 Explicación sencilla
  ------------------------- ----------------------- -----------------------
  `public/`                 Contiene los archivos   Es la parte que ve y
                            que el navegador        utiliza el usuario.
                            utiliza para mostrar la 
                            aplicación.             

  `public/index.html`       Define la estructura de Organiza los elementos
                            la página.              del chat.

  `public/css/styles.css`   Define la apariencia    Controla colores,
                            visual.                 tamaños, espacios y
                                                    distribución.

  `public/js/app.js`        Gestiona los eventos y  Captura el mensaje y
                            la comunicación con la  muestra la respuesta.
                            API.                    

  `api/chat.js`             Recibe la solicitud,    Es la puerta de entrada
                            consulta Gemini y       al servicio de IA.
                            devuelve el resultado.  

  `backend/`                Contiene el servidor    Es la implementación de
                            Express y los servicios backend que se usa para
                            para el desarrollo      trabajar localmente.
                            local.                  

  `vercel.json`             Configura aspectos de   Indica cómo debe
                            la publicación en       configurarse el
                            Vercel.                 despliegue.

  `package.json`            Declara dependencias y  Indica qué paquetes
                            scripts del proyecto.   necesita el proyecto.

  `GEMINI_API_KEY`          Credencial para         Es un secreto que debe
                            autenticar las          permanecer en el
                            solicitudes a Gemini.   servidor.

  Vercel                    Aloja la web y ejecuta  Permite acceder a la
                            la función de API.      aplicación por
                                                    internet.

  Gemini                    Procesa el mensaje y    Es el modelo de
                            genera una respuesta.   inteligencia artificial
                                                    utilizado.
  -------------------------------------------------------------------------

## 4. ¿Cómo se comunican el frontend y la API?

La comunicación se realiza mediante una petición HTTP con `fetch()`.

### Paso 1. El frontend envía el mensaje

El usuario escribe, por ejemplo: «¿Qué es la inteligencia artificial?».
El JavaScript del frontend envía el texto a la ruta `/api/chat` usando
el método `POST`.

``` js
fetch("/api/chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    message: "¿Qué es la inteligencia artificial?"
  })
});
```

-   `fetch("/api/chat")`: indica a qué ruta se envía la solicitud.
-   `method: "POST"`: indica que se está enviando información al
    servidor.
-   `Content-Type: application/json`: informa que el contenido se envía
    en formato JSON.
-   `JSON.stringify(...)`: convierte el objeto JavaScript en texto JSON
    para enviarlo.

### Paso 2. La API recibe la solicitud

El archivo `api/chat.js` recibe el mensaje. También puede comprobar que
el método sea correcto y que el texto no esté vacío.

### Paso 3. La API consulta Gemini

La función del servidor utiliza la biblioteca de Google Gemini y la
variable de entorno `GEMINI_API_KEY` para autenticar la solicitud. El
mensaje se envía al modelo, que genera una respuesta.

### Paso 4. La API devuelve la respuesta

La API envía al frontend una respuesta JSON, por ejemplo:

``` json
{
  "success": true,
  "response": "La inteligencia artificial es un campo de la informática..."
}
```

-   `success`: indica si la solicitud se procesó correctamente.
-   `response`: contiene el texto generado por Gemini.

### Paso 5. El frontend muestra el resultado

El JavaScript lee `data.response` y agrega el mensaje del asistente a la
conversación. Si ocurre un error, el frontend puede mostrar un mensaje
informativo al usuario.

## 5. ¿Qué papel cumplen `public/` y `vercel.json`?

### Carpeta `public/`

Contiene los archivos que el navegador necesita para presentar la
aplicación:

``` text
public/
├── index.html
├── css/
│   └── styles.css
└── js/
    └── app.js
```

-   `index.html`: estructura del chat.
-   `css/styles.css`: estilos y diseño.
-   `js/app.js`: eventos, envío de mensajes y presentación de
    respuestas.

Los archivos del frontend son accesibles desde el navegador. Por eso,
**no se debe colocar la clave de Gemini en ellos**.

### Archivo `vercel.json`

En este proyecto, el archivo contiene:

``` json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": null,
  "outputDirectory": "public"
}
```

-   `$schema`: permite identificar el esquema de configuración de
    Vercel.
-   `framework: null`: indica que no se está configurando un framework
    predefinido.
-   `outputDirectory: "public"`: señala que la carpeta `public` contiene
    los archivos estáticos que se publicarán.

La API se encuentra en `api/chat.js` y Vercel la reconoce como una
función de servidor.

## 6. ¿Qué sucede con la carpeta `backend/`?

La carpeta `backend/` conserva la implementación utilizada durante el
desarrollo local con Node.js y Express. En cambio, el despliegue actual
utiliza `api/chat.js` como endpoint publicado en Vercel.

Esto significa que hay dos implementaciones del lado servidor con
responsabilidades parecidas:

-   **Desarrollo local:** el frontend puede comunicarse con el servidor
    Express que se ejecuta localmente.
-   **Producción en Vercel:** el frontend llama a `/api/chat`, que
    ejecuta la función `api/chat.js`.

Vercel no ejecuta automáticamente `backend/src/app.js` solo porque la
carpeta exista en el repositorio. La función publicada es `api/chat.js`.

## 7. ¿Cómo se protege la clave de Gemini?

La clave se guarda en una variable de entorno llamada `GEMINI_API_KEY`,
configurada en Vercel para el entorno de despliegue.

Buenas prácticas:

-   No escribir la clave directamente en `public/js/app.js`.
-   No subir el archivo `.env` con secretos a GitHub.
-   No mostrar la clave en mensajes de error ni en registros públicos.
-   Utilizar la variable de entorno desde el código que se ejecuta en el
    servidor.

Así, el navegador envía el mensaje a nuestra API, pero no necesita
conocer la clave de Gemini.

## 8. Resumen

> Nuestra aplicación está dividida en varias partes. El frontend,
> ubicado en la carpeta `public`, permite al usuario escribir y
> visualizar los mensajes. Cuando envía una pregunta, JavaScript realiza
> una petición HTTP a nuestra API, ubicada en `api/chat.js`. La API
> recibe el mensaje, consulta al modelo Gemini utilizando una clave
> secreta almacenada en Vercel y devuelve la respuesta en formato JSON.
> Finalmente, el frontend muestra esa respuesta en pantalla.
>
> Vercel aloja la aplicación, publica los archivos estáticos y ejecuta
> la API. El archivo `vercel.json` contiene la configuración de
> publicación. De esta forma separamos la interfaz visual de la lógica
> del servidor y protegemos las credenciales de la inteligencia
> artificial.

## 9. Palabras claves

-   **Frontend:** muestra la interfaz y permite interactuar.
-   **API:** recibe solicitudes y devuelve respuestas.
-   **Backend:** ejecuta la lógica del lado servidor.
-   **Gemini:** genera el contenido de la respuesta.
-   **Vercel:** aloja la web y ejecuta la función de API.
-   **`public/`:** organiza los archivos estáticos.
-   **`vercel.json`:** define parte de la configuración del despliegue.
-   **`GEMINI_API_KEY`:** autentica la llamada a Gemini y debe
    mantenerse secreta.

El flujo completo es:

**Usuario → Frontend → API → Gemini → API → Frontend → Usuario.**
