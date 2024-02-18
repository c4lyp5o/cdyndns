import prisma from '../database/prismaClient.js';
import logger from '../utils/logger.js';

(async () => {
  try {
    const services = await prisma.runningServices.findMany({
      include: {
        domains: {
          include: {
            domain: true,
          },
        },
      },
    });

    for (const service of services) {
      const bree = breeInstances.get(service.serviceName);
      if (bree) {
        // Update the DNS of the service
        // const updatedService = await prisma.runningServices.update({
        //   where: { id: service.id },
        //   data: { dns: 'new_dns_value' }, // replace 'new_dns_value' with the new DNS value
        // });
        logger.info(`Updated DNS for service ${service.name}`);
      } else {
        logger.warn(`No job found for service ${service.name}`);
      }
    }
  } catch (error) {
    logger.error(`Failed to read services: ${error.message}`);
  }
})();
