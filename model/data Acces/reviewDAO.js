const mysqlExecute = require("../../util/mysqlConnexion");

class ReviewDAO {
    static async giveRanking(rank, cb){
        console.log(rank)
        let values =[
            rank.idContract,
            rank.clientScore+1,
            rank.clientComment
        ];

        let sql = "INSERT INTO review (estimateId, clientScore, clientComment) VALUES (?,?,?)";
        try{
            let res= await mysqlExecute(sql, values);
            cb({result: true});
        } catch(error){
            console.log(error)
            cb({result:false})
        }
    }

    static async averageRank(id, cb){
        let sql = "SELECT AVG(clientScore) AS Promedio_Ranking FROM review r, freelancer f WHERE f.idFreelancer = ? ";
        try{
            let res = await mysqlExecute(sql, [id]);
            const promedio = res[0].Promedio_Ranking;
            cb({result: true, data: promedio.toFixed(2)});
        }catch(error){
            console.error("Error al hacer la consulta", error)
            cb({result: false})
            console.log(error);
            cb({result:false})
        }
    }

    static async selectReviews(id,cb){
        let sql = "SELECT r.clientScore, r.clientComment from review r left join estimate e using(estimateId) where e.idFreelancer=?";
        try{
            const rows = await mysqlExecute(sql, [id]);
            cb({result: true, data: rows});
        }catch(error){
            console.error("Error al ejecutar la consulta:", error);
            cb({result: false});
        }
    }
}

module.exports=ReviewDAO;