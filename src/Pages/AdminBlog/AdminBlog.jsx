import React, { useEffect, useState } from "react";
import "./AdminBlog.scss";

const SECRET_STORAGE_KEY = "admin_blog_secret";

const AdminBlog = () => {
  const [secret, setSecret] = useState("");
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
      const response = await fetch("/api/generate-article", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-secret": secret,
        },
        body: JSON.stringify({ postText, postUrl, sourcePlatform }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || `Error ${response.status}`);
      }

      setResult(data);
      setStatus("success");
      setPostText("");
      setPostUrl("");
    } catch (error) {
      setErrorMessage(error.message || "Error desconocido.");
      setStatus("error");
    }
  };

  return (
    <div className="admin-blog">
      <div className="admin-blog__container">
        <h1>Generar artículo de blog</h1>
        <p className="admin-blog__intro">
          Pega el texto de un post de LinkedIn o Instagram con el que
          interactuaste. La IA escribirá un artículo original desde tu
          perspectiva, citando 1 o 2 de tus casos de estudio reales, y lo
          dejará como <strong>borrador</strong> en Contentful — no se publica
          solo.
        </p>

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

          <button type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Generando..." : "Generar borrador"}
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
            <p>
              <strong>Casos citados:</strong>{" "}
              {result.citedCaseStudies?.join(", ")}
            </p>
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
