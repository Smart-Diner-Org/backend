var {pool} = require('./../config');
module.exports.authenticate=function(req,res){
    var email=req.body.email;
    var password=req.body.password;
    console.log('email ' + email);
    console.log('password ' + password);
    // pool.query('SELECT * FROM customers WHERE email = ?',[email], function (error, results, fields) {
    const query = {
      // give the query a unique name
      name: 'fetch-customer',
      text: 'SELECT * FROM customers WHERE email = $1',
      values: [email],
    };
    pool.query(query, function (error, results, fields) {
      if (error) {
          res.json({
            status:false,
            message:'there are some error with query'
            })
      }else{
        console.log(results['rows']);
        results = results['rows'];
        if(results.length >0){
            if(password==results[0].password){
                res.json({
                    status:true,
                    message:'successfully authenticated',
                    userData : results[0]
                })
            }else{
                res.json({
                  status:false,
                  message:"Email and password does not match"
                 });
            }
        }
        else{
          res.json({
              status:false,    
            message:"Email does not exits"
          });
        }
      }
    });
}