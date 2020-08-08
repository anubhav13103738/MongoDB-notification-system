/**
 * Created by Annu on 4/26/2017.
 */
var db;
var data;
var fs = require('fs');
var path =require('path');
var account_sid = '';//account_id for twilio library to send sms to phone number but it doesn't allow
                    // to send sms to unverified numbers for free users we can insert valid id and token in
                    // here to make it work when the numbers are verified or the account is from purchasing
var auth_token = '';//account_token for twilio library to send sms to phone number but it doesn't 
                    // allow to send sms to unverified numbers for free users
var notifier = require('node-notifier');//npm module for notifications system
var config = JSON.parse(fs.readFileSync("config.json"));
//var client = require('twilio')(account_sid, auth_token);

//for sms system we need to pass account_sid and aut_token to the above line but it sends sms
// only to verified numbers by twilio for free users the code relating to sms works and
// as a proof a screenshot will be attached in the writeup.

var nodemailer = require('nodemailer');//npm module for mailing to subscribers

var transporter =  nodemailer.createTransport({
    service:'gmail',
    secure:false,
    port:25,
    auth:{
        user:process.env.MAILEREMAIL,
        pass: config.password
    },
    tls:{
        rejectUnauthorized:false
    }
});

var helperoptions ={
    from:'"Sender" <'+process.env.MAILEREMAIL+'>',
    to:'',
    subject:'',
    text:''
};

//helper options will be updated in each required route and according to the updates mails will be sent to the subscriber



var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoClient = require('mongodb').MongoClient;
//the following line of code will connect this application to the database which is made on mlab.com who provide free 500mb usage
mongoClient.connect(process.env.MONGOURI,(err,database)=>{
    if(err)console.log('can\'t connect '+err);
else{

    db = database
    app.listen(1234, () => {
        console.log('listening on 1234');//listen this app on port 1234
})
}
});

app.use(bodyParser.urlencoded({extended: true}));
app.use('/images', express.static('images'));
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));
app.use('/libs', express.static('libs'));

app.get('/',(req,res)=>{
    res.sendFile(__dirname+'/index.html');              //home route

});


app.get('/dropdown', (req,res)=>{
            //this route is to populate dropdowns present on subscribeService page, update character page
            //take out the json from database and throw it to this route from which required data can be used by angular factories
            //this will maintain the dynamic feature of our application new characters added will be seen in the dropdown from next time onwards
   db.collection('characters').find().toArray().then(function (doc) {
    res.json(doc);
})
});

app.get('/subscribeService', (req,res)=>{
   res.sendFile(__dirname+'/subscribeService.html'); 
});

app.get('/modifyCharData', (req,res)=>{
   res.sendFile(__dirname+'/modifydatabase.html');
});

app.get('/fetch', (req,res)=>{
                                    //fetch data from database
    db.collection('characters').find().toArray().then(function (doc) {
    res.json(doc);
});
});

app.get('/insert',(req,res)=>{
    res.sendFile(__dirname+'/insert.html'); 
});

app.get('/fetchpage', (req,res)=>{
   res.sendFile(__dirname+'/fetch.html');
});

app.get('/delete', (req,res)=>{
     res.sendFile(__dirname+'/delete.html');
});

app.get('/update', (req,res)=>{
   res.sendFile(__dirname+'/update.html') 
});





