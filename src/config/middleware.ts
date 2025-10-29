export default [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'https://market-assets.strapi.io', 'https://firebasestorage.googleapis.com'],
          'media-src': ["'self'", 'data:', 'blob:', 'https://firebasestorage.googleapis.com'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  {
    name: 'strapi::body',
    config: {
      formLimit: '256mb',
      jsonLimit: '256mb',
      textLimit: '256mb',
      formidable: {
        maxFileSize: 200 * 1024 * 1024, // 200MB
        keepExtensions: true,
        multiples: true,
      },
    },
  },
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
  // Add your custom middleware here
  'global::windows-file-cleanup',
];