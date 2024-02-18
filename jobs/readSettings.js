import axios from 'axios';
import { workerData } from 'worker_threads';
import prisma from '../database/prismaClient.js';
import logger from '../utils/logger.js';

(async () => {
  try {
    const { serviceData } = workerData;

    const services = await prisma.runningServices.findUnique({
      where: {
        id: serviceData.id,
      },
      include: {
        domains: {
          include: {
            domain: true,
          },
        },
      },
    });

    logger.info(`Read settings for service ${services.serviceName}`);
    logger.info(`Service: ${JSON.stringify(services)}`);
  } catch (error) {
    logger.error(`Failed to read services: ${error.message}`);
  }
})();
