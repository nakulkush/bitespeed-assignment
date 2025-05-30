import { PrismaClient, Contact } from "@prisma/client";
import { IdentifyRequest, IdentifyResponse } from "./types";

const prisma = new PrismaClient();

export async function identifyContact(
  data: IdentifyRequest
): Promise<IdentifyResponse> {
  const { email, phoneNumber } = data;

  const existing = await prisma.contact.findMany({
    where: {
      OR: [email ? { email } : {}, phoneNumber ? { phoneNumber } : {}].filter(
        (condition) => Object.keys(condition).length > 0
      ),
      deletedAt: null,
    },
    orderBy: { createdAt: "asc" },
  });

  if (existing.length === 0) {
    const newContact = await prisma.contact.create({
      data: { email, phoneNumber, linkPrecedence: "primary" },
    });
    return formatResponse([newContact]);
  }

  const exactMatch = existing.find(
    (c: any) => c.email === email && c.phoneNumber === phoneNumber
  );

  if (!exactMatch && hasNewInfo(existing, email, phoneNumber)) {
    const primary = await findPrimary(existing[0]);
    const secondary = await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkedId: primary.id,
        linkPrecedence: "secondary",
      },
    });
    existing.push(secondary);
  }

  await linkPrimaries(existing);

  const allRelated = await getAllRelated(existing);
  return formatResponse(allRelated);
}

function hasNewInfo(
  contacts: Contact[],
  email?: string | null,
  phoneNumber?: string | null
): boolean {
  const emailExists = email ? contacts.some((c) => c.email === email) : false;
  const phoneExists = phoneNumber
    ? contacts.some((c) => c.phoneNumber === phoneNumber)
    : false;

  return Boolean(email && !emailExists) || Boolean(phoneNumber && !phoneExists);
}

async function findPrimary(contact: Contact): Promise<Contact> {
  if (contact.linkPrecedence === "primary") return contact;

  if (contact.linkedId) {
    const linked = await prisma.contact.findUnique({
      where: { id: contact.linkedId },
    });
    if (linked) return findPrimary(linked);
  }

  return contact;
}

async function linkPrimaries(contacts: Contact[]): Promise<void> {
  const primaries = contacts.filter((c) => c.linkPrecedence === "primary");

  if (primaries.length > 1) {
    primaries.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const oldest = primaries[0];
    const toUpdate = primaries.slice(1);

    for (const contact of toUpdate) {
      await prisma.contact.update({
        where: { id: contact.id },
        data: { linkedId: oldest.id, linkPrecedence: "secondary" },
      });

      await prisma.contact.updateMany({
        where: { linkedId: contact.id },
        data: { linkedId: oldest.id },
      });
    }
  }
}

async function getAllRelated(contacts: Contact[]): Promise<Contact[]> {
  if (contacts.length === 0) return [];

  const primary = await findPrimary(contacts[0]);

  return await prisma.contact.findMany({
    where: {
      OR: [{ id: primary.id }, { linkedId: primary.id }],
      deletedAt: null,
    },
    orderBy: { createdAt: "asc" },
  });
}

function formatResponse(contacts: Contact[]): IdentifyResponse {
  const primary = contacts.find((c) => c.linkPrecedence === "primary");
  const secondaries = contacts.filter((c) => c.linkPrecedence === "secondary");

  const emails = [
    ...new Set(
      [primary?.email, ...secondaries.map((c) => c.email)].filter(Boolean)
    ),
  ] as string[];

  const phoneNumbers = [
    ...new Set(
      [primary?.phoneNumber, ...secondaries.map((c) => c.phoneNumber)].filter(
        Boolean
      )
    ),
  ] as string[];

  return {
    contact: {
      primaryContactId: primary!.id,
      emails,
      phoneNumbers,
      secondaryContactIds: secondaries.map((c) => c.id),
    },
  };
}

export { prisma };
