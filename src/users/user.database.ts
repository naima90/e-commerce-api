import { v4 as random } from "uuid";
import { UnitUser, User, Users } from "./user.interface";
import bcrypt from "bcryptjs";
import fs from "fs";

const loadUsers = (): Users => {
  try {
    // read data from users file using fs module
    const data = fs.readFileSync("./users.json", "utf-8");
    // parse data as json and return it as the users object
    return JSON.parse(data);
  } catch (error) {
    // if an error occurs log it and return an empty object
    console.log(`Error: ${error}`);
    return {};
  }
};

const users: Users = loadUsers();

// saves users object to users file
const saveUsers = () => {
  try {
    // json string representation of the object users saved to user file using fs module
    fs.writeFileSync("./users.json", JSON.stringify(users), "utf-8");
    // log success if user is saved
    console.log("User saved successfully!");
  } catch (error) {
    // log error if user not saved
    console.log(`Error: ${error}`);
  }
};

// find all users
export const findAllUsers = async (): Promise<UnitUser[]> => {
  return Object.values(users);
};

// find one user
export const findUser = async (id: string): Promise<UnitUser> => {
  return users[id];
};

// create user
export const createUser = async (userData: UnitUser): Promise<UnitUser | null> => {
  let id = random();

  let checkUser = await findUser(id);

  while (checkUser) {
    id = random();
    checkUser = await findUser(id);
  }

  const salt = await bcrypt.genSalt(10);

  const hashedPassword = await bcrypt.hash(userData.password, salt);

  const user: UnitUser = {
    id: id,
    username: userData.username,
    email: userData.email,
    password: hashedPassword,
  };

  users[id] = user;

  saveUsers();

  return user;
};

// find user by email
export const findUserByEmail = async (email: string): Promise<UnitUser | null> => {
  const getAllUsers = await findAllUsers();

  const user = getAllUsers.find((result) => email === result.email);

  if (!user) {
    return null;
  }

  return user;
};

// compare password
export const comparePassword = async (email: string, password: string) => {
  const user = await findUserByEmail(email);
  const decryptPassword = await bcrypt.compare(password, user!.password);

  if (!decryptPassword) {
    return null;
  }

  return user;
};

// update a user
export const updateUser = async (id: string, updateValues: User): Promise<UnitUser | null> => {
  const userExists = await findUser(id);

  if (!userExists) {
    return null;
  }

  if (updateValues.password) {
    const salt = await bcrypt.genSalt(10);
    const newPassword = await bcrypt.hash(updateValues.password, salt);

    updateValues.password = newPassword;
  }

  users[id] = {
    ...userExists,
    ...updateValues,
  };

  saveUsers();

  return users[id];
};

// remove a user
export const removeUser = async (id: string): Promise<null | void> => {
  const user = await findUser(id);

  if (!user) {
    return null;
  }

  delete users[id];

  saveUsers();
};
