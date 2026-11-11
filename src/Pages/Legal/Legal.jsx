import React, { useEffect } from "react";
import { Link, ScrollRestoration, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import PageHeader from "../../Components/Shared/PageHeader/PageHeader";
import { legal } from "../../data/legal";
import { slugify } from "../../utils/contentfulPosts";

// Páginas legales (/privacy-policy y /terms). El idioma sale de i18n, que ya
// detecta la bandera elegida o el idioma del navegador; los textos están en
// src/data/legal.js. `doc` es "privacy" o "terms".

// "texto **negrita** texto" → nodos con <strong>
const rich = (text) =>
  String(text)
    .split(/(\*\*[^*]+\*\*)/)
    .filter(Boolean)
    .map((part, i) => (part.startsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : part));

const Legal = ({ doc }) => {
  const { i18n } = useTranslation();
  const { hash } = useLocation();
  const lang = i18n.language?.startsWith("es") ? "es" : "en";
  const page = legal[lang][doc];
  const other = doc === "privacy" ? legal[lang].terms : legal[lang].privacy;
  const otherPath = doc === "privacy" ? "/terms" : "/privacy-policy";
  const sections = page.sections.map((s) => ({ ...s, id: slugify(s.h) }));

  useEffect(() => {
    document.title = `${page.title} · Ortega Freelance`;
  }, [page.title]);

  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }, [hash, lang]);

  return (
    <>
      <ScrollRestoration />
      <PageHeader heading={page.title} page={page.breadcrumb} />

      <section className="legal pb-120">
        <div className="container">
          <div className="legal__wrap">
            <p className="legal__updated">
              {lang === "es" ? "Última actualización" : "Last updated"}: {page.updated}
            </p>
            {page.intro.map((p, i) => (
              <p className="legal__intro" key={i}>
                {rich(p)}
              </p>
            ))}

            <nav className="legal__toc" aria-label={lang === "es" ? "Contenido" : "Contents"}>
              <ol>
                {sections.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`}>{s.h}</a>
                  </li>
                ))}
              </ol>
            </nav>

            {sections.map((s, n) => (
              <section className="legal__section" id={s.id} key={s.id}>
                <h2>
                  <span className="legal__num">{String(n + 1).padStart(2, "0")}</span>
                  {s.h}
                </h2>
                {(s.p || []).map((p, i) => (
                  <p key={`p${i}`}>{rich(p)}</p>
                ))}
                {s.list && (
                  <ul>
                    {s.list.map((item, i) => (
                      <li key={i}>{rich(item)}</li>
                    ))}
                  </ul>
                )}
                {(s.after || []).map((p, i) => (
                  <p key={`a${i}`}>{rich(p)}</p>
                ))}
              </section>
            ))}

            <p className="legal__other">
              {lang === "es" ? "Consulta también:" : "See also:"} <Link to={otherPath}>{other.title}</Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Legal;
