const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Jimp = require('jimp');
const _ = require('lodash');
// const session = require('express-session')
// const flash = require('connect-flash');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static('public'));
app.set('view engine','ejs');

global.state = '';

mongoose.connect('mongodb+srv://msSiddhesh:ms-certificate@cluster0.xylfk.mongodb.net/certificate?retryWrites=true&w=majority',{useNewUrlParser : true, useCreateIndex: true, useUnifiedTopology: true})
// mongoose.connect('mongodb://localhost:27017/certificate', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// });

const userSchema = new mongoose.Schema({
    firstName: {type: String,trim: true},
    lastName: {type: String,trim: true},
    portFolio: {type: String,trim: true}
})

const user = mongoose.model('user', userSchema)

// user.create({
// 	firstName : 'Siddhesh',
// 	lastName : 'Bhujbal',
// 	portFolio : 'Web'
// })

app.get('/', (req, res) => {
    res.render('form.ejs')
})

app.get('/download', (req, res) => {
    res.download('./image/newCertificate.jpg');
    });

app.get('/certificate', (req, res) => {


    let newUser = {
    'firstName': new RegExp(`^${_.trim(req.query.firstName)}$`, 'i'),
    'lastName': new RegExp(`^${_.trim(req.query.lastName)}$`, 'i'),
    'portFolio': new RegExp(`^${_.trim(req.query.portFolio)}$`, 'i')
         };

    user.findOne(newUser, (err, foundUser) => {
        if (err) {
            console.log('Error @finding user')
            res.redirect('/')
        } else {
            if (!foundUser) {
                state = false;
                res.redirect('/')
            } else {
                
            var fullName = foundUser.firstName + ' ' + foundUser.lastName;
            Jimp.read('image/certificate.jpg')
                .then(cert => {

                    Jimp.loadFont('./public/font/customJIMPFont.fnt').then(font => {
                        cert.print(
                            font,
                            416,
                            430, {
                                text: fullName,
                                alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                                alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
                            },
                            457,
                            10
                        );

                        cert.print(
                            font,
                            855,
                            462, {
                                text: foundUser.portFolio,
                                alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                                alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
                            },
                            270,
                            21
                        );

                        cert
                            .resize(1080, 720) // resize
                            .quality(100) // set JPEG quality
                            .write('./image/newCertificate.jpg'); // save 

                    });

                })
                state = true;
            res.redirect('/download');
        }
    }
    })
})

app.listen(process.env.PORT || 3000, () => console.log('Server started :D\n'))