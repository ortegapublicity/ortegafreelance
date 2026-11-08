// Netlify Function: lista los posts PUBLICADOS del blog (id y títulos en
// español e inglés) para que la bitácora elija los «Recommended posts» de
// cada borrador. Solo lectura.

import { listPublishedPosts } from "./lib/contentful.js";
import { checkAdmin, contentfulErrorMessage, jsonResponse } from "./lib/adminRequest.js";

export default async (req) => {
  const denied = checkAdmin(req);
  if (denied) return denied;
  try {
    return jsonResponse(200, { ok: true, posts: await listPublishedPosts() });
  } catch (error) {
    return jsonResponse(502, { error: `No pude leer los posts: ${contentfulErrorMessage(error)}` });
  }
};

export const config = {
  path: "/api/blog-posts",
};
