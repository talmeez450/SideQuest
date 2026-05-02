const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sql } = require('../config/db');

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { fullName, email, password, cnic } = req.body;
        const userCheck = await sql.query`SELECT * FROM Users WHERE Email = ${email} OR CnicNumber = ${cnic}`;
        if (userCheck.recordset.length > 0) return res.status(400).json({ success: false, message: 'User with this email or CNIC already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await sql.query`
            INSERT INTO Users (FullName, Email, PasswordHash, CnicNumber) 
            OUTPUT INSERTED.UserID, INSERTED.FullName, INSERTED.Email
            VALUES (${fullName}, ${email}, ${hashedPassword}, ${cnic})
        `;
        res.status(201).json({ success: true, message: 'User registered successfully', user: result.recordset[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error during registration' });
    }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await sql.query`SELECT * FROM Users WHERE Email = ${email}`;
        const user = result.recordset[0];

        if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });

        if (user.IsSuspended) return res.status(403).json({ success: false, message: 'Your guild membership has been suspended by the Grandmaster.' });

        const isMatch = await bcrypt.compare(password, user.PasswordHash);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password' });

        const payload = { id: user.UserID, email: user.Email, isVerified: user.IsKycVerified };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.UserID,
                fullName: user.FullName,
                email: user.Email,
                rating: user.Rating,
                isAdmin: user.IsAdmin,
                kycStatus: user.KycStatus,
                avatarUrl: user.AvatarUrl
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
};
