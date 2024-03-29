import {
  UserExists,
  authPayloadVerification,
  validateRequest,
} from "@samoznew/common";
import { Router } from "express";
import { body } from "express-validator";
import { createUser, isUserExist } from "../services";
import { passwordManager } from "../utils";
const route = Router();

route.post(
  "/signup",
  ...authPayloadVerification,
  body("passwordConfirmation").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Password confirmation does not match password");
    }
    return true;
  }),
  validateRequest,
  async (req, res) => {
    const { email, password } = req.body;
    const userExists = await isUserExist(email);

    if (userExists) {
      throw new UserExists(email);
    }

    const user = await createUser(email, password);
    const jwt = passwordManager.generateJWT(user);

    req.session = {
      ...req.session,
      jwt,
    };
    return res.status(201).send({
      data: user.toJSON(),
    });
  }
);

export { route as signupRoute };
