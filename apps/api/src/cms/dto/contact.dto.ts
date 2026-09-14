import { HttpError } from "../../http";

export type CreateContactMessageDto = {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
};

export function validateContactMessageDto(body: unknown): CreateContactMessageDto {
  const data = objectBody(body);
  const name = singleLineField(data, "name");
  const email = singleLineField(data, "email").toLowerCase();
  const message = multilineField(data, "message");
  const phone = optionalSingleLineField(data, "phone");
  const subject = optionalSingleLineField(data, "subject");

  if (name.length < 2) throw new HttpError(400, "name must be at least 2 characters");
  assertMax(name, 100, "name");
  assertMax(email, 254, "email");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, "email must be a valid email address");
  if (phone) assertMax(phone, 40, "phone");
  if (subject) assertMax(subject, 160, "subject");
  if (message.length < 10) throw new HttpError(400, "message must be at least 10 characters");
  assertMax(message, 5000, "message");

  return { name, email, phone, subject, message };
}

function objectBody(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new HttpError(400, "Request body must be an object");
  }
  return body as Record<string, unknown>;
}

function stringField(data: Record<string, unknown>, name: string) {
  const value = data[name];
  if (typeof value !== "string" || !value.trim()) throw new HttpError(400, `${name} is required`);
  return value.trim();
}

function singleLineField(data: Record<string, unknown>, name: string) {
  return stringField(data, name).replace(/\s+/gu, " ");
}

function multilineField(data: Record<string, unknown>, name: string) {
  return stringField(data, name).replace(/\r\n?/g, "\n");
}

function optionalSingleLineField(data: Record<string, unknown>, name: string) {
  const value = data[name];
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") throw new HttpError(400, `${name} must be a string`);
  const normalized = value.trim().replace(/\s+/gu, " ");
  return normalized || undefined;
}

function assertMax(value: string, max: number, name: string) {
  if (value.length > max) {
    throw new HttpError(400, `${name} must be at most ${max} characters`);
  }
}
