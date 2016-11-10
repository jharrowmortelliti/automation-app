const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const config = require('./webpack.config');
const internalIp = require('internal-ip');
const express = require('express');
const webpack = require('webpack');
const path = require('path');
const bodyParser = require('body-parser');
const Horseman = require('node-horseman')

const taskRunner = require('./taskRunner.js')
//const CronJob = require('cron').CronJob
const program  = require('commander')

const app = express();
const compiler = webpack(config);

const middleware = webpackDevMiddleware(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath,
  silent: false,
  stats: { color: true }
});

app.use(middleware);
app.use(webpackHotMiddleware(compiler));
//new code
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/screenshots'));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './src/www/index.html'));
});

//added code to handle instructions post
app.post('/tasks', (req, res) => {
  let tasks = req.body.tasks
  let photoId = req.body.photoId
  let horseman = new Horseman({
    ignoreSSLErrors: true
  })
  taskRunner(tasks, photoId, horseman)
  .then(() => {
    console.log('tasks complete')
    res.send('task complete')
  })
}) 

app.post('/scheduleTask', (req,res) => {
  let tasks = req.body.tasks
  let photoId = req.body.photoId
  let date = new Date(req.body.date)
  let repeatValue = req.body.repeatValue
  let repeatNumber = req.body.repeatNumber  
  

  date = new Date(date)
  console.log('tasks: ' + tasks + ' / photoId: '+photoId+' / date: '+date+' / repeatValue: '+repeatValue+' / repeatNumber: '+repeatNumber)
  

  let minutes = date.getMinutes()
  let hours = date.getHours()
  let day = date.getDate()
  let month =  date.getMonth() + 1

  let cronPattern = [minutes, hours, day, month].join(' ')
try{
  new CronJob(cronPattern, function() {
    let horseman = new Horseman({
      ignoreSSLErrors: true
    })
    taskRunner(tasks, photoId, horseman)
    .then(() => {
       console.log('tasks complete')
    })
  }, null, true)
} catch (ex) {
  console.log("cron pattern not valid")
}
})

const port = 8080;
const ip = internalIp.v4();

app.listen(port, (err) => {
  if (err) {
    console.log(err);
    return;
  }

  console.log(' --------------------------------------');
  console.log(`    Local: http://0.0.0.0:${port}`);
  console.log(` External: http://${ip}:${port}`);
  console.log(' --------------------------------------');
});
