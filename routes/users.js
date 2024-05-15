const express= require("express");
const usersControllers = require("../controllers/userControllers")
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Configuración para la ruta /edit-profile
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

const uploadEditProfile = multer({storage: storage});


router.post("/sign-up", upload.single('photo'), usersControllers.SignUp);

router.post("/getFreelancers", usersControllers.getFreelancer);

router.post("/user_exist", usersControllers.verifyUserExistence);

router.post("/view-profile",usersControllers.viewProfile);

router.post("/edit-profile", uploadEditProfile.fields([
    { name: "photo", maxCount: 1 },
    { name: "curriculum", maxCount: 1 },
    { name: "rut", maxCount: 1 },
    { name: "eps", maxCount: 1 },
]), usersControllers.editProfile);

router.post("/log-in", usersControllers.logIn);

router.post("/profile-photo", usersControllers.fetchPhoto);

router.post("/verify-email", usersControllers.verifyEmail)

router.post("/recovery-pass", usersControllers.recoveryPass)

router.post("/getTokenInfo", usersControllers.getTokenInfo)

router.post("/change-pass", usersControllers.updatePassword) 

router.post("/verify-email", usersControllers.verifyEmail)

router.post("/recovery-pass", usersControllers.recoveryPass)

router.post("/getTokenInfo", usersControllers.getTokenInfo)

router.post("/change-pass", usersControllers.updatePassword) 

router.post("/freelancer-preferences",usersControllers.progressiveProfiling);

router.post("/check-preferences",usersControllers.checkPreferences);

router.post("/add-previouswork", upload.single('img'), usersControllers.addPreviousWork);

router.post("/get-previouswork", usersControllers.fetchPortfolio);

router.post("/edit-previouswork", upload.single('img'), usersControllers.editPreviousWork);

module.exports= router;

