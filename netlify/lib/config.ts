/**
 * Buzones @ortegafreelance.com que viven en /sistemas/. Para añadir uno basta
 * con sumarlo aquí y dar acceso a alguien en TEAM_LOGIN.
 *
 * `shared`: lo ve todo el equipo. `admin`: quien entra con él ve todos.
 * `signature`: datos de la firma automática (ver `signature` en inbox.ts).
 */
export const MAIL_DOMAIN = 'ortegafreelance.com';
export const ORG = 'Ortega Freelance';

export type Signature = {
  role: string;
  tagline: string;
  phone: string;
  address: string;
  photo: string;
};

export const MAILBOXES = {
  raul: {
    name: 'Raúl Ortega',
    shared: false,
    admin: true,
    signature: {
      role: 'Freelancer',
      tagline: 'Marketing | Diseño digital | WEB',
      phone: '+584140419317',
      address: 'San Diego, Carabobo, Venezuela.',
      photo: '/firma/raul-ortega.png',
    } as Signature | null,
  },
} as const;

export type Mailbox = keyof typeof MAILBOXES;

/** Lo que llega a una dirección que no existe (hola@, info@…) cae aquí. */
export const CATCH_ALL: Mailbox = 'raul';

/** Enlaces de la firma: los mismos del pie de la web. */
export const LINKS = {
  facebook: 'https://www.facebook.com/ortegafreelance',
  linkedin: 'https://www.linkedin.com/in/ortegapublicity/',
  instagram: 'https://www.instagram.com/ortegafreelance/',
  calendly: 'https://calendly.com/ortegapublicity/meeting',
};
