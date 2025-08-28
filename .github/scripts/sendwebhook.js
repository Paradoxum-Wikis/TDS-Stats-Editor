const fs = require('fs');
const { sendDiscordNotification } = require('./webhook.js');

async function main() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  const eventData = fs.readFileSync(eventPath, 'utf8');
  const event = JSON.parse(eventData);

  if (!event.commits || event.commits.length === 0) {
    console.log('No commits in this push event');
    return;
  }

  const commits = event.commits.map(commit => ({
    sha: commit.id,
    message: commit.message.split('\n')[0],
    full_message: commit.message,
    author: commit.author.name
  }));

  const filesChanged = new Set();
  event.commits.forEach(commit => {
    commit.added.forEach(file => filesChanged.add(file));
    commit.removed.forEach(file => filesChanged.add(file));
    commit.modified.forEach(file => filesChanged.add(file));
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