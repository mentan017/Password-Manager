const https = require('https');
const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const fs = require('fs');
const uuid = require('uuid').v4;

const app = express();
const PORT = 5000;
const algorithm = "aes-256-cbc";
const options = {
    cert: fs.readFileSync("C:/Users/adria/Password-Manager/cert/cert.pem"),
    key: fs.readFileSync("C:/Users/adria/Password-Manager/cert/key.pem")
};

app.use(express.json());
app.use(express.static(__dirname + "/Client"));

app.get('/', async(req, res)=>{
    try{
        res.status(200).sendFile("index.html");
    }catch(e){
        console.log(e);
        res.sendStatus(500);
    }
});
app.post('/LogIn', async(req, res)=>{
    try{
        var Username = req.body.Username || "";
        var Password = req.body.Password || "";
        fs.readFile("./credentials.json", "utf-8", async (err, String)=>{
            if(err){
                console.log(err);
                res.sendStatus(500);
            }else{
                var credentials = JSON.parse(String);
                var i=0;
                var UsernameExists = false;
                while((i<credentials.length) && (UsernameExists === false)){
                    if(credentials[i].username == Username){
                        var Verification = await bcrypt.compare(Password, credentials[i].password);
                        if(Verification === true){
                            var Data = fs.readFileSync(`./Data/${credentials[i].filename}`, {encoding: 'utf-8', flag: 'r'});
                            Data = decrypt(Data, credentials[i].key, credentials[i].iv);
                            res.status(200).send(Data);
                        }else{
                            res.sendStatus(403);
                        }
                        UsernameExists = true;
                    }
                    i++;
                }
                if(UsernameExists == false){
                    var Salt = await bcrypt.genSalt(10);
                    Password = await bcrypt.hash(Password, Salt);
                    var NewFilename = uuid() + ".json";
                    var EncryptionKey = crypto.randomBytes(32);
                    var iv = crypto.randomBytes(16);
                    credentials.push({username: Username, password: Password, filename: NewFilename, iv: iv, key: EncryptionKey})
                    String = JSON.stringify(credentials);
                    fs.writeFileSync('./credentials.json', String);
                    fs.writeFileSync(`./Data/${NewFilename}`, (encrypt("[]", EncryptionKey, iv)));
                    res.status(200).send(JSON.stringify([]));
                }
            }
        });
    }catch(e){
        console.log(e);
        res.sendStatus(500);
    }
});
app.post('/NewPassword', async(req, res)=>{
    try{
        var Username = req.body.GlobalUsername || "";
        var Password = req.body.GlobalPassword || "";
        fs.readFile("./credentials.json", "utf-8", async(err, credentials)=>{
            if(err){
                console.log(err);
                res.sendStatus(500);
            }else{
                credentials = JSON.parse(credentials);
                var i=0;
                var UsernameExists = false;
                while((i<credentials.length) && (UsernameExists == false)){
                    if(credentials[i].username == Username){
                        var Verification = await bcrypt.compare(Password, credentials[i].password);
                        if(Verification === true){
                            var Data = fs.readFileSync(`./Data/${credentials[i].filename}`, {encoding: 'utf-8', flag: 'r'});
                            Data = decrypt(Data, credentials[i].key, credentials[i].iv);
                            Data = JSON.parse(Data);
                            var UniqueId = uuid();
                            Data.push({website: (req.body.Website || ""), username: (req.body.Username || ""), password: (req.body.Password || ""), id: UniqueId});
                            Data = JSON.stringify(Data);
                            fs.writeFileSync(`./Data/${credentials[i].filename}`, (encrypt(Data, credentials[i].key, Buffer.from(credentials[i].iv.data))));
                            res.status(200).send(JSON.stringify({id: UniqueId}));
                        }else{
                            res.sendStatus(403);
                        }
                        UsernameExists = true;
                    }
                    i++;
                }
                if(!UsernameExists) res.sendStatus(403);
            }
        });
    }catch(e){
        console.log(e);
        res.sendStatus(500);
    }
});
app.delete('/DeletePassword', async(req, res)=>{
    try{
        var Username = req.body.GlobalUsername || "";
        var Password = req.body.GlobalPassword || "";
        var CardId = req.body.CardId || "";
        fs.readFile("./credentials.json", "utf-8", async(err, credentials)=>{
            if(err){
                console.log(err);
                res.sendStatus(500);
            }else{
                credentials = JSON.parse(credentials);
                var i=0;
                var UsernameExists = false;
                while((i<credentials.length) && (UsernameExists == false)){
                    if(credentials[i].username == Username){
                        var Verification = await bcrypt.compare(Password, credentials[i].password);
                        if(Verification === true){
                            var Data = fs.readFileSync(`./Data/${credentials[i].filename}`, {encoding: 'utf-8', flag: 'r'});
                            Data = decrypt(Data, credentials[i].key, credentials[i].iv);
                            Data = JSON.parse(Data);
                            var j=0;
                            var PasswordDeleted = false;
                            while((j<Data.length) && (PasswordDeleted == false)){
                                if(Data[j].id == CardId){
                                    Data.splice(j, j+1);
                                    PasswordDeleted = true;
                                }
                                j++;
                            }
                            Data = JSON.stringify(Data);
                            fs.writeFileSync(`./Data/${credentials[i].filename}`, (encrypt(Data, credentials[i].key, Buffer.from(credentials[i].iv.data))));
                            res.sendStatus(200);
                        }else{
                            res.sendStatus(403);
                        }
                        UsernameExists = true;
                    }
                    i++;
                }
                if(!UsernameExists) res.sendStatus(403);
            }
        });
    }catch(e){
        console.log(e);
        res.sendStatus(500);
    }
});
app.put('/UpdatePassword', async(req, res)=>{
    try{
        var Username = req.body.GlobalUsername || "";
        var Password = req.body.GlobalPassword || "";
        var CardId = req.body.CardId || "";
        fs.readFile("./credentials.json", "utf-8", async(err, credentials)=>{
            if(err){
                console.log(err);
                res.sendStatus(500);
            }else{
                credentials = JSON.parse(credentials);
                var i=0;
                var UsernameExists = false;
                while((i<credentials.length) && (UsernameExists == false)){
                    if(credentials[i].username == Username){
                        var Verification = await bcrypt.compare(Password, credentials[i].password);
                        if(Verification === true){
                            var Data = fs.readFileSync(`./Data/${credentials[i].filename}`, {encoding: 'utf-8', flag: 'r'});
                            Data = decrypt(Data, credentials[i].key, credentials[i].iv);
                            Data = JSON.parse(Data);
                            var j=0;
                            var PasswordSaved = false;
                            while((j<Data.length) && (PasswordSaved == false)){
                                if(Data[j].id == CardId){
                                    Data[j] = {website: (req.body.Website || ""), username: (req.body.Username || ""), password: (req.body.Password || ""), id: CardId};
                                    PasswordSaved = true;
                                }
                                j++;
                            }
                            Data = JSON.stringify(Data);
                            fs.writeFileSync(`./Data/${credentials[i].filename}`, (encrypt(Data, credentials[i].key, Buffer.from(credentials[i].iv.data))));
                            res.sendStatus(200);
                        }else{
                            res.sendStatus(403);
                        }
                        UsernameExists = true;
                    }
                    i++;
                }
                if(!UsernameExists) res.sendStatus(403);
            }
        });
    }catch(e){
        console.log(e);
        res.sendStatus(500);
    }
});
function encrypt(text, key, iv){
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return(encrypted.toString('hex'));
}
function decrypt(text, key, ivold){
    let iv = Buffer.from(ivold);
    let encryptedText = Buffer.from(text, 'hex');
    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

https.createServer(options, app).listen(PORT);
console.log(`Server is running on port: ${PORT}`);