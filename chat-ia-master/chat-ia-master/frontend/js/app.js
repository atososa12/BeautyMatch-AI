

const chatForm = document.getElementById("chat-form");
const messageInput = document.getElementById("message-input");
const messagesContainer = document.getElementById("messages");
const newChatButton = document.getElementById("new-chat");

// URL del backend publicado en Vercel
const api_url = "https://beauty-backend-silk.vercel.app/api/chat";

let conversationHistory = [];

// Imágenes de referencia separadas por categoría.
const categoryImages = {
  nails: [
    "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80"
  ],
  makeup: [
    "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80"
  ],
  outfits: [
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80"
  ],
  general: [
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80"
  ]
};

function cleanText(text) {
  return String(text || "")
    .replace(/\r/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/^#{1,6}\s*/gm, "")
    .trim();
}

function removeWelcome() {
  const welcome = messagesContainer.querySelector(".welcome");
  if (welcome) welcome.remove();
}

function addMessage(text, sender) {
  removeWelcome();

  const message = document.createElement("div");
  message.classList.add("message", sender);
  message.textContent = text;

  messagesContainer.appendChild(message);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  return message;
}

function detectCategory(text) {
  const value = String(text || "").toLowerCase();

  if (
    /\b(maquillaje|maquillar|makeup|labios|labial|delineado|sombras|pestañas|rubor|base de maquillaje|glow|smokey eyes)\b/i.test(value)
  ) {
    return "makeup";
  }

  if (
    /\b(uñas|unas|manicura|manicure|nail art|esmalte|esmaltado|french|cutículas|cuticulas|uñitas|nail)\b/i.test(value)
  ) {
    return "nails";
  }

  if (
    /\b(ropa|vestido|vestidos|outfit|look|vestirme|vestimenta|conjunto|prendas|falda|pantalón|pantalon|zapatos|calzado|moda)\b/i.test(value)
  ) {
    return "outfits";
  }

  return "general";
}

function isPhotoRequest(message) {
  return /\b(fotos?|imágenes|imagenes|fotografías|fotografias|inspiración|inspiracion|ver diseños|mostrar fotos)\b/i.test(message);
}

function parseRecommendations(text) {
  const source = cleanText(text)
    .replace(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/gi, "$1")
    .replace(/https?:\/\/\S+/gi, "");

  const recommendations = [];

  const optionRegex =
    /(?:^|\n)\s*(?:✨\s*)?(?:Opción|Opcion)\s*([1-3])\s*[:.)-]\s*/gi;

  const matches = [...source.matchAll(optionRegex)];

  if (matches.length) {
    matches.forEach((match, index) => {
      const start = match.index + match[0].length;
      const end = index + 1 < matches.length
        ? matches[index + 1].index
        : source.length;

      let section = source.slice(start, end).trim();

      section = section.replace(
        /\n\s*(?:Mi recomendación|Mi recomendacion|Un tip|Consejo|Para completar tu look)[\s\S]*$/i,
        ""
      ).trim();

      const lines = section
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean);

      let title = "";
      let description = "";

      if (lines.length > 1) {
        title = lines[0].replace(/^#+\s*/, "").trim();
        description = lines.slice(1).join(" ");
      } else {
        const oneLine = section.replace(/\s+/g, " ").trim();

        const split = oneLine.match(
          /^(.{3,65}?)\s+(?=(?:Unas|Una|Un|El|La|Los|Las|Este|Esta|Para|Con|Llevá|Lleva|Elegí|Elige)\b)/i
        );

        if (split) {
          title = split[1].trim();
          description = oneLine.slice(split[0].length).trim();
        } else {
          const firstSentence = oneLine.match(/^(.{3,65}?)[.!?]\s+(.+)$/);

          if (firstSentence) {
            title = firstSentence[1].trim();
            description = firstSentence[2].trim();
          } else {
            title = oneLine.slice(0, 65).trim();
            description = oneLine.slice(65).trim();
          }
        }
      }

      title = title
        .replace(/^["'“”]+|["'“”]+$/g, "")
        .replace(/[*#]/g, "")
        .trim();

      description = description
        .replace(/📷\s*Búsqueda de imagen:.*/gi, "")
        .replace(/\s+/g, " ")
        .trim();

      if (title) {
        recommendations.push({
          title,
          description,
          category: detectCategory(title + " " + description),
          search: ""
        });
      }
    });
  }

  return recommendations.slice(0, 3).map(item => ({
    ...item,
    search: makeSearchQuery(item.title, item.description, item.category)
  }));
}

function makeSearchQuery(title, description, category) {
  const context = {
    nails: "nail art manicure nail design",
    makeup: "makeup beauty look",
    outfits: "fashion outfit style",
    general: "beauty fashion inspiration"
  };

  return `${title} ${context[category] || context.general}`;
}

function getSearchUrl(query) {
  return "https://www.google.com/search?tbm=isch&q=" +
    encodeURIComponent(query);
}

function createGallery(recommendations) {
  if (!recommendations.length) return;

  const gallery = document.createElement("div");
  gallery.className = "beautymatch-gallery";

  recommendations.forEach((item, index) => {
    const category = item.category || detectCategory(
      item.title + " " + item.description
    );

    const images = categoryImages[category] || categoryImages.general;
    const imageUrl = images[index % images.length];

    const card = document.createElement("article");
    card.className = "beautymatch-card";

    const imageLink = document.createElement("a");
    imageLink.className = "beautymatch-image-link";
    imageLink.href = getSearchUrl(item.search);
    imageLink.target = "_blank";
    imageLink.rel = "noopener noreferrer";
    imageLink.setAttribute("aria-label", "Ver imágenes de " + item.title);

    const image = document.createElement("img");
    image.src = imageUrl;
    image.alt = item.title;
    image.loading = "lazy";

    image.onerror = () => {
      image.remove();

      const fallback = document.createElement("div");
      fallback.className = "beautymatch-image-fallback";
      fallback.textContent = "Ver fotos de " + item.title;

      imageLink.appendChild(fallback);
    };

    imageLink.appendChild(image);

    const title = document.createElement("h3");
    title.className = "beautymatch-card-title";
    title.textContent = item.title;

    const description = document.createElement("p");
    description.className = "beautymatch-card-description";
    description.textContent = item.description;

    const searchLink = document.createElement("a");
    searchLink.className = "beautymatch-search-link";
    searchLink.href = getSearchUrl(item.search);
    searchLink.target = "_blank";
    searchLink.rel = "noopener noreferrer";
    searchLink.textContent = "Ver más fotos ↗";

    card.append(imageLink, title, description, searchLink);
    gallery.appendChild(card);
  });

  messagesContainer.appendChild(gallery);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeLinksAndImageInstructions(text) {
  return cleanText(text)
    .replace(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/gi, "$1")
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/^📷\s*Búsqueda de imagen:.*$/gim, "")
    .replace(/^#+\s*Inspiración para tu estilo.*$/gim, "")
    .replace(/^\s*(?:Ver más fotos|Ver fotos de referencia|Ver imágenes de referencia).*$/gim, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function findPreviousRecommendations() {
  for (let i = conversationHistory.length - 1; i >= 0; i--) {
    const item = conversationHistory[i];

    if (item.role === "assistant") {
      const recommendations = parseRecommendations(item.content);

      if (recommendations.length) return recommendations;
    }
  }

  return [];
}

async function sendMessage(message) {
  const photoRequest = isPhotoRequest(message);

  const previousRecommendations = photoRequest
    ? findPreviousRecommendations()
    : [];

  try {
    // Se conecta al backend de Vercel, no a localhost.
    const response = await fetch(api_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message,
        history: conversationHistory
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Error del servidor");
    }

    const answer = data.response || "No recibí una respuesta.";
    const parsedRecommendations = parseRecommendations(answer);

    const recommendations = parsedRecommendations.length
      ? parsedRecommendations
      : previousRecommendations;

    let visibleAnswer = removeLinksAndImageInstructions(answer);

    if (photoRequest && recommendations.length) {
      visibleAnswer =
        "¡Claro! Acá tenés fotos de inspiración para los estilos que estábamos viendo. ✨";
    }

    if (!visibleAnswer) {
      visibleAnswer = "Acá tenés inspiración para tu look. ✨";
    }

    addMessage(visibleAnswer, "assistant");

    if (recommendations.length) {
      createGallery(recommendations);
    }

    conversationHistory.push(
      { role: "user", content: message },
      { role: "assistant", content: answer }
    );

  } catch (error) {
    console.error("Error al comunicarse con el backend:", error);

    if (photoRequest && previousRecommendations.length) {
      addMessage("Te muestro las opciones que veníamos viendo. ✨", "assistant");
      createGallery(previousRecommendations);
      return;
    }

    addMessage(
      "No se pudo conectar con el servidor. Verificá la conexión e intentá nuevamente.",
      "assistant"
    );
  }
}

chatForm.addEventListener("submit", async event => {
  event.preventDefault();

  const text = messageInput.value.trim();
  if (!text) return;

  addMessage(text, "user");
  messageInput.value = "";
  messageInput.focus();

  await sendMessage(text);
});

newChatButton.addEventListener("click", () => {
  conversationHistory = [];

  messagesContainer.innerHTML = `
    <div class="welcome">
      <div class="welcome-icon">✦</div>
      <h2>¿En qué puedo ayudarte?</h2>
      <p>Escribí tu pregunta y comencemos una conversación.</p>
    </div>
  `;

  messageInput.focus();
});
