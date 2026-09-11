export interface InviteTokenPort {
  /** Crea un token de un solo uso; retorna el valor en claro para el enlace. */
  create(email: string, expiresAt: Date): Promise<string>;
  /** Consume el token si es válido; retorna el email o null. */
  consume(rawToken: string): Promise<string | null>;
}
