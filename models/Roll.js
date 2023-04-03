const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Rolls extends Model {
    // l'association
    static associate(models) {
      Rolls.belongsTo(models.Turns, { foreignKey: "id" });
    }

    // les methods customisées
  }

  Rolls.init(
    {
      id: {
        type: DataTypes.INTEGER(10),
        primaryKey: true,
        autoIncrement: true,
      },
      score: {
        type: DataTypes.INTEGER(10),
        allowNull: true,
      },
      roll: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Rolls",
      timestamps: true,
      createdAt: "created",
      updatedAt: false,
    }
  );
  return Rolls;
};
