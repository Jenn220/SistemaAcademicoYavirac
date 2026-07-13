CREATE TABLE IF NOT EXISTS documento_fase_practica (
  id_documento SERIAL PRIMARY KEY,
  codigo_formato VARCHAR(20) NOT NULL,
  titulo VARCHAR(200),
  contenido JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_documento_codigo ON documento_fase_practica (codigo_formato);
