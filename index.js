const express = require('express');
const app = express();
const ejs = require('ejs');
const bodyParser = require('body-parser');
const multer = require('multer');
const colors = require('colors');
const path = require('path');
let achyDB = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './database')
  },
  filename: function (req, file, callback) {
    callback(null, Math.random().toString(36).substring(7) + path.extname(file.originalname))
  }
})

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/uploads/:name', (req, res) => {
  res.sendFile(path.join(__dirname, 'database', req.params.name))
})

app.post('/', function (req, res) {
  let upload = multer({
    storage: achyDB,
    fileFilter: function (req, file, callback) {
      let idk = path.extname(file.originalname)
      if (idk !== '.png' && idk !== '.jpg') {
        return callback(res.end(''), null)
      }
      callback(null, true)
    }
  }).single('achy');
  upload(req, res, function (err) {
    res.end(`Successful! \nYour photo has been successfully uploaded to the system! \n/uploads/${req.file.filename}`)
  })
})

app.listen(3000, console.log(`[SYSTEM] Website live!`.green))