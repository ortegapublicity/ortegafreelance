import React, { useEffect, useState } from "react";
import "./AdminBlog.scss";

const SECRET_STORAGE_KEY = "admin_blog_secret";

// Netlify devuelve una página HTML cuando la función pasa de tiempo; sin esto
// la pantalla mostraba «Unexpected token '<'» en vez de un error legible.
async function readJson(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return {
      error:
        response.status === 504 || response.status === 502
          ? "La función tardó demasiado. Inténtalo de nuevo en un momento."
          : `Respuesta inesperada del servidor (${response.status}).`,
    };
  }
}

const AdminBlog = () => {
  const [secret, setSecret] = useState("");
  const [mode, setMode] = useState("social"); // social | claude
  const [articleJson, setArticleJson] = useState("");
  const [postText, setPostText] = useState("");
  const [postUrl, setPostUrl] = useState("");
  const [sourcePlatform, setSourcePlatform] = useState("linkedin");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // El secreto se recuerda SOLO en este navegador (localStorage), nunca se
  // envía a ningún lado salvo al propio endpoint /api/generate-article.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(SECRET_STORAGE_KEY);
      if (saved) setSecret(saved);
    } catch {
      // Safari en modo privado puede bloquear localStorage; no es crítico.
    }
  }, []);

  const handleSecretChange = (value) => {
    setSecret(value);
    try {
      window.localStorage.setItem(SECRET_STORAGE_KEY, value);
    } catch {
      // ignorar
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");
    setResult(null);

    try {
      let endpoint = "/api/generate-article";
      let body = { postText, postUrl, sourcePlatform };

      if (mode === "claude") {
        endpoint = "/api/blog-draft";
        let pasted;
        try {
          pasted = JSON.parse(articleJson);
        } catch {
          throw new Error("El texto pegado no es un JSON válido. Copia el bloque completo que te dio Claude.");
        }
        // Acepta el archivo de borrador de la bitácora ({ title, body, en })
        // y lo pasa al formato del endpoint ({ es, en }). Las portadas no van
        // por aquí: las sube el script local.
        body = pasted.es
          ? pasted
          : {
              es: { title: pasted.title, excerpt: pasted.excerpt, body: pasted.body },
              en: pasted.en,
            };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-secret": secret,
        },
        body: JSON.stringify(body),
      });

      const data = await readJson(response);

      if (!response.ok || data?.ok === false) {
        const details = Array.isArray(data?.details) ? ` ${data.details.join(" ")}` : "";
        throw new Error((data?.error || `Error ${response.status}`) + details);
      }

      setResult(data);
      setStatus("success");
      setPostText("");
      setPostUrl("");
      setArticleJson("");
    } catch (error) {
      setErrorMessage(error.message || "Error desconocido.");
      setStatus("error");
    }
  };

  return (
    <div className="admin-blog">
      <div className="admin-blog__container">
        <h1>Generar artículo de blog</h1>

        <div className="admin-blog__tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "social"}
            className={mode === "social" ? "is-active" : ""}
            onClick={() => setMode("social")}
          >
            Desde un post de redes
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "claude"}
            className={mode === "claude" ? "is-active" : ""}
            onClick={() => setMode("claude")}
          >
            Pegar artículo de Claude
          </button>
        </div>

        {mode === "social" ? (
          <p className="admin-blog__intro">
            Pega el texto de un post de LinkedIn o Instagram con el que
            interactuaste. La IA escribirá un artículo original desde tu
            perspectiva, citando 1 o 2 de tus casos de estudio reales, y lo
            dejará como <strong>borrador</strong> en Contentful — no se
            publica solo.
          </p>
        ) : (
          <p className="admin-blog__intro">
            Pega el JSON que te dio Claude Code con <code>/bitacora</code>. Se
            crea tal cual como <strong>borrador</strong> en Contentful, sin
            pasar por otra IA.
          </p>
        )}

        <form onSubmit={handleSubmit} className="admin-blog__form">
          <label>
            Frase secreta de administración
            <input
              type="password"
              value={secret}
              onChange={(e) => handleSecretChange(e.target.value)}
              required
              autoComplete="off"
            />
          </label>

          {mode === "claude" ? (
            <label>
              Artículo (JSON)
              <textarea
                value={articleJson}
                onChange={(e) => setArticleJson(e.target.value)}
                required
                rows={14}
                spellCheck={false}
                placeholder='{ "title": "...", "excerpt": "...", "body": [ ... ] }'
              />
            </label>
          ) : (
          <>
          <label>
            Plataforma de origen
            <select
              value={sourcePlatform}
              onChange={(e) => setSourcePlatform(e.target.value)}
            >
              <option value="linkedin">LinkedIn</option>
              <option value="instagram">Instagram</option>
              <option value="other">Otra</option>
            </select>
          </label>

          <label>
            URL del post original (opcional)
            <input
              type="url"
              value={postUrl}
              onChange={(e) => setPostUrl(e.target.value)}
              placeholder="https://www.linkedin.com/posts/..."
            />
          </label>

          <label>
            Texto del post
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              required
              minLength={20}
              rows={10}
              placeholder="Pega aquí el texto completo del post..."
            />
          </label>
          </>
          )}

          <button type="submit" disabled={status === "loading"}>
            {status === "loading"
              ? mode === "claude" ? "Creando..." : "Generando..."
              : mode === "claude" ? "Crear borrador" : "Generar borrador"}
          </button>
        </form>

        {status === "error" && (
          <div className="admin-blog__alert admin-blog__alert--error">
            {errorMessage}
          </div>
        )}

        {status === "success" && result && (
          <div className="admin-blog__alert admin-blog__alert--success">
            <h2>{result.title}</h2>
            <p>{result.excerpt}</p>
            {result.citedCaseStudies?.length > 0 && (
              <p>
                <strong>Casos citados:</strong>{" "}
                {result.citedCaseStudies.join(", ")}
              </p>
            )}
            {result.toc?.length > 0 && (
              <p>
                <strong>Índice:</strong> {result.toc.join(" · ")}
              </p>
            )}
            <a
              href={result.contentful?.editUrl}
              target="_blank"
              rel="noreferrer"
            >
              Revisar y publicar en Contentful →
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBlog;
