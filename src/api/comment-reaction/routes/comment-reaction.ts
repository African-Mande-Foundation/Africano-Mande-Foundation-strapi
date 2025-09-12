// src/api/comment-reaction/routes/comment-reaction.js
module.exports = {
  routes: [
    {
      method: "POST",
      path: "/comment-reactions/toggle",
      handler: "comment-reaction.toggleReaction",
      config: {
        auth: {
          required: true,
        },
      },
    },
  ],
};
