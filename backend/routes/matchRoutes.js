const express = require("express");
const { getMatchScore } = require("../controllers/matchController");

const router = express.Router();

router.post("/", getMatchScore);

module.exports = router;
