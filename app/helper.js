class Helper{

  constructor(){
    this.User = require('./models/user');
  }

  /*Method to set user online status to N (means NO)*/
  setUserStatusOffline(localReq,facebookReq,googleReq){

    /*Check for type of user*/
    /*Local user*/
    if ( localReq.username ){
      this.User.findOneAndUpdate({ 'local.username' : localReq.username }, {'local.online' : "N"} , function(err,user) {
        /*If there are any errros , return the error*/
        if (err){
          return err;
        }
      });
    }
    else if ( facebookReq.id ){
      this.User.findOneAndUpdate({ 'facebook.id' : facebookReq.id }, {'facebook.online' : "N"} , function(err,user) {
        /*If there are any errros , return the error*/
        if (err){
          return err;
        }
      });
    }
    else if ( googleReq.id  ){
      this.User.findOneAndUpdate({ 'google.id' : googleReq.id }, {'google.online' : "N"} , function(err,user) {
        /*If there are any errros , return the error*/
        if (err){
          return err;
        }
      });
    }
  }

  /*Check if given user is online*/
  isUserOnline(userReq){
    /*Check for type of user*/
    /*Local user*/
    if ( userReq.local.username ){
      this.User.findOne({ 'local.username' : userReq.local.username } , function(err,user) {
        /*If there are any errros , return the error*/
        if (err){
          return err;
        }
        return user.local.online === "Y";
      });
    }
    else if ( userReq.facebook.id ){
      this.User.findOne({ 'facebook.id' : userReq.facebook.id } , function(err,user) {
        /*If there are any errros , return the error*/
        if (err){
          return err;
        }
        return user.facebook.online === "Y";
      });
    }
    else if ( googleReq.id  ){
      this.User.findOne({ 'google.id' : userReq.google.id }, function(err,user) {
        /*If there are any errros , return the error*/
        if (err){
          return err;
        }
        return user.google.online === "Y";
      });
    }
  }


}

module.exports = new Helper();
