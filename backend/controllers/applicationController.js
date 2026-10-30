import Application from '../models/Application.js';

export async function listApplications(req, res, next) {
  try {
    const applications = await Application.find({ createdBy: req.user.id }).sort({ updatedAt: -1 });
    return res.json(applications);
  } catch (error) {
    return next(error);
  }
}

export async function createApplication(req, res, next) {
  try {
    const { externalJobId, title, company, location, jobUrl, status = 'saved', notes = '' } = req.body;
    const application = await Application.create({
      createdBy: req.user.id,
      externalJobId,
      title,
      company,
      location,
      jobUrl,
      status,
      notes,
      timeline: [{ status, note: notes }]
    });
    return res.status(201).json(application);
  } catch (error) {
    return next(error);
  }
}

export async function updateApplication(req, res, next) {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });
    if (!application) return res.status(404).json({ message: 'Application not found' });

    const { status, notes } = req.body;
    if (status && status !== application.status) {
      application.status = status;
      application.timeline.push({ status, note: notes || '' });
    }
    if (typeof notes === 'string') application.notes = notes;
    await application.save();
    return res.json(application);
  } catch (error) {
    return next(error);
  }
}

export async function deleteApplication(req, res, next) {
  try {
    const application = await Application.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id
    });
    if (!application) return res.status(404).json({ message: 'Application not found' });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}
