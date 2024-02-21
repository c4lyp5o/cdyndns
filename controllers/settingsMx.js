import Joi from 'joi';

import prisma from '../database/prismaClient.js';
import logger from '../utils/logger.js';
import { stopAllJobs, stopOneJob, startAllJobs } from './schedulerMx.js';

const createSchema = Joi.object({
  serviceName: Joi.string().required(),
  username: Joi.string().min(5).when('serviceName', {
    is: 'namecheap',
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  password: Joi.string().min(5).when('serviceName', {
    is: 'namecheap',
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  status: Joi.string().optional(),
  interval: Joi.number().min(3000).optional(),
  domains: Joi.array().items(Joi.object()).min(1).required(),
});

const namecheapDomainSchema = Joi.object({
  hostName: Joi.string().required(),
  domainName: Joi.string().required(),
  password: Joi.string().required(),
});

const otherDomainSchema = Joi.object({
  hostName: Joi.string().required(),
  domainName: Joi.string().required(),
});

async function createServiceSettings(req, res) {
  const data = await req.json();

  // const { error } = createSchema.validate(data);
  // if (error) {
  //   return res.status(400).json({ message: 'Not enough fields' });
  // }

  const { error } = createSchema.validate(data);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { serviceName, username, password, status, interval, domains } = data;

  try {
    const serviceExists = await prisma.runningServices.findMany({
      where: {
        serviceName,
      },
    });

    if (serviceExists.length > 0) {
      return res
        .status(400)
        .json({ message: `Service ${serviceName} already exists` });
    }

    if (serviceName === 'namecheap') {
      for (const domain of domains) {
        const { error } = namecheapDomainSchema.validate(domain);
        if (error) {
          return res.status(400).json({
            message:
              'Host Name / Domain Name / Password in domains is required',
          });
        }
      }
    } else {
      for (const domain of domains) {
        const { error } = otherDomainSchema.validate(domain);
        if (error) {
          return res.status(400).json({
            message: 'Host Name / Domain Name in domains is required',
          });
        }
      }
    }

    const newService = await prisma.runningServices.create({
      data: {
        serviceName,
        username: username || null,
        password,
        status,
        interval: Number(interval),
        domains: {
          create: domains.map((domain) => ({
            domain: {
              create: {
                hostName: domain.hostName,
                domainName: domain.domainName,
                password: domain.password,
              },
            },
          })),
        },
      },
      include: {
        domains: {
          include: {
            domain: true,
          },
        },
      },
    });

    logger.info(`Stopping all jobs`);
    await stopAllJobs();

    logger.info(`Starting all jobs`);
    await startAllJobs();

    res.json(newService);
  } catch ({ message }) {
    const errorMessage = `Failed to create service: ${message}`;
    logger.error(errorMessage);
    res.status(500).json({ message: errorMessage });
  }
}

async function readServiceSettings(req, res) {
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
      return res.status(404).json({ message: 'No services found' });
    } else {
      res.json(services);
    }
  } catch ({ message }) {
    const errorMessage = `Failed to read services: ${message}`;
    logger.error(errorMessage);
    res.status(500).json({ message: errorMessage });
  }
}

async function updateServiceSettings(req, res) {
  const data = await req.json();

  const { serviceId, status, interval, domainId, domainName } = data;

  try {
    if (domainId && domainName) {
      await prisma.domain.update({
        where: {
          id: Number(domainId),
        },
        data: {
          domainName,
        },
      });
    }

    const updatedService = await prisma.runningServices.update({
      where: { id: Number(serviceId) },
      data: {
        status,
        interval,
      },
      include: {
        domains: {
          include: {
            domain: true,
          },
        },
      },
    });

    res.json(updatedService);
  } catch ({ message }) {
    const errorMessage = `Failed to update service: ${message}`;
    logger.error(errorMessage);
    res.status(500).json({ message: errorMessage });
  }
}

async function deleteDomainFromService(req, res) {
  const { serviceId, domainId } = req.params;

  try {
    await prisma.domainOnService.delete({
      where: {
        domainId_serviceId: {
          domainId: Number(domainId),
          serviceId: Number(serviceId),
        },
      },
    });

    await prisma.domain.delete({
      where: {
        id: Number(domainId),
      },
    });

    res.json({
      message: 'Domain deleted from service and domain table successfully',
    });
  } catch ({ message }) {
    const errorMessage = `Failed to delete domain from service and domain table: ${message}`;
    logger.error(errorMessage);
    res.status(500).json({
      message: errorMessage,
    });
  }
}

async function deleteServiceAndDomains(req, res) {
  const { serviceId } = req.params;

  try {
    const domainsOnService = await prisma.domainOnService.findMany({
      where: {
        serviceId: Number(serviceId),
      },
    });

    await prisma.domainOnService.deleteMany({
      where: {
        serviceId: Number(serviceId),
      },
    });

    for (const domainOnService of domainsOnService) {
      await prisma.domain.delete({
        where: {
          id: domainOnService.domainId,
        },
      });
    }

    await prisma.runningServices.delete({
      where: {
        id: Number(serviceId),
      },
    });

    await stopOneJob(serviceId);

    res.json({
      message: 'Service and associated domains deleted successfully',
    });
  } catch ({ message }) {
    const errorMessage = `Failed to delete service and domains: ${message}`;
    logger.error(errorMessage);
    res.status(500).json({
      message: errorMessage,
    });
  }
}

async function killItWithFire(req, res) {
  try {
    await prisma.domainOnService.deleteMany();
    await prisma.runningServices.deleteMany();
    await prisma.domain.deleteMany();

    await stopAllJobs();

    res.json({ message: 'All services and domains deleted successfully' });
  } catch ({ message }) {
    const errorMessage = `Failed to delete all services and domains: ${message}`;
    logger.error(errorMessage);
    res.status(500).json({
      message: errorMessage,
    });
  }
}

export {
  createServiceSettings,
  readServiceSettings,
  updateServiceSettings,
  deleteDomainFromService,
  deleteServiceAndDomains,
  killItWithFire,
};
