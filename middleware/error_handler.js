export const errorhandler = (err,req,res,next)=>{
    const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    status: false,
    code: statusCode,
    message: err.message || 'Internal Server Error',
    payload: [],
  });
};



