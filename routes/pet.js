const express = require("express");
const router = express.Router();
const multer = require("multer");
const PetContoller = require("../controllers/pet");
const check = require("../helpers/middlewares/auth");

// Configuracion de subida
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/pets/")
    },
    filename: (req, file, cb) => {
        cb(null, "pet-"+Date.now()+"-"+file.originalname);
    }
});

const uploads = multer({storage});

// Definir rutas
router.post("/create", PetContoller.create);
router.put("/update", PetContoller.update);
router.delete("/delete/:id", PetContoller.deletebyId);
router.get("/petbyid/:id", PetContoller.petbyId);
router.get("/list", PetContoller.listPets);


// Exportar router
module.exports = router;