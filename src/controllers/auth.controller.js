import * as authService from "../services/auth.service.js";

export const register = async (req, res, next) => {
  try {
    const { user, message } = await authService.registerUser(req.body);

    res.status(201).json({
      success: true,
      message,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { message } = await authService.verifyEmail(req.params.token);

    res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { user, token, message } = await authService.loginUser(req.body);

    res.status(200).json({
      success: true,
      message,
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
};
