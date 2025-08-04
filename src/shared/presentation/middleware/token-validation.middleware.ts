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
) => {
  try {
    const token: string = req.headers.authtoken as string;

    if (!token) {
      return res.status(401).json({
        message: "authToken in headers is required",
      });
    }

    const validation = validateTokenLogic(token);


    // if (authHeader.startsWith("Bearer ")) {
    //   // Extract token from "Bearer <token>" format
    //   token = authHeader.substring(7);
    // } else {
    //   // Try to use the header value directly as a base64 token
    //   token = authHeader;
    // }

    // const validation = validateTokenLogic(token);

    if (!validation.isValid) {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }

    // Set user information in request
    req.user = {
      id: validation.userId,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Authentication failed",
    });
  }
};

// Pure validation logic (no HTTP concerns)
function validateTokenLogic(token: string): {
  userId: string;
  isValid: boolean;
} {
  try {
    // Decode the base64 token using Buffer
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [userId, expiryTimeStr] = decoded.split(":");

    if (!userId || !expiryTimeStr) {
      return { userId: "", isValid: false };
    }

    const expiryTime = parseInt(expiryTimeStr, 10);
    const currentTime = Date.now();

    if (currentTime > expiryTime) {
      return { userId: "", isValid: false };
    }

    return { userId, isValid: true };
  } catch (error) {
    return { userId: "", isValid: false };
  }
}
