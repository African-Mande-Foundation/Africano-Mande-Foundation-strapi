const lifecycle = {
  async afterUpdate(event) {
    const { result } = event;
    strapi.log.info(`🔥 Volunteer lifecycle triggered for ID: ${result.id}`);
    
    // Log the entire result to see the structure
    strapi.log.info(`Result structure: ${JSON.stringify(result, null, 2)}`);

    // Try different ways to get the user ID
    let userId = null;
    
    if (result.users_permissions_user) {
      if (typeof result.users_permissions_user === 'object') {
        userId = result.users_permissions_user.id;
      } else {
        userId = result.users_permissions_user;
      }
    } else if (result.user) {
      // Alternative field name
      userId = typeof result.user === 'object' ? result.user.id : result.user;
    }

    if (!userId) {
      strapi.log.error('No user ID found in volunteer application result');
      strapi.log.info(`Available fields: ${Object.keys(result).join(', ')}`);
      return;
    }

    strapi.log.info(`Found user ID: ${userId}`);

    try {
      // Verify the user exists
      const user = await strapi.db
        .query('plugin::users-permissions.user')
        .findOne({
          where: { id: parseInt(userId) },
        });

      if (!user) {
        strapi.log.error(`User with ID ${userId} not found.`);
        return;
      }

      if (result.state === 'approved') {
        // Find the Volunteer role
        const volunteerRole = await strapi.db
          .query('plugin::users-permissions.role')
          .findOne({ where: { name: 'Volunteer' } });

        if (!volunteerRole) {
          strapi.log.error('Volunteer role not found.');
          return;
        }

        // Update the user's role to Volunteer
        await strapi.db.query('plugin::users-permissions.user').update({
          where: { id: parseInt(userId) },
          data: { role: volunteerRole.id },
        });

        strapi.log.info(`✅ User ${userId} upgraded to Volunteer role.`);
      }

      if (result.state === 'rejected') {
        // Find the Authenticated role (default role)
        const authenticatedRole = await strapi.db
          .query('plugin::users-permissions.role')
          .findOne({ where: { name: 'Authenticated' } });

        if (!authenticatedRole) {
          strapi.log.error('Authenticated role not found.');
          return;
        }

        // Revert the user's role to Authenticated
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
