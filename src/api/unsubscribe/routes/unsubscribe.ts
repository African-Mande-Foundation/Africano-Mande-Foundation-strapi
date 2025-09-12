export default {
  routes: [
    {
      method: 'GET',
      path: '/unsubscribe',
      handler: 'unsubscribe.find',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
      },
    },
  ],
};
