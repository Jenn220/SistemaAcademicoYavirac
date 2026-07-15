import { ValueTransformer } from 'typeorm';

// El driver pg devuelve bigint como texto; lo convertimos a número al leer.
// Se aplica en las columnas para que también funcione en INSERT ... RETURNING.
export const bigintTransformer: ValueTransformer = {
  to: (value?: number | null) => value,
  from: (value?: string | null) => (value === null || value === undefined ? null : parseInt(value, 10)),
};
