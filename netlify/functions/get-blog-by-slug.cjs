// netlify/functions/get-blog-by-slug.js

const contentful = require("contentful"); 

exports.handler = async (event) => {
    // 1. Obtiene el slug de los parámetros de la URL
    const { slug, locale } = event.queryStringParameters;

    // 2. Configuración del cliente (usa las variables de entorno de Netlify)
    const client = contentful.createClient({
        space: process.env.CONTENTFUL_SPACE_ID,
        accessToken: process.env.CONTENTFUL_DELIVERY_TOKEN,
        host: 'cdn.contentful.com',
    });

    try {
        // 3. Busca la entrada por slug
        const entries = await client.getEntries({
            content_type: "blogPage",
            "fields.slug": slug,
            limit: 1, // Solo necesitamos un resultado
            include: 5, // Aumentamos profundidad para resolver Inline Entries y Assets anidados
            ...(locale && { locale }), // Pasa el locale si existe (ej: 'es')
        });
        
        const post = entries.items[0];

        // 4. Manejo de 404 si el post no existe
        if (!post) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: `Blog con slug '${slug}' no encontrado.` })
            };
        }
        
        // 5. Transformación de datos (Plano, compatible con BlogDetails.jsx)
        const blog = {
            id: post.sys.id,
            title: post.fields.title,
            slug: post.fields.slug,
            date: post.fields.date,
            content: post.fields.content, // Asumiendo que 'content' es el rich text
            // Manejo de la URL de la imagen
            image: post.fields.featuredImage?.fields?.file?.url 
                ? `https:${post.fields.featuredImage.fields.file.url}`
                : "/default-image.png",
        };
        
        return {
            statusCode: 200,
            body: JSON.stringify(blog),
        };

    } catch (error) {
        // 6. Manejo de errores 500 para debug
        console.error("Error fetching blog detail:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: "Serverless Function Failed (Detail)", 
                details: error.message 
            }),
        };
    }
};