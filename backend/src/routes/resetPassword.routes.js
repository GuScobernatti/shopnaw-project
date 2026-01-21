const { Router } = require("express");
const LoginRepository = require("../repositories/loginRepository");
const resetPasswordRoutes = Router();
const loginRepository = new LoginRepository();

resetPasswordRoutes.post("/forgot-password", async (req, res) => {
  await loginRepository.forgotPassword(req, res);
});

resetPasswordRoutes.post("/reset-password", async (req, res) => {
  await loginRepository.resetPassword(req, res);
});

module.exports = resetPasswordRoutes;
