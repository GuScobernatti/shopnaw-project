const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      error: "Acesso negado. Esta ação requer privilégios de administrador.",
    });
  }
};

module.exports = isAdmin;
