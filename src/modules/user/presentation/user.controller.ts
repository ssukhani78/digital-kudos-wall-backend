import { Request, Response } from "express";
import { RegisterUserUseCase, RegisterUserDTO } from "../application/register-user.use-case";
import { UserAlreadyExistsError } from "../domain/errors/user-already-exists.error";

export class UserController {
  constructor(private readonly registerUserUseCase: RegisterUserUseCase) {}

  async register(req: Request, res: Response): Promise<void> {
    const registerUserDto: RegisterUserDTO = req.body;

    const result = await this.registerUserUseCase.execute(registerUserDto);

    if (result.isSuccess) {
      res.status(201).send();
    } else {
      const error = result.error();
      if (error instanceof UserAlreadyExistsError) {
        res.status(409).json({ message: error.message }); // 409 Conflict
      } else if (typeof error === "string") {
        // This branch handles validation errors from Email or Password value objects
        res.status(400).json({ message: error }); // 400 Bad Request
      } else {
        res.status(500).json({ message: "An unexpected error occurred." });
      }
    }
  }
}
