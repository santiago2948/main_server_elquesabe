const mysqlExecute = require("../../util/mysqlConnexion");
const fs = require("fs");
const bcrypt = require('bcrypt');
const sharp = require("sharp");



const hashPassword = async (password) => {
    const saltRounds = 10; // Número de rondas de salado
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  };

  const comparePassword = async (password, hashedPassword, cb) => {
    try {
      const match = await bcrypt.compare    (password, hashedPassword);
      cb(match);
    } catch (error) {
      // Manejar el error, si ocurre
      console.error("Error al comparar contraseñas:", error);
      return false;
    }
  }; 

class ClientDAO {
  static async createClient(client, cb) {
    let sql =
      "INSERT INTO client (idClient, `name`, phoneNumber,cellphone,adress, email, `password`, idCity, `description`, profilePhoto ) VALUES (?,?,?,?,?,?,?,?,?,?);";
    const password = await hashPassword(client.password);
    let link = client.profilePhoto; 
    let fileContent = null;
    const values = [
      client.idCard,
      client.name,
      client.telphone,
      client.cellphone,
      client.adress,
      client.email,
      password,
      parseFloat(client.idCity),
      client.description,
    ];
    try {
      if (link !== null) {
        fileContent = await sharp(link)
          .resize({ width: 800 })
          .jpeg({ quality: 80 })
          .toBuffer();
      }
      values.push(fileContent);
      const results = await mysqlExecute(sql, values);
      cb({ result: true });
    } catch (err) {
      console.error(err);
      cb({ result: false });
    }

    if (link !== null) {
      try {
        fs.unlink(link, (error) => {
            if (error) {
              console.error("Error deleting file:", error);
            } else {
              console.log("File deleted successfully.");
            }
          });
      } catch (error) {
          console.log(error);
      }
    }
  }
  static async userExist(json, cb) {
    let sql = "select * from  client where idClient=?";
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
    } catch (error) {}
  }

  static async emailExist(json, cb) {
    let sql = "select * from  client where  email=?";
    try {
      const res = await mysqlExecute(sql, [json.email]);
      cb(res);
    } catch (error) {
      console.log(error);
    }
  }

  static async fetchById(id, cb) {
    let sql =
      "select name, cellphone, adress, email, description, profilePhoto from client where idClient=?";
    try {
      const response = await mysqlExecute(sql, [id]);
      response.map((e) => {
        if (e.profilePhoto) {
          let photo = e.profilePhoto.toString("base64");
          e["profilePhoto"] = photo;
        }
      });
      let user = response[0];
      cb(user);
    } catch (error) {
      console.log(error);
    }
  }

  static async updatePassword(data, cb) {

    let sql = "UPDATE client SET password = ? WHERE email = ?";
    let hashedPassword = await hashPassword(data.password)

    try{  
      console.log(hashedPassword)
        const res = await mysqlExecute(sql, [hashedPassword, data.email])
        if (res.affectedRows > 0){
          cb(true)
        } else {
          cb(false)
        }
    } catch (error){
      console.log(error);
    }
  }

  static async logIn(json, cb) {
    let sql =
      "SELECT name, idClient idCard, email, idCity, password, adress from client where email = ?";
    try {
      const response = await mysqlExecute(sql, [json.email]);
      if (response.length === 0) {
        cb({ login: false });
      } else {
        comparePassword(json.password, response[0]["password"], (match) => {
          if (match) {
            let user = response[0];
            user["user"] = "2";
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
static async getProfilePhotoById(json, cb){
    let {id} =json;
    let sql= "select profilePhoto from  client where  idClient=?";
    try {
        const res= await mysqlExecute(sql, [id]);
        if(res[0].profilePhoto){
            let photo= res[0].profilePhoto.toString("base64");
            cb({profilePhoto: photo, response: true});
        }else{
            cb({response: false});
        }
        
    } catch (error) {
        console.log(error);
    }
}
}

module.exports= ClientDAO;