export default {
  routes: [
    {
      method: 'POST',
      path: '/check-user',
      handler: 'check-user.findByEmail',
      config: {
        auth: false, // <-- allow public access
      },
    },

  ],
};
