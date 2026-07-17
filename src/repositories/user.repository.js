import User from "../models/user.model.js";

export const findByEmail = (email, includePassword = false) => {
  const query = User.findOne({ email });

  return includePassword ? query.select("+password") : query;
};

export const findById = (id) => User.findById(id);

export const findByVerificationToken = (token) =>
  User.findOne({ verificationToken: token }).select(
    "+verificationToken +verificationTokenExpires",
  );

export const create = (userData) => User.create(userData);

export const save = (user) => user.save();
