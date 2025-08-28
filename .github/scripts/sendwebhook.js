const fs = require('fs');
const { sendDiscordNotification } = require('./webhook.js');

async function main() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  const eventData = fs.readFileSync(eventPath, 'utf8');
  const event = JSON.parse(eventData);

  if (!Array.isArray(event.commits) || event.commits.length === 0) {
    console.log('No commits in this push event');
    return;
  }

  const commits = event.commits.map(commit => ({
    sha: commit.id || 'unknown',
    message: commit.message ? commit.message.split('\n')[0] : 'No message',
    full_message: commit.message || 'No message',
    author: commit.author && commit.author.name ? commit.author.name : 'Unknown Author'
  }));

  const filesChanged = new Set();
  event.commits.forEach(commit => {
    const added = Array.isArray(commit.added) ? commit.added : [];
    const removed = Array.isArray(commit.removed) ? commit.removed : [];
    const modified = Array.isArray(commit.modified) ? commit.modified : [];

    added.forEach(file => filesChanged.add(file));
    removed.forEach(file => filesChanged.add(file));
    modified.forEach(file => filesChanged.add(file));
  });

  const fileCount = filesChanged.size;

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    throw new Error('DISCORD_WEBHOOK_URL is not set');
  }

  await sendDiscordNotification(webhookUrl, commits, fileCount);
  console.log('Notification sent successfully');
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});