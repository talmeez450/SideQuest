const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sql } = require('../config/db');

// description:   Register a new user
// route:   POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { fullName, email, password, cnic } = req.body;

        // Check if user already exists
        const userCheck = await sql.query`SELECT * FROM Users WHERE Email = ${email} OR CnicNumber = ${cnic}`;
        if (userCheck.recordset.length > 0) {
            return res.status(400).json({ success: false, message: 'User with this email or CNIC already exists' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user into database
        const result = await sql.query`
            INSERT INTO Users (FullName, Email, PasswordHash, CnicNumber) 
            OUTPUT INSERTED.UserID, INSERTED.FullName, INSERTED.Email
            VALUES (${fullName}, ${email}, ${hashedPassword}, ${cnic})
        `;

        res.status(201).json({ 
            success: true, 
            message: 'User registered successfully',
            user: result.recordset[0]
        });

    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ success: false, message: 'Server error during registration' });
    }
};

// description:    Login user & get token
// route:   POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find user by email
        const result = await sql.query`SELECT * FROM Users WHERE Email = ${email}`;
        const user = result.recordset[0];

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // 2. Compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(password, user.PasswordHash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // 3. Generate JWT Token
        const payload = {
            id: user.UserID,
            email: user.Email,
            isVerified: user.IsKycVerified
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.UserID,
                fullName: user.FullName,
                email: user.Email,
                rating: user.Rating
            }
        });

    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
};