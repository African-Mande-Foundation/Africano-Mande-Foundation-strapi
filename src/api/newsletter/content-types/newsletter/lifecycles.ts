export default {
  async afterCreate(event) {
    const { result } = event;

    if (result.publishedAt && !result.eventEmitted) {
      // Completely detach: queue into next tick
      process.nextTick(() => {
        strapi.eventHub.emit("newsletter.dispatch", {
          id: result.id,
          reason: "publish",
        });
      });
    }
  },
};
