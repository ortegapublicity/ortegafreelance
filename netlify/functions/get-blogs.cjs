// netlify/functions/get-blogs.js

const contentful = require("contentful"); 
// Es CRÍTICO que 'contentful' esté en las "dependencies" de package.json

exports.handler = async () => {
    // Configuración del cliente con las variables de entorno de Netlify
    const client = contentful.createClient({
        space: process.env.CONTENTFUL_SPACE_ID,
        accessToken: process.env.CONTENTFUL_PREVIEW_TOKEN,
        host: 'preview.contentful.com',
    });

    try {
        const entries = await client.getEntries({
            content_type: "blogPage", // Asegúrate que este es el ID de tu modelo
            order: "-fields.date", 
        });

        // Mapea y transforma las entradas de Contentful a un objeto plano
        const blogs = entries.items.map(post => ({
            id: post.sys.id,
            title: post.fields.title,
            slug: post.fields.slug,
            description: post.fields.summary, // Usamos 'summary' si esa es la clave en Contentful
            date: post.fields.date,
            // Construye la URL completa de la imagen
            image: post.fields.featuredImage?.fields?.file?.url 
                ? `https:${post.fields.featuredImage.fields.file.url}`
                : "/default-image.png",
        }));
        
        return {
            statusCode: 200,
            body: JSON.stringify(blogs),
        };

    } catch (error) {
        // Esto ayudará a ver el error real en los logs de Netlify
        console.error("Error fetching all blogs:", error); 
        
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Serverless Function Failed", details: error.message }),
        };
    }
};