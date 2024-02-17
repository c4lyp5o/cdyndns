import Joi from 'joi';

import prisma from '../database/prismaClient.js';
import logger from '../utils/logger.js';

const createSchema = Joi.object({
  serviceName: Joi.string().required(),
  password: Joi.string().required(),
  interval: Joi.number().required(),
  domains: Joi.array().items(Joi.string()).min(1).required(),
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

  const { serviceName, username, password, interval, domains } = data;

  try {
    const newService = await prisma.runningServices.create({
      data: {
        serviceName,
        username: username || null,
        password,
        status: 'active',
        interval: Number(interval),
        domains: {
          create: domains.map((domain) => ({
            domain: {
              create: {
                domainName: domain,
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

    res.json(newService);
  } catch (error) {
    logger.error(`Failed to create service: ${error.message}`);
    res
      .status(500)
      .json({ error: `Failed to create service: ${error.message}` });
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
  } catch (error) {
    logger.error(`Failed to read services: ${error.message}`);
    res
      .status(500)
      .json({ error: `Failed to read services: ${error.message}` });
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

    // Update the RunningServices record
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
  } catch (error) {
    logger.error(`Failed to update service: ${error.message}`);
    res
      .status(500)
      .json({ error: `Failed to update service: ${error.message}` });
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
  } catch (error) {
    logger.error(
      `Failed to delete domain from service and domain table: ${error.message}`
    );
    res.status(500).json({
      error: `Failed to delete domain from service and domain table: ${error.message}`,
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

    res.json({
      message: 'Service and associated domains deleted successfully',
    });
  } catch (error) {
    logger.error(`Failed to delete service and domains: ${error.message}`);
    res.status(500).json({
      error: `Failed to delete service and domains: ${error.message}`,
    });
  }
}

export {
  createServiceSettings,
  readServiceSettings,
  updateServiceSettings,
  deleteDomainFromService,
  deleteServiceAndDomains,
};
