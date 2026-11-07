// Netlify Function (formato moderno / "v2"): recibe el texto de un post de
// LinkedIn o Instagram desde la página privada /admin-blog, genera un
// artículo con la API de Gemini usando los casos de estudio reales de Raúl
// como contexto, y lo crea en Contentful como entrada DRAFT (sin publicar).
//
// Variables de entorno requeridas (se cargan en Netlify → Site settings →
// Environment variables, nunca se commitean):
//   GEMINI_API_KEY
//   CONTENTFUL_SPACE_ID
//   CONTENTFUL_MANAGEMENT_TOKEN   (Content management token, NO el Delivery)
//   CONTENTFUL_ENVIRONMENT_ID     (opcional, default "master")
//   CONTENTFUL_BLOG_POST_TYPE     (opcional, default "blogPage")
//   BLOG_ADMIN_SECRET             (frase que la página /admin-blog debe enviar)

import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT, buildUserMessage } from "./lib/prompt.js";
import { blocksToRichText } from "./lib/richText.js";
import { createDraftBlogEntry } from "./lib/contentful.js";
import { caseStudies } from "../../src/data/caseStudies.js";

const jsonResponse = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

function extractJson(text) {
  // responseMimeType "application/json" ya fuerza JSON limpio, pero por si
  // algún día cambia el modelo o la config, toleramos un posible ```json.
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  return JSON.parse(candidate.trim());
}

function validateArticle(article) {
  if (!article || typeof article !== "object") {
    throw new Error("La IA no devolvió un objeto JSON.");
  }
  const { title, body, citedCaseStudies } = article;

  if (!title || typeof title !== "string") {
    throw new Error('Falta "title" en la respuesta de la IA.');
  }
  if (!Array.isArray(body) || body.length === 0) {
    throw new Error('Falta "body" (array de bloques) en la respuesta de la IA.');
  }
  if (!Array.isArray(citedCaseStudies) || citedCaseStudies.length === 0) {
    throw new Error('La IA no citó ningún caso de estudio ("citedCaseStudies" vacío).');
  }

  const validNames = new Set(caseStudies.map((cs) => cs.clientName));
  const unknown = citedCaseStudies.filter((name) => !validNames.has(name));
  if (unknown.length > 0) {
    throw new Error(
      `La IA citó casos de estudio que no existen: ${unknown.join(", ")}`
    );
  }

  return article;
}

export default async (req) => {
  if (req.method !== "POST") {
    return jsonResponse(405, { error: "Método no permitido." });
  }

  // Sin BLOG_ADMIN_SECRET configurado la función se niega a trabajar: si no,
  // cualquiera que encuentre /api/generate-article gasta la cuota de Gemini
  // y llena Contentful de borradores.
  const adminSecret = process.env.BLOG_ADMIN_SECRET;
  if (!adminSecret) {
    return jsonResponse(500, {
      error: "Falta BLOG_ADMIN_SECRET en las variables de entorno de la función.",
    });
  }
  if (req.headers.get("x-admin-secret") !== adminSecret) {
    return jsonResponse(401, { error: "No autorizado." });
  }

  let payload;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse(400, { error: "Body inválido, se esperaba JSON." });
  }

  const { postText, postUrl, sourcePlatform } = payload || {};
  if (!postText || typeof postText !== "string" || postText.trim().length < 20) {
    return jsonResponse(400, {
      error: "Falta postText (el texto del post pegado), o es demasiado corto.",
    });
  }

  if (!process.env.GEMINI_API_KEY) {
    return jsonResponse(500, {
      error: "Falta GEMINI_API_KEY en las variables de entorno de la función.",
    });
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  let article;
  try {
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-flash-latest",
      contents: buildUserMessage({ postText, postUrl, sourcePlatform }),
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("La respuesta de Gemini no incluyó texto.");
    }

    article = validateArticle(extractJson(text));
  } catch (error) {
    return jsonResponse(502, {
      error: `Fallo generando el artículo con Gemini: ${error.message}`,
    });
  }

  let contentfulResult;
  try {
    const richTextBody = blocksToRichText(article.body);
    contentfulResult = await createDraftBlogEntry({
      title: article.title,
      richTextBody,
    });
  } catch (error) {
    return jsonResponse(502, {
      error: `El artículo se generó pero falló al crear el borrador en Contentful: ${error.message}`,
      // Devolvemos el artículo generado para no perder el trabajo de la IA
      // si Raúl quiere copiarlo a mano mientras se resuelve el problema.
      article,
    });
  }

  return jsonResponse(200, {
    ok: true,
    title: article.title,
    excerpt: article.excerpt,
    citedCaseStudies: article.citedCaseStudies,
    contentful: contentfulResult,
  });
};

export const config = {
  path: "/api/generate-article",
};
