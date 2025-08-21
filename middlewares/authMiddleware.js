// middlewares/authMiddleware.js
module.exports = (req, res, next) => {
  if (req.session && req.session.usuario) {
    next();
  } else {
    res.redirect("/login");
  }
};
