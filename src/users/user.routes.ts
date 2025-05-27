import express, { Request, Response } from "express";
import * as database from "./user.database";
import { UnitUser } from "./user.interface";
import { StatusCodes } from "http-status-codes";

export const userRouter = express.Router();

userRouter.get("/users", async (req: Request, res: Response) => {
  try {
    const users: UnitUser[] = await database.findAllUsers();

    if (!users) {
      res.status(StatusCodes.NOT_FOUND).json({ msg: "No users at this time.." });
      // fixes error No overload matches this call.
      return;
    }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
    return;
  }
});

userRouter.get("/user/:id", async (req: Request, res: Response) => {
  try {
    const user: UnitUser = await database.findUser(req.params.id);

    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({ error: `User not found!` });
      return;
    }

    res.status(StatusCodes.OK).json({ user });
    return;
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
    return;
  }
});

userRouter.post("/register", async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: `Please provide all the required parameters..` });
      return;
    }

    const user = await database.findUserByEmail(email);

    if (user) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: `This email has already been registered..` });
      return;
    }

    const newUser = await database.createUser(req.body);

    res.status(StatusCodes.CREATED).json({ newUser });
    return;
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
    return;
  }
});

userRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: `Please provide all the required parameters..` });
      return;
    }

    const user = await database.findUserByEmail(email);

    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "No user exists with the email provided.." });
      return;
    }

    const comparePassword = await database.comparePassword(email, password);

    if (!comparePassword) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: `Incorrect Password!` });
      return;
    }

    res.status(StatusCodes.OK).json({ user });
    return;
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
    return;
  }
});

userRouter.put("/user/:id", async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(401).json({ error: `Please provide all the required parameters..` });
      return;
    }

    const getUser = await database.findUser(req.params.id);

    if (!getUser) {
      res.status(404).json({ error: `No user with id ${req.params.id}` });
      return;
    }

    const updateUser = await database.updateUser(req.params.id, req.body);

    res.status(201).json({ updateUser });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
    return;
  }
});

userRouter.delete("/user/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const user = await database.findUser(id);

    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({ error: `User does not exist` });
      return;
    }

    await database.removeUser(id);

    res.status(StatusCodes.OK).json({ msg: "User deleted" });
    return;
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
    return;
  }
});
