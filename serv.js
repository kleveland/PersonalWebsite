const express = require('express')
const path = require('path')
const app = express()

app.use('/static', express.static(path.join(__dirname, 'public')))
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

console.log(path.join(__dirname, 'public'));

app.get('/', (req, res) => {
    res.render('home', { title: "Title Message", nav: ["Home", "About Me", "Skills and CV", "Projects"]});
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))
