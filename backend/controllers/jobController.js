import Job from '../models/Job.js';

export async function listJobs(req, res, next) {
  try {
    const jobs = await Job.find({ createdBy: req.user.id }).sort({ appliedAt: -1 });
    return res.json(jobs);
  } catch (error) {
    return next(error);
  }
}

export async function createJob(req, res, next) {
  try {
    const job = await Job.create({ ...req.body, createdBy: req.user.id });
    return res.status(201).json(job);
  } catch (error) {
    return next(error);
  }
}

export async function updateJob(req, res, next) {
  try {
    const editableFields = [
      'company',
      'position',
      'status',
      'location',
      'jobUrl',
      'notes',
      'appliedAt'
    ];
    const updates = Object.fromEntries(
      editableFields
        .filter((field) => Object.hasOwn(req.body, field))
        .map((field) => [field, req.body[field]])
    );
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!job) return res.status(404).json({ message: 'Job not found' });
    return res.json(job);
  } catch (error) {
    return next(error);
  }
}

export async function deleteJob(req, res, next) {
  try {
    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!job) return res.status(404).json({ message: 'Job not found' });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}
