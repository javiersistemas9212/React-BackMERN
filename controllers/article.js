
const Article = require("../models/article");
const fs = require("fs");
const path = require("path");

const create = async(req, res) => {

    const artinfo = req.body;

    if (!artinfo.name || !artinfo.price || !artinfo.amount  || !artinfo.desc) {
        return res.status(400).json({
            status: "error",
            message: "Faltan datos por enviar",
        });
    }

    let art_to_save = new Article(artinfo);

    await art_to_save.save().then((artStored) => {
        
        // añadido
        artStored.toObject();

        // Devolver resultado
        return res.status(200).json({
            status: "success",
            message: "Articulo registrado correctamente",
            article: artStored
        });

    }).catch((err) => {
        console.log(err);
        return res.status(400).json({
            status: "error",
            mensaje: "No se ha guardado el articulo",
            error: err
        });
    });
}


const update = async (req, res) => {

    const artinfo = req.body;    
   
    if (!artinfo.name || !artinfo.price || !artinfo.amount  || !artinfo.desc) {
        return res.status(400).json({
            status: "error",
            message: "Faltan datos por enviar",
        });
    }

    let artUpdated = await Article.findByIdAndUpdate({ _id: artinfo.id }, artinfo, { new: true });

    if (!artUpdated) {
        return res.status(400).json({ status: "error", message: "Error al actualizar" });
    }
    
        // Devolver resultado
        return res.status(200).json({
            status: "success",
            message: "Articulo registrada correctamente",
            article: artUpdated
        });
}

const deletebyId = async (req, res) => {

    const idArt = req.params.id;
    
    let artDeleted =  await Article.deleteOne({_id : idArt});

    if (!artDeleted) {
        return res.status(400).json({ status: "error", message: "Error al eliminar" });
    }    
    

        // Devolver resultado
        return res.status(200).json({
            status: "success",
            message: "Articulo eliminado correctamente",
            artDeleted
        });

}

const upload = async(req, res) => {
    // Sacar publication id
    const articleId = req.params.id;

    // Recoger el fichero de imagen y comprobar que existe
    if (!req.file) {
        return res.status(404).send({
            status: "error",
            message: "Petición no incluye la imagen"
        });
    }

    // Conseguir el nombre del archivo
    let image = req.file.originalname;

    // Sacar la extension del archivo
    const imageSplit = image.split("\.");
    const extension = imageSplit[1];

    // Comprobar extension
    if (extension != "png" && extension != "jpg" && extension != "jpeg" && extension != "gif") {
        // Borrar archivo subido
        const filePath = req.file.path;
        const fileDeleted = fs.unlinkSync(filePath);

        // Devolver respuesta negativa
        return res.status(400).send({
            status: "error",
            message: "Extensión del fichero invalida"
        });
    }

    
    // Si si es correcta, guardar imagen en bbdd
    await Article.findOneAndUpdate({ _id: articleId }, { image: req.file.filename }, { new: true }).then((artUpdated)=>{
       
        artUpdated.toObject();

       if (!artUpdated) {
            return res.status(400).json({ status: "error", message: "Error al actualizar el articulo" });
        }
        
            // Devolver respuesta
            return res.status(200).send({
                status: "success",
                //: artUpdated,
                file: req.file,
            });
        
    
    });       
  
}



const articlebyId = (req, res) => {
    const idArt = req.params.id;
    
    Article.findById(idArt).then((artfind) => {
        
        return res.status(200).json({
            status: "success",
            article: artfind      
        });  

    }).catch((err) => {
        return res.status(500).json({
            status: "error",
            message: "Error al buscar el articulo",
            error: err      
        });   
    });
}

const media = (req, res) => {
    // Sacar el parametro de la url
    const file = req.params.file;

    // Montar el path real de la imagen
    const filePath = "./uploads/articles/" + file;

    // Comprobar que existe
    fs.stat(filePath, (error, exists) => {

        if (!exists) {
            return res.status(404).send({
                status: "error",
                message: "No existe la imagen"
            });
        }

        console.log(path.resolve(filePath));
        // Devolver un file
        return res.sendFile(path.resolve(filePath));
    });

}



const listArticles = (req,res) => {

     Article.find().then((artsinfo) => {
        
        return res.status(200).json({
            status: "success",
            articles: artsinfo      
        });   

     }).catch((err) => {
        return res.status(500).json({
            status: "error",
            message: "Error al buscar los articulos",
            error: err      
        });   

     });
}

module.exports = {
    create,
    update,
    deletebyId,
    articlebyId,
    listArticles,
    upload,
    media
}