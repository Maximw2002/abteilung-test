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
 * Das Modul besteht aus der Klasse {@linkcode AbteilungWriteService} für die
 * Schreiboperationen im Anwendungskern.
 * @packageDocumentation
 */

import {
    BueroNummerExistsException,
    VersionInvalidException,
    VersionOutdatedException,
} from './exceptions.js';
import { type DeleteResult, Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Abteilung } from '../entity/abteilung.entity.js';
import { AbteilungReadService } from './abteilung-read.service.js';
import { Abteilungsleiter } from '../entity/abteilungsleiter.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { MailService } from '../../mail/mail.service.js';
import { Mitarbeiter } from '../entity/mitarbeiter.entity.js';
import { getLogger } from '../../logger/logger.js';

/** Typdefinitionen zum Aktualisieren einer Abteilung mit `update`. */
export interface UpdateParams {
<<<<<<< HEAD
    /** ID des zu aktualisierenden Buches. */
    readonly id: number | undefined;
    /** Buch-Objekt mit den aktualisierten Werten. */
=======
    /** ID der zu aktualisierenden Abteilung. */
    readonly id: number | undefined;
    /** Abteilung-Objekt mit den aktualisierten Werten. */
>>>>>>> 94aed7b04e007475570dae24751e9ebf52e9d507
    readonly abteilung: Abteilung;
    /** Versionsnummer für die aktualisierenden Werte. */
    readonly version: string;
}

/**
 * Die Klasse `AbteilungWriteService` implementiert den Anwendungskern für das
 * Schreiben von Abteilungen und greift mit _TypeORM_ auf die DB zu.
 */
@Injectable()
export class AbteilungWriteService {
    private static readonly VERSION_PATTERN = /^"\d{1,3}"/u;

    readonly #repo: Repository<Abteilung>;

    readonly #readService: AbteilungReadService;

    readonly #mailService: MailService;

    readonly #logger = getLogger(AbteilungWriteService.name);

    constructor(
        @InjectRepository(Abteilung) repo: Repository<Abteilung>,
        readService: AbteilungReadService,
        mailService: MailService,
    ) {
        this.#repo = repo;
        this.#readService = readService;
        this.#mailService = mailService;
    }

    /**
     * Eine neue Abteilung soll angelegt werden.
     * @param abteilung Die neu abzulegende Abteilung
     * @returns Die ID der neu angelegten Abteilung
     * @throws bueroNummerExists falls die bueroNummer bereits existiert
     */
    async create(abteilung: Abteilung): Promise<number> {
        this.#logger.debug('create: abteilung=%o', abteilung);
        await this.#validateCreate(abteilung);

        const abteilungDb = await this.#repo.save(abteilung); // implizite Transaktion
        this.#logger.debug('create: abteilungDb=%o', abteilungDb);

        await this.#sendmail(abteilungDb);

        return abteilungDb.id!;
    }

    /**
     * Eine vorhandene Abteilung soll aktualisiert werden. "Destructured" Argument
     * mit id (ID der zu aktualisierenden Abteilung), abteilung (zu aktualisierende Abteilung)
     * und version (Versionsnummer für optimistische Synchronisation).
     * @returns Die neue Versionsnummer gemäß optimistischer Synchronisation
     * @throws NotFoundException falls keine Abteilung zur ID vorhanden ist
     * @throws VersionInvalidException falls die Versionsnummer ungültig ist
     * @throws VersionOutdatedException falls die Versionsnummer veraltet ist
     */
    // https://2ality.com/2015/01/es6-destructuring.html#simulating-named-parameters-in-javascript
    async update({ id, abteilung, version }: UpdateParams): Promise<number> {
        this.#logger.debug(
            'update: id=%d, abteilung=%o, version=%s',
            id,
            abteilung,
            version,
        );
        if (id === undefined) {
            this.#logger.debug('update: Keine gueltige ID');
            throw new NotFoundException(
                `Es gibt keine Abteilung mit der ID ${id}.`,
            );
        }

