const { exec } = require('child_process');

exec('npx sequelize-cli migration:generate --name=civicbridge', 
  (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error}`);
      return;
    }
    console.log(stdout);
    console.error(stderr);
  }
);