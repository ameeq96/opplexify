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
  const name = stringField(data, "name");
  const email = stringField(data, "email");
  const message = stringField(data, "message");
  const phone = optionalStringField(data, "phone");
  const subject = optionalStringField(data, "subject");

  if (name.length < 2) throw new HttpError(400, "name must be at least 2 characters");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, "email must be a valid email address");
  if (message.length < 10) throw new HttpError(400, "message must be at least 10 characters");

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

function optionalStringField(data: Record<string, unknown>, name: string) {
  const value = data[name];
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") throw new HttpError(400, `${name} must be a string`);
  return value;
}
