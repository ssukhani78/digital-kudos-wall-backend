import { Request, Response } from "express";
import { RegisterUserUseCase, RegisterUserDTO } from "../application/register-user.use-case";

export class UserController {
  constructor(private readonly registerUserUseCase: RegisterUserUseCase) {}

  async register(req: Request, res: Response): Promise<Response | void> {
    const registerUserDto: RegisterUserDTO = req.body;

    const result = await this.registerUserUseCase.execute(registerUserDto);

    if (result.isSuccess) {
      const user = result.getValue();
      res.status(201).json({
        id: user.id.toString(),
        name: user.name,
        email: user.email.value,
      });
    } else {
      const error = result.error();

      if (error?.constructor?.name === "UserAlreadyExistsError") {
        return res.status(409).json({ message: (error as Error).message });
      } else if (typeof error === "string") {
        return res.status(400).json({ message: error });
      } else {
        return res.status(500).json({ message: "An unexpected error occurred." });
      }
    }
  }
}
