'use strict';

export default {
  async findByEmail(ctx) {
    const { email } = ctx.request.body;

    if (!email) {
      return ctx.badRequest('Email is required');
    }

    const user = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { email },
      select: ['id', 'email']
    });

    ctx.send({ exists: !!user });
  }
};
