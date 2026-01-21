const { body, validationResult } = require("express-validator");

const signUpValidationRules = [
  body("name")
    .notEmpty()
    .withMessage("Nome é obrigatório.")
    .isLength({ min: 2 })
    .withMessage("Nome deve conter pelo menos 2 caracteres."),

  body("email")
    .notEmpty()
    .withMessage("Email é obrigatório.")
    .isEmail()
    .withMessage("Email inválido."),

  body("password")
    .notEmpty()
    .withMessage("Senha é obrigatória.")
    .isLength({ min: 8 })
    .withMessage("Mínimo de 8 caracteres.")
    .matches(/[A-Z]/)
    .withMessage("Deve conter pelo menos uma letra maiúscula.")
    .matches(/[a-z]/)
    .withMessage("Deve conter pelo menos uma letra minúscula.")
    .matches(/[0-9]/)
    .withMessage("Deve conter pelo menos um número.")
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage("Deve conter pelo menos um caractere especial."),
];

const signInValidationRules = [
  body("email")
    .notEmpty()
    .withMessage("Email é obrigatório.")
    .isEmail()
    .withMessage("Email inválido."),

  body("password").notEmpty().withMessage("Senha é obrigatória."),
];

const resetPasswordValidationRules = [
  body("newPassword")
    .notEmpty()
    .withMessage("A nova senha é obrigatória.")
    .isLength({ min: 8 })
    .withMessage("Mínimo de 8 caracteres.")
    .matches(/[A-Z]/)
    .withMessage("Deve conter pelo menos uma letra maiúscula.")
    .matches(/[a-z]/)
    .withMessage("Deve conter pelo menos uma letra minúscula.")
    .matches(/[0-9]/)
    .withMessage("Deve conter pelo menos um número.")
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage("Deve conter pelo menos um caractere especial."),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Erro de validação",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

module.exports = {
  signUpValidationRules,
  signInValidationRules,
  resetPasswordValidationRules,
  validate,
};
