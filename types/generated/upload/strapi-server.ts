// src/extensions/upload/strapi-server.ts
export default (plugin) => {
  // Disable sharp optimization to avoid permission errors on Windows
  if (plugin.services['image-manipulation']) {
    plugin.services['image-manipulation'].optimize = async (file) => {
      // Return the file as-is (no optimization)
      return file;
    };
  }

  return plugin;
};

