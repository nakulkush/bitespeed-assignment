"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.identifyContact = identifyContact;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.prisma = prisma;
function identifyContact(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email, phoneNumber } = data;
        // Find existing contacts
        const existing = yield prisma.contact.findMany({
            where: {
                OR: [email ? { email } : {}, phoneNumber ? { phoneNumber } : {}].filter((condition) => Object.keys(condition).length > 0),
                deletedAt: null,
            },
            orderBy: { createdAt: "asc" },
        });
        // No existing contacts - create new primary
        if (existing.length === 0) {
            const newContact = yield prisma.contact.create({
                data: { email, phoneNumber, linkPrecedence: "primary" },
            });
            return formatResponse([newContact]);
        }
        // Check if exact match exists
        const exactMatch = existing.find((c) => c.email === email && c.phoneNumber === phoneNumber);
        // Create secondary if new information provided
        if (!exactMatch && hasNewInfo(existing, email, phoneNumber)) {
            const primary = yield findPrimary(existing[0]);
            const secondary = yield prisma.contact.create({
                data: {
                    email,
                    phoneNumber,
                    linkedId: primary.id,
                    linkPrecedence: "secondary",
                },
            });
            existing.push(secondary);
        }
        // Handle linking multiple primaries
        yield linkPrimaries(existing);
        // Get all related contacts
        const allRelated = yield getAllRelated(existing);
        return formatResponse(allRelated);
    });
}
function hasNewInfo(contacts, email, phoneNumber) {
    const emailExists = email ? contacts.some((c) => c.email === email) : false;
    const phoneExists = phoneNumber
        ? contacts.some((c) => c.phoneNumber === phoneNumber)
        : false;
    //@ts-ignore
    return (email && !emailExists) || (phoneNumber && !phoneExists);
}
function findPrimary(contact) {
    return __awaiter(this, void 0, void 0, function* () {
        if (contact.linkPrecedence === "primary")
            return contact;
        if (contact.linkedId) {
            const linked = yield prisma.contact.findUnique({
                where: { id: contact.linkedId },
            });
            if (linked)
                return findPrimary(linked);
        }
        return contact;
    });
}
function linkPrimaries(contacts) {
    return __awaiter(this, void 0, void 0, function* () {
        const primaries = contacts.filter((c) => c.linkPrecedence === "primary");
        if (primaries.length > 1) {
            primaries.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
            const oldest = primaries[0];
            const toUpdate = primaries.slice(1);
            for (const contact of toUpdate) {
                yield prisma.contact.update({
                    where: { id: contact.id },
                    data: { linkedId: oldest.id, linkPrecedence: "secondary" },
                });
                yield prisma.contact.updateMany({
                    where: { linkedId: contact.id },
                    data: { linkedId: oldest.id },
                });
            }
        }
    });
}
function getAllRelated(contacts) {
    return __awaiter(this, void 0, void 0, function* () {
        if (contacts.length === 0)
            return [];
        const primary = yield findPrimary(contacts[0]);
        return yield prisma.contact.findMany({
            where: {
                OR: [{ id: primary.id }, { linkedId: primary.id }],
                deletedAt: null,
            },
            orderBy: { createdAt: "asc" },
        });
    });
}
function formatResponse(contacts) {
    const primary = contacts.find((c) => c.linkPrecedence === "primary");
    const secondaries = contacts.filter((c) => c.linkPrecedence === "secondary");
    const emails = [
        ...new Set([primary === null || primary === void 0 ? void 0 : primary.email, ...secondaries.map((c) => c.email)].filter(Boolean)),
    ];
    const phoneNumbers = [
        ...new Set([primary === null || primary === void 0 ? void 0 : primary.phoneNumber, ...secondaries.map((c) => c.phoneNumber)].filter(Boolean)),
    ];
    return {
        contact: {
            primaryContatctId: primary.id,
            emails,
            phoneNumbers,
            secondaryContactIds: secondaries.map((c) => c.id),
        },
    };
}
