// netlify/functions/get-blog-by-slug.js

const contentful = require("contentful"); // Corregido: require asignado a variable
 
exports.handler = async (event) => {
    const { slug } = event.queryStringParameters;

    // Se asume que CONTENTFUL_SPACE_ID y CONTENTFUL_ACCESS_TOKEN 
    // están configuradas en las variables de entorno de Netlify.
    const client = contentful.createClient({
        space: process.env.CONTENTFUL_SPACE_ID,
        accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
    });

    try {
        const entries = await client.getEntries({
            content_type: "blogPost",
            "fields.slug": slug,
            limit: 1 // Solo necesitamos un resultado
        });
        
        // 🚨 CORRECCIÓN CLAVE: Asignamos el post
        const post = entries.items[0];

        // Manejo de 404 si Contentful no devuelve nada
        if (!post) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: `Blog con slug '${slug}' no encontrado.` })
            };
        }
        
        // Transformación de datos (DEBE coincidir con BlogDetails.jsx)
        const blog = {
            id: post.sys.id,
            title: post.fields.title,
            slug: post.fields.slug,
            date: post.fields.date,
            content: post.fields.content, // Campo rich text e markdown
            // Manejo de la URL de la imagen
            image: post.fields.image?.fields?.file?.url 
                ? `https:${post.fields.image.fields.file.url}`
                : "/default-image.png",
        };
        
        return {
            statusCode: 200,
            body: JSON.stringify(blog),
        };
    } catch (error) {
        console.error("Error fetching blog detail:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch blog detail" }),
        };
    }
};