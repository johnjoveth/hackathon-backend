const express = require('express')
const mongoose = require('mongoose')

const Equipment = require('./models/equipmentModel')
const Manual = require('./models/manualModel')
const config = require('./config/config')
const nodemailer = require('nodemailer');
const client = require('twilio')('AC3530e532382c9c98e5f5801c043aee87', '9b734b623dc5b04df42a2493493cde41');

const app = express()
const objectID = require('mongodb').ObjectID

app.use(express.json())
app.use(express.urlencoded({extended: false}))

const port = 5000
let isSent = false
let isCalled = false
let recentTemp = 30.0
let recentCallTemp = 35.0


// Configure Nodemailer with your email service provider details
const configEmail = {
    service: 'gmail',
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: 'ceeceehackers@gmail.com',
        pass: 'fwipnyqrokolvlmo',
      },
  };

//routes

app.get('/', (req, res) => {
    res.send('Happy Hacking!')
})

app.get('/equipments', async(req, res) => {
    try {
        const products = await Equipment.find({});
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

app.get('/equipments/:id', (req, res) =>{
    // try {
    //     const id = req.params.id;
    //     const product = await Equipment.findById({_id: id}).exec();
    //     res.status(200).json(product);
    // } catch (error) {
    //     res.status(500).json({message: error.message})
        // }
     Equipment.findById(req.params.id).then((equipment) => {
        if(!equipment)
        {
           return res.status(404).send();
        }
        console.log(equipment)
        res.status(200).json(equipment);
        
    }).catch((error) => {
        return res.status(500).send(error);
    })

})


app.post('/equipments', async(req, res) => {
    try {
        const product = await Equipment.create(req.body)
        res.status(200).json(product);
        
    } catch (error) {
        console.log(error.message);
        res.status(500).json({message: error.message})
    }
})

// update an Equipment
app.put('/equipments/:id', async(req, res) => {
    try {
        const product = await Equipment.findByIdAndUpdate(req.params.id);
        // we cannot find any product in database
        if(!product){
            return res.status(404).json({message: `cannot find any product with ID ${req.params.id}`})
        }
        const updatedProduct = await Equipment.findById(id);
        res.status(200).json(updatedProduct);
        
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// delete a n Equipment

app.delete('/equipments/:id', async(req, res) =>{
    try {
        const product = await Equipment.findOneAndDelete(req.params.id);
        if(!product){
            return res.status(404).json({message: `cannot find any equip with ID ${req.params.id}`})
        }
        if(req.body.temperature > 38)
        {
            
        }
        res.status(200).json(product);
        
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// update endpoint for micro controller
app.put('/microcontroller/equipments', async(req, res) => {
    try {
        const {name} = req.body.name;
        console.log(name)
        const product = await Equipment.findOneAndUpdate(name, req.body, { new: true});
        // we cannot find any product in database
        if(!product){
            return res.status(404).json({message: `cannot find any equipment with name ${req.body.name}`})
        }
        if(req.body.temperature > 38)
        {
            if(!isSent || ((recentTemp + 1) < req.body.temperature) || ((recentTemp - 1) > req.body.temperature))
            { 

                //for sending email
                const mailOptions = {
                    from: 'CeeCeeHackers@alert.com',
                    to: 'john.joveth.r.flores@accenture.com',
                    subject: 'Temperature Alert',
                    text: `The temperature has exceeded the threshold. Current temperature: ${req.body.temperature}°C while the humidity is ${req.body.humid}`,
                  };
                const transporter = nodemailer.createTransport(configEmail);
                transporter.sendMail(mailOptions, (err, info) => {
                    if(err){
                        console.log(err);
                    }
                    else{
                        console.log(info.response);
                        isSent = true;
                        recentTemp = req.body.temperature;
                    }
                })

                //for calling

                if(req.body.temperature > 40)
                {
                    if(!isCalled || ((recentCallTemp + 2) < req.body.temperature) || ((recentCallTemp - 2) > req.body.temperature))
                    {
                        
                        client.calls.create({
                            url: 'http://demo.twilio.com/docs/voice.xml', // TwiML URL for call instructions
                            to: '+639567715776',
                            from: '+12343243158',
                            // from: '+15005550006',
                          })
                          .then(call => {
                                        console.log('Phone call initiated:', call.sid);
                                        isCalled = true
                                        recentCallTemp = req.body.temperature;
                                    })
                          .catch(error => console.log('Error making phone call:', error));

                        
                          
                    }
                    
                }
                else
                {
                    if(req.body.temperature < 38 )
                    {
                        isCalled = false
                    }
                }
            }
            
        }
        else{
            isSent = false
        }
        
        res.status(200).json(product);
        
    } catch (error) {
        res.status(500).json({message: error.message})
    }

});

//Update manuals post
app.post('/manual', async(req, res) => {
    try {
        const product = await Manual.create(req.body)
        res.status(200).json(product);
        
    } catch (error) {
        console.log(error.message);
        res.status(500).json({message: error.message})
    }
})

//manuals get all
app.get('/manual', async(req, res) => {
    try {
        const products = await Manual.find({});
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

mongoose.set("strictQuery", false)
mongoose.connect(config.db, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('connected to MongoDB')
    app.listen(process.env.PORT || port, ()=> {
        console.log(`Node API app is running on port ${port}`)
    });
}).catch((error) => {
    console.log(error)
})