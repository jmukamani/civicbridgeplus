'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove the foreign key constraint first
    await queryInterface.removeConstraint('Policies', 'Policies_county_id_fkey');
    // Now change the column type
    await queryInterface.changeColumn('Policies', 'county_id', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Change back to UUID
    await queryInterface.changeColumn('Policies', 'county_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'Counties',
        key: 'id'
      }
    });
    // Optionally, add the constraint back if needed
  }
}; 