const express = require("express");
const router = express.Router();
const usersController = require("../controller/usersController");
const { body } = require("express-validator");
const authMiddleware = require("../middlewares/authMiddleware");


router.post("/signup", body('email').isEmail(),
    body('password').isLength({min: 3, max: 32}),
    usersController.signup);


router.post("/login", usersController.login);
router.post("/logout", usersController.logout);
router.get("/refresh", usersController.refresh);
router.get("/activate/:link", usersController.activateEmail);
router.get("/", [authMiddleware, usersController.getAll]);
router.get("/:id", usersController.getOne);
router.patch("/:id", usersController.updateUser);
router.delete("/:id", usersController.deleteUser);



module.exports = router;