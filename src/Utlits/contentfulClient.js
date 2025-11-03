// src/Utils/contentfulClient.js
const contentful = require('contentful'); 
const client = contentful.createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
  environment: 'master' 
});
export default client;