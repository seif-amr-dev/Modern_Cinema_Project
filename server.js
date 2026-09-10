
const  app = require("./index.js")
 const connectdb= require("./connectDb.js")


const {setServers} = require("dns/promises")
setServers(["8.8.8.8","8.8.4.4"])
app.set("query parser" , "extended")
connectdb();
app.listen(3000,(req,res)=>{

console.log("server is running at port 3000");

})