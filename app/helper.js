class Helper{

  constructor(){
    this.Model = require('./models/user');
  }

  /*Method to set user online status to N (means NO)*/
  setUserStatusOffline(localReq,facebookReq,googleReq){

    /*Check for type of user*/
    /*Local user*/
    if ( localReq.username ){
      this.Model.User.findOneAndUpdate({ 'local.username' : localReq.username }, {'local.online' : "N"} , function(err,user) {
        /*If there are any errros , return the error*/
        if (err){
          throw err;
        }
      });
    }
    else if ( facebookReq.id ){
      this.Model.User.findOneAndUpdate({ 'facebook.id' : facebookReq.id }, {'facebook.online' : "N"} , function(err,user) {
        /*If there are any errros , return the error*/
        if (err){
          throw err;
        }
      });
    }
    else if ( googleReq.id  ){
      this.Model.User.findOneAndUpdate({ 'google.id' : googleReq.id }, {'google.online' : "N"} , function(err,user) {
        /*If there are any errros , return the error*/
        if (err){
          throw err;
        }
      });
    }
  }


  /*Method to check if given user is online*/
  /*TODO:Needs to be tested, but seems to work*/
  isUserOnline(userReq){
    /*Check for type of user*/
    /*Local user*/
    if ( userReq.local.username ){
      this.Model.User.findOne({ 'local.username' : userReq.local.username } , function(err,user) {
        /*If there are any errros , return the error*/
        if (err){
          throw err;
        }
        return user.local.online === "Y";
      });
    }
    else if ( userReq.facebook.id ){
      this.Model.User.findOne({ 'facebook.id' : userReq.facebook.id } , function(err,user) {
        /*If there are any errros , return the error*/
        if (err){
          throw err;
        }
        return user.facebook.online === "Y";
      });
    }
    else if ( googleReq.id  ){
      this.Model.User.findOne({ 'google.id' : userReq.google.id }, function(err,user) {
        /*If there are any errros , return the error*/
        if (err){
          throw err;
        }
        return user.google.online === "Y";
      });
    }
  }


  /*Method to update the socketID of a user*/
  updateSocketID(userReq,socketID){
    /*Check for type of user*/
    /*Local user*/
    if ( userReq.local.username ){
      this.Model.User.findOneAndUpdate({ 'local.username' : userReq.local.username }, {'local.socketID' : socketID } , function(err,user) {
        /*If there are any errros , return the error*/
        if (err){
          throw err;
        }
      });
    }
    else if ( userReq.facebook.id ){
      this.Model.User.findOneAndUpdate({ 'facebook.id' : userReq.facebook.id }, {'facebook.socketID' : socketID } , function(err,user) {
        /*If there are any errros , return the error*/
        if (err){
          throw err;
        }
      });
    }
    else if ( userReq.google.id  ){
      this.Model.User.findOneAndUpdate({ 'google.id' : userReq.google.id }, {'google.socketID' : socketID} , function(err,user) {
        /*If there are any errros , return the error*/
        if (err){
          throw err;
        }
      });
    }
  }


  /*Method to get online users, will later be changed to online friends only*/
  /*Returs a list with the online users*/
  getOnlineUsers(){
    /*Query in database*/
    this.Model.User.find({ $or:[{'local.online' :"Y"}, {'facebook.online' : "Y"}, {'google.online' : "Y"}] } , function(err, users){
      /*If there is any error return it*/
      if(err){
        throw err;
      }
    });
  }


  /*Inserts a message into the database*/
  insertMessage(fromUser,toUser,messageData){

    /*TODO:Consider changing name of this variablet*/
    var newMessage = new this.Model.Message();
    newMessage.messages.data = messageData;
    var currentdate = new Date();
    var datetime = "Last Sync: " + currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/"
                + currentdate.getFullYear() + " @ "
                + currentdate.getHours() + ":"
                + currentdate.getMinutes() + ":"
                + currentdate.getSeconds();
    newMessage.messages.timeStamp = datetime;

    /*Get fromUser type and store it into the message data*/
    if (fromUser.local.username){
      newMessage.messages.fromUserType = "local";
      newMessage.messages.fromUserID = "";
      newMessage.messages.fromUserName = fromUser.local.username;
    }
    else if (fromUser.facebook.id){
      newMessage.messages.fromUserType = "facebook";
      newMessage.messages.fromUserID = fromUser.facebook.id;
      newMessage.messages.fromUserName = "";
    }
    else if (fromUser.google.id){
      newMessage.messages.fromUserType = "google";
      newMessage.messages.fromUserID = fromUser.google.id;
      newMessage.messages.fromUserName = "";
    }

    /*Get toUser type*/
    if (toUser.local.username){
      newMessage.messages.toUserType = "local";
      newMessage.messages.toUserID = "";
      newMessage.messages.toUserName = toUser.local.username;
    }
    else if (fromUser.facebook.id){
      newMessage.messages.toUserType = "facebook";
      newMessage.messages.toUserID = toUser.facebook.id;
      newMessage.messages.toUserName = "";
    }
    else if (fromUser.google.id){
      newMessage.messages.toUserType = "google";
      newMessage.messages.toUserID = toUser.google.id;
      newMessage.messages.toUserName = "";
    }

    /*Save message*/
    newMessage.save(function(err){
      if (err){
        throw err;
      }
      return;
    });

  }


  /*Get all stored messages between two specific users*/
  /*Works fine*/
  getMessages(fromUser,toUser){

    var query = { $and : [{ $or : [ {'messages.fromUsername' : fromUser.local.username} ,
                  {'messages.fromUserID' : fromUser.facebook.id} ,
                  {'messages.fromUserID' : fromUser.google.id} ] },
                  { $or : [ {'messages.toUsername' : toUser.local.username} ,
                  {'messages.toUserID' : toUser.facebook.id} ,
                  {'messages.toUserID' : toUser.google.id} ] }] };

    this.Model.Message.find(query , function(err, data){
      /*If there is any error return it*/
      if(err){
        throw err;
      }
      console.log("MESSAGES ARE " + data);
    });

  }


}

module.exports = new Helper();
