require('dotenv').config();
const express= require('express');
const server = express();
const { v4: uuidv4 } = require('uuid');
const lodash= require('lodash');

const bodyParser= require('body-parser');
const fs= require('fs');
const path= require('path');

const dir= '/public';
const fileName= 'Data.json';
const filePath = path.join(dir, fileName);
const dirPath= path.join(__dirname,filePath);
const details= { };
    

server.use(express.static(path.join(__dirname,'public')));
server.use(express.static(process.env.STATIC_FOLDER));
console.log(dirPath);

server.use((req,res,next)=>{
    console.log(req.method,req.ip, req.path);
    next();
});

server.use(bodyParser.urlencoded());
server.use(bodyParser.json());

server.get('/getUuid', (req,res)=>{
    const uuid= uuidv4();
    res.json({ uuid });
})

// server.post("/person", (req,res)=>{
//     let person= {
//         "id": uuidv4(),
//         "name": req.body.name ,
//         "age" : req.body.age,
//         "city" : req.body.city
//     }

//     // let detail= JSON.stringify(person, null, 2);
//     details.users.push(person);
//     let add=JSON.stringify(details, null, 2);
//     fs.writeFile(dirPath, add, (err) => {
//         if(err) throw err;
//         console.log("File saved successfully");
//     });
//     res.send("File Saved to the Directory");

//     // fs.readFile('Data.json', 'utf8', (err, data) =>{
//     //     if(err)
//     //     {
//     //         res.writeHead(500, {'Content-Type': 'text/plain '});
//     //         res.end("Internal Server Error");
//     //     }
//     //     else {
//     //         res.writeHead(200, {'Content-Type': 'application/json '});
//     //         res.end(data);
//     //     }
//     // })
// })

server.post("/add",(req,res)=>{
    
    // let details = JSON.stringify(detail, null, 2);
    fs.readFile(dirPath, "utf-8", (err)=>{
        if(err){
            const person= {
                "id":uuidv4(),
                "name": req.body.name,
                "age": req.body.age,
                "city": req.body.city
            }

            details.users= [];
            details.users.push(person);
            let add=JSON.stringify(details, null, 2);
            fs.writeFile(dirPath, add, (err) =>{

            });
            res.send("File Saved to the Directory");
        }
        else{
            fs.readFile(dirPath, "utf-8", (err, data)=>{
                if(err) throw err;
                const person= {
                    "id":uuidv4(),
                    "name": req.body.name,
                    "age": req.body.age,
                    "city": req.body.city
                }
    
                const jsonObject= JSON.parse(data);
                jsonObject.users.push(person);
                
                let finalObject= JSON.stringify(jsonObject, null, 2);
                //console.log(finalObject);
                
                fs.writeFile(dirPath, finalObject, (err)=>{
                    if(err){
                        console.err("Error adding data")
                    }
                })
            })
            res.send("User Added");
        }
    })
    
})

server.post("/update", (req,res) => {
    const targetUuid = req.body.id;
    fs.readFile(dirPath, 'utf-8', (err, data)=> {
        if(err) throw err;
        const currentData = JSON.parse(data);
        console.log(currentData, targetUuid);

    const dataIndex= currentData.users.findIndex(data => data.id === targetUuid);
    if(dataIndex!==-1)
    {
        currentData.users[dataIndex].name= req.body.name;
        currentData.users[dataIndex].age= req.body.age;
        currentData.users[dataIndex].city=req.body.city;
        
        fs.writeFile(dirPath, JSON.stringify(currentData, null, 2), (err)=>{
            //console.log(JSON.stringify(currentData, null, 2));
            if (err) {
                console.error('Error updating data:', err);
                res.status(500).send('Error updating data');
            } else {
                console.log('Data updated successfully.');
                res.send('File updated');
            }        
        });
        console.log('Data updated successfully.');
    }
    else{
        console.log('Data not found.');
    }
});
})

server.post("/get-all", (req,res)=>{
    fs.readFile(dirPath, 'utf-8', (err, data)=>{
        if (err){
            console.error("Error fetching file", err);
        }
        else{
        const getdata= JSON.parse(data);
        const resData= JSON.stringify(getdata, null, 2);
        res.send(resData);
        }
    })
})

server.get("/fetchuser/:id", (req, res)=>{
    let targetId= req.params.id;
    fs.readFile(dirPath, 'utf-8', (err, data)=>{
        if (err) throw err
        const allData= JSON.parse(data);
        let index= allData.users.findIndex(data => data.id == targetId)
        let object= allData.users[index];
        //console.log(object);
        res.send(object );
    })
})

server.get("/deleteuser/:id", (req, res)=>{
    let targetId=req.params.id;
    fs.readFile(dirPath, 'utf-8', (err,data)=>{
        if(err) throw err
        const allData = JSON.parse(data);
        
        let index = allData.users.findIndex(data => data.id == targetId)
        const newData = allData.users.slice(0,index).concat(allData.users.slice(index+1));
        delete allData.users;
        allData.users=[];
        allData.users.push(newData);
        let finalData= JSON.stringify(allData,null,2);
        
        fs.unlink(dirPath,(err)=>{
            if(err) throw err;
        })
        fs.writeFile(dirPath, finalData, (err)=>{
            if(err) throw err;
        })
        
    })
    res.send("User Deleted");
})

server.listen(process.env.PORT,()=>{
    console.log("Server started at ", process.env.PORT);
})