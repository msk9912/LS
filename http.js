const {createServer} = require('http');
const {stat, createReadStream, createWriteStream, fstat} = require('fs');
const {promisify} = require('util');
const multiparty = require('multiparty');

var fileName;

// const fs = require('fs');
// const videoData=fs.readFileSync('file.txt', {encoding:'utf8',flag:'r'});
// console.log(videoData[1]);
// const filename = './copy/newVid.webm';
// const filename = './anime_dancing.mp4';
// const filename = './copy/2022620249_53_165'+'.mp4';
var filename;
const fileInfo = promisify(stat);

const sendOGVideo = async (req, res) => {
  const {size} = await fileInfo(filename); 
  const range = req.headers.range;
  if(range){
    let [start, end] = range.replace(/bytes=/, '').split('-');
    start = parseInt(start, 10);
    end = end ? parseInt(end, 10) : size-1;

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': (start-end) + 1,
      'Content-Type': 'video/mp4'
    })

    createReadStream(filename, {start, end}).pipe(res);
  }else{
    res.writeHead(200, {
      'Content-Length': size,
      'Content-Type': 'video/mp4'
    });  
    createReadStream(filename).pipe(res);
  }
};

createServer((req, res) => {
  let today = new Date();   
  let year = today.getFullYear(); // 년도
  let month = today.getMonth() + 1;  // 월
  let date = today.getDate();  // 날짜
  // let day = today.getDay();  
let hours = today.getHours(); // 시
let minutes = today.getMinutes();  // 분
let seconds = today.getSeconds();  // 초
let milliseconds = today.getMilliseconds(); // 밀리초

// var fileName;

  if(req.method === "POST"){
    let form = new multiparty.Form();
    fileName = "./copy/"+year+month+date+hours+minutes + "_" + seconds + "_" + milliseconds+".mp4";
    filename = fileName;
    form.on('part', (part) =>{
      part
        // .pipe(createWriteStream(`./copy/${part.filename}`))
        // .pipe(createWriteStream('./copy/'+year+month+date+hours+minutes + '_' + seconds + '_' + milliseconds+'.mp4'))
        .pipe(createWriteStream(fileName))
        .on('close', () => {
          res.writeHead(200, { 'Content-Type': 'text/html'});
          // res.end(`<h1>File Uploaded: ${part.filename}</h1>`)
          res.end(`
          <head>
            <style>
              .button{
                color:skyblue;
                border:1px solid skyblue;
                background-color:rgba(0,0,0,0);
                border-radius:10px;
                width:100px;
                height:40px;
                font-size:15px;
              }
            </style>
          </head>
          <a href="http://192.168.0.46:5050/og"><button class="button">Play</button></a>`)
        })
    })
    form.parse(req);
  }
  else if(req.url === "/og"){
    sendOGVideo(req, res);
  } else{
    res.writeHead(200, {'Content-Type': 'text/html'})
    res.end(`
    <head>

      <style>
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display&display=swap');
        #ok{
          font-family: 'Playfair Display', serif;
          font-size:100px;
          color:#6799FF;
        }
      
        .button{
          color:skyblue;
          border:1px solid skyblue;
          background-color:white;
          border-radius:10px;
          width:200px;
          height:80px;
          font-size:30px;}

        div{            
          position:absolute;
          top: 50%; left:50%;
          transform:translate(-50%, -50%);
          margin:0;
         
        }
        
        body{
          background:#EBF7FF;
        }
        
      </style>
    </head>
    <body>
    
      <form enctype="multipart/form-data" method="POST" action="/">
      <h1 id="ok" style="text-align: center;">Local Shorts'</h1>
      <hr>
      <div>
      <input type="file" name="upload-file" accept="video/*" capture="camera">
      <button class="button">Upload File</button>
      </div>
    </body>
    </form>
  `)
  }
}).listen(5050, () => console.log('server running on port 5050'));