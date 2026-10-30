const fallbackJobs = [
  {
    id: 'sample-google-cloud-engineer',
    title: 'Software Engineer, Cloud Platforms',
    company: 'Google',
    location: 'Bengaluru, India',
    description: 'Build reliable cloud services and developer tooling for global products.',
    jobUrl: 'https://careers.google.com/jobs/results/',
    source: 'Sample listings'
  },
  {
    id: 'sample-microsoft-product-engineer',
    title: 'Product Engineer, Developer Experience',
    company: 'Microsoft',
    location: 'Hyderabad, India',
    description: 'Create tools and experiences that help developers ship better software.',
    jobUrl: 'https://jobs.careers.microsoft.com/global/en/search',
    source: 'Sample listings'
  },
  {
    id: 'sample-amazon-full-stack',
    title: 'Full Stack Engineer, Customer Experience',
    company: 'Amazon',
    location: 'Chennai, India',
    description: 'Deliver customer-facing features across frontend and backend systems.',
    jobUrl: 'https://www.amazon.jobs/en/search',
    source: 'Sample listings'
  }
];

function filterFallbackJobs({ query = '', location = '' }) {
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedLocation = location.trim().toLowerCase();

  return fallbackJobs.filter((job) => {
    const searchable = `${job.title} ${job.company} ${job.description}`.toLowerCase();
    return (
      (!normalizedQuery || searchable.includes(normalizedQuery)) &&
      (!normalizedLocation || job.location.toLowerCase().includes(normalizedLocation))
    );
  });
}

async function fetchAdzunaJobs({ query = 'software engineer', location = 'India', page = 1 }) {
  const { ADZUNA_APP_ID: appId, ADZUNA_APP_KEY: appKey } = process.env;
  if (!appId || !appKey) return null;

  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    results_per_page: '20',
    what: query || 'software engineer',
    where: location || 'India',
    content_type: 'application/json'
  });
  const response = await fetch(`https://api.adzuna.com/v1/api/jobs/in/search/${page}?${params}`);
  if (!response.ok) throw new Error(`Job provider returned ${response.status}`);
  const payload = await response.json();

  return (payload.results || []).map((job) => ({
    id: `adzuna-${job.id}`,
    title: job.title,
    company: job.company?.display_name || 'Unknown company',
    location: job.location?.display_name || '',
    description: job.description || '',
    jobUrl: job.redirect_url,
    createdAt: job.created,
    source: 'Adzuna'
  }));
}

export async function searchJobs(filters) {
  try {
    const providerJobs = await fetchAdzunaJobs(filters);
    if (providerJobs) return { jobs: providerJobs, source: 'Adzuna' };
  } catch (error) {
    console.warn('Adzuna search unavailable, using fallback listings:', error.message);
  }

  return { jobs: filterFallbackJobs(filters), source: 'Sample listings' };
}
