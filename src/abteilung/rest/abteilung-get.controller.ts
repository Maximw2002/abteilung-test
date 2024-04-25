/* eslint-disable max-lines */
/*
 * Copyright (C) 2021 - present Juergen Zimmermann, Hochschule Karlsruhe
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
 * Das Modul besteht aus der Controller-Klasse für Lesen an der REST-Schnittstelle.
 * @packageDocumentation
 */

// eslint-disable-next-line max-classes-per-file
import {
    type Abteilung,
    type AbteilungsArt,
} from '../entity/abteilung.entity.js';
import {
    ApiHeader,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiProperty,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import {
    Controller,
    Get,
    Headers,
    HttpStatus,
    NotFoundException,
    Param,
    Query,
    Req,
    Res,
    UseInterceptors,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AbteilungReadService } from '../service/abteilung-read.service.js';
import { type Abteilungsleiter } from '../entity/abteilungsleiter.entity.js';
import { Public } from 'nest-keycloak-connect';
import { ResponseTimeInterceptor } from '../../logger/response-time.interceptor.js';
import { type Suchkriterien } from '../service/suchkriterien.js';
import { getBaseUri } from './getBaseUri.js';
import { getLogger } from '../../logger/logger.js';
import { paths } from '../../config/paths.js';

/** href-Link für HATEOAS */
export interface Link {
    /** href-Link für HATEOAS-Links */
    readonly href: string;
}

/** Links für HATEOAS */
export interface Links {
    /** self-Link */
    readonly self: Link;
    /** Optionaler Linke für list */
    readonly list?: Link;
    /** Optionaler Linke für add */
    readonly add?: Link;
    /** Optionaler Linke für update */
    readonly update?: Link;
    /** Optionaler Linke für remove */
    readonly remove?: Link;
}

/** Typedefinition für ein Abteilungsleiter-Objekt ohne Rückwärtsverweis zur Abteilung */
export type AbteilungsleiterModel = Omit<Abteilungsleiter, 'abteilung' | 'id'>;

/** Buch-Objekt mit HATEOAS-Links */
export type AbteilungModel = Omit<
    Abteilung,
    | 'vieleMitarbeiter'
    | 'aktualisiert'
    | 'erzeugt'
    | 'id'
    | 'abteilungsleiter'
    | 'version'
> & {
    abteilungsleiter: AbteilungsleiterModel;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _links: Links;
};

/** Abteilung-Objekte mit HATEOAS-Links in einem JSON-Array. */
export interface AbteilungenModel {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _embedded: {
        abteilungen: AbteilungModel[];
    };
}

/**
 * Klasse für `AbteilungGetController`, um Queries in _OpenAPI_ bzw. Swagger zu
 * formulieren. `AbteilungController` hat dieselben Properties wie die Basisklasse
 * `Abteilung` - allerdings mit dem Unterschied, dass diese Properties beim Ableiten
 * so überschrieben sind, dass sie auch nicht gesetzt bzw. undefined sein
 * dürfen, damit die Queries flexibel formuliert werden können. Deshalb ist auch
 * immer der zusätzliche Typ undefined erforderlich.
 * Außerdem muss noch `string` statt `Date` verwendet werden, weil es in OpenAPI
 * den Typ Date nicht gibt.
 */
export class AbteilungQuery implements Suchkriterien {
    @ApiProperty({ required: false })
    declare readonly bueroNummer: string;

    @ApiProperty({ required: false })
    declare readonly zufriedenheit: number;

    @ApiProperty({ required: false })
    declare readonly art: AbteilungsArt;

    @ApiProperty({ required: false })
    declare readonly budget: number;

    @ApiProperty({ required: false })
    declare readonly krankenstandsQuote: number;

    @ApiProperty({ required: false })
    declare readonly verfügabr: boolean;

    @ApiProperty({ required: false })
    declare readonly gruendungsDatum: string;

    @ApiProperty({ required: false })
    declare readonly homepage: string;

    @ApiProperty({ required: false })
    declare readonly javascript: string;

    @ApiProperty({ required: false })
    declare readonly typescript: string;

    @ApiProperty({ required: false })
    declare readonly abteilungsleiter: string;
}

const APPLICATION_HAL_JSON = 'application/hal+json';

/**
 * Die Controller-Klasse für die Verwaltung von Abteilungen.
 */
// Decorator in TypeScript, zur Standardisierung in ES vorgeschlagen (stage 3)
// https://devblogs.microsoft.com/typescript/announcing-typescript-5-0-beta/#decorators
// https://github.com/tc39/proposal-decorators
@Controller(paths.rest)
@UseInterceptors(ResponseTimeInterceptor)
@ApiTags('Abteilung REST-API')
// @ApiBearerAuth()
// Klassen ab ES 2015
export class AbteilungGetController {
    // readonly in TypeScript, vgl. C#
    // private ab ES 2019
    readonly #service: AbteilungReadService;

    readonly #logger = getLogger(AbteilungGetController.name);

    // Dependency Injection (DI) bzw. Constructor Injection
    // constructor(private readonly service: AbteilungReadService) {}
    // https://github.com/tc39/proposal-type-annotations#omitted-typescript-specific-features-that-generate-code
    constructor(service: AbteilungReadService) {
        this.#service = service;
    }

    /**
     * Eine Abteilung wird asynchron anhand seiner ID als Pfadparameter gesucht.
     *
     * Falls es eine solche Abteilung gibt und `If-None-Match` im Request-Header
     * auf die aktuelle Version der Abteilung gesetzt war, wird der Statuscode
     * `304` (`Not Modified`) zurückgeliefert. Falls `If-None-Match` nicht
     * gesetzt ist oder eine veraltete Version enthält, wird die gefundene
     * Abteilung im Rumpf des Response als JSON-Datensatz mit Atom-Links für HATEOAS
     * und dem Statuscode `200` (`OK`) zurückgeliefert.
     *
     * Falls es keine Abteilung zur angegebenen ID gibt, wird der Statuscode `404`
     * (`Not Found`) zurückgeliefert.
     *
     * @param idStr Pfad-Parameter `id`
     * @param req Request-Objekt von Express mit Pfadparameter, Query-String,
     *            Request-Header und Request-Body.
     * @param version Versionsnummer im Request-Header bei `If-None-Match`
     * @param res Leeres Response-Objekt von Express.
     * @returns Leeres Promise-Objekt.
     */
    // eslint-disable-next-line max-params
    @Get(':id')
    @Public()
    @ApiOperation({ summary: 'Suche mit der Abteilung-ID' })
    @ApiParam({
        name: 'id',
        description: 'Z.B. 1',
    })
    @ApiHeader({
        name: 'If-None-Match',
        description: 'Header für bedingte GET-Requests, z.B. "0"',
        required: false,
    })
    @ApiOkResponse({ description: 'Die Abteilung wurde gefunden' })
    @ApiNotFoundResponse({ description: 'Keine Abteilung zur ID gefunden' })
    @ApiResponse({
        status: HttpStatus.NOT_MODIFIED,
        description: 'Die Abteilung wurde bereits heruntergeladen',
    })
    async getById(
        @Param('id') idStr: string,
        @Req() req: Request,
        @Headers('If-None-Match') version: string | undefined,
        @Res() res: Response,
    ): Promise<Response<AbteilungModel | undefined>> {
        this.#logger.debug('getById: idStr=%s, version=%s', idStr, version);
        const id = Number(idStr);
        if (!Number.isInteger(id)) {
            this.#logger.debug('getById: not isInteger()');
            throw new NotFoundException(
                `Die Abteilung-ID ${idStr} ist ungueltig.`,
            );
        }

        if (req.accepts([APPLICATION_HAL_JSON, 'json', 'html']) === false) {
            this.#logger.debug('getById: accepted=%o', req.accepted);
            return res.sendStatus(HttpStatus.NOT_ACCEPTABLE);
        }

        const abteilung = await this.#service.findById({ id });
        if (this.#logger.isLevelEnabled('debug')) {
            this.#logger.debug('getById(): abteilung=%s', abteilung.toString());
            this.#logger.debug(
                'getById(): abteilungsleiter=%o',
                abteilung.abteilungsleiter,
            );
        }

        // ETags
        const versionDb = abteilung.version;
        if (version === `"${versionDb}"`) {
            this.#logger.debug('getById: NOT_MODIFIED');
            return res.sendStatus(HttpStatus.NOT_MODIFIED);
        }
        this.#logger.debug('getById: versionDb=%s', versionDb);
        res.header('ETag', `"${versionDb}"`);

        // HATEOAS mit Atom Links und HAL (= Hypertext Application Language)
        const abteilungModel = this.#toModel(abteilung, req);
        this.#logger.debug('getById: abteilungModel=%o', abteilungModel);
        return res.contentType(APPLICATION_HAL_JSON).json(abteilungModel);
    }

    /**
     * Abteilungen werden mit Query-Parametern asynchron gesucht. Falls es mindestens
     * eine solche Abteilung gibt, wird der Statuscode `200` (`OK`) gesetzt. Im Rumpf
     * des Response ist das JSON-Array mit den gefundenen Abteilungen, die jeweils
     * um Atom-Links für HATEOAS ergänzt sind.
     *
     * Falls es keine Abteilung zu den Suchkriterien gibt, wird der Statuscode `404`
     * (`Not Found`) gesetzt.
     *
     * Falls es keine Query-Parameter gibt, werden alle Abteilungen ermittelt.
     *
     * @param query Query-Parameter von Express.
     * @param req Request-Objekt von Express.
     * @param res Leeres Response-Objekt von Express.
     * @returns Leeres Promise-Objekt.
     */
    @Get()
    @Public()
    @ApiOperation({ summary: 'Suche mit Suchkriterien' })
    @ApiOkResponse({ description: 'Eine evtl. leere Liste mit Abteilungen' })
    async get(
        @Query() query: AbteilungQuery,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<Response<AbteilungenModel | undefined>> {
        this.#logger.debug('get: query=%o', query);

        if (req.accepts([APPLICATION_HAL_JSON, 'json', 'html']) === false) {
            this.#logger.debug('get: accepted=%o', req.accepted);
            return res.sendStatus(HttpStatus.NOT_ACCEPTABLE);
        }

        const abteilungen = await this.#service.find(query);
        this.#logger.debug('get: %o', abteilungen);

        // HATEOAS: Atom Links je Buch
        const abteilungenModel = abteilungen.map((abteilung) =>
            this.#toModel(abteilung, req, false),
        );
        this.#logger.debug('get: abteilungenModel=%o', abteilungenModel);

        const result: AbteilungenModel = {
            _embedded: { abteilungen: abteilungenModel },
        };
        return res.contentType(APPLICATION_HAL_JSON).json(result).send();
    }

    #toModel(abteilung: Abteilung, req: Request, all = true) {
        const baseUri = getBaseUri(req);
        this.#logger.debug('#toModel: baseUri=%s', baseUri);
        const { id } = abteilung;
        const links = all
            ? {
                  self: { href: `${baseUri}/${id}` },
                  list: { href: `${baseUri}` },
                  add: { href: `${baseUri}` },
                  update: { href: `${baseUri}/${id}` },
                  remove: { href: `${baseUri}/${id}` },
              }
            : { self: { href: `${baseUri}/${id}` } };

        this.#logger.debug(
            '#toModel: abteilung=%o, links=%o',
            abteilung,
            links,
        );
        const abteilungsleiterModel: AbteilungsleiterModel = {
            abteilungsleiter:
                abteilung.abteilungsleiter?.abteilungsleiter ?? 'N/A',
            vorname: abteilung.abteilungsleiter?.vorname ?? 'N/A',
        };
        const abteilungModel: AbteilungModel = {
            bueroNummer: abteilung.bueroNummer,
            zufriedenheit: abteilung.zufriedenheit,
            art: abteilung.art,
            budget: abteilung.budget,
            krankenstandsQuote: abteilung.krankenstandsQuote,
            verfuegbar: abteilung.verfuegbar,
            gruendungsDatum: abteilung.gruendungsDatum,
            homepage: abteilung.homepage,
            schlagwoerter: abteilung.schlagwoerter,
            abteilungsleiter: abteilungsleiterModel,
            _links: links,
        };

        return abteilungModel;
    }
}
/* eslint-enable max-lines */
