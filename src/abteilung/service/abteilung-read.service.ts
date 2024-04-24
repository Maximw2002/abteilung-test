/*
 * Copyright (C) 2016 - present Juergen Zimmermann, Hochschule Karlsruhe
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * Das Modul besteht aus der Klasse {@linkcode AbteilungReadService}.
 * @packageDocumentation
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { Abteilung } from '../entity/abteilung.entity.js';
import { QueryBuilder } from './query-builder.js';
import { type Suchkriterien } from './suchkriterien.js';
import { getLogger } from '../../logger/logger.js';

/**
 * Typdefinition für `findById`
 */
export interface FindByIdParams {
    /** ID der gesuchten Abteilung */
    readonly id: number;
    /** Sollen die Mitarbeiter mitgeladen werden? */
    readonly mitMitarbeitern?: boolean;
}

/**
 * Die Klasse `AbteilungReadService` implementiert das Lesen für Abteilungen und greift
 * mit _TypeORM_ auf eine relationale DB zu.
 */
@Injectable()
export class AbteilungReadService {
    static readonly ID_PATTERN = /^[1-9]\d{0,10}$/u;

    readonly #abteilungProps: string[];

    readonly #queryBuilder: QueryBuilder;

    readonly #logger = getLogger(AbteilungReadService.name);

    constructor(queryBuilder: QueryBuilder) {
        const abteilungDummy = new Abteilung();
        this.#abteilungProps = Object.getOwnPropertyNames(abteilungDummy);
        this.#queryBuilder = queryBuilder;
    }

    // Rueckgabetyp Promise bei asynchronen Funktionen
    //    ab ES2015
    //    vergleiche Task<> bei C# und Mono<> aus Project Reactor
    // Status eines Promise:
    //    Pending: das Resultat ist noch nicht vorhanden, weil die asynchrone
    //             Operation noch nicht abgeschlossen ist
    //    Fulfilled: die asynchrone Operation ist abgeschlossen und
    //               das Promise-Objekt hat einen Wert
    //    Rejected: die asynchrone Operation ist fehlgeschlagen and das
    //              Promise-Objekt wird nicht den Status "fulfilled" erreichen.
    //              Im Promise-Objekt ist dann die Fehlerursache enthalten.

    /**
     * Eine Abteilung asynchron anhand ihrer ID suchen
     * @param id ID der gesuchten Abteilung
     * @returns Die gefundene Abteilung vom Typ [Abteilung](abteilung_entity_abteilung_entity.Abteilung.html)
     *          in einem Promise aus ES2015.
     * @throws NotFoundException falls keine Abteilung mit der ID existiert
     */
    // https://2ality.com/2015/01/es6-destructuring.html#simulating-named-parameters-in-javascript
    async findById({ id, mitMitarbeitern = false }: FindByIdParams) {
        this.#logger.debug('findById: id=%d', id);

        // https://typeorm.io/working-with-repository
        // Das Resultat ist undefined, falls kein Datensatz gefunden
        // Lesen: Keine Transaktion erforderlich
        const abteilung = await this.#queryBuilder
            .buildId({ id, mitMitarbeitern })
            .getOne();
        if (abteilung === null) {
            throw new NotFoundException(
                `Es gibt keine Abteilung mit der ID ${id}.`,
            );
        }
        if (abteilung.schlagwoerter === null) {
            abteilung.schlagwoerter = [];
        }

        if (this.#logger.isLevelEnabled('debug')) {
            this.#logger.debug(
                'findById: abteilung=%s, abteilungsleiter=%o',
                abteilung.toString(),
                abteilung.abteilungsleiter,
            );
            if (mitMitarbeitern) {
                this.#logger.debug(
                    'findById: mitarbeiter=%o',
                    abteilung.vieleMitarbeiter,
                );
            }
        }
        return abteilung;
    }

    /**
     * Abteilungen asynchron suchen.
     * @param suchkriterien JSON-Objekt mit Suchkriterien
     * @returns Ein JSON-Array mit den gefundenen Abteilungen.
     * @throws NotFoundException falls keine Abteilungen gefunden wurden.
     */
    async find(suchkriterien?: Suchkriterien) {
        this.#logger.debug('find: suchkriterien=%o', suchkriterien);

        // Keine Suchkriterien?
        if (suchkriterien === undefined) {
            return this.#queryBuilder.build({}).getMany();
        }
        const keys = Object.keys(suchkriterien);
        if (keys.length === 0) {
            return this.#queryBuilder.build(suchkriterien).getMany();
        }

        // Falsche Namen fuer Suchkriterien?
        if (!this.#checkKeys(keys)) {
            throw new NotFoundException('Ungueltige Suchkriterien');
        }

        // QueryBuilder https://typeorm.io/select-query-builder
        // Das Resultat ist eine leere Liste, falls nichts gefunden
        // Lesen: Keine Transaktion erforderlich
        const abteilungen = await this.#queryBuilder
            .build(suchkriterien)
            .getMany();
        if (abteilungen.length === 0) {
            this.#logger.debug('find: Keine Abteilungen gefunden');
            throw new NotFoundException(
                `Keine Abteilungen gefunden: ${JSON.stringify(suchkriterien)}`,
            );
        }
        abteilungen.forEach((abteilung) => {
            if (abteilung.schlagwoerter === null) {
                abteilung.schlagwoerter = [];
            }
        });
        this.#logger.debug('find: abteilungen=%o', abteilungen);
        return abteilungen;
    }

    #checkKeys(keys: string[]) {
        // Ist jedes Suchkriterium auch eine Property von Abteilung oder "schlagwoerter"?
        let validKeys = true;
        keys.forEach((key) => {
            if (
                !this.#abteilungProps.includes(key) &&
                key !== 'javascript' &&
                key !== 'typescript'
            ) {
                this.#logger.debug(
                    '#checkKeys: ungueltiges Suchkriterium "%s"',
                    key,
                );
                validKeys = false;
            }
        });

        return validKeys;
    }
}
