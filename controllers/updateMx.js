import axios from 'axios';
import logger from '../utils/logger.js';

async function updateNamecheapDns({ host, domain, password, ip }) {
  const url = new URL('https://dynamicdns.park-your-domain.com/update');
  url.searchParams.append('host', host);
  url.searchParams.append('domain', domain);
  url.searchParams.append('password', password);
  url.searchParams.append('ip', ip);

  try {
    const response = await axios.get(url.toString());
    if (response.status === 200) {
      logger.info(
        `Successfully updated Namecheap DNS for ${host}.${domain} to ${ip}`
      );
      return { status: response.status, statusText: response.statusText };
    } else {
      throw new Error(
        `Failed to update Namecheap DNS: ${response.status} ${response.statusText}`
      );
    }
  } catch ({ message }) {
    const errorMessage = `Failed to update Namecheap DNS for ${host}.${domain} to ${ip}: ${message}`;
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }
}

async function updateDynDns({ host, domain, username, password, ip }) {
  const url = new URL(
    `https://${username}:${password}@members.dyndns.org/v3/update`
  );
  url.searchParams.append('hostname', `${host}.${domain}`);
  url.searchParams.append('myip', ip);

  try {
    const response = await axios.get(url.toString());
    if (response.data && response.data.status === 'good') {
      logger.info(`Successfully updated DynDNS for ${host}.${domain} to ${ip}`);
    } else {
      throw new Error(`Failed to update DynDNS: ${response.data.status}`);
    }
  } catch ({ message }) {
    const errorMessage = `Failed to update DynDNS for ${host}.${domain} to ${ip}: ${message}`;
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }
}

async function updateNoIpDns({ host, domain, username, password, ip }) {
  const url = new URL(
    `https://${username}:${password}@dynupdate.no-ip.com/nic/update`
  );
  url.searchParams.append('hostname', `${host}.${domain}`);
  url.searchParams.append('myip', ip);

  try {
    const response = await axios.get(url.toString());
    if (response.data && response.data.status === 'nochg') {
      logger.info(
        `Successfully updated No-IP DNS for ${host}.${domain} to ${ip}`
      );
    } else {
      throw new Error(`Failed to update No-IP DNS: ${response.data.status}`);
    }
  } catch ({ message }) {
    const errorMessage = `Failed to update No-IP DNS for ${host}.${domain} to ${ip}: ${message}`;
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }
}

const ddnsProviders = new Map([
  ['namecheap', updateNamecheapDns],
  ['dyndns', updateDynDns],
  ['no-ip', updateNoIpDns],
]);

export { ddnsProviders };
