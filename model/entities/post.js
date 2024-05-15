

class Post{
    constructor(json, img){
        this.description= json.description;
        this.title= json.title;
        this.idClient= json.idClient;
        this.img= img;
        this.adress=json.place;
        this.idCity=json.city;
    }
}

module.exports = Post;