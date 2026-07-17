import * as astroService from "../services/astro.service.js";

export const create = async (req, res, next) => {
  try {
    const astro = await astroService.createAstro(req.body, req.user._id);

    res.status(201).json({
      success: true,
      message: "Astro creado correctamente.",
      data: { astro },
    });
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const { astros, total, page, limit, totalPages } =
      await astroService.getAstros(req.query);

    res.status(200).json({
      success: true,
      data: {
        astros,
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const astro = await astroService.getAstroById(req.params.id);

    res.status(200).json({
      success: true,
      data: { astro },
    });
  } catch (error) {
    next(error);
  }
};

export const getBySlug = async (req, res, next) => {
  try {
    const astro = await astroService.getAstroBySlug(req.params.slug);

    res.status(200).json({
      success: true,
      data: { astro },
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const astro = await astroService.updateAstro(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "Astro actualizado correctamente.",
      data: { astro },
    });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const { message } = await astroService.deleteAstro(req.params.id);

    res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
};
