const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const DeviceSchema = new mongoose.Schema({
  device_id: { type: String, default: uuidv4, unique: true },
  browser_info: { type: String, required: true },
  OS: { type: String, required: true },
  type: { type: String, required: true },
  email: { type: String, required: true, ref: "Voter" },
  ethereum_address: { type: String, required: true, ref: "Voter" },
  login_time: { type: Date, default: Date.now },
});

const Device = mongoose.model("Device", DeviceSchema);
module.exports = Device;
