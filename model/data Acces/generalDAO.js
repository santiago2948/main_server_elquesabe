const mysqlExecute = require("../../util/mysqlConnexion")

class GeneralDAO{
    static async getKnowledge(cb){
        let sql = "SELECT * FROM technicalknowledge";
        try {
            let results = await mysqlExecute(sql);
            cb(results)
        } catch (error) {
            console.log(error);
        }
    }
    static async addKnowledge(knowledges, id){
        
    }

    static async fetchTowns(cb){
        let sql= "select * from town ORDER BY name ASC"
    try {
        const results = await mysqlExecute(sql);
        cb(results);

    } catch (error) {
        console.log(error);
    }
    }

    static async insertKnowledge(knowledges, id){
        let sql = "INSERT INTO academicdegrees (idFreelancer, idTechnicalKnowledge) VALUES (?, ?);";
        try {
            knowledges.map((e)=>mysqlExecute(sql, [id, e]))
        } catch (error) {
            console.log(error);
        }
        
    }

}

module.exports= GeneralDAO;