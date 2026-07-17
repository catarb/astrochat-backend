import * as astroRepository from "../repositories/astro.repository.js";
import { generateSlug } from "../utils/slug.js";

const UPDATABLE_FIELDS = [
  "name",
  "type",
  "description",
  "shortDescription",
  "imageUrl",
  "scientificName",
  "distance",
  "constellation",
  "isActive",
];

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const belongsToAnotherAstro = (astro, id) =>
  astro && astro._id.toString() !== id.toString();

export const createAstro = async (data, userId) => {
  const name = data.name.trim();
  const slug = generateSlug(name);

  if (await astroRepository.findByName(name)) {
    throw createError("Ya existe un astro con ese nombre.", 409);
  }

  if (await astroRepository.findBySlug(slug)) {
    throw createError("Ya existe un astro con ese slug.", 409);
  }

  return astroRepository.create({
    ...data,
    name,
    slug,
    createdBy: userId,
  });
};

export const getAstros = (query) => {
  const parsedPage = Number.parseInt(query.page, 10);
  const parsedLimit = Number.parseInt(query.limit, 10);
  const page = Number.isNaN(parsedPage) ? 1 : Math.max(parsedPage, 1);
  const limit = Number.isNaN(parsedLimit)
    ? 10
    : Math.min(Math.max(parsedLimit, 1), 50);
  const filters = {
    type: query.type || undefined,
    isActive:
      query.isActive === "true"
        ? true
        : query.isActive === "false"
          ? false
          : undefined,
    search: query.search?.trim() || undefined,
  };

  return astroRepository.findAll(filters, { page, limit });
};

export const getAstroById = async (id) => {
  const astro = await astroRepository.findById(id);

  if (!astro) {
    throw createError("Astro no encontrado.", 404);
  }

  return astro;
};

export const getAstroBySlug = async (slug) => {
  const astro = await astroRepository.findBySlug(slug);

  if (!astro) {
    throw createError("Astro no encontrado.", 404);
  }

  return astro;
};

export const updateAstro = async (id, data) => {
  const existingAstro = await astroRepository.findById(id);

  if (!existingAstro) {
    throw createError("Astro no encontrado.", 404);
  }

  const updateData = Object.fromEntries(
    Object.entries(data).filter(([field]) => UPDATABLE_FIELDS.includes(field)),
  );

  if (Object.hasOwn(updateData, "name")) {
    const name = updateData.name.trim();
    const slug = generateSlug(name);

    if (name !== existingAstro.name) {
      const astroWithName = await astroRepository.findByName(name);

      if (belongsToAnotherAstro(astroWithName, id)) {
        throw createError("Ya existe un astro con ese nombre.", 409);
      }

      const astroWithSlug = await astroRepository.findBySlug(slug);

      if (belongsToAnotherAstro(astroWithSlug, id)) {
        throw createError("Ya existe un astro con ese slug.", 409);
      }
    }

    updateData.name = name;
    updateData.slug = slug;
  }

  const updatedAstro = await astroRepository.updateById(id, updateData);

  if (!updatedAstro) {
    throw createError("Astro no encontrado.", 404);
  }

  return updatedAstro;
};

export const deleteAstro = async (id) => {
  const astro = await astroRepository.findById(id);

  if (!astro) {
    throw createError("Astro no encontrado.", 404);
  }

  await astroRepository.deleteById(id);

  return {
    message: "Astro eliminado correctamente.",
  };
};
