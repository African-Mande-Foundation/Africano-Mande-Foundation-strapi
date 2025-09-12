import type { Core } from "@strapi/strapi";

export default {
  register() {},

  bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const onNewsletterDispatch = async ({
      id,
      reason,
    }: {
      id: string;
      reason?: string;
    }) => {
      try {
        // ✅ Run queries outside of any lifecycle transaction
        const knex = strapi.db.connection;

        // Manually fetch newsletter
        const [newsletter] = await knex("newsletters").where({ id }).limit(1);
        if (!newsletter) {
          strapi.log.warn(`Newsletter with ID ${id} not found`);
          return;
        }

        // Fetch subscribers
        const signups = await knex("newsletter_signups").distinct("email"); 

        const subscribers = signups.filter((s) => !!s.email);

        if (subscribers.length === 0) {
          strapi.log.info("No subscribers found.");
          return;
        }

       

        // Fetch articles
        const articles = await knex("articles as a")
          .leftJoin("articles_author_lnk as aal", "a.id", "aal.article_id")
          .leftJoin("authors as au", "aal.author_id", "au.id")
          .distinct(
            "a.document_id",
            "a.title",
            "a.excerpt",
            "au.name as author_name",
          )
          .orderBy("a.created_at", "desc")
          .limit(5);

       
        // Send emails asynchronously
        setImmediate(async () => {
          try {
            await strapi
              .service("api::newsletter.newsletter")
              .sendEmails({ newsletter, subscribers, articles, reason });

           
          } catch (err) {
            strapi.log.error(
              "❌ Newsletter send failed in eventHub listener:",
              err,
            );
          }
        });
      } catch (err) {
        strapi.log.error("❌ Error in onNewsletterDispatch:", err);
      }
    };

    strapi.eventHub.on("newsletter.dispatch", onNewsletterDispatch);
    
  },
};
