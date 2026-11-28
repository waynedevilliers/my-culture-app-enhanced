import asyncWrapper from "../utils/asyncWrapper.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import { Subscriber, User } from "../db.js";
import { sendVerificationEmail } from "../utils/newsletter.js";
import jwt from 'jsonwebtoken';

export const subscribeSubscriber = asyncWrapper(async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  let user = null;
  if (token) {
    const decoded = jwt.verify(token, process.env.SECRET);
    user = await User.findByPk(decoded.id);
  }

  if (!user) {
    const { email } = req.body;
    if (!email) {
        throw new ErrorResponse("Invalid request", 400);
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ErrorResponse("This email belongs to a user, please log in", 400);
    }

    const existingSubscriber = await Subscriber.findOne({ where: { email } });
    if (existingSubscriber) {
        throw new ErrorResponse("This email is already subscribed", 400);
    }
    const newSubscriber = await Subscriber.create({ email });
    const savedSubscriber = await newSubscriber.save();

    await sendVerificationEmail(email, savedSubscriber.id);
    res.status(200).json({ message: "Subscriber created successfully", email: email });
  } else {
    const { email } = user

    console.log(user.email)

    const existingSubscriber = await Subscriber.findOne({ where: { email } });
      if (existingSubscriber) {
        throw new ErrorResponse("This email is already subscribed", 400);
    }

    user.newsletter = true;
    await user.save();
    const newSubscriber = await Subscriber.create({ email, status: "active" });
    await newSubscriber.save();

    res.status(200).json({ message: "Subscriber created successfully", email: email });
  }
});

export const unsubscribeSubscriber = asyncWrapper(async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  let user = null;
  if (token) {
    const decoded = jwt.verify(token, process.env.SECRET);
    user = await User.findByPk(decoded.id);
  }

  if (!user) {
    const { id, email } = req.query;
      if (!id || !email) {
        throw new ErrorResponse("Invalid request", 400);
      }

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new ErrorResponse("This email belongs to a user, please log in", 400);
      }

      const existingSubscriber = await Subscriber.findOne({ where: { id, email } });
      if(!existingSubscriber) {
        throw new ErrorResponse("Subscriber not found", 404);
      }

      await existingSubscriber.destroy();
      res.status(200).send("Successfully unsubscribed!");
  } else {
    const { email } = user

    const existingSubscriber = await Subscriber.findOne({ where: { email } });
      if(!existingSubscriber) {
        throw new ErrorResponse("Subscriber not found", 404);
      }

      await existingSubscriber.destroy();
      user.newsletter = false;
      await user.save();
      res.status(200).json({ message: "Successfully unsubscribed!", email: email });
  }
});

export const verifySubscriber = asyncWrapper(async (req, res) => {
  const { id, email } = req.query;
  if (!id || !email) {
    throw new ErrorResponse("Invalid request", 400);
  }

  const existingSubscriber = await Subscriber.findOne({ where: { id, email } });
  if(!existingSubscriber) {
    throw new ErrorResponse("Subscriber not found", 404);
  }

  if (existingSubscriber.status === "active") {
    throw new ErrorResponse("Subscriber already verified", 400);
  }

  existingSubscriber.status = "active";
  await existingSubscriber.save();
  res.status(200).send("Subscriber verified successfully");
});