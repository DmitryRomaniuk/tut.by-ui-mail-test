var webdriver = require('selenium-webdriver');
var By = webdriver.By;
var until = webdriver.until;
var fs = require('fs');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var winston = require('winston');
var Baby = require('babyparse');
var sax = require("sax"),
    strict = true,
    parser = sax.parser(strict);

function getUsersFromXMLFile(file) {
    var xmlUser = fs.readFileSync(file);
    var userXML=[],userXMLA=[];
    parser.onattribute = function (attr) {
        userXML.push(attr);
    };
    parser.write(xmlUser).close();
    for (var i=0; i<userXML.length;i=i+2) {
        userXMLA.push({user:userXML[i].value,pass:userXML[i+1].value})
    }
    return userXMLA;
}
function getUsersFromCSVFile(file) {
    var cvsparser = Baby.parseFiles(file, {header: false});
    var csvdata=cvsparser.data;
    var csvdatatemp = [];
    csvdata.forEach(function (elem,i) {
        csvdatatemp.push({user:elem[0],pass:elem[1]});
    });
    return csvdatatemp;
}
var xmlUserGet=getUsersFromXMLFile("./user/user.xml");
var csvUserGet=getUsersFromCSVFile("./user/user.csv");
var listUsers=xmlUserGet.concat(csvUserGet);
console.log(listUsers);

 var sentUsers = [{
 user: 'test-user-1-simple@tut.by',
 pass: '12345678',
 mailto: 'test-user-1-simple@tut.by',
 themeMail: 'hello world!',
 bodyMail: 'Yahoo!! asdf 123'
 }];

 webdriver.logging.installConsoleHandler();
 webdriver.logging.getLogger('webdriver.http')
 .setLevel(webdriver.logging.Level.ALL);

 sentUsers.forEach(function (user) {
 var currUser = {
 from: user.user,
 subject: user.themeMail,
 to: user.mailto,
 body: user.bodyMail
 };

 var transporter = nodemailer.createTransport(smtpTransport({
 service: 'yandex',
 auth: {
 user: user.user,
 pass: user.pass
 }
 }));
 // send mail
 transporter.sendMail({
 from: user.user,
 to: user.mailto,
 subject: user.themeMail,
 text: user.bodyMail
 }, function (error, response) {
 if (error) {
 console.log(error);
 winston.log('error', error);
 } else {
 console.log('Message sent');
 winston.log('info', 'Message sent and we logging with winston');
 }
 });
 // verify connection configuration
 transporter.verify(function (error, success) {
 if (error) {
 console.log(error);
 } else {
 console.log('Server is ready to take our messages');
 }
 })

 var driver = new webdriver.Builder()
 .forBrowser('chrome')
 .build();
 driver.manage().window().maximize();
 driver.manage().deleteAllCookies();
 driver.get('https://mail.tut.by/');
 driver.takeScreenshot().then(function (data) {
 var date = new Date(Date.now());
 date = date.toISOString();
 date = date.replace(/:/g, "-");
 var nameFile = "img-" + date + ".png";
 //fs.writeFileSync(nameFile, data, 'base64');
 });
 driver.findElement(By.name('login')).sendKeys(user.user);
 driver.findElement(By.name('password')).sendKeys(user.pass);
 driver.findElement(By.className('loginButton')).click();
 driver.wait(until.elementLocated(By.css("a[href=\"#sent\"]")), 5000);
 driver.findElement(By.css("a[href=\"#sent\"]")).click();
 driver.findElement(By.css("span[title=\""+user.user+"\"]")).click();
 driver.close();
 });
