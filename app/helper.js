class Helper{

  constructor(){
    this.User = require('./models/user');
  }

  /*Method to set user online status to N (means NO)*/
  setUserStatusOffline(localReq,facebookReq,googleReq){

    console.log(localReq);
    console.log(facebookReq);
    console.log(googleReq);

    /*Check for type of user*/
    /*Local user*/
    if ( localReq.username ){
      this.User.findOneAndUpdate({ 'local.username' : localReq.username }, {'local.online' : "N"} , function(err,user) {
        console.log("I AM IN LOCAL");
        /*If there are any errros , return the error*/
        if (err){
          return err;
        }

        /*Set user status offline*/
        console.log("ONLINE STATUS IS SET TO " + user.local.online);

      });
    }
    else if ( facebookReq.id ){

      this.User.findOneAndUpdate({ 'facebook.id' : facebookReq.id }, {'facebook.online' : "N"} , function(err,user) {
        console.log("I AM IN FACEBOOK");
        /*If there are any errros , return the error*/
        if (err){
          return err;
        }

        /*Set user status offline*/
        console.log("ONLINE STATUS IS SET TO " + user.facebook.online);

      });

    }
    else if ( googleReq.id  ){
      this.User.findOneAndUpdate({ 'google.id' : googleReq.id }, {'google.online' : "N"} , function(err,user) {
        console.log("I AM IN GOOGLE");
        /*If there are any errros , return the error*/
        if (err){
          return err;
        }

        /*Set user status offline*/
        console.log("ONLINE STATUS IS SET TO " + user.google.online);

      });
    }

  }


}

module.exports = new Helper();
