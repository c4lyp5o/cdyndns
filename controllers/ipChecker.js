import axios from 'axios';
import logger from '../utils/logger.js';

// Array of IP checking service URLs
const ipCheckServices = [
  'https://ipinfo.io/json',
  'https://ifconfig.me/all.json',
  'https://ipapi.co/json/',
  'https://api.myip.com',
];

// Function to get public IP
async function getPublicIp(req, res) {
  logger.info('Getting public IP');
  logger.info(`List of IP checking services: ${ipCheckServices.join(', ')}`);

  const requests = ipCheckServices.map((service) =>
    axios
      .get(service, { timeout: 5000 })
      .then((response) => {
        logger.info(
          `Got IP from ${service}: ${JSON.stringify(
            response.data.ip || response.data.ip_addr
          )}`
        );
        if (
          (response.data && response.data.ip) ||
          (response.data && response.data.ip_addr)
        ) {
          return response.data.ip || response.data.ip_addr;
        } else {
          throw new Error(`No IP in response from ${service}`);
        }
      })
      .catch((error) => {
        logger.error(`Failed to get IP from ${service}: ${error.message}`);
        return null;
      })
  );

  const results = await Promise.allSettled(requests);
  const successfulResults = results.filter(
    (result) => result.status === 'fulfilled'
  );

  if (successfulResults.length > 0) {
    res.json({ ip: successfulResults[0].value });
  } else {
    res.status(500).json({ message: 'Failed to get public IP' });
  }
}

async function getPublicIpInternalService() {
  logger.info('Getting public IP');
  logger.info(`List of IP checking services: ${ipCheckServices.join(', ')}`);

  const requests = ipCheckServices.map((service) =>
    axios
      .get(service, { timeout: 5000 })
      .then((response) => {
        logger.info(
          `Got IP from ${service}: ${JSON.stringify(
            response.data.ip || response.data.ip_addr
          )}`
        );
        if (
          (response.data && response.data.ip) ||
          (response.data && response.data.ip_addr)
        ) {
          return response.data.ip || response.data.ip_addr;
        } else {
          throw new Error(`No IP in response from ${service}`);
        }
      })
      .catch((error) => {
        logger.error(`Failed to get IP from ${service}: ${error.message}`);
        return null;
      })
  );

  const results = await Promise.allSettled(requests);
  const successfulResults = results.filter(
    (result) => result.status === 'fulfilled'
  );

  if (successfulResults.length > 0) {
    return { ip: successfulResults[0].value };
  } else {
    throw new Error('Failed to get public IP');
  }
}

export { getPublicIp, getPublicIpInternalService };
