import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../db.js";
import asyncWrapper from "../utils/asyncWrapper.js";
import ErrorResponse from "../utils/ErrorResponse.js";

export const register = asyncWrapper(async (req, res) => {
  const {
    body: {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      role,
      newsletter,
    },
  } = req;

  if (newsletter === null) {
    throw new ErrorResponse("Newsletter should be true or false", 400);
  }

  const found = await User.findOne({ where: { email } });

  if (found) throw new ErrorResponse("User Already Exist", 409);

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    phoneNumber,
    role,
    newsletter,
  });

  res.json(user);
});

export const login = asyncWrapper(async (req, res) => {
  const {
    body: { email, password },
  } = req;

  const user = await User.scope("withPassword").findOne({ where: { email } });

  if (!user)
    throw new ErrorResponse("Forbidden. Invalid email or password", 403);

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch)
    throw new ErrorResponse("Forbidden. Invalid email or password", 403);

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    newsletter: user.newsletter,
    phoneNumber: user.phoneNumber,
  };

  if (!process.env.SECRET) {
    throw new ErrorResponse("JWT secret not configured", 500);
  }

  const token = jwt.sign(payload, process.env.SECRET, {
    expiresIn: "1h",
  });

  res.json({ user: payload, token });
});

export const getProfile = asyncWrapper(async (req, res) => {
  const {
    user: { id },
  } = req;
  const user = await User.findByPk(id);
  res.json(user);
});

export const findAllUsers = asyncWrapper(async (req, res) => {
  const { page, limit, offset } = res.pagination;
  const entries = await User.findAndCountAll({
    offset,
    limit,
    order: [["id", "ASC"]],
  });

  const totalCount = entries.count;
  const totalPages = Math.ceil(totalCount / limit);

  const paginationData = {
    totalCount,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };

  res.json({ ...paginationData, results: entries.rows });
});

export const findOneUser = asyncWrapper(async (req, res) => {
  const {
    params: { id },
  } = req;
  const entry = await User.findByPk(id);
  res.json(entry);
});

export const updateUser = asyncWrapper(async (req, res) => {
  const {
    body,
  } = req;

  const [updated] = await User.update(body, {
    where: { id: req.user.id },
  });

  if (!updated) {
    throw new ErrorResponse("Entry not found", 404);
  }
  const updatedEntry = await User.findByPk(req.user.id);
  res.status(202).json(updatedEntry);
});

export const checkPassword = asyncWrapper(async (req, res, next) => {
  const {
    body: { password, newPassword },
  } = req;

  if (!password) return next();

  const entry = await User.scope("withPassword").findByPk(req.user.id);
  if (!entry) {
    throw new ErrorResponse("Entry not found", 404);
  }

  const isMatch = await bcrypt.compare(password, entry.password);

  if (!isMatch) {
    throw new ErrorResponse("Forbidden. Invalid password", 403);
  }

  req.body.password = await bcrypt.hash(newPassword, 10);
  next();
});