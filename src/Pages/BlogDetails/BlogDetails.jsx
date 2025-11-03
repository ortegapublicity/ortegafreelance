import React, { useState, useEffect } from "react";
import { Link, ScrollRestoration, useParams } from "react-router-dom";

// Importaciones de Contentful y Rich Text
import contentfulClient from "../../Utlits/contentfulClient"; 
import { documentToReactComponents } from '@contentful/rich-text-react-renderer'; 
import { INLINES, BLOCKS, MARKS } from '@contentful/rich-text-types'; // <-- Necesario para definir las opciones

// Importaciones de Componentes y Utilidades
import PageHeader from "../../Components/Shared/PageHeader/PageHeader";
import BlogSidebar from "../../Components/Blogs/BlogSidebar";
import Form from "../../Components/Shared/Form/Form";
import { socialIcons } from "../../Utlits/socilIcons";
// Importa las imágenes que usas en bloques fijos si deseas mantenerlas
import straightQuotes from "../../assets/img/blog/straight-quotes.png"; 


const BlogDetails = () => {
  const { slug } = useParams(); 
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lógica de carga del post... (TU CÓDIGO ACTUAL)
  useEffect(() => {
    if (!slug) return;
    contentfulClient.getEntries({
      content_type: 'blogPost', 
      'fields.slug': slug 
    }).then(response => {
      setPost(response.items[0]);
      setLoading(false);
    }).catch(error => {
      console.error("Error fetching blog post by slug:", error);
      setLoading(false);
    });
  }, [slug]);

  // Manejo de estados de carga y 404... (TU CÓDIGO ACTUAL)
  if (loading) {
    return (
      <section className="blog__bsection pb-120">
        <div className="container">
          <p className="white fz-24">Cargando artículo...</p>
        </div>
      </section>
    );
  }

  if (!post) {
    return (
      <section className="blog__bsection pb-120">
        <div className="container">
          <p className="white fz-24">Error 404: Artículo no encontrado.</p>
          <Link to="/all-blog" className="cmn--btn">Volver al Blog</Link>
        </div>
      </section>
    );
  }

  // Desestructura y Formatea... (TU CÓDIGO ACTUAL)
  const { title, date, body, featuredImage, tags, author } = post.fields; 
  
  const postDate = new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  const imageUrl = featuredImage 
    ? `https:${featuredImage.fields.file.url}` 
    : '/ruta/a/imagen/por/defecto.jpg'; 
    
  // --- CONFIGURACIÓN DE RENDERING PARA APLICAR ESTILOS ---
  const richTextOptions = {
    renderNode: {
      // PÁRRAFOS: Aplica tus clases de texto por defecto
      [BLOCKS.PARAGRAPH]: (node, children) => (
        <p className="fz-16 pra ttext__one">{children}</p>
      ),
      
      // CITAS DE BLOQUE: Recrea la estructura visual de tu quote__box
      [BLOCKS.QUOTE]: (node, children) => (
        <div className="quite__box mb-30">
          <img src={straightQuotes} alt="Quotes" />
          <p>{children}</p>
          {/* Si quieres una línea para autor, Contentful requiere que lo hagas en Rich Text */}
        </div>
      ),

      // LISTAS NO ORDENADAS (ul): Aplica el estilo de tus "Key Takeaways"
      [BLOCKS.UL_LIST]: (node, children) => (
        <div className="text__box mb-30">
            <ul className="challenge__list">
                {children}
            </ul>
        </div>
      ),
      
      // CABECERAS (H3): Aplica el estilo de tus títulos de sección
      [BLOCKS.HEADING_3]: (node, children) => <h3 className="white mb-30">{children}</h3>,
      
      // IMÁGENES INCRUSTADAS: Recrea el contenedor 'thumb mb-30'
      [BLOCKS.EMBEDDED_ASSET]: (node) => {
        const { title, description, file } = node.data.target.fields;
        const assetUrl = `https:${file.url}`;
        
        return (
          <div className="thumb mb-30">
            <img src={assetUrl} alt={description || title || 'Imagen de Contenido'} />
          </div>
        );
      },
      
      // ENLACES INCRUSTADOS: (Si hay un Content Model enlazado)
      // [BLOCKS.EMBEDDED_ENTRY]: (node) => (
      //    // Aquí puedes renderizar un componente específico, como un CTA
      // ),
    },
    // Enlaces estándar (Hyperlinks)
    renderInline: {
      [INLINES.HYPERLINK]: (node, children) => {
        const url = node.data.uri;
        return <a href={url} target="_blank" rel="noopener noreferrer">{children}</a>;
      },
    }
  };
  
  // --- FIN DE CONFIGURACIÓN DE RENDERING ---

  return (
    <>
      <PageHeader
        heading={title}
        page={title}
      />
      <section className="blog__bsection pb-120">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="blog__bleft__wrapper">
                <div
                  className="blog__bitem"
                  data-aos="fade-up"
                  data-aos-duration="1000"
                >
                  {/* 4. Imagen Destacada Dinámica */}
                  <Link to="" className="thumb">
                    <img src={imageUrl} alt={title} />
                  </Link>
                  
                  <div className="content__two">
                    <div
                      className="text__box mb-30"
                      data-aos="fade-up"
                      data-aos-duration="1400"
                    >
                      {/* 5. Metadatos Dinámicos */}
                      <span className="text__de">
                        By: {author || 'admin'} / Posted on {postDate}
                      </span>
                      
                      {/* 6. CUERPO DEL CONTENIDO DINÁMICO */}
                      {/* Aquí reemplazamos todo el contenido estático por el renderizado de Rich Text */}
                      {documentToReactComponents(body, richTextOptions)}
                      
                      {/* ¡TODO el contenido anterior fijo (párrafos, citas, listas) DEBE SER ELIMINADO de aquí! */}
                      
                    </div>
                  </div>
                  {/* 7. Tags y Compartir */}
                  <div className="post__in cmn__bg mb__cus60">
                    <div className="post__left">
                      <span className="fz-20 fw-500 white">Posted in :</span>
                      {tags && tags.map(tag => (
                        <Link key={tag} to={`/tag/${tag}`}>{tag}</Link>
                      ))}
                    </div>
                    <div className="post__right">
                      <span className="fz-20 fw-500 white">Share :</span>
                      <ul className="social-cus d-flex align-items-center">
                        {socialIcons.map(({id, icon}) => (
                          <li key={id}>
                            <Link to="">
                              <i>
                                {icon}
                              </i>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <Form isColTwo={true} />
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <BlogSidebar />
            </div>
          </div>
        </div>
      </section>
      <ScrollRestoration />
    </>
  );
};

export default BlogDetails;