const jwt = require('jsonwebtoken');
const User = require('../models/User');
const seedDatabase = require('../utils/seedData');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      district: user.district,
    },
    process.env.AUTH_SECRET || 'nyaayasetu_super_secret_jwt_key_2026',
    { expiresIn: '30d' }
  );
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: { message: 'Please provide email and password' } });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (user && (await user.matchPassword(password))) {
      return res.json({
        token: generateToken(user),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          district: user.district,
          language: user.language || 'en',
          phone: user.phone,
          specialization: user.specialization,
          metrics: user.metrics,
        }
      });
    }

    return res.status(401).json({ error: { message: 'Invalid email or password' } });
  } catch (error) {
    next(error);
  }
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, district, language, phone, specialization } = req.body;

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ error: { message: 'User already exists with this email' } });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'PARALEGAL',
      district: district || 'Mandya',
      language: language || 'en',
      phone: phone || '',
      specialization: specialization || '',
    });

    res.status(201).json({
      token: generateToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        district: user.district,
        language: user.language || 'en',
        phone: user.phone,
        specialization: user.specialization,
        metrics: user.metrics,
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// @desc    Trigger Demo Database Re-seed
// @route   POST /api/auth/seed-demo
// @access  Public
const seedDemoData = async (req, res, next) => {
  try {
    const success = await seedDatabase();
    if (success) {
      res.json({ message: 'Database successfully re-seeded with demo records and legal knowledge base!' });
    } else {
      res.status(500).json({ error: { message: 'Failed to seed database' } });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list (for assignments/role directory)
// @route   GET /api/auth/users
// @access  Private
const getUsersList = async (req, res, next) => {
  try {
    const { role, district } = req.query;
    const filter = { status: 'active' };
    if (role) {
      const r = role.toLowerCase();
      if (r.includes('mitra') || r.includes('paralegal')) {
        filter.role = { $in: ['PARALEGAL', 'nyaaya_mitra'] };
      } else if (r.includes('expert')) {
        filter.role = { $in: ['LEGAL_EXPERT', 'legal_expert'] };
      } else if (r.includes('manager')) {
        filter.role = { $in: ['CASE_MANAGER', 'case_manager'] };
      } else if (r.includes('admin')) {
        filter.role = { $in: ['ADMIN', 'admin'] };
      } else {
        filter.role = role;
      }
    }
    if (district && district !== 'All' && district !== 'All Districts') {
      filter.district = district;
    }

    const users = await User.find(filter).select('-password').sort({ name: 1 });
    res.json({ users });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loginUser,
  registerUser,
  getMe,
  seedDemoData,
  getUsersList,
};
