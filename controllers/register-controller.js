var {pool} = require('./../config');
module.exports.register=function(req,res){
    var today = new Date();
    let {name,email,password,mobile} = req.body;
    console.log("reached");
    console.log(req.body);
    pool.query(`INSERT INTO customers (name,email,password,mobile,created_at,updated_at) 
                VALUES ($1,$2,$3,$4,$5,$6)`,
                [name,email,password,mobile,today,today], 
                function (error, results, fields) {
      if (error) {
        console.log("error..");
        console.log(error);
        res.json({
            status:false,
            message:'there are some error with query'
        })
      }else{
          res.json({
            status:true,
            data:results,
            message:'user registered sucessfully'
        })
      }
    });
}