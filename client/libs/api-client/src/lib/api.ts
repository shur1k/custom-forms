/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface RegisterDto {
  /** @example "user@example.com" */
  email: string;
  /**
   * @minLength 8
   * @example "Password1!"
   */
  password: string;
}

export interface LoginDto {
  /** @example "user@example.com" */
  email: string;
  /** @example "Password1!" */
  password: string;
}

export interface CreateSchemaDto {
  /** @example "My Registration Form" */
  title: string;
  /** @example "form" */
  type: "form" | "page" | "dashboard";
  /** JSON Schema 2020-12 + x-ui document */
  schema?: object;
  /** @example "my-registration-form" */
  slug?: string;
}

export interface UpdateSchemaDto {
  /** @example "Updated Form Title" */
  title?: string;
  /** JSON Schema 2020-12 + x-ui document */
  schema?: object;
  /** @example "my-updated-form" */
  slug?: string;
}
