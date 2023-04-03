const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Players extends Model {
    // l'association
    static associate(models) {
      Players.hasMany(models.Games, { as: "game_player1" });
      Players.hasMany(models.Games, { as: "game_player2" });
      Players.hasMany(models.Games, { as: "game_current_player" });
      Players.hasMany(models.Turns, { as: "turns" });
    }

    // les methods customisées
  }

  Players.init(
    {
      id: {
        type: DataTypes.INTEGER(10),
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Players",
      timestamps: true,
      createdAt: "created",
      updatedAt: false,
    }
  );
  return Players;
};
