const { Model, DataTypes } = require("sequelize");
const Player = require("./Player");
const Turns = require("./Turn");

module.exports = (sequelize) => {
  class Games extends Model {
    // l'association
    static associate(models) {
      Games.belongsTo(models.Player, { as: "player1", foreignKey: "id" });
      Games.belongsTo(models.Player, { as: "player2", foreignKey: "id" });
      Games.belongsTo(models.Player, {
        as: "current_player",
        foreignKey: "id",
      });
      Games.hasMany(models.Turns, { foreignKey: "id" });
    }

    // les methods customisées
  }

  Games.init(
    {
      id: {
        type: DataTypes.INTEGER(10),
        primaryKey: true,
        autoIncrement: true,
      },
      game_room: {
        type: DataTypes.INTEGER(10),
        allowNull: true,
      },
      nb_dice_side: {
        type: DataTypes.INTEGER(10),
        allowNull: true,
        defaultValue: 6,
      },
      threshold_bonus: {
        type: DataTypes.INTEGER(10),
        allowNull: true,
        defaultValue: 3,
      },
      std_bonus_multiplier: {
        type: DataTypes.INTEGER(10),
        allowNull: true,
        defaultValue: 100,
      },
      ace_bonus_multiplier: {
        type: DataTypes.INTEGER(10),
        allowNull: true,
        defaultValue: 1000,
      },
      score_for_win: {
        type: DataTypes.INTEGER(10),
        allowNull: true,
        defaultValue: 10000,
      },
      default_dice_mb: {
        type: DataTypes.INTEGER(10),
        allowNull: true,
        defaultValue: 5,
      },
    },
    {
      sequelize,
      modelName: "Games",
      timestamps: true,
      createdAt: "created",
      updatedAt: false,
    }
  );
  return Games;
};
