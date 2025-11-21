const express = require("express");
const router = express.Router();

const {
  registerOwner,
  loginOwner,
  getOwnerProfile,
  updateOwner,
  deleteOwnerAccount,
  addPropertyToOwner,
  removePropertyFromOwner
} = require("./controller.js");

const { verifyLogin , verifyOwner } = require("./middleware.js")

// ---------- PUBLIC ROUTES ----------
router.post("/register", registerOwner);
router.post("/login", loginOwner);

// ---------- OWNER PROTECTED ROUTES ----------
router.get("/profile", verifyLogin, verifyOwner, getOwnerProfile);
router.put("/profile", verifyLogin, verifyOwner, updateOwner);
router.delete("/profile", verifyLogin, verifyOwner, deleteOwnerAccount);

// ---------- MODIFY OWNER PROPERTY LIST ----------
router.post("/property/add", verifyToken, verifyOwner, addPropertyToOwner);
router.post("/property/remove", verifyToken, verifyOwner, removePropertyFromOwner);

module.exports = router;
