const { sql } = require('../config/db');

const adminOnly = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const result = await sql.query`SELECT IsAdmin FROM Users WHERE UserID = ${userId}`;
        
        if (result.recordset.length === 0 || !result.recordset[0].IsAdmin) {
            return res.status(403).json({ success: false, message: 'Only Admins may enter here.' });
        }
        
        next();
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error verifying admin status' });
    }
};

module.exports = { adminOnly };
