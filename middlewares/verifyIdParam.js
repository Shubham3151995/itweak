const verifyIdParam = (req, res, next) => {
  try {
    if (req.role === "ADMINISTRATOR") {
      const id = req.params.id || req.id;
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).send({ message: "User Id invalid" });
      }
    }
    if (req.role !== "ADMINISTRATOR") {
      const id = req.params.id;
      if (id) {
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
          return res.status(400).send({ message: "User Id invalid" });
        }
      }
    }
    next();
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "ID undefined" });
  }
};

module.exports = verifyIdParam;
