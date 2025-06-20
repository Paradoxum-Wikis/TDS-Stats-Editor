const fetch = require('node-fetch');
const FormData = require('form-data');
const { execSync } = require('child_process');
const fs = require('fs');

const WIKI_BASE = process.env.WIKI_BASE || 'https://tds.fandom.com';
const USER_AGENT = process.env.USER_AGENT || 'TDS-Stats-Editor-Bot/1.0';
const COOKIE_HEADER = process.env.FANDOM_SESSION;

function extractUsernames(towerEntries) {
  const usernames = new Set();
  
  towerEntries.forEach(entry => {
    if (entry.includes('/')) {
      const username = entry.split('/')[0];
      usernames.add(username);
    }
  });
  
  return Array.from(usernames);
}

function detectChanges() {
  try {
    const diff = execSync('git diff HEAD~1 HEAD -- db/ApprovedList.js', { encoding: 'utf8' });
    
    if (!diff) {
      console.log('No changes detected in ApprovedList.js');
      return { newEntries: [] };
    }

    const addedLines = diff.split('\n')
      .filter(line => line.startsWith('+') && !line.startsWith('+++'))
      .map(line => line.substring(1).trim())
      .filter(line => line.includes('/') && line.includes('"'));
    
    const newEntries = [];
    
    addedLines.forEach(line => {
      const match = line.match(/"([^"]+\/[^"]+)"/);
      if (match) {
        newEntries.push(match[1]);
      }
    });
    
    return { newEntries };
  } catch (error) {
    console.error('Error detecting changes:', error.message);
    return { newEntries: [] };
  }
}

async function getCsrfToken() {
  const res = await fetch(`${WIKI_BASE}/api.php?action=query&meta=tokens&type=csrf&format=json`, {
    headers: {
      'User-Agent': USER_AGENT,
      'Cookie': COOKIE_HEADER,
    },
  });
  
  if (!res.ok) {
    throw new Error(`Failed to get token: ${res.statusText}`);
  }
  
  const data = await res.json();
  
  if (!data.query || !data.query.tokens || !data.query.tokens.csrftoken) {
    throw new Error('Invalid token response');
  }
  
  return data.query.tokens.csrftoken;
}

async function getUserId(username) {
  const res = await fetch(`${WIKI_BASE}/api.php?action=query&list=users&ususers=${encodeURIComponent(username)}&format=json`, {
    headers: {
      'User-Agent': USER_AGENT,
      'Cookie': COOKIE_HEADER,
    },
  });
  
  const data = await res.json();
  
  if (data.query && data.query.users && data.query.users[0] && data.query.users[0].userid) {
    return data.query.users[0].userid.toString();
  }
  
  throw new Error(`User ${username} not found`);
}

async function sendMessage(token, userId, title, content) {
  const jsonModel = JSON.stringify({
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: `Hello ${userId}!\n\nGreat news! Your ${content.includes('towers have') ? 'towers have' : 'tower has'} been approved and added to the TDS Stats Editor database:\n\n` },
          { type: 'text', text: content.match(/• .+/g)?.join('\n') || '' },
          { type: 'text', text: `\n\nYour ${content.includes('towers are') ? 'towers are' : 'tower is'} now verified and will no longer show the "unverified" tag. You can view ${content.includes('towers are') ? 'them' : 'it'} on the database at: https://tds-editor.com/db/\n\nThank you for your contribution to the community!\n\n` },
          { type: 'text', marks: [{ type: 'em' }], text: 'NOTE: This is an automated message from the TDS Stats Editor system.' }
        ]
      }
    ]
  });

  const form = new FormData();
  form.append('token', token);
  form.append('wallOwnerId', userId);
  form.append('title', title);
  form.append('rawContent', content);
  form.append('jsonModel', jsonModel);
  form.append('attachments', JSON.stringify({
    contentImages: [],
    openGraphs: [],
    atMentions: []
  }));

  const res = await fetch(`${WIKI_BASE}/wikia.php?controller=Fandom\\MessageWall\\MessageWall&method=createThread&format=json`, {
    method: 'POST',
    headers: {
      'User-Agent': USER_AGENT,
      'Cookie': COOKIE_HEADER,
      'X-Requested-With': 'XMLHttpRequest',
      'Referer': `${WIKI_BASE}/wiki/Message_Wall:${userId}`,
      ...form.getHeaders()
    },
    body: form
  });

  const responseText = await res.text();
  
  try {
    const json = JSON.parse(responseText);
    
    if (json.status && json.status !== 200) {
      throw new Error(`API Error: ${json.error || 'Unknown error'} - ${json.details || ''}`);
    }
    
    return json;
  } catch (parseError) {
    console.error('Raw response:', responseText);
    throw new Error(`Failed to parse response: ${parseError.message}`);
  }
}

async function main() {
  try {
    console.log('Checking for changes in ApprovedList.js...');
    
    const { newEntries } = detectChanges();
    
    if (newEntries.length === 0) {
      console.log('No new tower entries found.');
      return;
    }
    
    console.log(`Found ${newEntries.length} new tower entries:`, newEntries);
    const usernames = extractUsernames(newEntries);
    console.log('Users to notify:', usernames);
    
    console.log('Getting CSRF token...');
    const token = await getCsrfToken();
    
    for (const username of usernames) {
      try {
        console.log(`Processing user: ${username}`);
        const userTowers = newEntries.filter(entry => entry.startsWith(username + '/'));
        
        if (userTowers.length === 0) continue;
        
        const userId = await getUserId(username);
        console.log(`User ID for ${username}: ${userId}`);
        
        const towerList = userTowers.map(tower => `• ${tower.split('/')[1]}`).join('\n');
        const pluralTowers = userTowers.length > 1 ? 'towers have' : 'tower has';
        
        const messageTitle = `🎉 Your ${userTowers.length > 1 ? 'towers' : 'tower'} ${userTowers.length > 1 ? 'have' : 'has'} been approved!`;
        const messageContent = `Hello ${username}!

Great news! Your ${pluralTowers} been approved and added to the TDS Stats Editor database:

${towerList}

Your ${userTowers.length > 1 ? 'towers are' : 'tower is'} now verified and will no longer show the "unverified" tag. You can view ${userTowers.length > 1 ? 'them' : 'it'} on the database at: https://tds-editor.com/db/

Thank you for your contribution to the community!

NOTE: This is an automated message from the TDS Stats Editor system.`;
        
        console.log(`Sending message to ${username}...`);
        await sendMessage(token, userId, messageTitle, messageContent);
        console.log(`✅ Message sent successfully to ${username}`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`❌ Failed to notify ${username}:`, error.message);
      }
    }
    
    console.log('✅ Notification process completed!');
    
  } catch (error) {
    console.error('Error in main process:', error.message);
    process.exit(1);
  }
}

main();