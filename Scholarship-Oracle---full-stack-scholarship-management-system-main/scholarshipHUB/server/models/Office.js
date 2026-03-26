const mongoose = require("mongoose");

const officeSchema = new mongoose.Schema({
  officeName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const Office = mongoose.model("Office", officeSchema);
module.exports = Office;