app.post('/init', (req,res)=>{
                                                    //this is the route to insert character in database
    var datax = {"name": req.body.name, "actor": req.body.actor, "description": req.body.description};
db.collection('characters').insertOne(datax, (err,result)=>{
    if(err){
        console.log(err);
    }
    else{
        console.log("inserted in character collection");
                        //above query insert new character's data


        db.collection('subscribers').find({},{_id:0, email:1}).toArray(function (err,result) {
           if(err){
               console.log(err);
           }
            else{

               //the above query will find "all"(not only subscribed to this character) the subscriber's mail id from database and inform them about the new character insertion
               //by mail, notification and sms.


               //console.log(result);

               //notifiy insertion
               notifier.notify({
                   "title": "A new character added to database",
                   "message": req.body.name+" has been added to the database"
               });
               /*
               this is the commented code to send sms using twilio library but it doesn't allow to send sms to unverified number for free users.
               
               client.sendMessage({
                   to:'',// fill in number on which sms is to be sent
                   from:'', //fill in number from which the sms is to be sent
                   body:'test'
               }, function (err,message) {
                   if(err){console.log(err);}
                   else {console.log(message.sid);}
               });*/


               //found all the subscribed mail ids and mailed them about new character using for of loop
               for(var value of result){
                   helperoptions.to = value.email;
                   helperoptions.subject = "A new character added to database";
                   helperoptions.text=req.body.name+" has been added to the database, you can follow this character too";
                   transporter.sendMail(helperoptions, (err,info)=>{
                       if(err)
                       { return console.log(err);}
                       //notifier.notify('hihihihi');
                       console.log('message sent');
                       console.log(info);
                   });
                   //console.log(helperoptions.to);
               }

           }
        });
}
});

    //finally response is sent as an html page
res.sendFile(__dirname+'/fetch.html');
});






app.post('/remove', (req,res)=>{

    //this route will remove the character from database and informed the subscribed users who are subscribed to this(being removed) character
    //that this character is removed from database

    var thischar = req.body.character;
    db.collection('characters').deleteOne({"name":thischar}, function (err,result) {
        if(err){console.log(err);}
        else{

            //the above query will delete the character if it finds the req.body.character in the character collection

            console.log("Deleted");
            db.collection('subscribers').find({character:thischar},{_id:0, email:1}).toArray(function (err,result) {
                if(err){
                    console.log(err);
                }
                else{

                    //this route will find subscribed users who are subscribed to this(being removed) character

                    //console.log(result);

                    //notification of removal
                    notifier.notify({
                        "title": "A character has been removed from database",
                        "message": thischar+" has been removed from the database"
                    });

                    //mails of removal to this character subscribed users only
                    for(var value of result){
                        helperoptions.to = value.email;
                        helperoptions.subject = "Your subscribed character has been removed from database";
                        helperoptions.text=thischar+" has been removed from the database";
                        transporter.sendMail(helperoptions, (err,info)=>{
                            if(err)
                            { return console.log(err);}
                            console.log('message sent');
                            console.log(info);
                        });
                        //console.log(helperoptions.to);
                    }

                }
            });
        }
    });
    res.sendFile(__dirname+'/fetch.html');
});


