import { workerData } from 'worker_threads';
import logger from '../utils/logger.js';
import { getPublicIpInternalService } from '../controllers/ipChecker.js';
import { ddnsProviders } from '../controllers/updateMx.js';

(async () => {
  try {
    const { serviceData } = workerData;

    if (serviceData.status !== 'active') {
      logger.info(
        `Service ${serviceData.serviceName} is not active. Skipping update`
      );
      return;
    }

    const { ip: currentPublicIp } = await getPublicIpInternalService();
    logger.info(`Current public IP: ${currentPublicIp}`);

    // const services = await prisma.runningServices.findUnique({
    //   where: {
    //     id: serviceData.id,
    //   },
    //   include: {
    //     domains: {
    //       include: {
    //         domain: true,
    //       },
    //     },
    //   },
    // });

    let updateStatus;

    const dnsUpdater = ddnsProviders.get(serviceData.serviceName.toLowerCase());

    switch (serviceData.serviceName.toLowerCase()) {
      case 'namecheap':
        for (const singleDomain of serviceData.domains) {
          const { domain } = singleDomain;
          logger.info(
            `Updating ${serviceData.serviceName} for ${domain.hostName}.${domain.domainName}`
          );
          updateStatus = await dnsUpdater({
            host: domain.hostName,
            domain: domain.domainName,
            password: domain.password,
            ip: currentPublicIp,
          });
        }
        break;
      case 'dyndns':
      case 'no-ip':
        for (const singleDomain of serviceData.domains) {
          const { domain } = singleDomain;
          logger.info(
            `Updating ${serviceData.serviceName} for ${domain.hostName}.${domain.domainName}`
          );
          updateStatus = await dnsUpdater({
            host: domain.hostName,
            domain: domain.domainName,
            username: serviceData.username,
            password: serviceData.password,
            ip: currentPublicIp,
          });
        }
        break;
      default:
        throw new Error(`Unknown service: ${serviceData.serviceName}`);
    }

    logger.info(
      `Update status for ${serviceData.serviceName}: ${JSON.stringify(
        updateStatus
      )}`
    );
  } catch ({ message }) {
    logger.error(`Error updating service: ${message}`);
  }
})();
