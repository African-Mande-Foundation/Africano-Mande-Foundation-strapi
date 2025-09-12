import sanitizeHtml from "sanitize-html";

interface Comment {
  id: number;
  parent?: { id: number };
}

type CommentData = { Content?: unknown };


const SANITIZE_OPTS: sanitizeHtml.IOptions = {
  allowedTags: [],            
  allowedAttributes: {},      
};

// Normalize & sanitize to plain text
const cleanContent = (value: unknown): string => {
  const s = typeof value === "string" ? value : String(value ?? "");
  const stripped = sanitizeHtml(s, SANITIZE_OPTS);
  // Collapse whitespace & trim 
  return stripped.replace(/\s+/g, " ").trim();
};

// Utility function to update the repliesCount of a parent comment
const updateParentRepliesCount = async (parentId: number) => {
  if (!parentId) return;

  try {
    const repliesCount = await strapi.db.query('api::comment.comment').count({
      where: { parent: parentId },
    });

    await strapi.db.query('api::comment.comment').update({
      where: { id: parentId },
      data: { repliesCount },
    });
  } catch (err) {
    console.error(`Failed to update repliesCount for parent ID ${parentId}:`, err);
  }
};

export default {
  
  beforeCreate(event: { params: { data: CommentData } }) {
    if (event?.params?.data?.Content != null) {
      event.params.data.Content = cleanContent(event.params.data.Content);
    }
  },

  beforeUpdate(event: { params: { data: CommentData } }) {
    if (event?.params?.data?.Content != null) {
      event.params.data.Content = cleanContent(event.params.data.Content);
    }
  },

  
  async afterCreate(event: { result: Comment }) {
    const { result } = event;

    const comment = await strapi.db.query('api::comment.comment').findOne({
      where: { id: result.id },
      populate: { parent: true },
    });

    if (comment?.parent?.id) {
      await updateParentRepliesCount(comment.parent.id);
    }
  },

  async afterUpdate(event: { result: Comment }) {
    const { result } = event;

    const comment = await strapi.db.query('api::comment.comment').findOne({
      where: { id: result.id },
      populate: { parent: true },
    });

    if (comment?.parent?.id) {
      await updateParentRepliesCount(comment.parent.id);
    }
  },

  async afterDelete(event: { result: Comment }) {
    const { result } = event;

    if (result?.parent?.id) {
      await updateParentRepliesCount(result.parent.id);
    }
  },

  async afterDeleteMany(event: { result: Comment[] }) {
    const uniqueParentIds = new Set<number>();

    for (const deletedComment of event.result) {
      if (deletedComment?.parent?.id) {
        uniqueParentIds.add(deletedComment.parent.id);
      }
    }

    for (const parentId of uniqueParentIds) {
      await updateParentRepliesCount(parentId);
    }
  },
};
