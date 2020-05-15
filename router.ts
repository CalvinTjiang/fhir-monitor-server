import express = require("express");
import http from 'http';
import io from "socket.io";
import bodyParser from "body-parser";
import path from "path";

import Controller from "./src/controllers/Controller";
import GUI from "./src/views/GUI";
import Application from "./src/models/Application";
import StatCode from "./src/models/StatCode";


const PORT : number = 8080;
const app : express.Application = express();
const server : http.Server = new http.Server(app);
const socketio : io.Server = io(server);

const model: Application = new Application();
const gui : GUI = new GUI();
const controller : Controller = new Controller(model, gui, socketio);


app.use('/', express.static(path.join(__dirname,"public")));
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: false }));


// GET Method
app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/error', (req, res)=>{
    res.send("An Error has been occured!");
});

app.get('/login', (req, res)=>{
    controller.loginPage()
        .then((page)=>{
            res.send(page);
        }).catch((error)=>{
            console.log(error);
            res.redirect('/error');
        })
})

app.get('/index', (req, res)=>{
    controller.indexPage()
        .then((page)=>{
            res.send(page);
        }).catch((error)=>{
            console.log(error);
            res.redirect('/error');
        })
})

app.get('/patient/:patient', (req, res)=>{
    controller.patientPage(req.params.patient)
        .then((page)=>{
            res.send(page);
        }).catch((error)=>{
            console.log(error);
            res.redirect('/error');
        })
})

app.get('/monitor/:statCode/selection', (req, res)=>{
    for (let code in StatCode){
        if ((<any>StatCode)[code] == req.params.statCode){
            controller.monitorSelectionPage((<any>StatCode)[code])
                .then((page)=>{
                    res.send(page);
                }).catch((error)=>{
                    console.log(error);
                    res.redirect('/error');
                })
            break;
        }
    }
})

app.get('/monitor/:statCode/setting', (req, res)=>{
    for (let code in StatCode){
        if ((<any>StatCode)[code] == req.params.statCode){
            controller.monitorSettingPage((<any>StatCode)[code])
                .then((page)=>{
                    res.send(page);
                }).catch((error)=>{
                    console.log(error);
                    res.redirect('/error');
                })
            break;
        }
    }
})

app.get('/monitor/:statCode', (req, res)=>{
    for (let code in StatCode){
        if ((<any>StatCode)[code] == req.params.statCode){
            controller.monitorListPage((<any>StatCode)[code])
                .then((page)=>{
                    res.send(page);
                }).catch((error)=>{
                    console.log(error);
                    res.redirect('/error');
                })
            break;
        }
        
    }
})


// POST Method
app.post('/login', (req, res)=>{
    let ID: string = req.body.id;
    if (ID === undefined){
        res.redirect('/login');
    }
    controller.validateID(ID)
        .then((validated : boolean)=>{
            if (validated){
                res.redirect('/index');
            } else {
                res.redirect('/login');
            }
        }).catch((error)=>{
            console.log(error);
            res.redirect('/error');
        })
})

app.post('/api/monitor/:statCode/patients', (req, res)=>{
    for (let code in StatCode){
        if ((<any>StatCode)[code] == req.params.statCode){
            for (let ID of req.body){
                controller.addMonitoredPatient((<any>StatCode)[code], ID);
            }
        }
    }
    res.json();
})

app.post('/api/monitor/:statCode/interval/:interval', (req, res)=>{
    for (let code in StatCode){
        if ((<any>StatCode)[code] == req.params.statCode){
            controller.updateMonitorInterval((<any>StatCode)[code], Number(req.params.interval) * 1000)
        }
    }
    res.json();
})

// DELETE Method
app.delete('/api/monitor/:statCode/patient/:patient', (req, res)=>{
    for (let code in StatCode){
        if ((<any>StatCode)[code] == req.params.statCode){
            controller.removeMonitoredPatient((<any>StatCode)[code], req.params.patient);
        }
    }
    res.json();
})

server.listen(PORT, ()=>{
    console.log(`Web Application is running on http://localhost:${PORT}`)
})
