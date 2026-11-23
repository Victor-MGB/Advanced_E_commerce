import { Schema, model } from "mongoose";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: [4, "Too Short"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true }
);

categorySchema.post("init", function (doc) {
  const baseUrl = process.env.BASE_URL?.replace(/\/$/, "");
  if (doc.image && baseUrl && !doc.image.startsWith("http") && !doc.image.startsWith("/images/")) {
    doc.image = `${baseUrl}/category/${doc.image}`;
  }
});

export const categoryModel = model("category", categorySchema);
