// Convierte los bloques estructurados que devuelve la IA (ver lib/prompt.js)
// en un documento de Contentful Rich Text válido.
//
// Por qué: pedirle a un LLM que genere directamente el árbol de nodos de
// Contentful Rich Text (con todos sus "nodeType", "data", "marks", etc.) es
// frágil — basta un campo mal puesto para que Contentful rechace la entrada.
// En cambio, le pedimos un formato intermedio simple (bloques con un "type" y
// texto con **negrita**/*cursiva*) y lo convertimos aquí, en código
// determinista, al JSON exacto que Contentful espera.
//
// El content model `blogPage.body` permite estos nodeTypes (ver Settings →
// Content model en Contentful): heading-1..6, ordered-list, unordered-list,
// hr, blockquote, embedded-entry-block, embedded-asset-block, hyperlink,
// entry-hyperlink, asset-hyperlink, embedded-entry-inline. Marks permitidas:
// bold, italic, underline, code. Este conversor solo usa el subconjunto que
// necesitamos: paragraph, heading-2, heading-3, unordered-list, blockquote,
// con marks bold/italic.

const CONTENTFUL_RICHTEXT_SCHEMA_VERSION = "https://cdn.contentful.com/schemas/rich-text/v1.json";

/**
 * Convierte texto con **bold** y *italic* (o _italic_) en un array de
 * "text" nodes de Contentful Rich Text, aplicando los marks correspondientes.
 * No soporta anidamiento (negrita+cursiva a la vez); es intencionalmente
 * simple porque el prompt le pide a la IA que no abuse del formato.
 */
function parseInlineMarks(rawText) {
  const text = String(rawText ?? "");
  // Divide conservando los delimitadores, para poder detectar qué segmentos
  // están marcados.
  const tokens = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_)/g).filter(
    (t) => t !== ""
  );

  if (tokens.length === 0) {
    return [{ nodeType: "text", value: "", marks: [], data: {} }];
  }

  return tokens.map((token) => {
    if (/^\*\*[^*]+\*\*$/.test(token)) {
      return {
        nodeType: "text",
        value: token.slice(2, -2),
        marks: [{ type: "bold" }],
        data: {},
      };
    }
    if (/^\*[^*]+\*$/.test(token) || /^_[^_]+_$/.test(token)) {
      return {
        nodeType: "text",
        value: token.slice(1, -1),
        marks: [{ type: "italic" }],
        data: {},
      };
    }
    return { nodeType: "text", value: token, marks: [], data: {} };
  });
}

function paragraphNode(text) {
  return {
    nodeType: "paragraph",
    data: {},
    content: parseInlineMarks(text),
  };
}

function headingNode(level, text) {
  const nodeType = level === 3 ? "heading-3" : "heading-2";
  return {
    nodeType,
    data: {},
    content: parseInlineMarks(text),
  };
}

function blockquoteNode(text) {
  return {
    nodeType: "blockquote",
    data: {},
    content: [paragraphNode(text)],
  };
}

function unorderedListNode(items) {
  return {
    nodeType: "unordered-list",
    data: {},
    content: (items ?? []).map((item) => ({
      nodeType: "list-item",
      data: {},
      content: [paragraphNode(item)],
    })),
  };
}

/**
 * @param {Array<{type: string, text?: string, items?: string[], level?: number}>} blocks
 * @returns {object} documento Rich Text de Contentful
 */
export function blocksToRichText(blocks) {
  const content = (blocks ?? [])
    .map((block) => {
      switch (block?.type) {
        case "heading":
          return headingNode(block.level === 3 ? 3 : 2, block.text);
        case "quote":
          return blockquoteNode(block.text);
        case "bulletList":
          return unorderedListNode(block.items);
        case "paragraph":
        default:
          if (!block?.text) return null;
          return paragraphNode(block.text);
      }
    })
    .filter(Boolean);

  // Contentful exige al menos un nodo de contenido.
  if (content.length === 0) {
    content.push(paragraphNode(""));
  }

  return {
    nodeType: "document",
    data: {},
    content,
  };
}

export const RICHTEXT_SCHEMA_VERSION = CONTENTFUL_RICHTEXT_SCHEMA_VERSION;
