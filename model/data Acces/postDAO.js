const mysqlExecute = require("../../util/mysqlConnexion");
const sharp = require("sharp");
const fs= require("fs");
const { resolve } = require("path");

class PostDAO{
    static async createPost(post, cb){
        let values= [
        post.description,
        post.title,
        post.idClient,
        post.idCity,
        post.adress
    ];

    let link= post.img;
    let fileContent=null;
    try {
        if (link !== null) {
          fileContent = await sharp(link)
            .resize({ width: 800 })
            .jpeg({ quality: 80 })
            .toBuffer();
        }
      } catch (err) {
        console.error(err);
      }
    let sql= " INSERT INTO contractoffer (description, title, idClient, idCity, adress) VALUES (?,?,?,?,?)";
    let imgSql= "INSERT INTO imegesco (image, idContractoffer) VALUES (?,?)"
    try {
        let res= await mysqlExecute(sql, values);
        if(fileContent) mysqlExecute(imgSql, [fileContent, res.insertId]);
        cb({result: true});
    } catch (error) {
        console.log(error);
        cb({result: false});
    }
    
        try {
            if (link !== null) {
            fs.unlink(link, (error) => {
                if (error) {
                  console.error("Error deleting file:", error);
                } else {
                  console.log("File deleted successfully.");
                }
              });
            }
        } catch (error) {
            console.log(error);
        }
      
    }
    
    static async fetchAll(city, cb){
        let sql=city?"select idContractoffer, c.description, title, idClient, l.name, t.name city, c.idCity, c.adress from contractoffer c join client l using(idClient) join town t on t.idCity= c.idCity WHERE c.idCity=?" : 
        "select idContractoffer, c.description, title, idClient, l.name, t.name city, c.idCity, c.adress from contractoffer c join client l using(idClient) join town t on t.idCity= c.idCity";
        try {
            const response =city? await mysqlExecute(sql, [parseFloat(city)]) : await mysqlExecute(sql);
            for (let i = 0; i < response.length; i++) {
                await new Promise(async (resolve)=>{
                    sql= "select image from imegesco where idContractoffer=?";
                    let res= await mysqlExecute(sql, response[i].idContractoffer);
                    if(res.length>0){
                        response[i]["img"]= res[0].image.toString("base64");
                    }else{
                        response[i]["img"]=null;
                    }
                    resolve()
                })
            }
            cb(response);
        } catch (error) {
            console.log(error);
        }

    }

    static async fetchByKeyword(city, search, cb){
        let sql = city ?
        "SELECT idContractoffer, c.description, title, idClient, l.name, t.name AS city FROM contractoffer c JOIN client l USING(idClient) JOIN town t ON c.idCity=t.idCity WHERE c.idCity = ? AND c.description LIKE ?" :
        "SELECT idContractoffer, c.description, title, idClient, l.name, t.name AS city FROM contractoffer c JOIN client l USING(idClient) JOIN town t ON c.idCity=t.idCity WHERE c.description LIKE ?";
        const descriptionValue = `%${search}%`;
        try {
            const response =city? await mysqlExecute(sql, [parseFloat(city), descriptionValue]) : await mysqlExecute(sql,[descriptionValue]);
            for (let i = 0; i < response.length; i++) {
                await new Promise(async (resolve)=>{
                    sql= "select image from imegesco where idContractoffer=?";
                    let res= await mysqlExecute(sql, response[i].idContractoffer);
                    if(res.length>0){
                        response[i]["img"]= res[0].image.toString("base64");
                    }else{
                        response[i]["img"]=null;
                    }
                    resolve()
                })
            }
            cb(response);
        } catch (error) {
            console.log(error);
        }
        
    }
}

module.exports= PostDAO;