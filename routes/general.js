const express = require("express");
const GeneralControllers= require("../controllers/generalControllers");

const router = express.Router();

router.post("/knowledge", GeneralControllers.fetchKnowledge)


router.post("/towns", GeneralControllers.fetchCityes);


module.exports= router;