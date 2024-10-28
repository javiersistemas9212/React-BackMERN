// Importar dependencias y modulos
const bcrypt = require("bcrypt");
const mongoosePagination = require("mongoose-pagination");
const fs = require("fs");
const path = require("path");

// Importar modelos
const User = require("../models/user");

// Importar servicios
const jwt = require("../services/jwt");
//const followService = require("../services/followService");
const validate = require("../helpers/validate");


// Regristro de usuarios
const register = (req, res) => {
    // Recoger datos de la peticion
    let params = req.body;

    // Comprobar que me llegan bien (+ validacion)
    if (!params.name || !params.email || !params.password || !params.nick) {
        return res.status(400).json({
            status: "error",
            message: "Faltan datos por enviar",
        });
    }

    // Validación avanzada
    try {
        validate(params);
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Valición no superada",
        });
    }

    // Control usuarios duplicados
    let query = User.find({
        $or: [
            { email: params.email },
            { nick: params.nick }
        ]
    });

    query.then(async (userbyparams) => {

        if (userbyparams.length > 0) {
            return res.status(400).send({
                status: "error",
                message: "El usuario ya existe..."
            });
        }

        // Cifrar la contraseña
        let pwd = await bcrypt.hash(params.password, 10);
        params.password = pwd;

        // Crear objeto de usuario
        let user_to_save = new User(params);

        // Guardar usuario en la bbdd
        await user_to_save.save().then((userStored) => {

            // añadido
            userStored.toObject();
            delete userStored.password;
            delete userStored.role;

            // Devolver resultado
            return res.status(200).json({
                status: "success",
                message: "Usuario registrado correctamente",
                user: userStored
            });

        }).catch((err) => {
            return res.status(400).json({
                status: "error",
                message: "No se ha guardado el usuario",
                error: err
            });
        });
    }).catch((err) => {
        return res.status(400).json({
            status: "error",
            message: "No se ha encontrado el usuario",
            error: err
        });
    });
}

const login = (req, res) => {
    // Recoger parametros body
    let params = req.body;

    if (!params.email || !params.password) {
        return res.status(400).send({
            status: "error",
            message: "Faltan datos por enviar."
        });
    }

    // Buscar en la bbdd si existe
    User.findOne({ email: params.email })
        //.select({ "password": 0 })
        .then((user) => {

            // Comprobar su contraseña
            const pwd = bcrypt.compareSync(params.password, user.password);

            if (!pwd) {
                return res.status(400).send({
                    status: "error",
                    message: "No te has identificado correctamente"
                })
            }

            // Conseguir Token
            const token = jwt.createToken(user);

            // Devolver Datos del usuario
            return res.status(200).send({
                status: "success",
                message: "Te has identificado correctamente",
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    nick: user.nick
                }
            });
        }).catch((err) => {
            return res.status(400).json({
                status: "error",
                mensaje: "No se ha autenticado",
                error: err
            });
        });
}

const profile = (req, res) => {
    // Recibir el parametro del id de usuario por la url
    const id = req.params.id;

    User.findById(id)
        .select({ password: 0, role: 0 })
        .then(async (userProfile) => {


            // Devolver el resultado 
            return res.status(200).send({
                status: "success",
                user: userProfile
            });

        }).catch((err) => {
            return res.status(400).json({
                status: "error",
                mensaje: "No se ha obtenido los datos del usuario",
                error: err
            });
        });

}

const list = (req, res) => {
    // Controlar en que pagina estamos
    let page = 1;
    if (req.params.page) {
        page = req.params.page;
    }
    page = parseInt(page);

    // Consulta con mongoose paginate
    let itemsPerPage = 5;

    User.find().select("-password -email -role -__v").sort('_id').paginate(page, itemsPerPage, async (error, users, total) => {

        if (error || !users) {
            return res.status(404).send({
                status: "error",
                message: "No hay usuarios disponibles",
                error
            });
        }
    });
}

const update = (req, res) => {
    // Recoger info del usuario a actualizar
    let userIdentity = req.user;
    let userToUpdate = req.body;

    // Eliminar campos sobrantes
    delete userToUpdate.iat;
    delete userToUpdate.exp;
    delete userToUpdate.role;
    delete userToUpdate.image;

    // Comprobar si el usuario ya existe
    User.find({
        $or: [
            { email: userToUpdate.email.toLowerCase() },
            { nick: userToUpdate.nick.toLowerCase() }
        ]
    }).then(async (users) => {

        let userIsset = false;
        users.forEach(user => {
            if (user && user._id != userIdentity.id) userIsset = true;
        });

        if (userIsset) {
            return res.status(200).send({
                status: "error",
                message: "El usuario ya existe"
            });
        }

        // Cifrar la contraseña
        if (userToUpdate.password) {
            let pwd = await bcrypt.hash(userToUpdate.password, 10);
            userToUpdate.password = pwd;

        } else {
            delete userToUpdate.password;
        }

        // Buscar y actualizar 
        try {
            let userUpdated = await User.findByIdAndUpdate({ _id: userIdentity.id }, userToUpdate, { new: true });

            if (!userUpdated) {
                return res.status(400).json({ status: "error", message: "Error al actualizar" });
            }

            // Devolver respuesta
            return res.status(200).send({
                status: "success",
                message: "Metodo de actualizar usuario",
                user: userUpdated
            });

        } catch (error) {
            return res.status(500).send({
                status: "error",
                message: "Error al actualizar",
            });
        }

    }).catch((err) => {
        return res.status(400).json({
            status: "error",
            mensaje: "No se han actualizado los datos del usuario",
            error: err
        });
    });
}

const upload = (req, res) => {

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
        fs.unlinkSync(filePath);

        // Devolver respuesta negativa
        return res.status(400).send({
            status: "error",
            message: "Extensión del fichero invalida"
        });
    }

    // Si si es correcta, guardar imagen en bbdd
    User.findOneAndUpdate({ _id: req.user.id }, { image: req.file.filename }, { new: true }).then((userUpdated) => {

        // Devolver respuesta
        return res.status(200).send({
            status: "success",
            user: userUpdated,
            file: req.file,
        });

    }).catch((err) => {
        return res.status(400).json({
            status: "error",
            mensaje: "No se han actualizado los archivos del usuario",
            error: err
        });
    });

}

const avatar = (req, res) => {
    // Sacar el parametro de la url
    const file = req.params.file;

    // Montar el path real de la imagen
    const filePath = "./uploads/avatars/" + file;

    // Comprobar que existe
    fs.stat(filePath, (error, exists) => {

        if (!exists) {
            return res.status(404).send({
                status: "error",
                message: "No existe la imagen"
            });
        }

        // Devolver un file
        return res.sendFile(path.resolve(filePath));
    });

}


// Exportar acciones
module.exports = {
    register,
    login,
    profile,
    list,
    update,
    upload,
    avatar
}