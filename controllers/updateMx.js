import axios from 'axios';
import logger from './logger.js';

async function updateNamecheapDns(host, domain, password, ip) {
  const url = new URL('https://dynamicdns.park-your-domain.com/update');
  url.searchParams.append('host', host);
  url.searchParams.append('domain', domain);
  url.searchParams.append('password', password);
  url.searchParams.append('ip', ip);

  try {
    const response = await axios.get(url.toString());
    if (response.data && response.data.ErrCount === '0') {
      logger.info(
        `Successfully updated Namecheap DNS for ${host}.${domain} to ${ip}`
      );
    } else {
      throw new Error(
        `Failed to update Namecheap DNS: ${response.data.errors.join(', ')}`
      );
    }
  } catch (error) {
    logger.error(
      `Failed to update Namecheap DNS for ${host}.${domain} to ${ip}: ${error.message}`
    );
  }
}

async function updateDynDns(host, domain, username, password, ip) {
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
  } catch (error) {
    logger.error(
      `Failed to update DynDNS for ${host}.${domain} to ${ip}: ${error.message}`
    );
  }
}

async function updateNoIpDns(host, domain, username, password, ip) {
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
  } catch (error) {
    logger.error(
      `Failed to update No-IP DNS for ${host}.${domain} to ${ip}: ${error.message}`
    );
  }
}

export { updateNamecheapDns, updateDynDns, updateNoIpDns };
