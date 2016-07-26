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
var listUserDB = require('./createDB');

function getUsersFromXMLFile(file) {
    var xmlUser = fs.readFileSync(file);
    var userXML = [], userXMLA = [];
    parser.onattribute = function (attr) {
        userXML.push(attr);
    };
    parser.write(xmlUser).close();
    for (var i = 0; i < userXML.length; i = i + 2) {
        userXMLA.push({user: userXML[i].value, pass: userXML[i + 1].value})
    }
    return userXMLA;
}
function getUsersFromCSVFile(file) {
    var cvsparser = Baby.parseFiles(file, {header: false});
    var csvdata = cvsparser.data;
    var csvdatatemp = [];
    csvdata.forEach(function (elem, i) {
        csvdatatemp.push({user: elem[0], pass: elem[1]});
    });
    return csvdatatemp;
}
var xmlUserGet = getUsersFromXMLFile("./user/user.xml");
var csvUserGet = getUsersFromCSVFile("./user/user.csv");
var listUsers = xmlUserGet.concat(csvUserGet);
var DBUserGet = {users: null};
listUserDB(DBUserGet, consList);
function consList() {
    var dataA = [];
    DBUserGet.users.forEach(function (elem) {
        dataA.push({user: elem.user, pass: elem.pass})
    });
    listUsers = listUsers.concat(dataA);
    console.log(listUsers);
    nextStepSyncProgramm();
}
function nextStepSyncProgramm() {

    listUsers.forEach(function (elem, i) {
            var j = i + 1;
            var j2 = i + 2;
            if (i % 2 != 0) {
                elem.user = elem.user;
                elem.pass = elem.pass;
                elem.mailto = 'test-user-' + i + '-simple@tut.by';
                elem.themeMail = 'hello from user ' + j;
                elem.bodyMail = 'Body mail from user ' + j
            } else {
                elem.user = elem.user;
                elem.pass = elem.pass;
                elem.mailto = 'test-user-' + j2 + '-simple@tut.by';
                elem.themeMail = 'hello from user ' + j;
                elem.bodyMail = 'Body mail from user ' + j
            }
        }
    );
    console.log(listUsers);

    webdriver.logging.installConsoleHandler();
    webdriver.logging.getLogger('webdriver.http')
        .setLevel(webdriver.logging.Level.ALL);
    sentMessages(0);
    function sentMessages(i) {
        var user = listUsers[i];

        var transporter = nodemailer.createTransport(smtpTransport({
            service: 'yandex',
            pool: true,
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
                if (i<listUsers.length) {i++;setTimeout(function(){sentMessages(i)},10000)}
            }
        });
        // verify connection configuration
        transporter.verify(function (error, success) {
            if (error) {
                console.log(error);
            } else {
                console.log('Server is ready to take our messages');
            }
        });}

    listUsers.forEach(function (user, i) {
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
            fs.writeFileSync(nameFile, data, 'base64');
        });
        driver.findElement(By.name('login')).sendKeys(user.user);
        driver.takeScreenshot().then(function (data) {
            var date = new Date(Date.now());
            date = date.toISOString();
            date = date.replace(/:/g, "-");
            var nameFile = "img-" + date + ".png";
            fs.writeFileSync(nameFile, data, 'base64');
        });
        driver.findElement(By.name('password')).sendKeys(user.pass);
        driver.takeScreenshot().then(function (data) {
            var date = new Date(Date.now());
            date = date.toISOString();
            date = date.replace(/:/g, "-");
            var nameFile = "img-" + date + ".png";
            fs.writeFileSync(nameFile, data, 'base64');
        });
        driver.findElement(By.className('loginButton')).click();
        driver.takeScreenshot().then(function (data) {
            var date = new Date(Date.now());
            date = date.toISOString();
            date = date.replace(/:/g, "-");
            var nameFile = "img-" + date + ".png";
            fs.writeFileSync(nameFile, data, 'base64');
        });
        driver.wait(until.elementLocated(By.css("a[href=\"#sent\"]")), 15000);
        driver.takeScreenshot().then(function (data) {
            var date = new Date(Date.now());
            date = date.toISOString();
            date = date.replace(/:/g, "-");
            var nameFile = "img-" + date + ".png";
            fs.writeFileSync(nameFile, data, 'base64');
        });
        driver.findElement(By.css("a[href=\"#sent\"]")).click();
        driver.close();
    });
}