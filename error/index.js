exports.handle400 = (err, req, res, next) => {
  const codes = ['42703'];
  if (codes.includes(err.code)) {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`400 - error code: ${err.code} - message: ${err.toString()}`);
    }
    res.status(400).send({ message: '400: Bad Request' });
  } else next(err);
};
exports.handle404 = (err, req, res, next) => {
  const codes = [];
  if (err.status === 404 || codes.includes(err.code)) {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`404 - error code: ${err.code} - message: ${err.message || err.toString()}`);
    }
    res.status(404).send({ message: '404: Not found' });
  } else next(err);
};
exports.handle500 = (err, req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`500 - error code: ${err.code} --- message: ${err.message}`);
  }
  res.status(500).send({ message: '400: Server Error' });
};
