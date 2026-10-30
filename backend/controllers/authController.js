import jwt from 'jsonwebtoken';
import User from '../models/User.js';

function createToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
}

export async function register(req, res, next) {
  try {
    const { name, email, password, role = 'seeker' } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const user = await User.create({ name, email, password, role });
    return res.status(201).json({
      token: createToken(user.id),
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.json({
      token: createToken(user.id),
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    return next(error);
  }
}
