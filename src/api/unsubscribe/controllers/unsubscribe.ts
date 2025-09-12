import crypto from 'crypto';

export default {
  async find(ctx) {
    const { email, token } = ctx.query;

    if (!email || !token) {
      return ctx.badRequest('Missing parameters');
    }

    const validToken = crypto.createHash('sha256')
      .update(email + process.env.UNSUBSCRIBE_SECRET)
      .digest('hex');

    if (token !== validToken) {
      return ctx.unauthorized('Invalid token');
    }

    const removed = await strapi.db.query('api::newsletter-signup.newsletter-signup').delete({
      where: { email },
    });

    ctx.send({
      message: 'Successfully unsubscribed.',
      removed,
    });
  },
};
