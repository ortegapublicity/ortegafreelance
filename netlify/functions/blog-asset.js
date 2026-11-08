// Netlify Function: sube una portada de la bitácora (JPG) a Contentful como
// asset en BORRADOR y devuelve su ID, para enlazarlo luego como imagen
// destacada en /api/blog-draft. Una imagen por petición, para no rozar el
// límite de tiempo de las funciones.
//
// Body: { title, fileName, dataBase64 }

import { uploadBlogImage } from "./lib/contentful.js";
import { checkAdmin, contentfulErrorMessage, jsonResponse, readJsonBody } from "./lib/adminRequest.js";

const MAX_IMAGE_BYTES = 1_500_000;

export default async (req) => {
  const denied = checkAdmin(req);
  if (denied) return denied;

  const parsed = await readJsonBody(req, Math.ceil(MAX_IMAGE_BYTES * 1.4) + 4000);
  if (parsed.error) return parsed.error;
  const { title, fileName, dataBase64 } = parsed.data || {};

  if (typeof title !== "string" || !title.trim() || title.length > 200) {
    return jsonResponse(422, { error: "Falta title (máx. 200 caracteres)." });
  }
  if (typeof fileName !== "string" || !/^[a-z0-9._-]{1,120}\.jpe?g$/i.test(fileName)) {
    return jsonResponse(422, { error: "fileName debe ser un .jpg sin espacios." });
  }
  const buffer = Buffer.from(String(dataBase64 || ""), "base64");
  // Firma de un JPG: FF D8 FF
  if (buffer.length < 1000 || buffer[0] !== 0xff || buffer[1] !== 0xd8 || buffer[2] !== 0xff) {
    return jsonResponse(422, { error: "dataBase64 no es un JPG válido." });
  }
  if (buffer.length > MAX_IMAGE_BYTES) {
    return jsonResponse(413, { error: "La imagen pasa de 1,5 MB." });
  }

  try {
    const result = await uploadBlogImage({ title: title.trim(), fileName, buffer });
    return jsonResponse(200, { ok: true, ...result });
  } catch (error) {
    return jsonResponse(502, { error: `Falló al subir la imagen a Contentful: ${contentfulErrorMessage(error)}` });
  }
};

export const config = {
  path: "/api/blog-asset",
};
