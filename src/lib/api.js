export async function getJobs() {
  const res = await fetch('/api/jobs')
  if (!res.ok) throw new Error('Failed to fetch jobs')
  return res.json()
}

export async function getJob(id) {
  const res = await fetch(`/api/jobs/${id}`)
  if (!res.ok) throw new Error('Failed to fetch job')
  return res.json()
}

export async function uploadResume(file) {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch('/api/upload', { method: 'POST', body: form })
  if (!res.ok) throw new Error('Failed to upload resume')
  return res.json()
}

export async function submitApplication(data) {
  const res = await fetch('/api/applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to submit application')
  return res.json()
}

export async function getAdminApplications(params, token) {
  const qs = new URLSearchParams(params).toString()
  const res = await fetch(`/api/admin/applications?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to fetch applications')
  return res.json()
}

export async function updateApplication(id, data, token) {
  const res = await fetch(`/api/admin/applications/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update application')
  return res.json()
}

export async function deleteApplication(id, token) {
  const res = await fetch(`/api/admin/applications/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to delete application')
}

export async function getAdminStats(token) {
  const res = await fetch('/api/admin/stats', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to fetch stats')
  return res.json()
}

export async function getApplicationStatus(token) {
  const res = await fetch(`/api/track/${token}`)
  if (!res.ok) throw new Error('Application not found')
  return res.json()
}
