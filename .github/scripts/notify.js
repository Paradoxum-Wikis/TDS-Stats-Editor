const fetch = require('node-fetch');
const FormData = require('form-data');
const { execSync } = require('child_process');

const WIKI_BASE = process.env.WIKI_BASE || 'https://tds.fandom.com';
const USER_AGENT = process.env.USER_AGENT || 'DarkGabonnie/1.048596';
const FANDOM_SESSION_VALUE = process.env.FANDOM_SESSION;
const COOKIE_HEADER = `fandom_session=${FANDOM_SESSION_VALUE}`;

console.log('--- Initializing Script ---');
if (!FANDOM_SESSION_VALUE) {
  console.error('CRITICAL: FANDOM_SESSION environment variable is not set or empty!');
  process.exit(1);
}
console.log(`FANDOM_SESSION loaded. Length: ${FANDOM_SESSION_VALUE.length}`);
console.log('--------------------------');

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
    
    const newEntries = new Set();
    
    addedLines.forEach(line => {
      const match = line.match(/"([^"]+\/[^"]+)"/);
      if (match) {
        newEntries.add(match[1]);
      }
    });
    
    return { newEntries: Array.from(newEntries) };
  } catch (error) {
    console.error('Error detecting changes:', error.message);
    return { newEntries: [] };
  }
}

async function getCsrfToken() {
  console.log('--- Fetching CSRF token ---');
  const headers = {
    'User-Agent': USER_AGENT,
    'Cookie': COOKIE_HEADER,
  };

  console.log('Token request headers:', JSON.stringify(headers, null, 2));

  const res = await fetch(`${WIKI_BASE}/api.php?action=query&meta=tokens&type=csrf&format=json`, {
    headers: headers,
  });
  
  console.log(`Token response status: ${res.status} ${res.statusText}`);
  const responseText = await res.text();

  if (!res.ok) {
    console.error('Raw token response:', responseText);
    throw new Error(`Failed to get token: ${res.statusText}`);
  }
  
  const data = JSON.parse(responseText);
  
  if (!data.query || !data.query.tokens || !data.query.tokens.csrftoken) {
    console.error('Invalid token response body:', JSON.stringify(data, null, 2));
    throw new Error('Invalid token response');
  }
  
  const token = data.query.tokens.csrftoken;
  console.log(`Successfully fetched CSRF token: ${token}`);
  console.log('--------------------------');
  return token;
}

async function getUserId(username) {
  console.log(`Fetching user ID for username: "${username}"`);
  const res = await fetch(`${WIKI_BASE}/api.php?action=query&list=users&ususers=${encodeURIComponent(username)}&format=json`, {
    headers: {
      'User-Agent': USER_AGENT,
      'Cookie': COOKIE_HEADER,
    },
  });
  
  const data = await res.json();
  
  if (data.query && data.query.users && data.query.users[0] && data.query.users[0].userid) {
    const userId = data.query.users[0].userid.toString();
    console.log(`Found user ID: ${userId} for username: "${username}"`);
    return userId;
  }
  
  console.error(`User not found response for "${username}":`, JSON.stringify(data, null, 2));
  throw new Error(`User ${username} not found`);
}

async function sendMessage(token, userId, title, content) {
  console.log('\n--- Preparing to send message ---');
  console.log(`Recipient User ID: ${userId}`);
  console.log(`Message Title: ${title}`);

  const jsonModel = JSON.stringify({
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: content }]
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

  console.log('--- Form Data Payload ---');
  console.log(`token: ${token}`);
  console.log(`wallOwnerId: ${userId}`);
  console.log(`title: ${title}`);
  console.log(`rawContent:\n${content}`);
  console.log(`jsonModel: ${jsonModel}`);
  console.log('------------------------');

  const headers = {
    'User-Agent': USER_AGENT,
    'Cookie': COOKIE_HEADER,
    'X-Requested-With': 'XMLHttpRequest',
    ...form.getHeaders()
  };

  console.log('--- Request Headers ---');
  console.log(JSON.stringify(headers, null, 2));
  console.log('-----------------------');

  const res = await fetch(`${WIKI_BASE}/wikia.php?controller=Fandom\\MessageWall\\MessageWall&method=createThread&format=json`, {
    method: 'POST',
    headers: {
      'User-Agent': USER_AGENT,
      'Cookie': COOKIE_HEADER,
      'X-Requested-With': 'XMLHttpRequest',
      ...form.getHeaders()
    },
    body: form
  });

  console.log(`--- API Response Status: ${res.status} ${res.statusText} ---`);
  const responseText = await res.text();
  if (!res.ok) {
    console.error('Raw API response:', responseText);
    throw new Error(`API request failed with status ${res.status}`);
  }
  
  try {
    const json = JSON.parse(responseText);
    console.log('Fandom API Response:', JSON.stringify(json, null, 2));
    return json;
  } catch (parseError) {
    console.error('Raw API response (could not parse as JSON):', responseText);
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
        const messageContent = `Hello ${username}!\n\nGreat news! Your ${pluralTowers} been approved and added to the TDS Stats Editor database:\n\n${towerList}\n\nYour ${userTowers.length > 1 ? 'towers are' : 'tower is'} now verified and will no longer show the "unverified" tag. You can view ${userTowers.length > 1 ? 'them' : 'it'} on the database at: https://tds-editor.com/db/\n\nThank you for your contribution to the TDS community!\n\n---\n*This is an automated message from the TDS Stats Editor system.*`;
        
        console.log(`\nConstructed message for ${username}:`);
        console.log('====================================');
        console.log(messageContent);
        console.log('====================================');

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