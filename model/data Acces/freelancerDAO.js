const mysqlExecute = require("../../util/mysqlConnexion");
const fs = require("fs");
const fs2 = require("fs").promises;
const bcrypt = require("bcrypt");
const sharp = require("sharp");
const GeneralDAO = require("./generalDAO");
const { response } = require("express");

// Esta función envuelve la función fs.readFile en una promesa para uso asíncrono
const readFileAsync = async (path) => {
    try {
        return await fs2.readFile(path);
    } catch (error) {
        throw error;
    }
};
const { error } = require("console");

const hashPassword = async (password) => {
  const saltRounds = 10; // Número de rondas de salado
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

const comparePassword = async (password, hashedPassword, cb) => {
  try {
    const match = await bcrypt.compare(password, hashedPassword);
    cb(match);
  } catch (error) {
    // Manejar el error, si ocurre
    console.error("Error al comparar contraseñas:", error);
    return false;
  }
};

class FreelancerDAO {
  static async createFreelancer(free, cb) {
    let sql =
      "INSERT INTO freelancer (idFreelancer, `name`, phoneNumber,cellphone,adress, email, `password`, idCity, `description`, profilePhoto) VALUES (?,?,?,?,?,?,?,?,?,?);";
    const password = await hashPassword(free.password);
    const knowledge = free.technickKnowledge;
    let link = free.profilePhoto;
    const values = [
      free.idCard,
      free.name,
      free.telphone,
      free.cellphone,
      free.adress,
      free.email,
      password,
      parseFloat(free.idCity),
      free.description,
    ];
    let fileContent = null;

    try {
      if (link !== null) {
        fileContent = await sharp(link)
          .resize({ width: 800 })
          .jpeg({ quality: 80 })
          .toBuffer();
      }
      values.push(fileContent);
      const results = await mysqlExecute(sql, values);
      cb({ result: true, user: {} });
      GeneralDAO.insertKnowledge(knowledge, free.idCard);
    } catch (err) {
      console.log(err);
      cb({ result: false });
    }

    if (link !== null) {
      fs.unlink(link, (error) => {
        if (error) {
          console.error("Error deleting file:", error);
        } else {
          console.log("File deleted successfully.");
        }
      });
    }
  }

  static async fetchAll(p, cb) {
    let sql =
      p.city !== "00"
        ? "select f.idFreelancer, f.name , t.name city, f.description, f.profilePhoto, f.url from freelancer f left join town t using (idCity) where f.idCity=?"
        : "select f.idFreelancer, f.name , t.name city, f.description, f.profilePhoto, f.url from freelancer f left join town t using (idCity)";
    try {
      const results =
        p.city !== "00"
          ? await mysqlExecute(sql, [parseFloat(p.city)])
          : await mysqlExecute(sql);
      results.map((freelancer) => {
        if (freelancer.profilePhoto) {
          let photo = freelancer.profilePhoto.toString("base64");
          freelancer["profilePhoto"] = photo;
        }
      });
      cb(results);
    } catch (err) {
      console.log(error)
      cb({ result: false });
    }
  }
  static async fetchAll(p, cb) {
    let sql =
      p.city !== "00"
        ? "select f.idFreelancer, f.name , t.name city, f.description, f.profilePhoto from freelancer f left join town t using (idCity) where f.idCity=?"
        : "select f.idFreelancer, f.name , t.name city, f.description, f.profilePhoto from freelancer f left join town t using (idCity)";
    try {
      const results =
        p.city !== "00"
          ? await mysqlExecute(sql, [parseFloat(p.city)])
          : await mysqlExecute(sql);
      results.map((freelancer) => {
        if (freelancer.profilePhoto) {
          let photo = freelancer.profilePhoto.toString("base64");
          freelancer["profilePhoto"] = photo;
        }
      });
      cb(results);
    } catch (err) {
      console.log(err);
      cb({ result: false });
    }
  }

  static async fetchByKeyword(p, cb) {
    let sql =
      p.city !== "00"
        ? "select f.idFreelancer, f.name name, t.name city, f.description, f.profilePhoto FROM freelancer f left join town t using (idCity) WHERE idCity=? and description LIKE ? or f.name like ? "
        : "select f.idFreelancer, f.name name, t.name city, f.description, f.profilePhoto FROM freelancer f left join town t using (idCity) WHERE description LIKE ? or f.name like ? ";
    try {
      const results =
        p.city !== "00"
          ? await mysqlExecute(sql, [
              parseFloat(p.city),
              `%${p.keyword}%`,
              `%${p.keyword}%`,
            ])
          : await mysqlExecute(sql, [`%${p.keyword}%`, `%${p.keyword}%`]);
      results.map((freelancer) => {
        if (freelancer.profilePhoto) {
          let photo = freelancer.profilePhoto.toString("base64");
          freelancer["profilePhoto"] = photo;
        }
      });
      cb(results);
    } catch (err) {
      console.log(err);
      cb({ result: false });
    }
  }
  static async userExist(json, cb) {
    let sql = "select * from  freelancer where idFreelancer=?";
    try {
      const res = await mysqlExecute(sql, [json.idCard]);
      this.emailExist(json, (e) => {
        if (e.length === 0 && res.length === 0) {
          cb({ result: true });
        } else {
          if (e.length !== 0) {
            cb({ result: false, error: "Email registrada anteriormente." });
          } else {
            cb({ result: false, error: "Cedula registrada anteriormente." });
          }
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  static async emailExist(json, cb) {
    let sql = "select * from  freelancer where  email=?";
    try {
      const res = await mysqlExecute(sql, [json.email]);
      cb(res);
    } catch (error) {
      console.log(error);
    }
  }

  static async fetchById(id, cb) {
    let sql =
      "SELECT idFreelancer, name, description, cellphone, email, importantInfo, profilePhoto, rut, curriculum, eps FROM freelancer WHERE idFreelancer = ?";
    try {
      const response = await mysqlExecute(sql, [id]);
      const user = response[0];

      // Convertir blobs a URLs de datos base64 si existen
      if (user.profilePhoto) {
        user.profilePhoto = user.profilePhoto.toString("base64");
      }
      if (user.rut) {
        user.rut = user.rut.toString("base64");
      }
      if (user.curriculum) {
        user.curriculum = user.curriculum.toString("base64");
      }
      if (user.eps) {
        user.eps = user.eps.toString("base64");
      }

      // Obtener títulos de conocimientos académicos y agregarlos a la respuesta
      sql =
        "SELECT title FROM academicdegrees JOIN technicalknowledge USING(idTechnicalKnowledge) WHERE idFreelancer = ?";
      const knowledge = await mysqlExecute(sql, [id]);
      const knowledgeList = knowledge.map((e) => e.title).join(", ");
      user["knowledge"] = knowledgeList;

      cb(user);
    } catch (error) {
      console.log(error);
    }
  }
  

  static async updateById(formData) {
    const {
        id,
        name,
        description,
        cellphone,
        email,
        importantInfo,
        profilePhoto,
        curriculum,
        rut,
        eps,
        password,
    } = formData;

    
    let fileContents = {};

    // Verificar y procesar los archivos adjuntos
    if (profilePhoto) {
        fileContents.profilePhoto = await sharp(profilePhoto)
            .resize({ width: 800 })
            .jpeg({ quality: 80 })
            .toBuffer();
    }
    if (curriculum) {
        fileContents.curriculum = await readFileAsync(curriculum);
    }
    if (rut) {
        fileContents.rut = await readFileAsync(rut);
    }
    if (eps) {
        fileContents.eps = await readFileAsync(eps);
    }

    // Consulta SQL para actualizar el perfil
    let sql = `UPDATE freelancer SET
                name = ?,
                description = ?,
                cellphone = ?,
                email = ?,
                importantInfo = ?`;

    const params = [
        name,
        description,
        cellphone,
        email,
        importantInfo,
    ];

    // Agregar campos de archivos al SQL y parámetros
    if (profilePhoto) {
        sql += ", profilePhoto = ?";
        params.push(fileContents.profilePhoto);
    }
    if (curriculum) {
        sql += ", curriculum = ?";
        params.push(fileContents.curriculum);
    }
    if (rut) {
        sql += ", rut = ?";
        params.push(fileContents.rut);
    }
    if (eps) {
        sql += ", eps = ?";
        params.push(fileContents.eps);
    }

    sql += " WHERE idFreelancer = ?";

    params.push(id);

    try {
        // Ejecutar la consulta SQL
        await mysqlExecute(sql, params);

        // Eliminar archivos temporales
        if (profilePhoto) {
            fs.unlink(profilePhoto, (error) => {
                if (error) {
                    console.error("Error deleting profile photo file:", error);
                } else {
                    console.log("Profile photo file deleted successfully.");
                }
            });
        }
        if (curriculum) {
            fs.unlink(curriculum, (error) => {
                if (error) {
                    console.error("Error deleting curriculum file:", error);
                } else {
                    console.log("Curriculum file deleted successfully.");
                }
            });
        }
        if (rut) {
            fs.unlink(rut, (error) => {
                if (error) {
                    console.error("Error deleting rut file:", error);
                } else {
                    console.log("Rut file deleted successfully.");
                }
            });
        }
        if (eps) {
            fs.unlink(eps, (error) => {
                if (error) {
                    console.error("Error deleting eps file:", error);
                } else {
                    console.log("Eps file deleted successfully.");
                }
            });
        }

        // Actualización de la contraseña si es necesario
        if (password) {
            const hashedPassword = hashPassword(password);
            sql = "UPDATE freelancer SET password = ? WHERE idFreelancer = ?";
            await mysqlExecute(sql, [hashedPassword, id]);
        }

        console.log("Perfil actualizado correctamente.");
    } catch (error) {
        console.error("Error al actualizar el perfil:", error);
    }
  }

  static async logIn(json, cb){
    let sql = "SELECT name, idFreelancer idCard, email, idCity, adress, password from freelancer where email = ?";
    try{
        const response = await mysqlExecute(sql, [ json.email]);
        if (response.length === 0) {
            cb({login: false});    
        } else{
            comparePassword(json.password, response[0]["password"], (match)=>{
            if(match) {
                let user = response[0];
                user["user"]="1";
                user["password"]=null;
                cb({login : true, user : user})
            } else {
                cb({login: false});
            }
            });
            
        } 
    } catch (error){
        console.log(error);
    }
}
static async logIn(json, cb) {
let sql =
  "SELECT name, idFreelancer idCard, email, idCity, adress, password from freelancer where email = ?";
try {
  const response = await mysqlExecute(sql, [json.email]);
  if (response.length === 0) {
    cb({ login: false });
  } else {
    comparePassword(json.password, response[0]["password"], (match) => {
      if (match) {
        let user = response[0];
        user["user"] = "1";
        user["password"] = null;
        cb({ login: true, user: user });
      } else {
        cb({ login: false });
      }
    });
  }
} catch (error) {
  console.log(error);
}
}

static async getProfilephotoById(id, cb) {
let sql = "select profilePhoto from  freelancer where  idFreelancer=?";
try {
  const res = await mysqlExecute(sql, [id]);
  if (res[0].profilePhoto) {
    let photo = res[0].profilePhoto.toString("base64");
    cb({ profilePhoto: photo, response: true });
  } else {
    cb({ response: false });
  }
} catch (error) {
  console.log(error);
}
}

static async progressiveProfiling(json, cb) {
const values = [json.tools, json.preferredBrands, json.id];

let sql = "UPDATE freelancer SET tools = ?, preferredBrands = ? WHERE idFreelancer = ?";

try {
  const res = await mysqlExecute(sql, values);
  
  const updatedRows = res.affectedRows;

  const success = updatedRows > 0;

  cb({ success });
} catch (error) {
  console.log(error);
  cb({ success: false });
}
}


static async checkPreferences(id, cb) {
let sql =
  "SELECT tools, preferredBrands FROM freelancer WHERE idFreelancer =?";
try {
  const res = await mysqlExecute(sql, [id]);

  if(res[0].tools && res[0].preferredBrands){
    cb({response: true});
  }else{
    cb({response: false});
  }

} catch (error) {
  console.log(error);
}
}

static async addPreviousWork(formValues, cb) {
const {
  idFreelancer,
  title,
  description,
  date,
  img
} = formValues;

let fileContent = {};

try {

  let sql = `INSERT INTO previouswork (idFreelancer, title, description, date) VALUES (?, ?, ?, ?)`;
  let params = [idFreelancer, title, description, date];

  const res = await mysqlExecute(sql, params);

  // Obtener el idPreviousWork asignado automáticamente
  const idPreviousWork = res.insertId;

  if (img) {

    fileContent.img = await sharp(img)
      .resize({ width: 800 })
      .jpeg({ quality: 80 })
      .toBuffer();

    let imgSql = `INSERT INTO imagespw (idPreviousWork, image) VALUES (?, ?)`;
    let imgParams = [idPreviousWork, fileContent.img];

    await mysqlExecute(imgSql, imgParams);

    if (img) {
      fs.unlink(img, (error) => {
          if (error) {
              console.error("Error deleting profile photo file:", error);
          } else {
              console.log("Profile photo file deleted successfully.");
          }
      });
    }
  }

  cb({response: true});
  }catch (error) {
  console.log(error);
  cb({response: false});
  }
}

static async fetchPortfolio(id, cb) {
  try {
    let sql = "SELECT * FROM previouswork WHERE idFreelancer = ?";
    const previousWorks = await mysqlExecute(sql, [id]);

    let portfolio = [];

    for (let work of previousWorks) {
      sql = "SELECT image FROM imagespw WHERE idPreviousWork = ?";
      const images = await mysqlExecute(sql, [work.idPreviousWork]);

      let portfolioItem = {
        idPreviousWork: work.idPreviousWork,
        title: work.title,
        description: work.description,
        date: work.date,
        img: null
      };
      // Si hay una imagen, convertirla a base64
      if (images.length > 0) {
        const imageBlob = images[0].image;
        const base64Image = imageBlob.toString('base64');
        portfolioItem.img = base64Image;
      }

      // Añadir el objeto al array de trabajos previos con imágenes
      portfolio.push(portfolioItem);
    }

    cb(portfolio);
  } catch (error) {
    console.log(error);
    cb(error, null);
  }
}

static async editPreviousWork(formValues, cb) {
  const {
    idPreviousWork,
    title,
    description,
    date,
    img
  } = formValues;
  
  let fileContent = {};
  
  try {
    // Verificar si ya existe una imagen para el trabajo previo
    let imgSql = `SELECT COUNT(*) AS count FROM imagespw WHERE idPreviousWork = ?`;
    let imgParams = [idPreviousWork];
    let imgResult = await mysqlExecute(imgSql, imgParams);
    let imgExists = imgResult[0].count > 0;

    if (imgExists) {
      // Si existe una imagen, actualizarla
      fileContent.img = await sharp(img)
        .resize({ width: 800 })
        .jpeg({ quality: 80 })
        .toBuffer();
  
      let updateImgSql = `UPDATE imagespw SET image = ? WHERE idPreviousWork = ?`;
      let updateImgParams = [fileContent.img, idPreviousWork];
  
      await mysqlExecute(updateImgSql, updateImgParams);
    } else {
      // Si no existe una imagen, insertarla
      fileContent.img = await sharp(img)
        .resize({ width: 800 })
        .jpeg({ quality: 80 })
        .toBuffer();
  
      let insertImgSql = `INSERT INTO imagespw (idPreviousWork, image) VALUES (?, ?)`;
      let insertImgParams = [idPreviousWork, fileContent.img];
  
      await mysqlExecute(insertImgSql, insertImgParams);
    }

    // Actualizar la información del trabajo previo
    let sql = `UPDATE previouswork SET title = ?, description = ?, date = ? WHERE idPreviousWork = ?`;
    let params = [title, description, date, idPreviousWork];
    await mysqlExecute(sql, params);

    cb({ response: true });
  } catch (error) {
    console.error("Error al editar el trabajo previo:", error);
    cb({ response: false });
  }
}


}

module.exports = FreelancerDAO;
