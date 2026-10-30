import User from '../models/User.js';

export async function getResume(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select('resumeText');
    return res.json({ resumeText: user?.resumeText || '' });
  } catch (error) {
    return next(error);
  }
}

export async function saveResume(req, res, next) {
  try {
    const resumeText = typeof req.body.resumeText === 'string' ? req.body.resumeText.trim() : '';
    if (resumeText.length > 30000) {
      return res.status(400).json({ message: 'Resume text must be 30,000 characters or fewer.' });
    }

    await User.findByIdAndUpdate(req.user.id, { resumeText });
    return res.json({ resumeText });
  } catch (error) {
    return next(error);
  }
}

export async function deleteResume(req, res, next) {
  try {
    await User.findByIdAndUpdate(req.user.id, { resumeText: '' });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}
