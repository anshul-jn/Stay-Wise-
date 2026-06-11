import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'staywise_secret_key_123', {
    expiresIn: '30d'
  });
};

export const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  console.log(`[Auth] Attempting registration for email: ${email}, role: ${role}`);

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      console.warn(`[Auth Warning] Registration failed: User ${email} already exists.`);
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Generate Verification Token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    const verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'customer',
      isVerified: false,
      verificationToken,
      verificationTokenExpire
    });
    console.log(`[Auth] User ${email} created successfully in DB (isVerified: false). Sending email...`);

    // Send email
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${verificationToken}`;
    const message = `Welcome to StayWise.ai! Please verify your email by clicking the link: \n\n ${verifyUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Verify your StayWise.ai Account',
        message
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful! Please check your email to verify your account.'
      });
    } catch (emailError) {
      console.error(`[Auth Error] Failed to send email to ${email}:`, emailError);
      user.verificationToken = undefined;
      user.verificationTokenExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
  } catch (error) {
    console.error(`[Auth Error] Registration error for ${email}:`, error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password, loginRole } = req.body;
  console.log(`[Auth] Attempting login for email: ${email}, portal: ${loginRole}`);

  try {
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      // If logging in from the Admin Portal, ensure the user is an admin
      if (loginRole === 'admin' && user.role !== 'admin') {
        console.warn(`[Auth Warning] Login failed: Customer ${email} attempted to access Admin Portal.`);
        return res.status(403).json({ success: false, message: 'No such admin exists' });
      }

      if (!user.isVerified) {
        console.warn(`[Auth Warning] Login failed: User ${email} has not verified their email.`);
        return res.status(401).json({ success: false, message: 'Please verify your email first' });
      }

      console.log(`[Auth] User ${email} logged in successfully.`);

      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id)
        }
      });
    } else {
      console.warn(`[Auth Warning] Login failed for ${email}: Invalid credentials or user not found.`);
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(`[Auth Error] Login error for ${email}:`, error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json({ success: true, data: user });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    console.log(`[Auth] Attempting email verification with token: ${token.substring(0, 10)}...`);

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpire: { $gt: Date.now() }
    });

    if (!user) {
      console.warn(`[Auth Warning] Verification failed: Invalid or expired token.`);
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save();

    console.log(`[Auth] User ${user.email} verified successfully.`);
    res.json({ success: true, message: 'Email verified successfully! You can now log in.' });
  } catch (error) {
    console.error(`[Auth Error] Email verification error:`, error);
    res.status(500).json({ success: false, message: error.message });
  }
};
