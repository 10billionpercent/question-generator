import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { z } from "zod";
import { config } from "../config";
import { requireAuth } from "../middleware/auth";
import { UserModel } from "../models/user.model";

const router: Router = Router();

const signupSchema = z.object({
  name: z.string().trim().min(1),
  emailOrPhone: z.string().trim().min(3),
  institutionName: z.string().trim().min(1),
  password: z.string().min(8),
});

const loginSchema = z.object({
  emailOrPhone: z.string().trim().min(3),
  password: z.string().min(1),
});

const serializeUser = (user: {
  _id: unknown;
  name: string;
  emailOrPhone: string;
  institutionName: string;
}) => ({
  id: String(user._id),
  name: user.name,
  emailOrPhone: user.emailOrPhone,
  institutionName: user.institutionName,
});

const signToken = (user: {
  _id: unknown;
  name: string;
  emailOrPhone: string;
  institutionName: string;
}) =>
  jwt.sign(
    {
      userId: String(user._id),
      name: user.name,
      emailOrPhone: user.emailOrPhone,
      institutionName: user.institutionName,
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn as SignOptions["expiresIn"] },
  );

router.post("/signup", async (req: Request, res: Response) => {
  try {
    const input = signupSchema.parse(req.body);
    const emailOrPhone = input.emailOrPhone.toLowerCase();

    const existing = await UserModel.findOne({ emailOrPhone });
    if (existing) {
      return res.status(409).json({ error: "Account already exists" });
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await UserModel.create({
      name: input.name,
      emailOrPhone,
      institutionName: input.institutionName,
      passwordHash,
    });

    return res.status(201).json({
      token: signToken(user),
      user: serializeUser(user),
    });
  } catch (error: any) {
    if (error.issues) {
      return res
        .status(400)
        .json({ error: "Validation failed", details: error.issues });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const input = loginSchema.parse(req.body);
    const emailOrPhone = input.emailOrPhone.toLowerCase();

    const user = await UserModel.findOne({ emailOrPhone });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const passwordOk = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordOk) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    return res.json({
      token: signToken(user),
      user: serializeUser(user),
    });
  } catch (error: any) {
    if (error.issues) {
      return res
        .status(400)
        .json({ error: "Validation failed", details: error.issues });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/me", requireAuth, (req: Request, res: Response) => {
  return res.json({ user: req.authUser });
});

export { router as authRouter };
