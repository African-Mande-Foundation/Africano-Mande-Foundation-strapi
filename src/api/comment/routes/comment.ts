export default {
  routes: [
    {
      method: "GET",
      path: "/comments",
      handler: "comment.find",
      config: {
        required: true,
      },
    },
    {
      method: "DELETE",
      path: "/comments/:id/own",
      handler: "comment.deleteOwn",
      config: {
        auth: {
          required: true,
        },
      },
    },
    {
      method: "POST",
      path: "/comments",
      handler: "comment.create",
      config: {
        auth: {
          required: true,
        },
      },
    },
  ],
};
