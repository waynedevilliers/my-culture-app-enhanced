import asyncWrapper from '../utils/asyncWrapper.js';
import { sequelize, Event, User, Location, Image, Category, EventCategory } from "../db.js";
import { Op } from 'sequelize';
import ErrorResponse from '../utils/ErrorResponse.js';

export const findNextEvent = asyncWrapper(async (req, res) => {
  const nextEvent = await Event.findAll({
    where: {
      date: {
        [Op.gt]: new Date(),
      },
      published: true,
    },
    order: [["date", "ASC"]],
    limit: 4,
    include: [
      { model: User },
      { model: Location },
      { model: Image },
      { model: Category },
    ],
  });

  res.status(200).json(nextEvent);
});

export const findAllEvents = asyncWrapper(async (req, res) => {
  const { page, limit, offset } = res.pagination;
  const entries = await Event.findAndCountAll({
    offset,
    limit,
    order: [["date", "DESC"]],
    distinct: true,
    include: [
      { model: User, required: false },
      { model: Location, required: false },
      { model: Image, required: false },
      { model: Category, required: false },
    ],
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

  res.status(200).json({ ...paginationData, results: entries.rows });
});

export const findOneEventById = asyncWrapper(async (req, res) => {
  const {
    params: { id },
  } = req;
  const event = await Event.findByPk(id, {
    include: [
      { model: User },
      { model: Location },
      { model: Image },
      { model: Category },
    ],
  });
  res.status(200).json(event);
});

export const createEvent = asyncWrapper(async (req, res) => {
  const { body } = req;

  const result = await sequelize.transaction(async (t) => {
    const event = await Event.create({
      title: body.title,
      date: body.date,
      content: body.content,
      discountedPrice: body.discountedPrice,
      abendkassePrice: body.abendkassePrice,
      prebookedPrice: body.prebookedPrice,
      bookingLink: body.bookingLink,
      userId: req.user.id,
      imageId: body.imageId,
      locationId: body.locationId,
    }, { transaction: t });

    if (body.Categories && body.Categories.length > 0) {
      await event.setCategories(body.Categories.map(cat => cat.id), { transaction: t });
    }

    return await Event.findByPk(event.id, {
      include: [
        { model: User },
        { model: Location },
        { model: Image },
        { model: Category },
      ],
      transaction: t
    });
  });

  res.status(201).json(result);
});

export const updateEvent = asyncWrapper(async (req, res) => {
  const {
    params: { id },
    body,
  } = req;

  const result = await sequelize.transaction(async (t) => {
    const [updatedRows] = await Event.update(
      {
        title: body.title,
        date: body.date,
        content: body.content,
        conclusion: body.conclusion,
        discountedPrice: body.discountedPrice,
        abendkassePrice: body.abendkassePrice,
        prebookedPrice: body.prebookedPrice,
        bookingLink: body.bookingLink,
        published: body.published,
        userId: req.user.id,
        imageId: body.imageId,
        locationId: body.locationId,
      },
      { where: { id }, transaction: t },
    );

    if (!updatedRows) throw new ErrorResponse("Entry not found", 404);

    const event = await Event.findByPk(id, { transaction: t });
    if (body.Categories) {
      await event.setCategories(body.Categories.map(cat => cat.id), { transaction: t });
    }

    return await Event.findByPk(id, {
      include: [
        { model: User },
        { model: Location },
        { model: Image },
        { model: Category },
      ],
      transaction: t
    });
  });

  res.status(202).json(result);
});

export const deleteEvent = asyncWrapper(async (req, res) => {
  const {
    params: { id },
  } = req;

  const deleted = await Event.destroy({ where: { id } });
  if (!deleted) throw new ErrorResponse("Entry not found", 404);
  await EventCategory.destroy({ where: { EventId: id } });

  const responseMessage = { message: `Entry with id ${id} was deleted successfully` };
  res.status(200).json(responseMessage);
});