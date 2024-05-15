const express = require("express");
const postControllers = require("../controllers/postControllers");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

router.post("/create-post",upload.single("img"), postControllers.createPost)

router.post("/get-posts", postControllers.fetchPost);

module.exports= router;