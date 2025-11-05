// netlify/functions/get-blog-by-slug.js
const contentful = require("contentful");

exports.handler = async (event) => {
  const { slug } = event.queryStringParameters;
  const client = contentful.createClient({
    space: process.env.CONTENTFUL_SPACE_ID,
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
  });

  try {
    const entries = await client.getEntries({
      content_type: "blogPost",
      "fields.slug": slug,
    });

    const post = entries.items[0];
    if (!post) {
      return { statusCode: 404, body: JSON.stringify({ error: "Blog not found" }) };
    }

    const blog = {
      id: post.sys.id,
      title: post.fields.title,
      slug: post.fields.slug,
      date: post.fields.date,
      content: post.fields.content, // Campo rich text o markdown desde Contentful
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
    return { statusCode: 500, body: JSON.stringify({ error: "Failed to fetch blog" }) };
  }
};
