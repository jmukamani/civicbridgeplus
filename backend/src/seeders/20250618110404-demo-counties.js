'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Counties', [
      {
        id: '47a5d5e5-60a7-4f24-bc5b-8e5a1a2b3c4d',
        name: 'Nairobi',
        code: '047',
        region: 'Nairobi',
        population: 4397073,
        area: 694.9,
        headquarters: 'Nairobi City',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '30b5d5e5-60a7-4f24-bc5b-8e5a1a2b3c4d',
        name: 'Turkana',
        code: '023',
        region: 'Rift Valley',
        population: 926976,
        area: 71597.8,
        headquarters: 'Lodwar',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '01a5d5e5-60a7-4f24-bc5b-8e5a1a2b3c4d',
        name: 'Mombasa',
        code: '001',
        region: 'Coast',
        population: 1208333,
        area: 229.7,
        headquarters: 'Mombasa',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '02a5d5e5-60a7-4f24-bc5b-8e5a1a2b3c4d',
        name: 'Kisumu',
        code: '042',
        region: 'Nyanza',
        population: 1155574,
        area: 2085.9,
        headquarters: 'Kisumu',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '03a5d5e5-60a7-4f24-bc5b-8e5a1a2b3c4d',
        name: 'Nakuru',
        code: '032',
        region: 'Rift Valley',
        population: 2162203,
        area: 7509.5,
        headquarters: 'Nakuru',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '04a5d5e5-60a7-4f24-bc5b-8e5a1a2b3c4d',
        name: 'Kakamega',
        code: '037',
        region: 'Western',
        population: 1867579,
        area: 3033.8,
        headquarters: 'Kakamega',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '05a5d5e5-60a7-4f24-bc5b-8e5a1a2b3c4d',
        name: 'Kiambu',
        code: '022',
        region: 'Central',
        population: 2417735,
        area: 2449.2,
        headquarters: 'Kiambu',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '06a5d5e5-60a7-4f24-bc5b-8e5a1a2b3c4d',
        name: 'Machakos',
        code: '016',
        region: 'Eastern',
        population: 1421932,
        area: 5952.9,
        headquarters: 'Machakos',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '07a5d5e5-60a7-4f24-bc5b-8e5a1a2b3c4d',
        name: 'Meru',
        code: '012',
        region: 'Eastern',
        population: 1545714,
        area: 6936.1,
        headquarters: 'Meru',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '08a5d5e5-60a7-4f24-bc5b-8e5a1a2b3c4d',
        name: 'Kisii',
        code: '045',
        region: 'Nyanza',
        population: 1266860,
        area: 1317.9,
        headquarters: 'Kisii',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Counties', null, {});
  }
};