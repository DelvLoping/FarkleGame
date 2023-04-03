const DB = require("../db/db.config");
// const { CategoryError, RequestError } = require("../errors/customError");
const Players = DB.PLayers;

exports.findPlayerByPk = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérification si le champ id est présent et cohérent
    if (!id) return res.status("401").json({ message: "Missing parameter" });

    const category = await Categories.findByPk(id);
    if (category === null)
      return res
        .status("401")
        .json({ message: "La categorie demandé n'existe pas." });

    res
      .status(200)
      .json({ message: "'Une categorie a bien été trouvé.'", data: category });
  } catch (error) {
    res.status(501).json({ error: error });
  }
};

exports.findAllCat = async (req, res, next) => {
  try {
    const category = await Categories.findAll();
    if (category === null)
      throw new CategoryError("la liste de category est vide !");
    res.status(200).json({
      message: "La liste des categories a bien été récupérée.",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

exports.createPlayer = async (req, res, next) => {
  const { name, description } = req.body;
  try {
    if (!name || !description)
      return res
        .status("401")
        .json({ message: "Tous les parammétres n'ont pas été fournis" });

    const player = await Players.create({ name, description });
    if (player === null)
      return res
        .status("401")
        .json({ message: `Erreur la categorie ${name} n'a pas été crée.` });

    const message = `La categorie ${name} a bien été crée.`;
    res.status(201).json({ message, data: player });
  } catch (error) {
    next(error);
  }
};

exports.updateCat = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Vérification si le champ id est présent et cohérent
    if (!id) throw new RequestError("Missing parameter");

    const category = await Categories.findByPk(id);
    if (category === null)
      throw new CategoryError("Cettez categorie n'existe pas.", 0);

    // Mise à jour de l'utilisateur
    await Categories.update(req.body, { where: { id: id } });
    res.status(200).json({
      message: `La categorie ${category.name} a bien été mis à jour.`,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteCat = async (req, res, next) => {
  try {
    let id = parseInt(req.params.id);

    // Vérification si le champ id est présent et cohérent
    if (!id) {
      throw new RequestError("Missing parameter");
    }

    const category = await Categories.findByPk(id);
    if (category === null)
      throw new CategoryError("Cette categorie n'existe pas.", 0);

    // Suppression de l'utilisateur
    const catDeleted = await Categories.destroy({
      where: { id: id },
      include: {
        model: Product,
      },
      force: true,
    });
    res.status(404).json({
      message: `La categorie avec l'identifiant n°${id} a bien été supprimé.`,
      data: category,
    });
  } catch (err) {
    next(err);
  }
};
