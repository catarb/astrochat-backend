import Astro from "../models/astro.model.js";

const escapeRegularExpression = (text) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const create = (astroData) => Astro.create(astroData);

export const findAll = async (filters, pagination) => {
  const query = {};

  if (filters.type) {
    query.type = filters.type;
  }

  if (typeof filters.isActive === "boolean") {
    query.isActive = filters.isActive;
  }

  if (filters.search) {
    const searchExpression = new RegExp(
      escapeRegularExpression(filters.search),
      "i",
    );
    query.$or = [
      { name: searchExpression },
      { shortDescription: searchExpression },
      { description: searchExpression },
    ];
  }

  const { page, limit } = pagination;
  const skip = (page - 1) * limit;
  const [astros, total] = await Promise.all([
    Astro.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Astro.countDocuments(query),
  ]);

  return {
    astros,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const findById = (id) => Astro.findById(id);

export const findBySlug = (slug) => Astro.findOne({ slug });

export const findByName = (name) => Astro.findOne({ name });

export const updateById = (id, updateData) =>
  Astro.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

export const deleteById = (id) => Astro.findByIdAndDelete(id);
