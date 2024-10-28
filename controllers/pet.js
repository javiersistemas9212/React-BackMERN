
const Pet = require("../models/pet");

const create = (req, res) => {

    const petinfo = req.body;

    if (!petinfo.name || !petinfo.price || !petinfo.type) {
        return res.status(400).json({
            status: "error",
            message: "Faltan datos por enviar",
        });
    }

    let pet_to_save = new Pet(petinfo);

    pet_to_save.save().then((petStored) => {

        // añadido
        petStored.toObject();

        // Devolver resultado
        return res.status(200).json({
            status: "success",
            message: "Mascota registrado correctamente",
            pet: petStored
        });

    }).catch((err) => {
        return res.status(400).json({
            status: "error",
            mensaje: "No se ha guardado la mascota",
            error: err
        });
    });
}


const update = async (req, res) => {

    const petinfo = req.body;
    
   
    if (!petinfo.name || !petinfo.price || !petinfo.type) {
        return res.status(400).json({
            status: "error",
            message: "Faltan datos por enviar",
        });
    }

    let petUpdated = await Pet.findByIdAndUpdate({ _id: petinfo.id }, petinfo, { new: true });

    if (!petUpdated) {
        return res.status(400).json({ status: "error", message: "Error al actualizar" });
    }
    
        // Devolver resultado
        return res.status(200).json({
            status: "success",
            message: "Mascota registrada correctamente",
            pet: petUpdated
        });
}

const deletebyId = async (req, res) => {

    const idPet = req.params.id;
    
    let petDeleted =  await Pet.deleteOne({ _id: idPet });

    if (!petDeleted) {
        return res.status(400).json({ status: "error", message: "Error al eliminar" });
    }    
        // Devolver resultado
        return res.status(200).json({
            status: "success",
            message: "Mascota eliminada correctamente"
        });

}

const petbyId = (req, res) => {
    const idPet = req.params.id;
    
    Pet.findById(idPet).then((petfind) => {
        
        return res.status(200).json({
            status: "success",
            pet: petfind      
        });  

    }).catch((err) => {
        return res.status(500).json({
            status: "error",
            message: "Error al buscar la mascota",
            error: err      
        });   
    });
}

const listPets = (req,res) => {

     Pet.find().then((petsinfo) => {

        return res.status(200).json({
            status: "success",
            pets: petsinfo      
        });   

     }).catch((err) => {
        return res.status(500).json({
            status: "error",
            message: "Error al buscar las mascotas",
            error: err      
        });   

     });

}

module.exports = {
    create,
    update,
    deletebyId,
    petbyId,
    listPets
}