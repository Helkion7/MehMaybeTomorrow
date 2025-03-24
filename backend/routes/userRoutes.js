const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const verifyJWT = require("../middleware/verifyJWT");

// Protect all user routes
router.use(verifyJWT);

// Routes for user operations
router.put("/profile", userController.updateProfile);
router.put("/password", userController.changePassword);
router.delete("/account", userController.deleteAccount);

module.exports = router;
