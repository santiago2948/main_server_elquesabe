const GeneralDAO = require("../model/data Acces/generalDAO");

exports.fetchCityes = (req, res, next)=>{
    GeneralDAO.fetchTowns((results)=>{
        res.json(results);
    })
    
}


exports.fetchKnowledge = (req, res, next)=>{
    GeneralDAO.getKnowledge((data)=>{
        res.json(data);
    })
    
}