// import { Request, Response, NextFunction } from "express";

// export interface AuthenticatedRequest extends Request {
//   user?: {
//     id: string;
//   };
// }

// export const authenticateUser = (
//   req: AuthenticatedRequest,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader) {
//       return res.status(401).json({
//         message: "Authorization header required",
//       });
//     }

// //       if (!authHeader.startsWith("Bearer ")) {
// //         try {
// //           // Try to decode as base64 token directly
// //           Buffer.from(authHeader, "base64").toString("utf-8");
// //           // If successful, use the token as-is
// //           return next();
// //         } catch {
// //           return res.status(401).json({
// //             message: "Invalid authorization format",
// //           });
// //         }
// //       }

// //       const token = authHeader.substring(7); // Remove "Bearer " prefix
// //       const validation = authService.validateToken(token);

// //       if (!validation.isValid) {
// //         return res.status(401).json({
// //           message: "Invalid or expired token",
// //         });
// //       }

// //       // Set user information in request
// //       req.user = {
// //         id: validation.userId,
// //       };

// //       next();
// //     } catch (error) {
// //       return res.status(401).json({
// //         message: "Authentication failed",
// //       });
// //     }
// //   };
// // };
