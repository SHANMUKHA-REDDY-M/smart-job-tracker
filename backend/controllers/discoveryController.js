import { searchJobs } from '../services/jobDiscovery.js';
import User from '../models/User.js';
import { scoreJob } from '../services/jobMatching.js';

export async function discoverJobs(req, res, next) {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const result = await searchJobs({
      query: req.query.q || '',
      location: req.query.location || '',
      page
    });
    const user = await User.findById(req.user.id).select('resumeText');
    const jobs = result.jobs
      .map((job) => ({ ...job, match: scoreJob(job, user?.resumeText) }))
      .sort((first, second) => (second.match?.score || 0) - (first.match?.score || 0));
    return res.json({ ...result, jobs, hasResume: Boolean(user?.resumeText), page });
  } catch (error) {
    return next(error);
  }
}
