
 class Client {
    constructor(json){
        this.name = json.name;
        this.idCard= json.idCard;
        this.telphone= json.telphone;
        this.cellphone=json.cellphone;
        this.adress=json.adress;
        this.email=json.email;
        this.password=json.password;
        this.idCity=json.idCity;
        this.description=json.description;
        this.profilePhoto= json.profilePhoto;
    }
    addPhoto(p){
        this.profilePhoto=p;
    }
}

module.exports=  Client;
