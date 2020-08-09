const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Jimp = require('jimp');
const toastr = require('toastr');
// const session = require('express-session')
// const flash = require('connect-flash');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static('public'));
app.set('view engine','ejs');
// app.use(session({
//     secret: 'Any data',
//     cookie: {maxAge: 60000},
//     resave: false,
//     saveUninitialized: false
// }));
// app.use(flash());

mongoose.connect('mongodb+srv://msSiddhesh:ms-certificate@cluster0.xylfk.mongodb.net/certificate?retryWrites=true&w=majority',{useNewUrlParser : true, useCreateIndex: true, useUnifiedTopology: true})
// mongoose.connect('mongodb://localhost:27017/certificate', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// });

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    portFolio: String
})

const user = mongoose.model('user', userSchema)

// user.create({
// 	firstName : 'Muddayya',
// 	lastName : 'Swami',
// 	portFolio : 'Alumni Outreach'
// })

app.get('/', (req, res) => {
    res.render('form.ejs')
})

app.get('/download', (req, res) => {

// toastr.options = {
//   "closeButton": false,
//   "debug": false,
//   "newestOnTop": false,
//   "progressBar": false,
//   "positionClass": "toast-top-right",
//   "preventDuplicates": false,
//   "onclick": null,
//   "showDuration": "300",
//   "hideDuration": "1000",
//   "timeOut": "5000",
//   "extendedTimeOut": "1000",
//   "showEasing": "swing",
//   "hideEasing": "linear",
//   "showMethod": "fadeIn",
//   "hideMethod": "fadeOut"
// }
//     toastr.success('Successfully Downloaded !!')
    res.download('./image/newCertificate.jpg');
    });

app.get('/certificate', (req, res) => {

    let newUser = {
    'firstName': new RegExp(`^${req.query.firstName}$`, 'i'),
    'lastName': new RegExp(`^${req.query.lastName}$`, 'i'),
    'portFolio': new RegExp(`^${req.query.portFolio}$`, 'i'),
        };

    user.findOne(newUser, (err, foundUser) => {
        if (err) {
            console.log('Error @finding user')
            res.redirect('/')
        } else {
            if (!foundUser) {
                console.log('Error @not found user')
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
            // req.flash('message', 'Downloaded successfully :)');
            res.redirect('/download');
        }
    }
    })
})

app.listen(process.env.PORT || 3000, () => console.log('Server started :D\n'))