        const validateResult = await this.#validateUpdate(
            abteilung,
            id,
            version,
        );
        this.#logger.debug('update: validateResult=%o', validateResult);
        if (!(validateResult instanceof Abteilung)) {
            return validateResult;
        }

        const abteilungNeu = validateResult;
        const merged = this.#repo.merge(abteilungNeu, abteilung);
        this.#logger.debug('update: merged=%o', merged);
        const updated = await this.#repo.save(merged); // implizite Transaktion
        this.#logger.debug('update: updated=%o', updated);

        return updated.version!;
    }

    /**
     * Eine Abteilung wird asynchron anhand seiner ID gelöscht.
     *
     * @param id ID der zu löschenden Abteilung
     * @returns true, falls die Abteilung vorhanden war und gelöscht wurde. Sonst false.
     */
    async delete(id: number) {
        this.#logger.debug('delete: id=%d', id);
        const abteilung = await this.#readService.findById({
            id,
            mitMitarbeitern: true,
        });

        let deleteResult: DeleteResult | undefined;
        await this.#repo.manager.transaction(async (transactionalMgr) => {
<<<<<<< HEAD
            // Das Buch zur gegebenen ID mit Titel und Abb. asynchron loeschen
=======
            // Die Abteilung zur gegebenen ID mit Abteilungsleiter und Abb. asynchron loeschen
>>>>>>> 94aed7b04e007475570dae24751e9ebf52e9d507

            // TODO "cascade" funktioniert nicht beim Loeschen
            const abteilungsleiterId = abteilung.abteilungsleiter?.id;
            if (abteilungsleiterId !== undefined) {
                await transactionalMgr.delete(
                    Abteilungsleiter,
                    abteilungsleiterId,
                );
            }
            const vieleMitarbeiter = abteilung.vieleMitarbeiter ?? [];
            for (const mitarbeiter of vieleMitarbeiter) {
                await transactionalMgr.delete(Mitarbeiter, mitarbeiter.id);
            }

            deleteResult = await transactionalMgr.delete(Abteilung, id);
            this.#logger.debug('delete: deleteResult=%o', deleteResult);
        });

        return (
            deleteResult?.affected !== undefined &&
            deleteResult.affected !== null &&
            deleteResult.affected > 0
        );
    }

    async #validateCreate({ bueroNummer }: Abteilung): Promise<undefined> {
        this.#logger.debug('#validateCreate: bueroNummer=%s', bueroNummer);
        if (await this.#repo.existsBy({ bueroNummer })) {
            throw new BueroNummerExistsException(bueroNummer);
        }
    }

    async #sendmail(abteilung: Abteilung) {
        const subject = `Neue Abteilung ${abteilung.id}`;
<<<<<<< HEAD
        const abteilungsleiter =
            abteilung.abteilungsleiter?.abteilungsleiter ?? 'N/A';
=======
        const abteilungsleiter = abteilung.abteilungsleiter?.nachname ?? 'N/A';
>>>>>>> 94aed7b04e007475570dae24751e9ebf52e9d507
        const body = `Die Abteilung mit dem Abteilungsleiter <strong>${abteilungsleiter}</strong> ist angelegt`;
        await this.#mailService.sendmail({ subject, body });
    }

    async #validateUpdate(
        abteilung: Abteilung,
        id: number,
        versionStr: string,
    ): Promise<Abteilung> {
        this.#logger.debug(
            '#validateUpdate: abteilung=%o, id=%s, versionStr=%s',
            abteilung,
            id,
            versionStr,
        );
        if (!AbteilungWriteService.VERSION_PATTERN.test(versionStr)) {
            throw new VersionInvalidException(versionStr);
        }

        const version = Number.parseInt(versionStr.slice(1, -1), 10);
        this.#logger.debug(
            '#validateUpdate: abteilung=%o, version=%d',
            abteilung,
            version,
        );

        const abteilungDb = await this.#readService.findById({ id });

        // nullish coalescing
        const versionDb = abteilungDb.version!;
        if (version < versionDb) {
            this.#logger.debug('#validateUpdate: versionDb=%d', version);
            throw new VersionOutdatedException(version);
        }
        this.#logger.debug('#validateUpdate: abteilungDb=%o', abteilungDb);
        return abteilungDb;
    }
}
