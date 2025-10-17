const lifecycle = {
  async afterUpdate(event) {
    const { result } = event;

    strapi.log.info(`🔥 Volunteer lifecycle triggered for ID: ${result.id}`);

    // Re-fetch with relations populated
    const fullResult = await strapi.db.query('api::volunteer-application.volunteer-application').findOne({
      where: { id: result.id },
      populate: ['users_permissions_user'],
    });

    strapi.log.info(`✅ Populated result: ${JSON.stringify(fullResult, null, 2)}`);

    // Extract user ID
    const userRelation = fullResult.users_permissions_user;
    const userId = userRelation && typeof userRelation === 'object' ? userRelation.id : userRelation;

    if (!userId) {
      strapi.log.error('No user ID found even after populate.');
      return;
    }

    strapi.log.info(`Found user ID: ${userId}`);

    try {
      const user = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { id: parseInt(userId) },
      });

      if (!user) {
        strapi.log.error(`User with ID ${userId} not found.`);
        return;
      }

      if (fullResult.state === 'approved') {
        const volunteerRole = await strapi.db
          .query('plugin::users-permissions.role')
          .findOne({ where: { name: 'Volunteer' } });

        if (!volunteerRole) {
          strapi.log.error('Volunteer role not found.');
          return;
        }

        await strapi.db.query('plugin::users-permissions.user').update({
          where: { id: parseInt(userId) },
          data: { role: volunteerRole.id },
        });

        strapi.log.info(`✅ User ${userId} upgraded to Volunteer role.`);
      }

      if (fullResult.state === 'rejected') {
        const authenticatedRole = await strapi.db
          .query('plugin::users-permissions.role')
          .findOne({ where: { name: 'Authenticated' } });

        if (!authenticatedRole) {
          strapi.log.error('Authenticated role not found.');
          return;
        }

        await strapi.db.query('plugin::users-permissions.user').update({
          where: { id: parseInt(userId) },
          data: { role: authenticatedRole.id },
        });

        strapi.log.info(`❌ User ${userId} reverted to Authenticated role.`);
      }

    } catch (error) {
      strapi.log.error(`Error updating user role: ${error.message}`);
    }
  },
};

export default lifecycle;
