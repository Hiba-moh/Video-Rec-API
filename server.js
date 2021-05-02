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

const proConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
   //coming from Heroku addons
};

const pool = new Pool (proConfig);



app.use (cors ());


console.log(pool)

// GET "/"
app.get("/", async(req, res) => {
  try{
  const videos = await pool.query ('select *from videos');
  console.log(videos.rows)
res.send(videos.rows)
  }
  catch(error){
  console.log('Leroy message ',error.message)  
  }
});

app.use (express.json ()); 
app.use (urlencoded ({extended: true}));


// POST "/"
app.post('/',(req,res)=>{
  let  genId ;
  const {title,vurl}=req.body

const generateId=()=>{
  return Math.floor(100000 + Math.random() * 900000);
}

  if(!title || !vurl){
  res.send('error')
  }
else{
  genId = generateId();
  while (data.find(video=>{video.id==genId})){
 genId = generateId();

}
}
const rating=0;

// let newVid={"id":genId,"title":title,"url":url,"rating":rating}
// data.push(newVid);

// console.log(newVid);
// INSERT INTO videos(id,title,vUrl,rating) VALUES(323445,'Why the Tour de France is so brutal','https://www.youtube.com/watch?v=ZacOS8NBK6U',73);
const oneVideo = pool.query('INSERT INTO videos(id,title,vUrl,rating) VALUES($1,$2,$3,$4) RETURNING *',
[genId,title,vurl,rating])



res.json (oneVideo.rows[0]).status (200);
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