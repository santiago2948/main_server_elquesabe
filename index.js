const bodyParser = require("body-parser");
const path = require("path");
const express = require("express");
const session= require("express-session");
const cors = require("cors");
const app = express();

//routes
const userRoutes = require("./routes/users");
const generalRoutes=require("./routes/general")
const postRoutes = require("./routes/post");
const reviewRoutes = require("./routes/review")


app.use(session({
    secret:"tu_secreto",
    resave: false,
    saveUninitialized: true
}))

// Middleware de body-parser para analizar datos de formularios
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
// Ruta de inicio
app.use(userRoutes);
app.use(generalRoutes);
app.use(postRoutes);
app.use(reviewRoutes);
// Iniciar el servidor
app.listen(3200);
