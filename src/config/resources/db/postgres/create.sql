-- Copyright (C) 2022 - present Juergen Zimmermann, Hochschule Karlsruhe
--
-- This program is free software: you can redistribute it and/or modify
-- it under the terms of the GNU General Public License as published by
-- the Free Software Foundation, either version 3 of the License, or
-- (at your option) any later version.
--
-- This program is distributed in the hope that it will be useful,
-- but WITHOUT ANY WARRANTY; without even the implied warranty of
-- MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
-- GNU General Public License for more details.
--
-- You should have received a copy of the GNU General Public License
-- along with this program.  If not, see <https://www.gnu.org/licenses/>.

-- docker compose exec postgres bash
-- psql --dbname=abteilung --username=abteilung --file=/scripts/create-table-abteilung.sql

-- Indexe mit pgAdmin auflisten: "Query Tool" verwenden mit
--  SELECT   tablename, indexname, indexdef, tablespace
--  FROM     pg_indexes
--  WHERE    schemaname = 'abteilung'
--  ORDER BY tablename, indexname;

-- https://www.postgresql.org/docs/devel/app-psql.html
-- https://www.postgresql.org/docs/current/ddl-schemas.html
-- https://www.postgresql.org/docs/current/ddl-schemas.html#DDL-SCHEMAS-CREATE
-- "user-private schema" (Default-Schema: public)
CREATE SCHEMA IF NOT EXISTS AUTHORIZATION abteilung;

ALTER ROLE abteilung SET search_path = 'abteilung';

-- https://www.postgresql.org/docs/current/sql-createtype.html
-- https://www.postgresql.org/docs/current/datatype-enum.html
CREATE TYPE abteilungsart AS ENUM ('ENTWICKLUNG', 'VERTRIEB');

-- https://www.postgresql.org/docs/current/sql-createtable.html
-- https://www.postgresql.org/docs/current/datatype.html
CREATE TABLE IF NOT EXISTS abteilung (
                  -- https://www.postgresql.org/docs/current/datatype-numeric.html#DATATYPE-INT
                  -- https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-PRIMARY-KEYS
                  -- impliziter Index fuer Primary Key
                  -- "GENERATED ALWAYS AS IDENTITY" gemaess SQL-Standard
                  -- entspricht SERIAL mit generierter Sequenz abteilung_id_seq
    id            integer GENERATED ALWAYS AS IDENTITY(START WITH 1000) PRIMARY KEY USING INDEX TABLESPACE abteilungspace,
                  -- https://www.postgresql.org/docs/current/ddl-constraints.html#id-1.5.4.6.6
    version       integer NOT NULL DEFAULT 0,
                  -- impliziter Index als B-Baum durch UNIQUE
                  -- https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-UNIQUE-CONSTRAINTS
    buero_nummer   varchar(17) NOT NULL UNIQUE USING INDEX TABLESPACE abteilungspace,
                  -- https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-CHECK-CONSTRAINTS
                  -- https://www.postgresql.org/docs/current/functions-matching.html#FUNCTIONS-POSIX-REGEXP
    zufriedenheit integer NOT NULL CHECK (zufriedenheit >= 0 AND zufriedenheit <= 5),
    art           abteilungsart,
                  -- https://www.postgresql.org/docs/current/datatype-numeric.html#DATATYPE-NUMERIC-DECIMAL
                  -- 10 Stellen, davon 2 Nachkommastellen
    budget        decimal(8,2) NOT NULL,
    krankenstands_quote decimal(4,3) NOT NULL,
                  -- https://www.postgresql.org/docs/current/datatype-boolean.html
    verfuegbar     boolean NOT NULL DEFAULT FALSE,
                  -- https://www.postgresql.org/docs/current/datatype-datetime.html
    gruendungs_datum  date,
    homepage      varchar(40),
    -- schlagwoerter json,
    schlagwoerter varchar(64),
                  -- https://www.postgresql.org/docs/current/datatype-datetime.html
    erzeugt       timestamp NOT NULL DEFAULT NOW(),
    aktualisiert  timestamp NOT NULL DEFAULT NOW()
) TABLESPACE abteilungspace;

CREATE TABLE IF NOT EXISTS abteilungsleiter (
    id                  integer GENERATED ALWAYS AS IDENTITY(START WITH 1000) PRIMARY KEY USING INDEX TABLESPACE abteilungspace,
    nachname    varchar(40) NOT NULL,
    vorname             varchar(40),
    abteilung_id        integer NOT NULL UNIQUE USING INDEX TABLESPACE abteilungspace REFERENCES abteilung
) TABLESPACE abteilungspace;


CREATE TABLE IF NOT EXISTS mitarbeiter (
    id              integer GENERATED ALWAYS AS IDENTITY(START WITH 1000) PRIMARY KEY USING INDEX TABLESPACE abteilungspace,
    name            varchar(32) NOT NULL,
    job_type        varchar(16) NOT NULL,
    abteilung_id    integer NOT NULL REFERENCES abteilung
) TABLESPACE abteilungspace;
CREATE INDEX IF NOT EXISTS mitarbeiter_abteilung_id_idx ON mitarbeiter(abteilung_id) TABLESPACE abteilungspace;
