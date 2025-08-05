import { Request, Response, NextFunction } from "express";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

export const validateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authtoken as string;

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Authorization header missing or invalid",
    });
    return;
  }

  // const token = authHeader.substring(7); // Remove "Bearer " prefix

  try {
    // Decode base64 token (format: userId:expiryTime)
    const decodedToken = Buffer.from(token, "base64").toString("utf-8");
    const [userId, expiryTime] = decodedToken.split(":");

    if (!userId || !expiryTime) {
      res.status(401).json({
        success: false,
        message: "Invalid token format",
      });
      return;
    }

    // Check if token is expired
    const currentTime = Date.now();
    const tokenExpiryTime = parseInt(expiryTime, 10);

    if (currentTime > tokenExpiryTime) {
      res.status(401).json({
        success: false,
        message: "Token expired",
      });
      return;
    }

    // Set user information in request
    req.user = { id: userId };
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
    return;
  }
};
