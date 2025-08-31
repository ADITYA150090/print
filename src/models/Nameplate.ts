import mongoose, { Schema, model, models } from "mongoose";

const NameplateSchema = new Schema({
  logo: { type: String, required: true },
  background: { type: String, required: true },
  language: { type: String, required: true },
  font: { type: String, required: true },
  houseName: { type: String, required: true },
  ownerName: { type: String, required: true },
  address: { type: String, required: true },
  styles: {
    houseName: { fontSize: Number, color: String, x: Number, y: Number },
    ownerName: { fontSize: Number, color: String, x: Number, y: Number },
    address: { fontSize: Number, color: String, x: Number, y: Number },
  },
  officerName: { type: String, required: true }, // new field
  email: { type: String, required: true },       // new field
}, { timestamps: true });

const Nameplate = models.Nameplate || model("Nameplate", NameplateSchema);
export default Nameplate;
