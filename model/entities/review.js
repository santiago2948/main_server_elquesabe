

class Review{
    constructor(json){
        this.idContract = json.idContract;
        this.clientScore = json.clientScore;
        this.clientComment = json.clientComent;
    }
}
module.exports = Review;