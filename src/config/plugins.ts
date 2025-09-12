module.exports = ({ env }) => ({
  upload: {
    config: {
      providerOptions: {
        localServer: {
          maxage: 300000
        },
      },
      breakpoints: null // disables sharp image optimization
    },
  },
});
