import express from "express";
import * as SystemControllers from "../controllers/system_controllers"

const router = express.Router();

router.post("/init", SystemControllers.systemInit);

router.get("/initFile", SystemControllers.initFromFile);
router.get("/status", SystemControllers.isLoggedIn);
router.get("/healthcheck", SystemControllers.getIsSystemUp);
router.get("/newtoken", SystemControllers.startNewSession);    // usage: stores/newtoken


export default router;
