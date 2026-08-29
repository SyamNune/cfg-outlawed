const User = require('../models/User');
const Case = require('../models/Case');
const KnowledgeArticle = require('../models/KnowledgeArticle');

// @desc    Get all users (Admin view)
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const { role, district, search } = req.query;
    const filter = {};

    if (role && role !== 'all') {
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
    if (district && district !== 'all' && district !== 'All' && district !== 'All Districts') {
      filter.district = district;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json({ count: users.length, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin Create User
// @route   POST /api/admin/users
// @access  Private (Admin)
const createUserByAdmin = async (req, res, next) => {
  try {
    const { name, email, password, role, district, phone, specialization } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: { message: 'Name, email, password, and role are required.' } });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: { message: 'User already exists with this email address.' } });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
      district: district || 'Bengaluru Urban',
      phone: phone || '',
      specialization: specialization || '',
      status: 'active',
      metrics: {
        casesHandled: 0,
        fieldVisitsCount: 0,
        resolvedCount: 0,
        rating: 5.0,
        pendingCases: 0
      }
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        district: user.district,
        phone: user.phone,
        specialization: user.specialization,
        status: user.status
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin Update User (Change role, district, status, etc.)
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
const updateUserByAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }

    const { name, email, role, district, phone, specialization, status } = req.body;

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (role) user.role = role;
    if (district) user.district = district;
    if (phone !== undefined) user.phone = phone;
    if (specialization !== undefined) user.specialization = specialization;
    if (status) user.status = status;

    const updatedUser = await user.save();
    res.json({ message: 'User details and role updated successfully', user: updatedUser });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin Delete User
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const deleteUserByAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: `User "${user.name}" (${user.email}) successfully removed.` });
  } catch (error) {
    next(error);
  }
};

// @desc    Get System-Wide Statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getSystemStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCases = await Case.countDocuments();
    const totalKnowledge = await KnowledgeArticle.countDocuments();
    const highPriorityCases = await Case.countDocuments({ priority: 'high' });
    const resolvedCases = await Case.countDocuments({ status: { $in: ['resolved', 'closed'] } });

    const roleBreakdown = {
      nyaaya_mitra: await User.countDocuments({ role: 'nyaaya_mitra' }),
      case_manager: await User.countDocuments({ role: 'case_manager' }),
      legal_expert: await User.countDocuments({ role: 'legal_expert' }),
      admin: await User.countDocuments({ role: 'admin' }),
    };

    res.json({
      totalUsers,
      totalCases,
      totalKnowledge,
      highPriorityCases,
      resolvedCases,
      roleBreakdown,
      dbStatus: 'Connected - MongoDB Atlas Cluster0'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  createUserByAdmin,
  updateUserByAdmin,
  deleteUserByAdmin,
  getSystemStats,
};
