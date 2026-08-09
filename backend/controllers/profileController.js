const User = require('../models/User');
const Share = require('../models/Share');
const { success, failure } = require('../utils/apiResponse');

/**
 * GET /api/profile
 */
const getProfile = async (req, res, next) => {
  try {
    const [totalShares, downloadsAgg] = await Promise.all([
      Share.countDocuments({ user: req.user._id }),
      Share.aggregate([
        { $match: { user: req.user._id } },
        { $group: { _id: null, totalDownloads: { $sum: '$downloads' } } },
      ]),
    ]);

    return success(res, {
      message: 'Profile retrieved',
      data: {
        user: req.user.toSafeObject(),
        totalShares,
        totalDownloads: downloadsAgg[0]?.totalDownloads || 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (name !== undefined) user.name = name.trim();
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();
    return success(res, { message: 'Profile updated successfully', data: { user: user.toSafeObject() } });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/profile/password
 */
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 8) {
      return failure(res, { message: 'A valid current and new password (8+ chars) are required', statusCode: 422 });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return failure(res, { message: 'Current password is incorrect', statusCode: 401 });
    }

    user.password = newPassword;
    await user.save();

    return success(res, { message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile, updatePassword };
