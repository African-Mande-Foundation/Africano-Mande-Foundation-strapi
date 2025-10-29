export default ({ env }) => ({
  upload: {
    config: {
      sizeLimit: 200 * 1024 * 1024, // 200MB
      breakpoints: {
        xlarge: 1920,
        large: 1000,
        medium: 750,
        small: 500,
        xsmall: 64
      },
      // Disable automatic file cleanup to prevent Windows permission errors
      autoCleanup: false,
    },
  },
});