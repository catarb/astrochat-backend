import mongoose from "mongoose";

export const ASTRO_TYPES = [
  "star",
  "planet",
  "moon",
  "galaxy",
  "nebula",
  "black-hole",
  "comet",
  "asteroid",
  "cluster",
  "other",
];

const astroSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    type: {
      type: String,
      required: true,
      enum: ASTRO_TYPES,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 1500,
    },
    shortDescription: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 250,
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    scientificName: {
      type: String,
      trim: true,
      maxlength: 150,
      default: null,
    },
    distance: {
      type: String,
      trim: true,
      maxlength: 150,
      default: null,
    },
    constellation: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

astroSchema.index({ type: 1 });
astroSchema.index({ isActive: 1 });

const Astro = mongoose.model("Astro", astroSchema);

export default Astro;
