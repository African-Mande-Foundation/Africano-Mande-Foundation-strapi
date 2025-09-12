/**
 * comment controller
 */
import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::comment.comment",
  ({ strapi }) => ({
    async find(ctx) {
      const userId = ctx.state.user?.id;

      // Run the default core controller
      const { data, meta } = await super.find(ctx);

      const enriched = await Promise.all(
        data.map(async (comment) => {
          const commentId = comment.id;

          // Count likes and dislikes
          const [likesCount, dislikesCount] = await Promise.all([
            strapi.db.query("api::comment-reaction.comment-reaction").count({
              where: { comment: commentId, type: "like" },
            }),
            strapi.db.query("api::comment-reaction.comment-reaction").count({
              where: { comment: commentId, type: "dislike" },
            }),
          ]);

          // Current user reaction
          let currentUserReaction = null;
          if (userId) {
            const reaction = await strapi.db
              .query("api::comment-reaction.comment-reaction")
              .findOne({
                where: { comment: commentId, user: userId },
              });
            currentUserReaction = reaction?.type || null;
          }

          const safeUser = comment.user
            ? {
                id: comment.user.id,
                documentId: comment.user.documentId,
                username: comment.user.username,
                photoUrl: comment.user.photoUrl,
              }
            : null;

          return {
            ...comment,
            user: safeUser,
            likesCount,
            dislikesCount,
            currentUserReaction,
          };
        }),
      );

      return { data: enriched, meta };
    },

    // New custom method for deleting own comments
    async deleteOwn(ctx) {
      const { id } = ctx.params; // Get the comment ID from the URL parameters
      const userId = ctx.state.user?.id; // Get the authenticated user's ID

      if (!userId) {
        return ctx.unauthorized("You are not authenticated.");
      }

      try {
        // Find the comment
        const comment = await strapi.db.query("api::comment.comment").findOne({
          where: { id: id },
          populate: ["user"], // Populate the user to check ownership
        });

        if (!comment) {
          return ctx.notFound("Comment not found.");
        }

        // Check if the authenticated user is the owner of the comment
        if (comment.user.id !== userId) {
          return ctx.forbidden("You are not allowed to delete this comment.");
        }

        // Delete the comment
        await strapi.db.query("api::comment.comment").delete({
          where: { id: id },
        });

        return ctx.send({ message: "Comment deleted successfully." });
      } catch (error) {
        strapi.log.error(`Error deleting comment: ${error.message}`);
        return ctx.badRequest("Failed to delete comment.");
      }
    },
  }),
);
