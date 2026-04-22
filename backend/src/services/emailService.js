const nodemailer = require('nodemailer')
 
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})
 
/**
 * Send an artist application email to a venue/company
 */
async function sendApplication({ to, artistName, gigTitle, coverLetter, resumeData }) {
  const resumeText = resumeData
    ? formatResumeHTML(typeof resumeData === 'string' ? JSON.parse(resumeData) : resumeData)
    : ''
 
  const html = `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: 'DM Sans', Arial, sans-serif; color: #1a1a2e; background: #f5f5f5; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 32px auto; background: white; border-radius: 12px; overflow: hidden; }
  .header { background: linear-gradient(135deg, #FF6B00, #7B2FBE); padding: 28px 32px; color: white; }
  .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
  .header p { margin: 4px 0 0; opacity: 0.85; font-size: 14px; }
  .body { padding: 28px 32px; }
  .cover { white-space: pre-line; line-height: 1.7; color: #333; font-size: 15px; margin-bottom: 24px; }
  .resume-section { background: #f8f8ff; border-radius: 8px; padding: 20px; margin-top: 20px; border: 1px solid #e0e0f0; }
  .resume-section h3 { margin: 0 0 12px; color: #FF6B00; font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em; }
  .stat-row { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 12px; }
  .stat { background: white; border-radius: 6px; padding: 10px 14px; text-align: center; border: 1px solid #e0e0f0; }
  .stat .value { font-size: 18px; font-weight: 700; color: #FF6B00; }
  .stat .label { font-size: 11px; color: #888; margin-top: 2px; }
  .footer { padding: 16px 32px; background: #f5f5f5; text-align: center; font-size: 12px; color: #888; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
  .badge-orange { background: rgba(255,107,0,0.12); color: #FF6B00; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>Artist Application — ${artistName}</h1>
    <p>Opportunity: ${gigTitle}</p>
  </div>
  <div class="body">
    <p style="font-size:13px;color:#888;margin-bottom:16px;">
      <span class="badge badge-orange">Powered by FanFlow AI</span>
      &nbsp;Automated application submitted on behalf of this artist
    </p>
    
    <div class="cover">${coverLetter}</div>
    
    ${resumeText}
  </div>
  <div class="footer">
    This application was sent via FanFlow AI — the independent artist revenue platform.<br>
    To stop receiving applications: <a href="mailto:unsubscribe@fanflow.ai">unsubscribe</a>
  </div>
</div>
</body>
</html>`
 
  const info = await transporter.sendMail({
    from: `"${artistName} via FanFlow AI" <${process.env.EMAIL_FROM || 'noreply@fanflow.ai'}>`,
    to,
    subject: `Artist Application: ${artistName} for "${gigTitle}"`,
    text: coverLetter,
    html,
  })
 
  return info
}
 
/**
 * Send notification to artist about a new gig match
 */
async function sendGigAlert({ to, artistName, gigTitle, venue, pay, deadline }) {
  await transporter.sendMail({
    from: `"FanFlow AI" <${process.env.EMAIL_FROM || 'noreply@fanflow.ai'}>`,
    to,
    subject: `🎯 New Gig Match: "${gigTitle}" — ${pay}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#FF6B00,#7B2FBE);padding:20px;border-radius:12px 12px 0 0;color:white;">
          <h2 style="margin:0;">New Gig Found!</h2>
        </div>
        <div style="padding:20px;background:#1a1a26;color:#f0f0ff;border-radius:0 0 12px 12px;">
          <p>Hey ${artistName},</p>
          <p>FanFlow AI found a new opportunity matching your profile:</p>
          <div style="background:#2a2a3a;padding:16px;border-radius:8px;margin:12px 0;">
            <strong style="color:#FF6B00;">${gigTitle}</strong><br>
            Venue: ${venue}<br>
            Pay: ${pay}<br>
            Deadline: ${deadline}
          </div>
          <p>Your AI manager has already prepared your application. Log in to review and submit.</p>
        </div>
      </div>`,
  })
}
 
function formatResumeHTML(resume) {
  if (!resume) return ''
  const stats = resume.stats || {}
  return `
<div class="resume-section">
  <h3>Artist Resume</h3>
  <strong style="font-size:18px;">${resume.name || ''}</strong>
  <p style="color:#888;margin:4px 0 12px;font-size:13px;">${resume.tagline || ''}</p>
  
  <div class="stat-row">
    ${Object.entries(stats).map(([k, v]) => `
      <div class="stat">
        <div class="value">${v}</div>
        <div class="label">${k.replace(/([A-Z])/g, ' $1').toLowerCase()}</div>
      </div>`).join('')}
  </div>
  
  <p style="font-size:14px;color:#444;line-height:1.6;">${(resume.bio || '').slice(0, 300)}...</p>
  
  ${resume.highlights?.length ? `
    <div style="margin-top:12px;">
      <strong style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.08em;">Highlights</strong>
      <ul style="margin:8px 0;padding-left:18px;">
        ${resume.highlights.map(h => `<li style="font-size:13px;color:#444;margin-bottom:4px;">${h}</li>`).join('')}
      </ul>
    </div>` : ''}
</div>`
}
 
module.exports = { sendApplication, sendGigAlert }
 