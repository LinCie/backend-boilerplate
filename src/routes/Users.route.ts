import bcrypt from "bcrypt";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Router } from "express";
import { User } from "../database/entities/User.entity";
import { getEm } from "../database/getEm";
import { CreateUserDto } from "../dtos/users/create-user.dto";
import { UpdateUserDto } from "../dtos/users/update-user.dto";

const route = Router();

route.post("/", async (req, res) => {
  try {
    const body = plainToInstance(CreateUserDto, req.body);

    const errors = await validate(body);
    if (errors.length > 0) {
      res.status(400).json(errors);
      return;
    }

    const hash = await bcrypt.hash(body.password, 10);

    const user = new User(body.username, hash);

    const em = await getEm();
    await em.persistAndFlush(user);

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
});

route.get("/", async (req, res) => {
  try {
    const em = await getEm();

    const users = await em.findAll(User);

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json(error);
  }
});

route.get("/:id", async (req, res) => {
  try {
    const em = await getEm();

    const user = await em.findOne(User, { id: req.params.id });

    if (!user) {
      res.status(404).send();
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
});

route.patch("/:id", async (req, res) => {
  try {
    const body = plainToInstance(UpdateUserDto, req.body);

    const errors = await validate(body);
    if (errors.length > 0) {
      res.status(400).json(errors);
      return;
    }

    const em = await getEm();

    const user = await em.findOne(User, { id: req.params.id });
    if (!user) {
      res.status(404).send();
      return;
    }

    em.assign(user, body);
    await em.flush();

    res.status(204).send();
  } catch (error) {
    res.status(500).json(error);
  }
});

route.delete("/:id", async (req, res) => {
  try {
    const em = await getEm();

    const user = await em.findOne(User, { id: req.params.id });

    if (!user) {
      res.status(404).send();
      return;
    }

    await em.removeAndFlush(user);
    res.status(204).send();
  } catch (error) {
    res.status(500).json(error);
  }
});

export default route;
