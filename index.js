const express = require( 'express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())
app.get('/', (req, res)=>{
    res.send('Running my server')
})

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        console.log('decoded', decoded);
        req.decoded = decoded;
        next()
    })



}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.fxp4k.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){
    try{
        await client.connect();
        const serviceCollection= client.db("geniusCar").collection("service")
        const orderCollection= client.db("geniusCar").collection("order")
        app.post('/login', async(req,res)=>{
            const user = req.body;
            const accessToken=jwt.sign(user,process.env.ACCESS_TOKEN,{
                expiresIn:'1d'
            })
            res.send({accessToken})
        })
        

        app.get('/service', async(req,res)=>{
            const qurey = {}
            const cursor = serviceCollection.find(qurey)
            const services = await cursor.toArray()
         
            res.send(services)
        })
        app.post('/service', async(req,res)=>{
            const newService = req.body;
            const result = await serviceCollection.insertOne(newService)
         
            res.send(result)
        })
       app.get('/service/:id', async(req,res)=>{
           const id = req.params.id;
           const qurey = {_id: ObjectId(id)}
           const service = await serviceCollection.findOne(qurey)
           res.send(service)
       })

       
       app.delete('/service/:id', async(req,res)=>{
           const id = req.params.id;
           const qurey ={_id: ObjectId(id)}
           const result = await serviceCollection.deleteOne(qurey)
           res.send(result)
       })
       
       app.get('/order',verifyJWT, async(req,res)=>{
           const decodedEmail = req.decoded.email
           const email = req.query.email
           if(email === decodedEmail)
        //    console.log(email: email)
           {const qurey = {email: email}
           const cursor = orderCollection.find(qurey)
           const order = await cursor.toArray()
           res.send(order)}
           else{
            res.status(403).send({message: 'forbidden access'})
        }
       })


       app.post('/order', async(req,res)=>{
           const order = req.body;
           const result = await orderCollection.insertOne(order)
           res.send(result)
       })
    }
    finally{

    }
}
run().catch(console.dir)
app.listen(port, ()=>{
    console.log('listening the server', port)
})