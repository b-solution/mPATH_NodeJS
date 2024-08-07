"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Rename the table
    await queryInterface.renameTable("ContractProjectDatum", "contract_project_data");
  },

  down: async (queryInterface, Sequelize) => {
    // Revert the table name change
    await queryInterface.renameTable("contract_project_data", "ContractProjectDatum");
  },
};
