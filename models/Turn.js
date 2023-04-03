const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Turns extends Model {
    // l'association
    static associate(models) {
      Turns.hasMany(models.Rolls, { foreignKey: "id" });
      Turns.belongsTo(models.Games, { foreignKey: "id" });
      Turns.belongsTo(models.Players, { foreignKey: "id" });
    }

    // les methods customisées
  }

  Turns.init(
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
    },
    {
      sequelize,
      modelName: "Turns",
      timestamps: true,
      createdAt: "created",
      updatedAt: false,
    }
  );
  return Turns;
};