app.post('/updated', (req,res)=>{

                                    //this route is for updation
    if(req.body.character=="select"){
                                    //if no character is selected from the dropdown
         res.sendFile(__dirname+'/sorry.html');
    }
    else if(req.body.actor=='' && req.body.description=='' && req.body.key=='' && req.body.value==''){
                                    //when all the fields for updation are empty
    res.sendFile(__dirname+'/sorry.html');
}
    else if(req.body.actor!='' && req.body.description=='' && req.body.key=='' && req.body.value==''){
                                    //when a character's actor is updated
    var act = req.body.actor;
    var thischar =  req.body.character;
    db.collection('characters').updateOne({"name":req.body.character},{$set:{"actor":req.body.actor}}, function (err,result) {
       if(err){console.log(err);}
       else{

           //the above query will update the character's actor in database
           console.log("updated character collection");
           db.collection('subscribers').find({character:thischar},{_id:0, email:1}).toArray(function (err,result) {
               if(err){
                   console.log(err);
               }
               else{

                   //the above query will find those subscribers who are subscribed to this character

                   //notify actor's updation
                   notifier.notify({
                       "title": "A character's actor has been replaced by another actor",
                       "message": act+" has replaced the actor playing character "+thischar
                   });
                   //console.log(result);

                   //mail all the subscribed users of this character
                   for(var value of result){
                       helperoptions.to = value.email;
                       helperoptions.subject = "Your subscribed character has been replaced by another actor";
                       helperoptions.text=act+" has replaced your subscribed character "+thischar;
                       transporter.sendMail(helperoptions, (err,info)=>{
                           if(err)
                           { return console.log(err);}
                           console.log('message sent');
                           console.log(info);
                       });
                       //console.log(helperoptions.to);
                   }
               }
           });
           res.sendFile(__dirname+'/fetch.html');
       }
    });
}
    else if(req.body.actor=='' && req.body.description!='' && req.body.key=='' && req.body.value==''){
                                            //when both actor and character's description are updated

        var des = req.body.description;
        var thischar =  req.body.character;
    db.collection('characters').updateOne({"name":req.body.character},{$set:{"description":req.body.description}}, function (err,result) {
        if(err){console.log(err);}
        else{
            console.log("updated character collection");
            db.collection('subscribers').find({character:thischar},{_id:0, email:1}).toArray(function (err,result) {
                if(err){
                    console.log(err);
                }
                else{
                    //console.log(result);
                    //notify updates
                    notifier.notify({
                        "title": "A character's character's description has been updated",
                        "message": thischar+", character's new description is "+des
                    });

                    //mail users of this character
                    for(var value of result){
                        helperoptions.to = value.email;
                        helperoptions.subject = "Your subscribed character's description has been updated";
                        helperoptions.text=thischar+", your subscribed character's new description is "+des;
                        transporter.sendMail(helperoptions, (err,info)=>{
                            if(err)
                            { return console.log(err);}
                            console.log('message sent');
                            console.log(info);
                        });
                        //console.log(helperoptions.to);
                    }
                }
            });
            res.sendFile(__dirname+'/fetch.html');
        }
    });
}
    else if(req.body.actor=='' && req.body.description=='' && req.body.key!='' && req.body.value==''){
                                    //to add a new field to database key and value are required if either of them is missing insertion will not take place
    res.sendFile(__dirname+'/keyvalerror.html');
}
    else if(req.body.actor=='' && req.body.description=='' && req.body.key=='' && req.body.value!=''){
                                    //to add a new field to database key and value are required if either of them is missing insertion will not take place
    res.sendFile(__dirname+'/keyvalerror.html');
}
    else if(req.body.actor=='' && req.body.description=='' && req.body.key!='' && req.body.value!=''){
        //to add a new field to database key and value are required if either of them is missing insertion will not take place
        //since both are present in this case insertion will take place
        var keyer = req.body.key;
        var val = req.body.value;
        var thischar =  req.body.character;
        db.collection('characters').updateOne({"name":req.body.character},{$set:{keyer:req.body.value}}, function (err,result) {
            if(err){console.log(err);}
            else{
                                //above query will find the character update its db
                console.log("updated character collection");
                db.collection('characters').updateOne({"name":req.body.character}, { $rename: { "keyer":req.body.key }},function (err,result) {
                    if(err){console.log(err);}
                    else{
                                //since key was not updating simultaneously so above query will rename key for this character' new field
                        db.collection('subscribers').find({character:thischar},{_id:0, email:1}).toArray(function (err,result) {
                            if(err){
                                console.log(err);
                            }
                            else{
                                //the above query will find the subscribed users of this character

                                //console.log(result);

                                //notify update
                                notifier.notify({
                                    "title": "A character's has a new field and value",
                                    "message": thischar+"'s new field is "+keyer+" and its value is "+val
                                });

                                //send mails to subscribed users
                                for(var value of result){
                                    helperoptions.to = value.email;
                                    helperoptions.subject = "Your subscribed character's has a new field and value";
                                    helperoptions.text=thischar+", your subscribed character's new field is "+keyer+" and its value is "+val;
                                    transporter.sendMail(helperoptions, (err,info)=>{
                                        if(err)
                                        { return console.log(err);}
                                        console.log('message sent');
                                        console.log(info);
                                    });
                                    //console.log(helperoptions.to);
                                }
                            }
                        });
                    }
                });
                res.sendFile(__dirname+'/updates.html');
            }
        });
}
    else if(req.body.actor!='' && req.body.description!='' && req.body.key=='' && req.body.value==''){

                                        //in this case both actor and description are being updated
        var thischar =  req.body.character;
        var des = req.body.description;
        var act = req.body.actor;
    db.collection('characters').updateOne({"name":req.body.character},{$set:{"actor":req.body.actor, "description":req.body.description}}, function (err,result) {
        if(err){console.log(err);}
        else{
            db.collection('subscribers').find({character:thischar},{_id:0, email:1}).toArray(function (err,result) {
                if(err){
                    console.log(err);
                }
                else{
                    //console.log(result);

                    //notify update
                    notifier.notify({
                        "title": "A character's des and actor has been updated",
                        "message": thischar+"'s new actor is "+act+" and its new description is "+des
                    });

                    //mail
                    for(var value of result){
                        helperoptions.to = value.email;
                        helperoptions.subject = "Your subscribed character's des and actor has been updated";
                        helperoptions.text=thischar+", your subscribed character's new actor is "+act+" and its new description is "+des;
                        transporter.sendMail(helperoptions, (err,info)=>{
                            if(err)
                            { return console.log(err);}
                            console.log('message sent');
                            console.log(info);
                        });
                        //console.log(helperoptions.to);
                    }
                }
            });
            res.sendFile(__dirname+'/fetch.html');
        }
    });
}
    else if(req.body.actor!='' && req.body.description=='' && req.body.key!='' && req.body.value==''){
    res.sendFile(__dirname+'/keyvalerror.html');
}
    else if(req.body.actor!='' && req.body.description=='' && req.body.key=='' && req.body.value!=''){
    res.sendFile(__dirname+'/keyvalerror.html');
}
    else if(req.body.actor!='' && req.body.description=='' && req.body.key!='' && req.body.value!=''){
        var keyer = req.body.key;
        var val = req.body.value;
        var thischar =  req.body.character;
        var act = req.body.actor;
    db.collection('characters').updateOne({"name":req.body.character},{$set:{"actor":req.body.actor, keyer:req.body.value}},function (err,result) {
        if(err){console.log(err);}
        else{
            db.collection('characters').updateOne({"name":req.body.character}, { $rename: { "keyer":req.body.key }}, function (err,result) {
                if(err){console.log(err);}
                else{
                    db.collection('subscribers').find({character:thischar},{_id:0, email:1}).toArray(function (err,result) {
                        if(err){
                            console.log(err);
                        }
                        else{
                            //console.log(result);
                            notifier.notify({
                                "title": "A character has a new actor,field and value",
                                "message": thischar+"'s new actor is "+act+", new field is "+keyer+" and its value is "+val
                            });
                            for(var value of result){
                                helperoptions.to = value.email;
                                helperoptions.subject = "Your subscribed character has a new actor,field and value";
                                helperoptions.text=thischar+", your subscribed character's new actor is "+act+", new field is "+keyer+" and its value is "+val;
                                transporter.sendMail(helperoptions, (err,info)=>{
                                    if(err)
                                    { return console.log(err);}
                                    console.log('message sent');
                                    console.log(info);
                                });
                                //console.log(helperoptions.to);
                            }
                        }
                    });
                }
            });
            res.sendFile(__dirname+'/newupdated.html');
        }
    });
}
    else if(req.body.actor=='' && req.body.description!='' && req.body.key!='' && req.body.value==''){
        //to add a new field to database key and value are required if either of them is missing insertion will not take place

        res.sendFile(__dirname+'/keyvalerror.html');
}
    else if(req.body.actor=='' && req.body.description!='' && req.body.key=='' && req.body.value!=''){
        //to add a new field to database key and value are required if either of them is missing insertion will not take place

        res.sendFile(__dirname+'/keyvalerror.html');
}
    else if(req.body.actor=='' && req.body.description!='' && req.body.key!='' && req.body.value!=''){

                                //in this case description and and new field is updated and added respectivly
        var keyer = req.body.key;
        var val = req.body.value;
        var thischar =  req.body.character;
        var des = req.body.description;
    db.collection('characters').updateOne({"name":req.body.character},{$set:{"description":req.body.description, keyer:req.body.value}}, function (err,result) {
        if(err){console.log(err);}
        else{
            db.collection('characters').updateOne({"name":req.body.character}, { $rename: { "keyer":req.body.key }}, function (err,result) {
                if(err){console.log(err);}
                else{
                    db.collection('subscribers').find({character:thischar},{_id:0, email:1}).toArray(function (err,result) {
                        if(err){
                            console.log(err);
                        }
                        else{
                            //console.log(result);
                            //notify
                            notifier.notify({
                                "title": "A character has a new des,field and value",
                                "message": thischar+"'s new des is "+des+", new field is "+keyer+" and its value is "+val
                            });

                            //mail
                            for(var value of result){
                                helperoptions.to = value.email;
                                helperoptions.subject = "Your subscribed character's has a new des,field and value";
                                helperoptions.text=thischar+", your subscribed character's new des is "+des+", new field is "+keyer+" and its value is "+val;
                                transporter.sendMail(helperoptions, (err,info)=>{
                                    if(err)
                                    { return console.log(err);}
                                    console.log('message sent');
                                    console.log(info);
                                });
                                //console.log(helperoptions.to);
                            }
                        }
                    });
                }
            });
            res.sendFile(__dirname+'/newupdated.html');
        }
    });
}
    else if(req.body.actor!='' && req.body.description!='' && req.body.key!='' && req.body.value!=''){

                                    //all fields are updated and a new one is added
        var keyer = req.body.key;
        var val = req.body.value;
        var thischar =  req.body.character;
        var des = req.body.description;
        var act = req.body.actor;
    db.collection('characters').updateOne({"name":req.body.character},{$set:{"actor":req.body.actor,"description":req.body.description, keyer:req.body.value}}, function (err,result) {
        if(err){console.log(err);}
        else{
            db.collection('characters').updateOne({"name":req.body.character}, { $rename: { "keyer":req.body.key }}, function (err,result) {
                if(err){console.log(err);}
                else{
                    db.collection('subscribers').find({character:thischar},{_id:0, email:1}).toArray(function (err,result) {
                        if(err){
                            console.log(err);
                        }
                        else{
                            //console.log(result);
                            //notify
                            notifier.notify({
                                "title": "A character has a new actor, des, field and value",
                                "message": thischar+"'s new actor is "+act+", new des is "+des+", new field is "+keyer+" and its value is "+val
                            });
                            //mail
                            for(var value of result){
                                helperoptions.to = value.email;
                                helperoptions.subject = "Your subscribed character's has a new actor, des,field and value";
                                helperoptions.text=thischar+", your subscribed character's new actor is "+act+", new des is "+des+", new field is "+keyer+" and its value is "+val;
                                transporter.sendMail(helperoptions, (err,info)=>{
                                    if(err)
                                    { return console.log(err);}
                                    console.log('message sent');
                                    console.log(info);
                                });
                                //console.log(helperoptions.to);
                            }
                        }
                    });
                }
            });
            res.sendFile(__dirname+'/newupdated.html');
        }
    });
}
else{
        res.sendFile(__dirname+'/sorry.html');
}
});



