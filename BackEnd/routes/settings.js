const express = require("express");
const router = express.Router();
const settingsController = require("../controllers/settingsController");

router.get("/", settingsController.GetAllSettings);
router.get("/:key", settingsController.GetSettingByKey);
router.put("/", settingsController.PutSetting);

module.exports = router;
