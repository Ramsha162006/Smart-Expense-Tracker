const{createClient} = require("redis")
const redisClient = createClient({
    url : process.env.REDIS_URL || "redis://localhost:6379"
});
redisClient.on("erroe",(err) => {
    console.log("Redis Client Error: ",err);
});
(async ()=>{
    try{
        await redisClient.connect();
        console.log("Redis connected successfully!");
    }catch(err){
        console.log("Redis connection failed: ",err);
    }
})();
module.exports = redisClient;