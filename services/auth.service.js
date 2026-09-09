const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const { USER_ROLES } = require('../utils/constants');

class AuthService {
  /**
   * Generates JWT token for authenticated user
   */
  generateToken(user) {
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
      hotelId: user.hotelId || null
    };

    return jwt.sign(
      payload,
      process.env.JWT_SECRET || 'super_secret_jwt_key_cia3_hotel_platform_2026',
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      }
    );
  }

  /**
   * Register a new user
   */
  async register(userData, creatorUser = null) {
    const { name, email, password, role, hotelId, phone } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw ApiError.conflict(`User with email '${email}' already exists`);
    }

    // Role safety check: only Admin can create Staff or Admin accounts
    let assignedRole = USER_ROLES.GUEST;
    if (role && role !== USER_ROLES.GUEST) {
      if (!creatorUser || creatorUser.role !== USER_ROLES.ADMIN) {
        throw ApiError.forbidden('Only an administrator can register Staff or Admin accounts');
      }
      assignedRole = role;
    }

    const passwordHash = await User.hashPassword(password);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: assignedRole,
      hotelId: assignedRole === USER_ROLES.STAFF ? hotelId : null,
      phone
    });

    const token = this.generateToken(newUser);

    return {
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        hotelId: newUser.hotelId,
        phone: newUser.phone,
        createdAt: newUser.createdAt
      },
      token
    };
  }

  /**
   * Authenticate user login
   */
  async login(email, password) {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const token = this.generateToken(user);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hotelId: user.hotelId,
        phone: user.phone,
        createdAt: user.createdAt
      },
      token
    };
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId) {
    const user = await User.findById(userId).populate('hotelId', 'name city address');
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return user;
  }
}

module.exports = new AuthService();
