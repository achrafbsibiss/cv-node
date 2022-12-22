const Sequelize = require("sequelize");

const sequelize = new Sequelize("mysqlNode", "root", "achraf11", {
  hostname: "localhost",
  dialect: "mysql"
});

sequelize

  .authenticate()
  .then(() => {
    console.log(" connection has been esblished successfuly");
  })
  .catch(err => {
    console.log(" unable to connect");
  });

module.exports = sequelize;
