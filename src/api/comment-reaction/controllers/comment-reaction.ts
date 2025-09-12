import { factories } from "@strapi/strapi";
import { Context } from "koa";

export default factories.createCoreController(
  "api::comment-reaction.comment-reaction",
  ({ strapi }) => ({
    async toggleReaction(ctx: Context) {
      const user = ctx.state.user;
      if (!user) {
        console.log("User is not logged in. Returning unauthorized.");
        return ctx.unauthorized("You must be logged in to react to comments");
      }

      const { commentId, type } = ctx.request.body;

      if (!commentId || !type) {
        return ctx.badRequest("Missing commentId or type");
      }

      const existing = await strapi.db
        .query("api::comment-reaction.comment-reaction")
        .findOne({
          where: { user: user.id, comment: commentId },
        });

      let reaction;
      if (existing) {
        if (existing.type === type) {
          // Remove reaction if same type clicked again
          await strapi.db
            .query("api::comment-reaction.comment-reaction")
            .delete({
              where: { id: existing.id },
            });
          reaction = null;
        } else {
          // Update to new type
          reaction = await strapi.db
            .query("api::comment-reaction.comment-reaction")
            .update({
              where: { id: existing.id },
              data: { type },
            });
        }
      } else {
        // Create new reaction
        reaction = await strapi.db
          .query("api::comment-reaction.comment-reaction")
          .create({
            data: {
              type,
              comment: commentId,
              user: user.id,
            },
          });
      }
      const [likesCount, dislikesCount] = await Promise.all([
        strapi.db.query("api::comment-reaction.comment-reaction").count({
          where: { comment: commentId, type: "like" },
        }),
        strapi.db.query("api::comment-reaction.comment-reaction").count({
          where: { comment: commentId, type: "dislike" },
        }),
      ]);

      return { reaction, likesCount, dislikesCount };
    },
  }),
);
