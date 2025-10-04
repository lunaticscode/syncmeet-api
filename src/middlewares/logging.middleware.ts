const loggingMiddleware: AppMiddleware = (req, _, next) => {
  console.log("req.url => ", req.url);
  next();
};

export default loggingMiddleware;
