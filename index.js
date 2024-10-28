// Importar dependencias
const connection = require("./database/connection");
const express = require("express");
const cors = require("cors");

// Mensaje bienvenida
console.log("API NODE para tienda de mascotas!!");

// Conexion a bbdd
connection();

// Crear servidor node
const app = express();
const puerto = 3900;

// Configurar cors
app.use(cors());

// Convertir los datos del body a objetos js
app.use(express.json());
app.use(express.urlencoded({extended: true})); 

// Cargar conf rutas
const UserRoutes = require("./routes/user");
const PetRoutes = require("./routes/pet");
const ArticleRoutes = require("./routes/article");

app.use("/api/user", UserRoutes);
app.use("/api/pet", PetRoutes);
app.use("/api/article", ArticleRoutes);



// Poner servidor a escuchar peticiones http
app.listen(puerto, () => {
    console.log("Servidor de node corriendo en el puerto: ", puerto);
});