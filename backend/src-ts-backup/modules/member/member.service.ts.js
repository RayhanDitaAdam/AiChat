import prisma from "../../common/services/prisma.service.js";
import { LoyaltyEngine } from "../reward/loyalty.engine.js";

export const getMembers = async (search) => {
  return await prisma.user.findMany({
    where: {
      AND: [
        {
          OR: [{ role: "USER" }, { registrationType: "MEMBER" }],
        },
        ...(search
          ? [
              {
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { phone: { contains: search, mode: "insensitive" } },
                  { email: { contains: search, mode: "insensitive" } },
                  { username: { contains: search, mode: "insensitive" } },
                  { customerId: { contains: search, mode: "insensitive" } },
                ],
              },
            ]
          : []),
      ],
    },
    select: {
      id: true,
      username: true,
      name: true,
      phone: true,
      email: true,
      points: true,
      dob: true,
      createdAt: true,
    },
  });
};

export const getMemberDetail = async (id) => {
  return await prisma.user.findFirst({
    where: { id },
    include: {
      posPointHistory: { orderBy: { createdAt: "desc" }, take: 10 },
      myTransactions: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { items: { include: { product: true } } },
      },
    },
  });
};

export const identifyMember = async (identifier) => {
  return await LoyaltyEngine.identifyMember(identifier);
};
