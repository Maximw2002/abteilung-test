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
 * Das Modul besteht aus der Klasse {@linkcode QueryBuilder}.
 * @packageDocumentation
 */

import { Abteilung } from '../entity/abteilung.entity.js';
import { Abteilungsleiter } from '../entity/abteilungsleiter.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Mitarbeiter } from '../entity/mitarbeiter.entity.js';
import { Repository } from 'typeorm';
import { type Suchkriterien } from './suchkriterien.js';
import { getLogger } from '../../logger/logger.js';
import { typeOrmModuleOptions } from '../../config/typeormOptions.js';

/** Typdefinitionen für die Suche mit der Abteilung-ID. */
export interface BuildIdParams {
    /** ID der gesuchten Abteilung. */
    readonly id: number;
<<<<<<< HEAD
    /** Sollen die Abbildungen mitgeladen werden? */
=======
    /** Sollen die Mitarbeiter mitgeladen werden? */
>>>>>>> 94aed7b04e007475570dae24751e9ebf52e9d507
    readonly mitMitarbeitern?: boolean;
}
/**
 * Die Klasse `QueryBuilder` implementiert das Lesen für Abteilungen und greift
 * mit _TypeORM_ auf eine relationale DB zu.
 */
@Injectable()
export class QueryBuilder {
    readonly #abteilungAlias = `${Abteilung.name
        .charAt(0)
        .toLowerCase()}${Abteilung.name.slice(1)}`;

    readonly #abteilungsleiterAlias = `${Abteilungsleiter.name
        .charAt(0)
        .toLowerCase()}${Abteilungsleiter.name.slice(1)}`;

    readonly #mitarbeiterAlias = `${Mitarbeiter.name
        .charAt(0)
        .toLowerCase()}${Mitarbeiter.name.slice(1)}`;

    readonly #repo: Repository<Abteilung>;

    readonly #logger = getLogger(QueryBuilder.name);

    constructor(@InjectRepository(Abteilung) repo: Repository<Abteilung>) {
        this.#repo = repo;
    }

    /**
     * Eine Abteilung mit der ID suchen.
     * @param id ID der gesuchten Abteilung
     * @returns QueryBuilder
     */
    buildId({ id, mitMitarbeitern = false }: BuildIdParams) {
        // QueryBuilder "abteilung" fuer Repository<Abteilung>
        const queryBuilder = this.#repo.createQueryBuilder(
            this.#abteilungAlias,
<<<<<<< HEAD
        );

        // Fetch-Join: aus QueryBuilder "buch" die Property "titel" ->  Tabelle "titel"
        queryBuilder.innerJoinAndSelect(
            `${this.#abteilungAlias}.titel`,
            this.#abteilungsleiterAlias,
        );

=======
        );

        // Fetch-Join: aus QueryBuilder "abteilung" die Property "abteilungsleiter" ->  Tabelle "abteilungsleiter"
        queryBuilder.innerJoinAndSelect(
            `${this.#abteilungAlias}.abteilungsleiter`,
            this.#abteilungsleiterAlias,
        );

>>>>>>> 94aed7b04e007475570dae24751e9ebf52e9d507
        if (mitMitarbeitern) {
            // Fetch-Join: aus QueryBuilder "abteilung" die Property "vieleMitarbeiter" -> Tabelle "mitarbeiter"
            queryBuilder.leftJoinAndSelect(
                `${this.#abteilungsleiterAlias}.vieleMitarbeiter`,
                this.#mitarbeiterAlias,
            );
        }

        queryBuilder.where(`${this.#abteilungAlias}.id = :id`, { id: id }); // eslint-disable-line object-shorthand
        return queryBuilder;
    }

    /**
     * Abteilungen asynchron suchen.
     * @param suchkriterien JSON-Objekt mit Suchkriterien
     * @returns QueryBuilder
     */
    // z.B. { abteilungsleiter: 'a', zufriedenheit: 5, javascript: true }
    // "rest properties" fuer anfaengliche WHERE-Klausel: ab ES 2018 https://github.com/tc39/proposal-object-rest-spread
    // eslint-disable-next-line max-lines-per-function
    build({
        abteilungsleiter,
        javascript,
        typescript,
        ...props
    }: Suchkriterien) {
        this.#logger.debug(
            'build: abteilungsleiter=%s, javascript=%s, typescript=%s, props=%o',
            abteilungsleiter,
            javascript,
            typescript,
            props,
        );

        let queryBuilder = this.#repo.createQueryBuilder(this.#abteilungAlias);
        queryBuilder.innerJoinAndSelect(
            `${this.#abteilungAlias}.abteilungsleiter`,
            'abteilungsleiter',
        );

        // z.B. { abteilungsleiter: 'a', zufriedenheit: 5, javascript: true }
        // "rest properties" fuer anfaengliche WHERE-Klausel: ab ES 2018 https://github.com/tc39/proposal-object-rest-spread
        // type-coverage:ignore-next-line
        // const { abteilungsleiter, javascript, typescript, ...props } = suchkriterien;

        let useWhere = true;

        // Abteilungsleiter in der Query: Teilstring des Abteilungsleiters und "case insensitive"
        // CAVEAT: MySQL hat keinen Vergleich mit "case insensitive"
        // type-coverage:ignore-next-line
        if (
            abteilungsleiter !== undefined &&
            typeof abteilungsleiter === 'string'
        ) {
            const ilike =
                typeOrmModuleOptions.type === 'postgres' ? 'ilike' : 'like';
            queryBuilder = queryBuilder.where(
                `${this.#abteilungsleiterAlias}.abteilungsleiter ${ilike} :abteilungsleiter`,
                { abteilungsleiter: `%${abteilungsleiter}%` },
            );
            useWhere = false;
        }

        if (javascript === 'true') {
            queryBuilder = useWhere
                ? queryBuilder.where(
                      `${this.#abteilungAlias}.schlagwoerter like '%JAVASCRIPT%'`,
                  )
                : queryBuilder.andWhere(
                      `${this.#abteilungAlias}.schlagwoerter like '%JAVASCRIPT%'`,
                  );
            useWhere = false;
        }

        if (typescript === 'true') {
            queryBuilder = useWhere
                ? queryBuilder.where(
                      `${this.#abteilungAlias}.schlagwoerter like '%TYPESCRIPT%'`,
                  )
                : queryBuilder.andWhere(
                      `${this.#abteilungAlias}.schlagwoerter like '%TYPESCRIPT%'`,
                  );
            useWhere = false;
        }

        // Restliche Properties als Key-Value-Paare: Vergleiche auf Gleichheit
        Object.keys(props).forEach((key) => {
            const param: Record<string, any> = {};
            param[key] = (props as Record<string, any>)[key]; // eslint-disable-line @typescript-eslint/no-unsafe-assignment, security/detect-object-injection
            queryBuilder = useWhere
                ? queryBuilder.where(
                      `${this.#abteilungAlias}.${key} = :${key}`,
                      param,
                  )
                : queryBuilder.andWhere(
                      `${this.#abteilungAlias}.${key} = :${key}`,
                      param,
                  );
            useWhere = false;
        });

        this.#logger.debug('build: sql=%s', queryBuilder.getSql());
        return queryBuilder;
    }
}
