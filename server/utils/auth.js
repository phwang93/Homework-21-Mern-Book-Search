const jwt = require('jsonwebtoken');

// set token secret and expiration date
const secret = 'mysecretsshhhhh';
const expiration = '2h';

module.exports = {
  // function for our authenticated routes
  authMiddleware: function ({ req }) {
    let token =
      req?.body?.token || req?.query?.token || req.headers.authorization;
    token = token.split(" ").pop().trim();
    if (!token) {
      return req
    }

    // don't verify for all requests
    try {
      const { data } = jwt.decode(token, secret);
      return { ...req, data };
    } catch (err) {
      console.log(err);
      console.log("Invalid token");
      return res.status(400).json({ message: "invalid token!" });
    }
  },
  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };

    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};