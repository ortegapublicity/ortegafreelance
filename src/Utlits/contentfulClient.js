// src/Utlits/contentfulClient.js (Versión CORREGIDA)
import * as contentful from 'contentful';

const client = contentful.createClient({
  // CAMBIO CLAVE: Usar la sintaxis de Vite/ESM para variables de entorno en el cliente
  space: import.meta.env.VITE_CONTENTFUL_SPACE_ID, // <-- CORREGIDO
  accessToken: import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN, // <-- CORREGIDO
  environment: 'master' 
});

export default client;