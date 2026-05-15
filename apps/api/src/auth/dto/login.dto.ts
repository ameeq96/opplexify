import { HttpError } from "../../http";

export type LoginDto = {
  email: string;
  password: string;
};

export type ForgotPasswordDto = {
  email: string;
};

export type ResetPasswordDto = {
  token: string;
  password: string;
};

export type UpdateProfileDto = {
  name: string;
  avatar?: string;
};

export function validateLoginDto(body: unknown): LoginDto {
  const data = objectBody(body);
  const email = stringField(data, "email");
  const password = stringField(data, "password");
  assertEmail(email);
  assertMin(password, 6, "password");
  return { email, password };
}

export function validateForgotPasswordDto(body: unknown): ForgotPasswordDto {
  const data = objectBody(body);
  const email = stringField(data, "email");
  assertEmail(email);
  return { email };
}

export function validateResetPasswordDto(body: unknown): ResetPasswordDto {
  const data = objectBody(body);
  const token = stringField(data, "token");
  const password = stringField(data, "password");
  assertMin(password, 8, "password");
  return { token, password };
}

export function validateUpdateProfileDto(body: unknown): UpdateProfileDto {
  const data = objectBody(body);
  const name = stringField(data, "name");
  const avatar = optionalStringField(data, "avatar");
  return { name, avatar };
}

function objectBody(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new HttpError(400, "Request body must be an object");
  }
  return body as Record<string, unknown>;
}

function stringField(data: Record<string, unknown>, name: string) {
  const value = data[name];
  if (typeof value !== "string" || !value.trim()) {
    throw new HttpError(400, `${name} is required`);
  }
  return value.trim();
}

function optionalStringField(data: Record<string, unknown>, name: string) {
  const value = data[name];
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") throw new HttpError(400, `${name} must be a string`);
  return value;
}

function assertEmail(value: string) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw new HttpError(400, "email must be a valid email address");
  }
}

function assertMin(value: string, min: number, name: string) {
  if (value.length < min) {
    throw new HttpError(400, `${name} must be at least ${min} characters`);
  }
}
