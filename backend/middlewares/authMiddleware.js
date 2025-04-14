const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");
  
  if (!token) return res.status(401).json({ message: "Немає доступу" });

  try {
    const verified = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);

    req.user = verified;
    next(); 
  } catch (err) {
    res.status(401).json({ message: "Невірний токен" });
  }
};

const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };
