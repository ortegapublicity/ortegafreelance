// Textos legales de ortegafreelance.com en español e inglés.
// Los pinta src/Pages/Legal/Legal.jsx en /privacy-policy y /terms.
//
// Describen lo que la web hace de verdad (revisado en el código el
// 2026-11-11): formulario por FormSubmit, Calendly, Google Analytics 4 vía
// Google Tag Manager, LinkedIn Insight Tag, pagos por PayPal y BNC, correo
// con Resend + Netlify Blobs, blog en Contentful y la API de LinkedIn solo
// para publicar en el perfil de Raúl. Si se añade o quita un servicio de
// terceros, actualiza la política de privacidad y la fecha `updated`.
//
// Bloques de cada sección: { h, p: [párrafos antes], list: [puntos], after: [párrafos después] }.
// En el texto, **negrita** se pinta en negrita.

const UPDATED = { es: "11 de noviembre de 2026", en: "November 11, 2026" };
const CONTACT = "raul@ortegafreelance.com";

export const legal = {
  es: {
    privacy: {
      title: "Política de Privacidad",
      breadcrumb: "Privacidad",
      updated: UPDATED.es,
      intro: [
        "Esta política explica qué datos personales recojo cuando visitas ortegafreelance.com, me escribes o contratas mis servicios, para qué los uso, con quién los comparto y qué derechos tienes. La escribí para que se entienda sin ser abogado.",
      ],
      sections: [
        {
          h: "Quién es el responsable",
          p: [
            `**Raúl Ortega Talavera**, profesional independiente que opera como «Ortega Freelance». San Diego, Carabobo, Venezuela. Correo: ${CONTACT}.`,
            "Soy yo quien decide cómo se tratan tus datos y a quien debes dirigirte para cualquier consulta sobre ellos.",
          ],
        },
        {
          h: "Qué datos recojo",
          list: [
            "**Formulario de contacto:** tu nombre, tu correo y el mensaje que escribas.",
            "**Correos que me envías:** la dirección, el contenido y los adjuntos.",
            "**Videollamadas:** si agendas una cita, Calendly recoge tu nombre, tu correo y las respuestas que des al reservar.",
            "**Pagos:** si contratas un plan, recibo la confirmación del pago (nombre, correo, importe y fecha). Los datos de tu tarjeta o cuenta los procesa PayPal o el banco; yo **nunca** los veo ni los guardo.",
            "**Navegación:** datos técnicos y de uso (páginas visitadas, dispositivo, navegador, país aproximado y de dónde llegaste) que recogen Google Analytics y LinkedIn Insight Tag mediante cookies, y los registros técnicos del servidor.",
            "**Preferencia de idioma:** se guarda en tu navegador (localStorage) para mostrarte la web en el idioma que elegiste.",
          ],
          after: ["No pido ni trato datos sensibles (salud, religión, ideología, etc.). Por favor, no los incluyas en tus mensajes."],
        },
        {
          h: "Para qué los uso y con qué base",
          list: [
            "**Responderte** cuando me escribes o agendas una llamada: porque tú lo solicitas.",
            "**Preparar propuestas, prestar el servicio y cobrarlo:** para cumplir el acuerdo que tenemos o que me pides preparar.",
            "**Cumplir obligaciones legales y fiscales**, como conservar comprobantes de pago.",
            "**Medir y mejorar la web y mis campañas** (estadísticas de visitas y conversiones): por mi interés legítimo en saber qué funciona y, donde la ley lo exija, con tu consentimiento.",
          ],
          after: ["No vendo tus datos, no los alquilo y no los uso para enviarte publicidad por correo si no me lo pides."],
        },
        {
          h: "Con quién los comparto",
          p: ["Solo con los proveedores que necesito para que la web y mi trabajo funcionen, cada uno con sus propias políticas de privacidad:"],
          list: [
            "**Netlify:** alojamiento de la web y registros técnicos.",
            "**FormSubmit:** entrega a mi correo los mensajes del formulario de contacto.",
            "**Resend y Netlify Blobs:** envío, recepción y archivo de mi correo profesional.",
            "**Calendly:** agenda de videollamadas.",
            "**PayPal y BNC (Banco Nacional de Crédito):** procesamiento de pagos.",
            "**Google (Google Analytics 4 y Google Tag Manager):** estadísticas de la web.",
            "**LinkedIn (Insight Tag):** estadísticas y medición de campañas en LinkedIn.",
            "**Contentful:** gestión de los artículos del blog (no contiene datos de visitantes).",
          ],
        },
        {
          h: "Integración con LinkedIn",
          p: [
            "Uso la API de LinkedIn únicamente para publicar contenido en **mi propio perfil** de LinkedIn (por ejemplo, avisar de un artículo nuevo del blog). Esa integración no accede a datos de visitantes de esta web ni de otros miembros de LinkedIn, y no guarda información de perfiles ajenos.",
          ],
        },
        {
          h: "Cookies y tecnologías parecidas",
          p: [
            "Google Analytics y LinkedIn Insight Tag usan cookies para contar visitas y medir resultados de campañas. Puedes bloquearlas o borrarlas desde la configuración de tu navegador; la web seguirá funcionando. También puedes instalar el complemento de inhabilitación de Google Analytics (tools.google.com/dlpage/gaoptout) y gestionar los anuncios de LinkedIn desde la configuración de tu cuenta de LinkedIn.",
            "La preferencia de idioma se guarda en tu navegador y no se envía a nadie.",
          ],
        },
        {
          h: "Dónde se guardan",
          p: [
            "Varios de estos proveedores tienen sus servidores en Estados Unidos u otros países. Al usarlos, tus datos pueden transferirse fuera de tu país; elijo proveedores reconocidos que aplican medidas de seguridad y contractuales adecuadas.",
          ],
        },
        {
          h: "Cuánto tiempo los conservo",
          list: [
            "**Mensajes y correos:** hasta tres años desde nuestro último contacto, salvo que pidas borrarlos antes.",
            "**Datos de clientes y comprobantes de pago:** el tiempo que exijan las obligaciones legales y fiscales.",
            "**Estadísticas:** el plazo configurado en cada herramienta; se usan de forma agregada.",
          ],
        },
        {
          h: "Tus derechos",
          p: [
            `Puedes pedirme acceder a tus datos, corregirlos, borrarlos, oponerte a un uso concreto, limitarlo, recibirlos en un formato portable o retirar un consentimiento que hayas dado. Escríbeme a ${CONTACT} desde la dirección relacionada con tus datos; te responderé en un máximo de 30 días. Si no estás conforme con la respuesta, puedes acudir a la autoridad de protección de datos de tu país.`,
          ],
        },
        {
          h: "Seguridad",
          p: [
            "La web funciona solo con HTTPS, el panel de correo exige un código de un solo uso enviado a mi correo personal, y uso permisos y contraseñas distintos para cada servicio. Ningún sistema es infalible: si detectara un incidente que afectara a tus datos, te avisaría y tomaría las medidas necesarias.",
          ],
        },
        {
          h: "Menores de edad",
          p: ["Esta web y mis servicios están dirigidos a empresas y profesionales. No recojo a sabiendas datos de menores de 18 años."],
        },
        {
          h: "Cambios en esta política",
          p: [
            "Si cambio la forma de tratar los datos, actualizaré esta página y su fecha. Si el cambio es importante y tengo tu correo, te avisaré.",
          ],
        },
      ],
    },

    terms: {
      title: "Términos y Condiciones",
      breadcrumb: "Términos",
      updated: UPDATED.es,
      intro: [
        "Estos términos regulan el uso de ortegafreelance.com y la contratación de mis servicios digitales: publicidad pagada, diseño y desarrollo web, branding, contenido y vídeo. Buscan que tanto quien contrata como yo sepamos desde el principio qué se entrega, cómo se paga y qué pasa si algo cambia.",
        "Al contratar un plan, pagar una propuesta o usar esta web, aceptas estos términos. Si una propuesta o contrato firmado dice algo distinto, **manda lo firmado**.",
      ],
      sections: [
        {
          h: "Quién presta el servicio",
          p: [`**Raúl Ortega Talavera** («Ortega Freelance»), profesional independiente con domicilio en San Diego, Carabobo, Venezuela. Contacto: ${CONTACT}.`],
        },
        {
          h: "Qué se contrata",
          p: [
            "Cada servicio se define en el plan publicado en la web o en una propuesta escrita (alcance, entregables, plazos y precio). Lo que no aparezca ahí no está incluido y se presupuesta aparte.",
          ],
          list: [
            "**Publicidad Digital** y **Marketing Digital Completo:** planes por trimestre.",
            "**Plan Página Web 360:** precio por web realizada.",
            "**Proyectos a medida:** según su propuesta.",
          ],
        },
        {
          h: "Precios y pagos",
          list: [
            "Los precios están en **dólares estadounidenses (USD)**.",
            "Los planes trimestrales se pagan **por adelantado**, al inicio de cada trimestre.",
            "En webs y proyectos a medida, salvo que la propuesta diga otra cosa, se paga **el 50 % para empezar** y **el 50 % antes de la entrega final**.",
            "Los pagos se hacen por **PayPal** o **BNC**. Las comisiones del medio de pago y las bancarias corren por cuenta de quien paga.",
            "El trabajo empieza cuando el pago se confirma.",
          ],
        },
        {
          h: "La inversión en anuncios es aparte",
          p: [
            "El presupuesto que se invierte en Meta, Google, LinkedIn u otras plataformas **no está incluido** en mis honorarios. Lo paga el cliente directamente a cada plataforma, en cuentas a su nombre o sobre las que tenga control. Así el dinero de los anuncios siempre es tuyo y lo puedes ver en tiempo real.",
          ],
        },
        {
          h: "Lo que garantizo y lo que no",
          p: [
            "Me comprometo a trabajar con profesionalidad, a aplicar buenas prácticas y a informarte con datos reales. Los resultados de la publicidad y del posicionamiento dependen de factores que no controlo (el mercado, el presupuesto, la competencia, los algoritmos y las políticas de cada plataforma), por eso **no garantizo cifras concretas** de ventas, clientes, alcance o retorno. Las cifras de mis casos de estudio son reales, pero no son una promesa para otro negocio.",
          ],
        },
        {
          h: "Lo que necesito de ti",
          list: [
            "Información, materiales, accesos y aprobaciones a tiempo. Los retrasos en esto mueven los plazos en la misma medida.",
            "Que tengas los derechos sobre los textos, imágenes, logos y marcas que me entregas para usar en el proyecto.",
            "Que tus productos, anuncios y contenidos cumplan la ley y las políticas de cada plataforma.",
            "Una persona de contacto que pueda aprobar el trabajo.",
          ],
        },
        {
          h: "Accesos y seguridad",
          list: [
            "Siempre que se pueda, dame acceso con **un rol o usuario propio** (por ejemplo, como socio en tu administrador comercial de Meta o como usuario en Google Ads) en lugar de compartir tu contraseña.",
            "Uso los accesos solo para el proyecto y no los comparto con terceros.",
            "Al terminar, te devuelvo o elimino mis accesos. Te recomiendo revocarlos tú también y cambiar cualquier contraseña que hayas compartido.",
            "Las cuentas publicitarias, el dominio, el alojamiento y las cuentas de los servicios de tu web deben quedar **a tu nombre**.",
          ],
        },
        {
          h: "Revisiones, entregas y aprobación",
          p: [
            "Cada propuesta indica cuántas rondas de cambios incluye; si no lo dice, son **dos rondas** por entregable. Los cambios adicionales o los cambios de alcance se presupuestan aparte antes de hacerlos.",
            "Si en **7 días** desde una entrega no recibo observaciones, esa entrega se considera aprobada. Ese plazo no limita la corrección de errores que sean míos.",
          ],
        },
        {
          h: "Cancelaciones y reembolsos",
          list: [
            "**Antes de empezar:** puedes cancelar y te devuelvo lo pagado, menos las comisiones del medio de pago que no se recuperen.",
            "**Con el trabajo empezado:** se cobra el trabajo hecho y el tiempo reservado; se devuelve la parte que corresponda al trabajo no realizado.",
            "**Planes trimestrales:** puedes no renovar avisando antes del inicio del siguiente trimestre. El trimestre en curso no se reembolsa una vez iniciado.",
            "Lo que ya se pagó a terceros (licencias, dominios, anuncios, herramientas) no es reembolsable por mi parte.",
            "Si yo no pudiera terminar un trabajo por causas mías, te devuelvo la parte no entregada.",
          ],
          after: ["Antes de abrir una disputa o un contracargo con PayPal o el banco, escríbeme: casi todo se resuelve hablando y más rápido."],
        },
        {
          h: "Propiedad de lo que se entrega",
          list: [
            "Una vez **pagado por completo**, los entregables finales hechos para ti (diseños, textos, código y sitio web) son tuyos y puedes usarlos sin límite.",
            "Conservo los derechos sobre mis herramientas, plantillas, componentes y métodos previos; te concedo una licencia de uso permanente sobre los que formen parte de tu proyecto.",
            "Los recursos de terceros (tipografías, fotos de bancos de imágenes, plugins, servicios) se rigen por sus propias licencias.",
            "Puedo mostrar el trabajo en mi portafolio y en mi blog, salvo que acordemos confidencialidad por escrito. Nunca publico datos confidenciales ni cifras internas sin tu permiso.",
          ],
        },
        {
          h: "Confidencialidad",
          p: [
            "Trato como confidencial la información no pública de tu negocio que conozca por el proyecto y no la comparto con nadie, salvo con los proveedores necesarios para hacer el trabajo o cuando la ley lo exija. Pido lo mismo respecto a mis propuestas, precios a medida y métodos.",
          ],
        },
        {
          h: "Servicios de terceros",
          p: [
            "Muchos proyectos dependen de plataformas como Meta, Google, LinkedIn, Netlify, PayPal o proveedores de dominio y alojamiento. Sus condiciones también aplican, y no soy responsable de sus caídas, cambios de reglas, rechazos de anuncios o bloqueos de cuentas que no hayan sido causados por mi trabajo. Si ocurre algo así, te ayudo a resolverlo.",
          ],
        },
        {
          h: "Mantenimiento después de la entrega",
          p: [
            "Salvo que el plan o la propuesta lo incluyan, el mantenimiento, las actualizaciones, la renovación del dominio y del alojamiento y los cambios posteriores a la entrega no están incluidos. Corrijo sin coste los errores de mi trabajo que aparezcan en los **30 días** siguientes a la entrega.",
          ],
        },
        {
          h: "Límite de responsabilidad",
          p: [
            "Mi responsabilidad total por cualquier reclamación relacionada con un servicio se limita al importe que me pagaste por ese servicio en los **tres meses** anteriores. No respondo de daños indirectos, como lucro cesante o pérdida de datos que no estuvieran bajo mi custodia. Nada de esto limita la responsabilidad que la ley no permita limitar.",
          ],
        },
        {
          h: "Uso de esta web y del blog",
          p: [
            "Los artículos del blog son informativos y reflejan mi experiencia; no son asesoría financiera, legal ni fiscal. Los textos, diseños y portadas de esta web son míos o tengo licencia para usarlos: puedes citarlos con enlace a la fuente, pero no copiarlos para uso comercial.",
          ],
        },
        {
          h: "Cambios, ley aplicable y disputas",
          p: [
            "Puedo actualizar estos términos; los cambios no afectan a los servicios ya contratados, que siguen con los términos vigentes al contratar.",
            "Ante cualquier desacuerdo, primero lo intentamos resolver de buena fe por escrito. Si no es posible, se aplican las leyes de la República Bolivariana de Venezuela y los tribunales competentes de Carabobo, salvo que una propuesta o contrato firmado diga otra cosa o que la ley de tu país te dé un derecho que no se pueda renunciar.",
          ],
        },
      ],
    },
  },

  en: {
    privacy: {
      title: "Privacy Policy",
      breadcrumb: "Privacy",
      updated: UPDATED.en,
      intro: [
        "This policy explains what personal data I collect when you visit ortegafreelance.com, contact me or hire my services, what I use it for, who I share it with and what your rights are. I wrote it to be understood without a lawyer.",
      ],
      sections: [
        {
          h: "Who is responsible",
          p: [
            `**Raúl Ortega Talavera**, an independent professional operating as "Ortega Freelance". San Diego, Carabobo, Venezuela. Email: ${CONTACT}.`,
            "I decide how your data is handled and I am the person to contact with any question about it.",
          ],
        },
        {
          h: "What data I collect",
          list: [
            "**Contact form:** your name, your email and the message you write.",
            "**Emails you send me:** the address, the content and any attachments.",
            "**Video calls:** if you book a meeting, Calendly collects your name, email and the answers you give when booking.",
            "**Payments:** if you buy a plan, I receive the payment confirmation (name, email, amount and date). Your card or account details are processed by PayPal or the bank; I **never** see or store them.",
            "**Browsing:** technical and usage data (pages visited, device, browser, approximate country and where you came from) collected by Google Analytics and LinkedIn Insight Tag through cookies, plus the server's technical logs.",
            "**Language preference:** stored in your browser (localStorage) to show the site in the language you chose.",
          ],
          after: ["I do not ask for or process sensitive data (health, religion, beliefs, etc.). Please don't include it in your messages."],
        },
        {
          h: "Why I use it and on what basis",
          list: [
            "**To reply to you** when you write or book a call: because you ask me to.",
            "**To prepare proposals, deliver the service and get paid:** to fulfil the agreement we have or that you ask me to prepare.",
            "**To meet legal and tax obligations**, such as keeping payment records.",
            "**To measure and improve the site and my campaigns** (visit and conversion statistics): based on my legitimate interest in knowing what works and, where the law requires it, on your consent.",
          ],
          after: ["I don't sell or rent your data, and I don't use it to send you marketing emails unless you ask me to."],
        },
        {
          h: "Who I share it with",
          p: ["Only with the providers I need for the site and my work to function, each with its own privacy policy:"],
          list: [
            "**Netlify:** website hosting and technical logs.",
            "**FormSubmit:** delivers contact form messages to my inbox.",
            "**Resend and Netlify Blobs:** sending, receiving and archiving my business email.",
            "**Calendly:** video call scheduling.",
            "**PayPal and BNC (Banco Nacional de Crédito):** payment processing.",
            "**Google (Google Analytics 4 and Google Tag Manager):** website statistics.",
            "**LinkedIn (Insight Tag):** statistics and LinkedIn campaign measurement.",
            "**Contentful:** management of blog articles (it holds no visitor data).",
          ],
        },
        {
          h: "LinkedIn integration",
          p: [
            "I use the LinkedIn API only to publish content on **my own** LinkedIn profile (for example, to announce a new blog article). That integration does not access data from visitors to this site or from other LinkedIn members, and it does not store anyone else's profile information.",
          ],
        },
        {
          h: "Cookies and similar technologies",
          p: [
            "Google Analytics and LinkedIn Insight Tag use cookies to count visits and measure campaign results. You can block or delete them in your browser settings and the site will keep working. You can also install the Google Analytics opt-out add-on (tools.google.com/dlpage/gaoptout) and manage LinkedIn ads from your LinkedIn account settings.",
            "The language preference is stored in your browser and is not sent to anyone.",
          ],
        },
        {
          h: "Where it is stored",
          p: [
            "Several of these providers have servers in the United States or other countries. By using them, your data may be transferred outside your country; I choose well-known providers that apply appropriate security and contractual safeguards.",
          ],
        },
        {
          h: "How long I keep it",
          list: [
            "**Messages and emails:** up to three years after our last contact, unless you ask me to delete them sooner.",
            "**Client data and payment records:** as long as legal and tax obligations require.",
            "**Statistics:** for the period configured in each tool; they are used in aggregate.",
          ],
        },
        {
          h: "Your rights",
          p: [
            `You can ask me to access, correct or delete your data, object to a specific use, restrict it, receive it in a portable format or withdraw any consent you gave. Email me at ${CONTACT} from the address linked to your data; I will reply within 30 days. If you are not satisfied with the answer, you can contact the data protection authority in your country.`,
          ],
        },
        {
          h: "Security",
          p: [
            "The site runs on HTTPS only, the email panel requires a one-time code sent to my personal email, and I use separate permissions and passwords for each service. No system is infallible: if I detected an incident affecting your data, I would let you know and take the necessary steps.",
          ],
        },
        {
          h: "Minors",
          p: ["This site and my services are aimed at businesses and professionals. I do not knowingly collect data from anyone under 18."],
        },
        {
          h: "Changes to this policy",
          p: ["If I change how data is handled, I will update this page and its date. If the change is significant and I have your email, I will let you know."],
        },
      ],
    },

    terms: {
      title: "Terms and Conditions",
      breadcrumb: "Terms",
      updated: UPDATED.en,
      intro: [
        "These terms govern the use of ortegafreelance.com and the hiring of my digital services: paid advertising, web design and development, branding, content and video. Their goal is that both the client and I know from the start what is delivered, how it is paid and what happens if something changes.",
        "By buying a plan, paying a proposal or using this site, you accept these terms. If a signed proposal or contract says something different, **the signed document prevails**.",
      ],
      sections: [
        {
          h: "Who provides the service",
          p: [`**Raúl Ortega Talavera** ("Ortega Freelance"), an independent professional based in San Diego, Carabobo, Venezuela. Contact: ${CONTACT}.`],
        },
        {
          h: "What you are hiring",
          p: [
            "Each service is defined by the plan published on the site or by a written proposal (scope, deliverables, timeline and price). Anything not listed there is not included and is quoted separately.",
          ],
          list: [
            "**Digital Advertising** and **Full Digital Marketing:** quarterly plans.",
            "**360 Website Plan:** priced per website.",
            "**Custom projects:** according to their proposal.",
          ],
        },
        {
          h: "Prices and payments",
          list: [
            "Prices are in **US dollars (USD)**.",
            "Quarterly plans are paid **in advance**, at the start of each quarter.",
            "For websites and custom projects, unless the proposal says otherwise, **50% is paid to start** and **50% before final delivery**.",
            "Payments are made through **PayPal** or **BNC**. Payment provider and bank fees are paid by the payer.",
            "Work starts once payment is confirmed.",
          ],
        },
        {
          h: "Ad spend is separate",
          p: [
            "The budget invested in Meta, Google, LinkedIn or other platforms is **not included** in my fees. The client pays it directly to each platform, in accounts in their name or under their control. That way the advertising money is always yours and you can see it in real time.",
          ],
        },
        {
          h: "What I guarantee and what I don't",
          p: [
            "I commit to working professionally, applying best practices and reporting with real data. Advertising and search results depend on factors I don't control (the market, budget, competition, and each platform's algorithms and policies), so **I don't guarantee specific figures** for sales, clients, reach or return. The figures in my case studies are real, but they are not a promise for another business.",
          ],
        },
        {
          h: "What I need from you",
          list: [
            "Information, materials, access and approvals on time. Delays here move deadlines by the same amount.",
            "That you hold the rights to the texts, images, logos and trademarks you give me for the project.",
            "That your products, ads and content comply with the law and with each platform's policies.",
            "A contact person who can approve the work.",
          ],
        },
        {
          h: "Access and security",
          list: [
            "Whenever possible, give me access through **my own role or user** (for example, as a partner in your Meta Business Manager or as a user in Google Ads) instead of sharing your password.",
            "I use access only for the project and never share it with third parties.",
            "When we finish, I hand back or remove my access. I recommend you revoke it too and change any password you shared.",
            "Ad accounts, the domain, hosting and your website's service accounts must remain **in your name**.",
          ],
        },
        {
          h: "Revisions, delivery and approval",
          p: [
            "Each proposal states how many rounds of changes are included; if it doesn't, it is **two rounds** per deliverable. Extra changes or scope changes are quoted before they are made.",
            "If I receive no comments within **7 days** of a delivery, that delivery is considered approved. This period does not limit the correction of errors that are mine.",
          ],
        },
        {
          h: "Cancellations and refunds",
          list: [
            "**Before work starts:** you can cancel and I refund what you paid, minus any non-recoverable payment fees.",
            "**Once work has started:** the work done and the time reserved are charged; the portion for work not performed is refunded.",
            "**Quarterly plans:** you can choose not to renew by notifying me before the next quarter starts. The current quarter is not refundable once it has started.",
            "Amounts already paid to third parties (licenses, domains, ads, tools) are not refundable by me.",
            "If I cannot finish a job for reasons on my side, I refund the undelivered portion.",
          ],
          after: ["Before opening a dispute or chargeback with PayPal or the bank, please email me: almost everything gets solved faster by talking."],
        },
        {
          h: "Ownership of deliverables",
          list: [
            "Once **paid in full**, the final deliverables made for you (designs, copy, code and website) are yours to use without limits.",
            "I keep the rights to my pre-existing tools, templates, components and methods; I grant you a permanent license to use those that are part of your project.",
            "Third-party resources (fonts, stock photos, plugins, services) are governed by their own licenses.",
            "I may show the work in my portfolio and blog unless we agree on confidentiality in writing. I never publish confidential data or internal figures without your permission.",
          ],
        },
        {
          h: "Confidentiality",
          p: [
            "I treat as confidential any non-public information about your business that I learn through the project, and I don't share it with anyone except the providers needed to do the work or when the law requires it. I ask the same regarding my proposals, custom prices and methods.",
          ],
        },
        {
          h: "Third-party services",
          p: [
            "Many projects depend on platforms such as Meta, Google, LinkedIn, Netlify, PayPal or domain and hosting providers. Their terms also apply, and I am not responsible for their outages, rule changes, ad rejections or account suspensions that were not caused by my work. If something like that happens, I will help you resolve it.",
          ],
        },
        {
          h: "Maintenance after delivery",
          p: [
            "Unless the plan or proposal includes it, maintenance, updates, domain and hosting renewals and changes after delivery are not included. I fix at no cost any errors in my work that appear within **30 days** of delivery.",
          ],
        },
        {
          h: "Limitation of liability",
          p: [
            "My total liability for any claim related to a service is limited to the amount you paid me for that service in the previous **three months**. I am not liable for indirect damages, such as lost profits or loss of data that was not in my custody. Nothing here limits liability that cannot be limited by law.",
          ],
        },
        {
          h: "Use of this site and the blog",
          p: [
            "Blog articles are informational and reflect my experience; they are not financial, legal or tax advice. The texts, designs and covers on this site are mine or licensed to me: you may quote them with a link to the source, but not copy them for commercial use.",
          ],
        },
        {
          h: "Changes, governing law and disputes",
          p: [
            "I may update these terms; changes do not affect services already hired, which keep the terms in force when they were hired.",
            "In case of any disagreement, we will first try to resolve it in good faith in writing. If that isn't possible, the laws of the Bolivarian Republic of Venezuela and the competent courts of Carabobo apply, unless a signed proposal or contract says otherwise or the law of your country gives you a right that cannot be waived.",
          ],
        },
      ],
    },
  },
};
