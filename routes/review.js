const express = require("express");
const reviewControllers = require("../controllers/reviewControllers")


const router = express.Router();

router.post("/create-review", reviewControllers.createRanking);

router.post("/average-rank", reviewControllers.averageRanking);

router.post("/select-reviews", reviewControllers.selectedReview);


module.exports = router;