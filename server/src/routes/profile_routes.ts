import express from "express";
import type { Router } from "express";
import { authMiddleware } from "../middleware/verifyToken.ts";
import {
  Editprofilepassword,
  GetAmount,
  //   GetHistory,
} from "../controllers/profile_controller.ts";

const profile: Router = express.Router();
profile.put("/change", authMiddleware, Editprofilepassword);

profile.get("/amount", authMiddleware, GetAmount);

export default profile;
