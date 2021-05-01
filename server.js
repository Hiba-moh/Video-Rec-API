const { urlencoded } = require("express");
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const data = require('./exampleresponse.json')
const Pool = require ('pg').Pool;
const cors = require ('cors');


app.listen(port, () => console.log(`Listening on port ${port}`));

// Store and retrieve your videos from here
// If you want, you can copy "exampleresponse.json" into here to have some data to work with
// let videos = data;


const proConfig = {
  connectionString: process.env.DATABASE_URL, //coming from Heroku addons
};

const pool = new Pool (proConfig);



app.use (cors ());




// GET "/"
app.get("/", async(req, res) => {
  const videos = await pool.query ('select *from videos');
  console.log(videos.rows)
res.send(videos.rows)
});

app.use (express.json ()); 
app.use (urlencoded ({extended: true}));

// POST "/"
app.post('/',(req,res)=>{
  let  genId ;
  const {title,url}=req.body

const generateId=()=>{
  return Math.floor(100000 + Math.random() * 900000);
}

  if(!title || !url){
  res.send('error')
  }
else{
  genId = generateId();
  while (data.find(video=>{video.id==genId})){
 genId = generateId();

}
}
const rating=0;

let newVid={"id":genId,"title":title,"url":url,"rating":rating}
data.push(newVid);

console.log(newVid);
res.send('added succesfully')

})



app.get('/:id',(req,res)=>{
  const id=Number(req.params.id)
  console.log(id)
  let vid = data.find(vid=>vid.id===id)
  if(vid){
return res.json(vid)
  }
  else{
    res.send('not found')
  }
})

app.delete('/:id', (req, res) => {
  let id= Number(req.params.id);
data.forEach(vid => {
      if (vid.id === id) {
          data.splice(vid, 1)
          res.send("video deleted");
// return res.json(vid);
      }   else{
        res.send({
          "result": "failure",
          "message": "Video could not be deleted"
        })
      }
})
})