const Owner = require("../models/owner");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


exports.registerOwner = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await Owner.findOne({ where: { email } });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const owner = await Owner.create({
      name,
      email,
      password_hash: hashed,
      property_ids: []
    });

    res.status(201).json({ message: "Owner registered", owner });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.loginOwner = async (req, res) => {
  try {
    const { email, password } = req.body;

    const owner = await Owner.findOne({ where: { email } });
    if (!owner) return res.status(404).json({ message: "Owner not found" });

    const match = await bcrypt.compare(password, owner.password_hash);
    if (!match) return res.status(401).json({ message: "Incorrect password" });

    const token = jwt.sign(
      { id: owner.id, role: "owner" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getOwnerProfile = async (req, res) => {
  try {
    const owner = await Owner.findByPk(req.user.id);
    res.json(owner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateOwner = async (req, res) => {
  try {
    const owner = await Owner.findByPk(req.user.id);
    if (!owner) return res.status(404).json({ message: "Owner not found" });

    await owner.update(req.body);

    res.json({ message: "Profile updated", owner });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteOwnerAccount = async (req, res) => {
  try {
    const owner = await Owner.findByPk(req.user.id);
    if (!owner) return res.status(404).json({ message: "Owner not found" });

    await owner.destroy();

    res.json({ message: "Owner account deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addPropertyToOwner = async (req, res) => {
  try {
    const { property_id } = req.body;
    const owner = await Owner.findByPk(req.user.id);

    if (!owner) return res.status(404).json({ message: "Owner not found" });

    const arr = owner.property_ids || [];

    if (arr.includes(property_id))
      return res.status(400).json({ message: "Property already added" });

    arr.push(property_id);
    owner.property_ids = arr;
    await owner.save();

    res.json({ message: "Property added", property_ids: owner.property_ids });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.removePropertyFromOwner = async (req, res) => {
  try {
    const { property_id } = req.body;
    const owner = await Owner.findByPk(req.user.id);

    if (!owner) return res.status(404).json({ message: "Owner not found" });

    const arr = owner.property_ids || [];

    owner.property_ids = arr.filter((id) => id !== property_id);
    await owner.save();

    res.json({ message: "Property removed", property_ids: owner.property_ids });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
