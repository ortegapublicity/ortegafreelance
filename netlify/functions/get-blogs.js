// netlify/functions/get-blogs.js
const contentful = require("contentful");

exports.handler = async () => {
  const client = contentful.createClient({
    space: process.env.CONTENTFUL_SPACE_ID,
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
  });

  try {
    const entries = await client.getEntries({ content_type: "blogPost" });

    const blogs = entries.items.map((item) => ({
      id: item.sys.id,
      title: item.fields.title,
      slug: item.fields.slug,
      date: item.fields.date,
      description: item.fields.description,
      image: item.fields.image?.fields?.file?.url
        ? `https:${item.fields.image.fields.file.url}`
        : "/default-image.png",
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(blogs),
    };
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return { statusCode: 500, body: JSON.stringify({ error: "Failed to fetch blogs" }) };
  }
};
