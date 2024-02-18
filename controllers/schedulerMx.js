import path from 'path';
import Bree from 'bree';
import prisma from '../database/prismaClient.js';
import logger from '../utils/logger.js';

const breeInstances = new Map();

async function getAllJobs() {
  const jobs = [];

  for (const [serviceName, bree] of breeInstances) {
    jobs.push({
      serviceName,
      interval: bree.config.jobs[0].interval,
      jobs: bree.config.jobs.map((job) => job.name),
    });
  }

  if (jobs.length === 0) {
    return { message: 'No jobs found' };
  } else {
    return { jobs };
  }
}

async function startOneJob(service) {
  try {
    const existingBree = breeInstances.get(service.serviceName);
    if (existingBree) {
      existingBree.stop();
    }

    const bree = new Bree({
      jobs: [
        {
          name: 'readSettings',
          worker: { workerData: { serviceData: service } },
          interval: `${service.interval}s`,
          path: path.join(process.cwd(), 'jobs', 'readSettings.js'),
        },
      ],
    });
    bree.start();

    breeInstances.set(service.serviceName, bree);
    logger.info(`Started jobs for service ${service.serviceName}`);
  } catch ({ message }) {
    const errorMessage = `Failed to start jobs for service ${service.serviceName}: ${message}`;
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }
}

async function startAllJobs() {
  logger.info('Attempting to start all jobs');

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

    if (services.length === 0) {
      logger.warn('No services found');
      return;
    }

    for (const service of services) {
      logger.info(`Starting jobs for service ${service.serviceName}`);
      startOneJob(service);
    }

    logger.info('All jobs started');
    return { message: 'All jobs started' };
  } catch ({ message }) {
    logger.error(`Failed to start jobs: ${message}`);
    throw new Error(`Failed to start jobs: ${message}`);
  }
}

async function stopOneJob(serviceName) {
  try {
    const bree = breeInstances.get(serviceName);

    if (bree) {
      bree.stop();
      breeInstances.delete(serviceName);
      const message = `Stopped jobs for service ${serviceName}`;
      logger.info(message);
      return { message };
    } else {
      const message = `No jobs found for service ${serviceName}`;
      logger.warn(message);
      return { message };
    }
  } catch ({ message }) {
    const errorMessage = `Failed to stop jobs for service ${serviceName}: ${message}`;
    throw new Error(errorMessage);
  }
}

async function stopAllJobs() {
  logger.info('Attempting to stop all jobs');

  try {
    for (const bree of breeInstances.values()) {
      bree.stop();
    }

    // for (const [name, bree] of breeInstances.entries()) {
    //   logger.info(`stopping: ${name}`);
    //   bree.stop();
    // }

    breeInstances.clear();
    const message = 'All jobs stopped';
    logger.info(message);
    return { message };
  } catch ({ message }) {
    const errorMessage = `Failed to stop all jobs: ${message}`;
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }
}

export {
  breeInstances,
  getAllJobs,
  startOneJob,
  startAllJobs,
  stopOneJob,
  stopAllJobs,
};
