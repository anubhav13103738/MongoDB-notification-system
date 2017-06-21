# gossipGirlTask
Steps to use the code:
1.	Unzip the compressed folder
2.	Go to the uncompressed folder namely socialCopsTask
3.	Hold shift+right click open command window here
4.	Type either ‘nodemon app.js’ or ‘node app.js’ and hit enter(exclude single inverted commas) give it some time and when it displays listen on 1234 go to step 5
5.	Now open a browser and in the address bar type ‘localhost:1234’ and hit enter
Note: please enter phone number such that it is 10 digit greater than 7000000000 and less than 9999999999 

6.	You can either subscribe or use crud(create,read,update,delete) operations in this application and whenever there is any change in characters collection present in mongodb database it will notify the user in the form of mail(subscribed users), desktop notifications and sms(twilio doesn’t send sms to unverified number that is why the sms code is commented in this one but it does work and as a proof I’ll be attaching a screenshot when I used the twilio library). I will recommend to subscribe first with a valid mail id(these will be added to subscribers collection of our mongodb database) to receive mails as notifications and then perform crud operations. With various update the subscribed users who are subscribed to that particular character but in the case of insertion all the subscribed user will get a mail and notification that a new character has been added to database.


Write Up:
Note: Your system must have node.js installed
This task was to develop a notification system which will provide updates when a database operation is performed on a particular collection.
Now notification can be of several types. In this task I have used 3 types of notifications 
1.	Mails-I have used nodemail module downloaded from npm for this
 
2.	Dekstop notifications- I have used node-notifier module downloaded from npm for this
 
3.	Sms
Sms is not working because I have used twilio module for the same and twilio doesn’t allow sending sms to unverified numbers for free users but the code is commented and is working for the same.
 

Approach:
First thing that came to my mind after reading the problem statement was to create a mongodb database with collection of characters and a little details about them and collection of subscriber which will store mail id, subscribed characters and phone numbers. Characters collection will store name, actor and description. And I made this on mlabs.com so it can be accessed from anywhere.
Now I have used node.js and express to write the server side code. I have downloaded mongodb module from npm and used it to connect to database. For frontend I have used angularjs. The dropdown seen on subscribe service and update character comes from database and is dynamic in nature when a new character is added it will automatically be added to the dropdown list.
For sending database to backend I have used bodyparser module downloaded from npm. This bodyparser will send the data from front end to backend which can be further added, removed updated or fetched from database using mongodb queries.
Firstly the user will subscribe to a character. If the character is not present in the dropdown list it can be added by using other option. This will be added to the subscribers collection and in case other will be added to characters collection as well.
 Character collection
 subscribers collection
Now for testing purposes I have developed a front end to perform crud operations on characters collection. With every insertion in characters collection “all” the subscribed users will get mail,(sms-not working because of twilio/code working and commented/) and desktop notification.
With every deletion in characters collection only those subscribed to that particular character will receive the mail,(sms-not working because of twilio/code working and commented/) and desktop notification.
With every update in characters collection users subscribed to that particular character will receive the mail,(sms-not working because of twilio/code working and commented/) and desktop notification.
Update includes several cases 
only actor update, 
only description update,
 adding a new field(both key and value),
any two of the above and all the three altogether.