//this route is for new users to subscribe to our service and they are added to our database collection subscribers
app.post('/subscribed', (req,res)=>{
    var chara;
    if(req.body.character!= "other")
    {
        //when the character is present in the dropdown coming from database
         data = {"character": req.body.character, "email": req.body.eMail, "phone": req.body.mob};
        var chara = req.body.character;
    }
    else{
        //when the character is not present in the dropdown coming from database
         data = {"character": req.body.character1, "email": req.body.eMail, "phone": req.body.mob};
        var chara = req.body.character1;
        newCharacter = {"name":req.body.character1};
        db.collection('characters').insertOne(newCharacter, (err,result)=>{
            //add this new character in character collection of our database
           if(err){
               console.log(err);
           }
            else{
                console.log("inserted in character collection");
            }
        });
        }    
            //and finally add this subscriber to subscribers collection of our database
        db.collection('subscribers').insertOne(data, (err,result)=>{
            if(err){
                console.log(err);
                }
            else{
                console.log('check db');
                helperoptions.to = req.body.eMail;
                helperoptions.subject = "Congratulations, you have been subscribed to our gossip girl service";
                helperoptions.text="you have been successfully subscribed to our service and will be provided updates for "+chara;
                transporter.sendMail(helperoptions, (err,info)=>{
                    if(err)
                    { return console.log(err);}
                    console.log('message sent');
                    console.log(info);
                });
            }
        });


res.sendFile(__dirname+'/subscribed.html')
    
});
