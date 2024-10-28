const express = require("express");
const router = express.Router();
const multer = require("multer");
const ArticleContoller = require("../controllers/article");
const check = require("../helpers/middlewares/auth");

// Configuracion de subida
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/articles/")
    },
    filename: (req, file, cb) => {
        cb(null, Date.now()+"-"+file.originalname);
    }
});

const uploads = multer({storage});

// Definir rutas
router.post("/create", ArticleContoller.create);
router.put("/update", ArticleContoller.update);
router.delete("/delete/:id", ArticleContoller.deletebyId);
router.get("/articlebyid/:id", ArticleContoller.articlebyId);
router.get("/img/:file", ArticleContoller.media);
router.post("/upload/:id", [uploads.single("file0")], ArticleContoller.upload);
router.get("/list", ArticleContoller.listArticles);


// Exportar router
module.exports = router;