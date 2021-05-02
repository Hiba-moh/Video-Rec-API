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
    if(req.query.order=='dec'){
      const videos = await pool.query ('select *from videos order by rating dec');
    }
    else if(req.query.order=='asc'){
      const videos = await pool.query ('select *from videos order by rating asc');
    }
else
  const videos = await pool.query ('select *from videos');
  // console.log(videos.rows)
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
  console.log('video data:',title,vurl)

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

// let newVid={"id":genId,"title":title,"url":url,"rating":rating}
// data.push(newVid);

// console.log(newVid);
// INSERT INTO videos(id,title,vUrl,rating) VALUES(323445,'Why the Tour de France is so brutal','https://www.youtube.com/watch?v=ZacOS8NBK6U',73);
const oneVideo = pool.query('INSERT INTO videos(id,title,vUrl) VALUES($1,$2,$3) RETURNING *',
[genId,title,vurl])



res.json (status(200));
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
console.log('Video to delete',id);
  pool.query("DELETE FROM videos WHERE id=$1", [id])
  .then(() => res.json(status(200)))
  .catch((e) => console.error(e));

// data.forEach(vid => {
//       if (vid.id === id) {
//           data.splice(vid, 1)
//           res.send("video deleted");
// return res.json(vid);
//       }   else{
//         res.send({
//           "result": "failure",
//           "message": "Video could not be deleted"
//         })
//       }
// })
})