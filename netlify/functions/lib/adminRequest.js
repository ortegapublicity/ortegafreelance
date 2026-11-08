// Utilidades compartidas por las funciones de administración del blog
// (/api/blog-draft y /api/blog-asset): autenticación con BLOG_ADMIN_SECRET y
// lectura segura del cuerpo JSON.

import { timingSafeEqual } from "node:crypto";

export const jsonResponse = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

function sameSecret(given, expected) {
  const a = Buffer.from(String(given ?? ""));
  const b = Buffer.from(String(expected));
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Devuelve una Response de error, o null si la petición es válida. */
export function checkAdmin(req) {
  if (req.method !== "POST") return jsonResponse(405, { error: "Método no permitido." });
  const adminSecret = process.env.BLOG_ADMIN_SECRET;
  if (!adminSecret) {
    return jsonResponse(500, {
      error: "Falta BLOG_ADMIN_SECRET en las variables de entorno de la función.",
    });
  }
  if (!sameSecret(req.headers.get("x-admin-secret"), adminSecret)) {
    return jsonResponse(401, { error: "No autorizado." });
  }
  return null;
}

/** { data } o { error: Response } */
export async function readJsonBody(req, maxBytes) {
  const raw = await req.text();
  if (raw.length > maxBytes) return { error: jsonResponse(413, { error: "La petición es demasiado grande." }) };
  try {
    return { data: JSON.parse(raw) };
  } catch {
    return { error: jsonResponse(400, { error: "Body inválido, se esperaba JSON." }) };
  }
}

/**
 * Mensaje corto de un error de Contentful. El SDK mete en error.message un
 * JSON con las cabeceras de la petición (incluido el final del token): eso
 * no debe salir en la respuesta.
 */
export function contentfulErrorMessage(error) {
  try {
    const e = JSON.parse(error.message);
    const extra = e.details?.errors?.map((d) => d.details || d.name).filter(Boolean).join("; ");
    return `${e.status || ""} ${e.message || e.statusText || "error"}${extra ? ` (${extra})` : ""}`.trim();
  } catch {
    return String(error?.message || error).slice(0, 300);
  }
}
