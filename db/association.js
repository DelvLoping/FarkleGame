module.exports = (db) => {
  db.Employee.belongsTo(db.Address, {
    foreignKey: "addressId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  db.Address.hasOne(db.Employee, {
    foreignKey: "addressId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
};
