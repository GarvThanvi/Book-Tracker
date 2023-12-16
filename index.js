import express from "express";
import pg from "pg";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000;
const API_URL = "https://openlibrary.org/search.json";

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "PagePal",
  password: "GArv1234",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static("public"));

app.get("/", async (req, res) => {
   try{
       const your_reads = await db.query("SELECT * FROM your_reads");
       const yr_data = your_reads.rows;

       const wishlist = await db.query("SELECT * FROM wishlist");
       const wl_data = wishlist.rows;
       res.render("index.ejs", {yr : yr_data , wl : wl_data });
   }catch(err){
      console.log(err);
   }

   
});

app.get("/search", (req,res) =>{
  res.render("search.ejs");
});

app.post("/findbook", async (req, res)=>{
   
  const booktofind = addPlusSigns(req.body.bookname);
  try{
   const result = await axios.get(API_URL, {
      params: {title: booktofind,},
   });
   if(result){
   res.render("search.ejs", { 
      allbooks: result.data.docs,  
   })}else{
      res.render("search.ejs", {noresult : "No books match your keyword."});
   }
  } catch(err){
   console.log(err);
  }
  
  
});

app.post("/addtoyr", async(req,res)=>{
   const bookcontent = req.body.content;
   const parts = bookcontent.split("+");
   
   

   try{
      await db.query("INSERT INTO your_reads (lccn , title) VALUES ($1, $2)", [parts[1], parts[0]]);
   }catch(err){
      console.log(err);
   }

});

app.post("/addtowl", async(req,res)=>{
   const bookcontent = req.body.content;
   const parts = bookcontent.split("+");
   
   

   try{
      await db.query("INSERT INTO wishlist (lccn , title) VALUES ($1, $2)", [parts[1], parts[0]]);
   }catch(err){
      console.log(err);
   }

});


app.listen(port, ()=>{
   console.log(`Server running on ${port}`);
});

function addPlusSigns(inputString) {
   var words = inputString.split(' ');
   for (var i = 0; i < words.length - 1; i++) {
     words[i] += '+';
   }
   var result = words.join(''); 
   return result;
 }
 
