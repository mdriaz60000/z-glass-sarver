const express = require('express')
const cors = require("cors");
require("dotenv").config();
const app = express()
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { default: axios } = require('axios');
require('dotenv').config()

//middlewere
app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

// ReDMlQIaToZOFcV6


 const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.c6fbz7w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
 console.log(uri)
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const sunglassCollection = client.db('sunglassDb').collection('sunglass')
    const payments = client.db('sunglassDb').collection('payment')

    app.post('/sunglass', async (req, res) => {
      const newSunglass = req.body
      console.log(newSunglass)
      const result = await sunglassCollection.insertOne(newSunglass)
      res.send(result) 
    })

    // payment
    app.post("/createPayment", async (req, res)=>{
      const paymentInfo = req.body
     const tranxId = new ObjectId().toString()
     
      const  intialeData = {
        store_id: 'riaz66fa2670e473d',
        store_passwd: 'riaz66fa2670e473d@ssl',
        total_amount: '480',
        currency: 'BDT',
        tran_id: tranxId,
        success_url: 'https://z-glass.web.app/success-payment',
        fail_url: 'https://z-glass.web.app/fail',
        cancel_url: 'https://z-glass.web.app/cancel',
        cus_name: 'Customer Name',
        cus_email: 'cust@yahoo.com',
        cus_add1: 'Dhaka',
        cus_add2: 'Dhaka',
        cus_city: 'Dhaka',
        cus_state: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: '01711111111',
        cus_fax: '01711111111',
        ship_country: 'Bangladesh',
        multi_card_name: 'mastercard,visacard,amexcard',
        value_a: 'ref001_A',
        value_b: 'ref002_B',
        value_c: 'ref003_C',
        value_d: 'ref004_D',
        product_name : 'sunglass',
        product_category : 'many',
        product_profile : 'general',
        shipping_method : 'No'
      };
 
      const response = await axios({
       method: 'POST',
       url: 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php',
       data: intialeData,
       headers: {
        "Content-Type": "application/x-www-form-urlencoded",
       }
      })
      console.log(response)

      const saveData = {
        customar_name: 'dummy',
        paymentId: intialeData.tran_id,
        amount : intialeData.total_amount,
        status: 'pending',
      }
      const save = await payments.insertOne(saveData)
      if(save){
        res.send({
          paymentUrl : response.data.GatewayPageURL,
      })
      } 

    })

    app.post('/success-payment', async (req, res)=>{
     const successData = req.body
     if(successData.status!== 'Valid'){
      throw new Error('Unauthorized Payment , Invalid Payment');
     }
     // update database
    const query = {
      paymentId : successData.tran_id
    }
    const update ={
      $set: {
        status : 'Success'
      }
    }

    const updateData = await payments.updateOne(query, update)
    console.log ('successData', successData)
    console.log('updateData', updateData)
    res.redirect("https://z-glass.web.app/success")
    })

     app.post('/fail', async (req, res)=>{
      res.redirect("https://z-glass.web.app/fail")
     })

     app.post('/cancel', async (req, res)=>{
      res.redirect("https://z-glass.web.app/cancel")
     })

     // get
    app.get('/sunglass',async (req, res)=>{
      const result = await sunglassCollection.find().toArray()
      res.send(result)
     })

     app.delete('/sunglass/:id',async (req, res)=>{
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const result = await sunglassCollection.deleteOne(query)
      res.send(result)
     })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
   run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('z-glass-return')
})

app.listen(port, () => {
  console.log(`z-glass-server app listening on port ${port}`)
})