/**
 * newsletter service
 */

import { factories } from "@strapi/strapi";
import crypto from "crypto";

interface Subscriber {
  email: string;
}

export default factories.createCoreService(
  "api::newsletter.newsletter",
  ({ strapi }) => ({
    async sendEmails({ newsletter, subscribers, articles, reason }) {
      try {
        const subject = newsletter.Title || "New Newsletter";
        const contentHtml =
          newsletter.content || "<p>Check out our latest update!</p>";

        // Build articles HTML
        const articlesHtml = articles
          .map((article) => {
            return `
            <tr>
                          <td style="background-color: #ffffff; padding: 24px; border-bottom: 1px solid #e5e5e5;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%;">
                              <tr>
                                <td>
                                  <h3 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 600; line-height: 1.4;">
                                    <a href="${process.env.FRONTEND_URL}/news/${article.document_id}"
                                       style="color: #00bcd4; text-decoration: none;">
                                      ${article.title}
                                    </a>
                                  </h3>
                                  <p style="margin: 0 0 16px 0; font-size: 14px; color: #666666; line-height: 1.5;">
                                    ${article.excerpt || ""}
                                  </p>
                                  <p style="margin: 0; font-size: 13px; color: #333333;">
                                    <strong><em>By ${article.author_name || "Unknown Author"}</em></strong>
                                  </p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>

              `;
          })
          .join("");

        // Send emails in batches
        const BATCH_SIZE = 50;
        for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
          const batch = subscribers.slice(i, i + BATCH_SIZE);

          await Promise.all(
            batch.map(async (subscriber) => {
              const unsubscribeToken = crypto
                .createHash("sha256")
                .update(`${subscriber.email}${process.env.UNSUBSCRIBE_SECRET}`)
                .digest("hex");

              const unsubscribeLink = `${process.env.FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(
                subscriber.email,
              )}&token=${unsubscribeToken}`;

              const html = `
                <!DOCTYPE html>
                                <html lang="en">
                                <head>
                                    <meta charset="UTF-8">
                                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                    <title>${subject}</title>
                                </head>
                                <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">

                                    <!-- Main Container -->
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 700px; margin: 0 auto; background-color: #ffffff;">

                                        <!-- Header -->
                                       <tr>
                  <td style="background-color: #ffffff; padding: 32px 40px; text-align: center;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%;">
                      <tr>
                        <td align="center">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                            <tr>
                              <!-- Logo -->
                              <td style="vertical-align: middle; padding-right: 12px;">
                                <img src="https://firebasestorage.googleapis.com/v0/b/foundation-fm.firebasestorage.app/o/Foundation_FM_Media%2FIMG-20220323-WA0012.jpg?alt=media&token=181d64fc-c649-495a-95a9-1ff82a7643ee"
                                     alt="FoundationFM Logo"
                                     style="height: 50px; width: auto;" />
                              </td>
                              <!-- Text -->
                              <td style="vertical-align: middle; text-align: left;">
                                <h1 style="margin: 0; color: #00bcd4; font-size: 24px; font-weight: 700;">
                                  FoundationFM
                                </h1>
                                <p style="margin: 4px 0 0 0; color: #00bcd4; font-size: 14px; opacity: 0.9;">
                                  Professional News & Updates
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>


                                        <!-- Newsletter Title -->
                                        <tr>
                                            <td style="background-color: #ffffff; padding: 32px 40px 0 40px; text-align: center;">
                                                <h2 style="margin: 0 0 8px 0; color: #00bcd4; font-size: 28px; font-weight: 700;">
                                                    ${subject}
                                                </h2>
                                                <div style="width: 60px; height: 2px; background-color: #00bcd4; margin: 0 auto 32px auto;"></div>
                                            </td>
                                        </tr>

                                        <!-- Newsletter Content -->
                                        <tr>
                                            <td style="background-color: #ffffff; padding: 0 40px 32px 40px;">
                                                <div style="background-color: #f9f9f9; padding: 24px;">
                                                    <div style="color: #333333; font-size: 15px; line-height: 1.6;">
                                                        ${contentHtml}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>

                                        <!-- Articles Section Header -->
                                        <tr>
                                            <td style="background-color: #ffffff; padding: 0 40px 24px 40px;">
                                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%;">
                                                    <tr>
                                                        <td style="border-top: 1px solid #e5e5e5; padding-top: 32px; text-align: center;">
                                                            <h3 style="margin: 0 0 8px 0; color: #00bcd4; font-size: 22px; font-weight: 700;">
                                                                Latest Articles
                                                            </h3>
                                                            <div style="width: 40px; height: 2px; background-color: #00bcd4; margin: 0 auto;"></div>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>

                                        <!-- Articles List -->
                                        <tr>
                                            <td style="background-color: #ffffff; padding: 0 40px;">
                                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border-top: 1px solid #e5e5e5;">
                                                    ${articlesHtml}
                                                </table>
                                            </td>
                                        </tr>

                                        <!-- Social Media Section -->
                                        <tr>
                                            <td style="background-color: #ffffff; padding: 40px;">
                                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%;">
                                                    <tr>
                                                        <td style="border-top: 1px solid #e5e5e5; padding-top: 32px; text-align: center;">
                                                            <h3 style="margin: 0 0 24px 0; color: #00bcd4; font-size: 18px; font-weight: 700;">
                                                                Follow Us
                                                            </h3>

                                                            <!-- Social Links Row 1 -->
                                                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 0 auto 16px auto;">
                                                                <tr>
                                                                    <td align="center" style="padding: 8px 16px;">
                                                                        <a href="https://facebook.com" style="color: #333333; text-decoration: none; font-size: 14px; display: inline-flex; align-items: center;">
                                                                            <img src="https://firebasestorage.googleapis.com/v0/b/foundation-fm.firebasestorage.app/o/Foundation_FM_Media%2Fdownload%20(2).png?alt=media&token=f3fc5007-25c1-42d6-81a3-7f8568a5151c"
                                                                                 alt="Facebook" style="width: 16px; height: 16px; margin-right: 6px;" />
                                                                            Facebook
                                                                        </a>
                                                                    </td>
                                                                    <td align="center" style="padding: 8px 16px;">
                                                                        <a href="https://instagram.com" style="color: #333333; text-decoration: none; font-size: 14px; display: inline-flex; align-items: center;">
                                                                            <img src="https://firebasestorage.googleapis.com/v0/b/foundation-fm.firebasestorage.app/o/Foundation_FM_Media%2Fdownload%20(3).png?alt=media&token=308f2f1f-8b74-4e84-8df7-ac5ac8bb3a7b"
                                                                                 alt="Instagram" style="width: 16px; height: 16px; margin-right: 6px;" />
                                                                            Instagram
                                                                        </a>
                                                                    </td>
                                                                    <td align="center" style="padding: 8px 16px;">
                                                                        <a href="https://www.tiktok.com/@99.4foundationfm" style="color: #333333; text-decoration: none; font-size: 14px; display: inline-flex; align-items: center;">
                                                                            <img src="https://firebasestorage.googleapis.com/v0/b/foundation-fm.firebasestorage.app/o/Foundation_FM_Media%2Fdownload%20(4).png?alt=media&token=080fee01-e88d-4713-998a-98e9cf6f634e"
                                                                                 alt="TikTok" style="width: 16px; height: 16px; margin-right: 6px;" />
                                                                            TikTok
                                                                        </a>
                                                                    </td>
                                                                </tr>
                                                            </table>

                                                            <!-- Social Links Row 2 -->
                                                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 0 auto;">
                                                                <tr>
                                                                    <td align="center" style="padding: 8px 16px;">
                                                                        <a href="https://x.com/foundationfm_99" style="color: #333333; text-decoration: none; font-size: 14px; display: inline-flex; align-items: center;">
                                                                            <img src="https://firebasestorage.googleapis.com/v0/b/foundation-fm.firebasestorage.app/o/Foundation_FM_Media%2Fdownload%20(1).png?alt=media&token=d4f88083-d9ef-4b88-940f-6b4a7c056405"
                                                                                 alt="Twitter" style="width: 16px; height: 16px; margin-right: 6px;" />
                                                                            Twitter
                                                                        </a>
                                                                    </td>
                                                                    <td align="center" style="padding: 8px 16px;">
                                                                        <a href="https://www.youtube.com/@FoundationFM-99.4" style="color: #333333; text-decoration: none; font-size: 14px; display: inline-flex; align-items: center;">
                                                                            <img src="https://firebasestorage.googleapis.com/v0/b/foundation-fm.firebasestorage.app/o/Foundation_FM_Media%2Fdownload%20(6).png?alt=media&token=b0e99e0a-47e8-4cbc-8e25-cf56a1bfa435"
                                                                                 alt="YouTube" style="width: 16px; height: 16px; margin-right: 6px;" />
                                                                            YouTube
                                                                        </a>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>

                                        <!-- Footer -->
                                        <tr>
                                            <td style="background-color: #f5f5f5; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e5e5;">
                                                <p style="margin: 0 0 8px 0; font-size: 12px; color: #666666;">
                                                    If you wish to stop receiving our emails,
                                                    <a href="${unsubscribeLink}" style="color: #00bcd4; text-decoration: none;">
                                                        click here to unsubscribe
                                                    </a>
                                                </p>
                                                <p style="margin: 0; font-size: 11px; color: #999999;">
                                                    © ${new Date().getFullYear()} FoundationFM. All rights reserved.
                                                </p>
                                            </td>
                                        </tr>

                                    </table>
                                </body>
                                </html>
                  `;

              return strapi.plugin("email").service("email").send({
                to: subscriber.email,
                subject,
                html,
              });
            }),
          );

          // avoid provider throttling
          await new Promise((res) => setTimeout(res, 500));
        }
      } catch (err) {
        strapi.log.error("❌ Error sending newsletter emails:", err);
      }
    },
  }),
);
