import { GoogleGenerativeAI } from '@google/generative-ai';
import Job from '../models/Job.js';

const MAX_HISTORY_MESSAGES = 12;

function getModel() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return null;

  const client = new GoogleGenerativeAI(apiKey);
  return client.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash'
  });
}

function formatStatus(status) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

async function getBuiltInReply(message, userId) {
  const normalizedMessage = message.toLowerCase();
  const jobs = await Job.find({ createdBy: userId }).sort({ appliedAt: -1 }).lean();
  const counts = jobs.reduce((result, job) => {
    result[job.status] = (result[job.status] || 0) + 1;
    return result;
  }, {});

  if (/\b(help|support|how do i|what can you)\b/.test(normalizedMessage)) {
    return 'I can help you track applications, add or update jobs, cycle statuses, search your jobs, and answer questions about interviews and job searching.';
  }

  if (/\b(how many|count|total|applications|jobs)\b/.test(normalizedMessage)) {
    const breakdown = ['pending', 'applied', 'interview', 'offer', 'rejected']
      .filter((status) => counts[status])
      .map((status) => `${formatStatus(status)}: ${counts[status]}`)
      .join(', ');
    return `You have ${jobs.length} tracked job${jobs.length === 1 ? '' : 's'}${breakdown ? `. ${breakdown}.` : '.'}`;
  }

  if (/\b(interview|interviewing)\b/.test(normalizedMessage)) {
    const interviews = jobs.filter((job) => job.status === 'interview');
    if (!interviews.length) return 'You do not have any applications marked as interviewing yet.';
    return `You have ${interviews.length} interview${interviews.length === 1 ? '' : 's'}: ${interviews.map((job) => `${job.position} at ${job.company}`).join(', ')}.`;
  }

  if (/\b(offer|offers)\b/.test(normalizedMessage)) {
    const offers = jobs.filter((job) => job.status === 'offer');
    return offers.length
      ? `You have ${offers.length} offer${offers.length === 1 ? '' : 's'}: ${offers.map((job) => `${job.position} at ${job.company}`).join(', ')}.`
      : 'You do not have any applications marked as offers yet.';
  }

  if (/\b(pending|follow.?up|next step)\b/.test(normalizedMessage)) {
    const pending = jobs.filter((job) => ['pending', 'applied'].includes(job.status));
    return pending.length
      ? `Consider following up on: ${pending.slice(0, 5).map((job) => `${job.position} at ${job.company}`).join(', ')}.`
      : 'You have no pending or applied jobs that need a follow-up.';
  }

  return 'I am your built-in job tracker assistant. Ask me about your application count, interviews, offers, follow-ups, or how to use the tracker.';
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) return [];

  return history
    .filter(
      (entry) =>
        entry &&
        ['user', 'model'].includes(entry.role) &&
        typeof entry.text === 'string' &&
        entry.text.trim()
    )
    .slice(-MAX_HISTORY_MESSAGES)
    .map((entry) => ({
      role: entry.role,
      parts: [{ text: entry.text.trim().slice(0, 4000) }]
    }));
}

export async function chat(req, res, next) {
  try {
    const { message, history } = req.body;

    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ msg: 'Please provide a chat message.' });
    }

    const builtInReply = await getBuiltInReply(message.trim(), req.user.id);
    const model = getModel();

    if (!model) {
      return res.json({ reply: builtInReply, source: 'built-in' });
    }

    const conversation = model.startChat({
      history: normalizeHistory(history),
      generationConfig: {
        maxOutputTokens: 700,
        temperature: 0.7
      }
    });
    const result = await conversation.sendMessage(
      `You are Smart Job Tracker Assistant. Give practical, concise career guidance about job searching, resumes, interviews, and application tracking. Never claim to submit applications or access private accounts. Here is the user's private tracker summary: ${builtInReply} User message: ${message.trim().slice(0, 4000)}`
    );
    const response = result.response.text();

    return res.json({ reply: response });
  } catch (error) {
    return next(error);
  }
}
