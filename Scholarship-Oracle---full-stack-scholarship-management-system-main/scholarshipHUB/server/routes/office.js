const express = require("express");
const router = express.Router();

const OFFICE_USER = "Alvas";
const OFFICE_PASS = "Alvas12345";

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === OFFICE_USER && password === OFFICE_PASS) {
    return res.json({ success: true, role: "office" });
  }

  return res.status(401).json({ success: false });
});

module.exports = router;
