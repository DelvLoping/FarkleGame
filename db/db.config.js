require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    charset: "utf8mb4", // spécifie l'encodage UTF-8
    collate: "utf8mb4_general_ci", // spécifie le collation pour l'encodage UTF-8
    logging: false,
  }
);

/********************************/
/*** Mise en place des relations ***/
const db = {};

db.sequelize = sequelize;
db.Games = require("../models/Game")(sequelize);
db.Turns = require("../models/Turn")(sequelize);
db.PLayers = require("../models/Player")(sequelize);
db.Rolls = require("../models/Roll")(sequelize);

// require("./association")(db);

/****************************************/
/***** Synchronisation des models ******/
// sequelize.sync((err) => {
//     console.log('Database Sync Error', err);
// });
db.sequelize.sync({ alter: true });
module.exports = db;
