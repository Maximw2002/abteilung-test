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
 * Das Modul besteht aus der Controller-Klasse für Schreiben an der REST-Schnittstelle.
 * @packageDocumentation
 */

import { AbteilungDTO, AbteilungDtoOhneRef } from './abteilungDTO.entity.js';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiHeader,
    ApiNoContentResponse,
    ApiOperation,
    ApiPreconditionFailedResponse,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { AuthGuard, Roles } from 'nest-keycloak-connect';
import {
    Body,
    Controller,
    Delete,
    Headers,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    Req,
    Res,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { type Abteilung } from '../entity/abteilung.entity.js';
import { AbteilungWriteService } from '../service/abteilung-write.service.js';
import { type Abteilungsleiter } from '../entity/abteilungsleiter.entity.js';
import { type Mitarbeiter } from '../entity/mitarbeiter.entity.js';
import { ResponseTimeInterceptor } from '../../logger/response-time.interceptor.js';
import { getBaseUri } from './getBaseUri.js';
import { getLogger } from '../../logger/logger.js';
import { paths } from '../../config/paths.js';

const MSG_FORBIDDEN = 'Kein Token mit ausreichender Berechtigung vorhanden';
/**
 * Die Controller-Klasse für die Verwaltung von Abteilungen.
 */
@Controller(paths.rest)
@UseGuards(AuthGuard)
@UseInterceptors(ResponseTimeInterceptor)
@ApiTags('Abteilung REST-API')
@ApiBearerAuth()
export class AbteilungWriteController {
    readonly #service: AbteilungWriteService;

    readonly #logger = getLogger(AbteilungWriteController.name);

    constructor(service: AbteilungWriteService) {
        this.#service = service;
    }

    /**
     * Eine neue Abteilung wird asynchron angelegt. Die neu anzulegende Abteilung ist als
     * JSON-Datensatz im Request-Objekt enthalten. Wenn es keine
     * Verletzungen von Constraints gibt, wird der Statuscode `201` (`Created`)
     * gesetzt und im Response-Header wird `Location` auf die URI so gesetzt,
     * dass damit die neu angelegte Abteilung abgerufen werden kann.
     *
     * Falls Constraints verletzt sind, wird der Statuscode `400` (`Bad Request`)
     * gesetzt und genauso auch wenn der Abteilungsleiter oder die Büro-Nummer bereits
     * existieren.
     *
     * @param abteilungDTO JSON-Daten für ein Abteilung im Request-Body.
     * @param res Leeres Response-Objekt von Express.
     * @returns Leeres Promise-Objekt.
     */
    @Post()
    @Roles({ roles: ['admin', 'user'] })
    @ApiOperation({ summary: 'Eine neue Abteilung anlegen' })
    @ApiCreatedResponse({ description: 'Erfolgreich neu angelegt' })
    @ApiBadRequestResponse({ description: 'Fehlerhafte Abteilungsdaten' })
    @ApiForbiddenResponse({ description: MSG_FORBIDDEN })
    async post(
        @Body() abteilungDTO: AbteilungDTO,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<Response> {
        this.#logger.debug('post: abteilungDTO=%o', abteilungDTO);

        const abteilung = this.#abteilungDtoToAbteilung(abteilungDTO);
        const id = await this.#service.create(abteilung);

        const location = `${getBaseUri(req)}/${id}`;
        this.#logger.debug('post: location=%s', location);
        return res.location(location).send();
    }

    /**
     * Eine vorhandene Abteilung wird asynchron aktualisiert.
     *
     * Im Request-Objekt von Express muss die ID der zu aktualisierenden Abteilung
     * als Pfad-Parameter enthalten sein. Außerdem muss im Rumpf die zu
     * aktualisierende Abteilung als JSON-Datensatz enthalten sein. Damit die
     * Aktualisierung überhaupt durchgeführt werden kann, muss im Header
     * `If-Match` auf die korrekte Version für optimistische Synchronisation
     * gesetzt sein.
     *
     * Bei erfolgreicher Aktualisierung wird der Statuscode `204` (`No Content`)
     * gesetzt und im Header auch `ETag` mit der neuen Version mitgeliefert.
     *
     * Falls die Versionsnummer fehlt, wird der Statuscode `428` (`Precondition
     * required`) gesetzt; und falls sie nicht korrekt ist, der Statuscode `412`
     * (`Precondition failed`). Falls Constraints verletzt sind, wird der
     * Statuscode `400` (`Bad Request`) gesetzt und genauso auch wenn der neue
     * Abteilungsleiter oder die neue Büro-Nummer bereits existieren.
     *
     * @param abteilungDTO Abteilungsdaten im Body des Request-Objekts.
     * @param id Pfad-Paramater für die ID.
     * @param version Versionsnummer aus dem Header _If-Match_.
     * @param res Leeres Response-Objekt von Express.
     * @returns Leeres Promise-Objekt.
     */
    // eslint-disable-next-line max-params
    @Put(':id')
    @Roles({ roles: ['admin', 'user'] })
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Eine vorhandene Abteilung aktualisieren',
        tags: ['Aktualisieren'],
    })
    @ApiHeader({
        name: 'If-Match',
        description: 'Header für optimistische Synchronisation',
        required: false,
    })
    @ApiNoContentResponse({ description: 'Erfolgreich aktualisiert' })
    @ApiBadRequestResponse({ description: 'Fehlerhafte Abteilungsdaten' })
    @ApiPreconditionFailedResponse({
        description: 'Falsche Version im Header "If-Match"',
    })
    @ApiResponse({
        status: HttpStatus.PRECONDITION_REQUIRED,
        description: 'Header "If-Match" fehlt',
    })
    @ApiForbiddenResponse({ description: MSG_FORBIDDEN })
    async put(
        @Body() abteilungDTO: AbteilungDtoOhneRef,
        @Param('id') id: number,
        @Headers('If-Match') version: string | undefined,
        @Res() res: Response,
    ): Promise<Response> {
        this.#logger.debug(
            'put: id=%s, abteilungDTO=%o, version=%s',
            id,
            abteilungDTO,
            version,
        );

        if (version === undefined) {
            const msg = 'Header "If-Match" fehlt';
            this.#logger.debug('put: msg=%s', msg);
            return res
                .status(HttpStatus.PRECONDITION_REQUIRED)
                .set('Content-Type', 'application/json')
                .send(msg);
        }

        const abteilung = this.#abteilungDtoOhneRefToAbteilung(abteilungDTO);
        const neueVersion = await this.#service.update({
            id,
            abteilung,
            version,
        });
        this.#logger.debug('put: version=%d', neueVersion);
        return res.header('ETag', `"${neueVersion}"`).send();
    }

    /**
     * Eine Abteilung wird anhand seiner ID-gelöscht, die als Pfad-Parameter angegeben
     * ist. Der zurückgelieferte Statuscode ist `204` (`No Content`).
     *
     * @param id Pfad-Paramater für die ID.
     * @returns Leeres Promise-Objekt.
     */
    @Delete(':id')
    @Roles({ roles: ['admin'] })
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Abteilung mit der ID löschen' })
    @ApiNoContentResponse({
        description: 'Die Abteilung wurde gelöscht oder war nicht vorhanden',
    })
    @ApiForbiddenResponse({ description: MSG_FORBIDDEN })
    async delete(@Param('id') id: number) {
        this.#logger.debug('delete: id=%s', id);
        await this.#service.delete(id);
    }

    #abteilungDtoToAbteilung(abteilungDTO: AbteilungDTO): Abteilung {
        const abteilungsleiterDTO = abteilungDTO.abteilungsleiter;
        const abteilungsleiter: Abteilungsleiter = {
            id: undefined,
            titel: titelDTO.titel,
            untertitel: titelDTO.untertitel,
            buch: undefined,
        };
        const vieleMitarbeiter = abteilungDTO.vieleMitarbeiter?.map(
            (mitarbeiterDTO) => {
                const mitarbeiter: Mitarbeiter = {
                    id: undefined,
                    name: mitarbeiterDTO.name,
                    jobType: mitarbeiterDTO.jobType,
                    abteilung: undefined,
                };
                return mitarbeiter;
            },
        );
        const abteilung = {
            id: undefined,
            version: undefined,
            bueroNummer: abteilungDTO.bueroNummer,
            zufriedenheit: abteilungDTO.zufriedenheit,
            art: abteilungDTO.art,
            budget: abteilungDTO.budget,
            krankenstandsQuote: abteilungDTO.krankenstandsQuote,
            verfuegbar: abteilungDTO.verfuegbar,
            gruendungsDatum: abteilungDTO.gruendungsDatum,
            homepage: abteilungDTO.homepage,
            schlagwoerter: abteilungDTO.schlagwoerter,
            abteilungsleiter,
            vieleMitarbeiter,
            erzeugt: new Date(),
            aktualisiert: new Date(),
        };

        // Rueckwaertsverweise
        abteilung.abteilungsleiter.abteilung = abteilung;
        abteilung.vieleMitarbeiter?.forEach((mitarbeiter) => {
            mitarbeiter.abteilung = abteilung;
        });
        return abteilung;
    }

    #abteilungDtoOhneRefToAbteilung(
        abteilungDTO: AbteilungDtoOhneRef,
    ): Abteilung {
        return {
            id: undefined,
            version: undefined,
            bueroNummer: abteilungDTO.bueroNummer,
            zufriedenheit: abteilungDTO.zufriedenheit,
            art: abteilungDTO.art,
            budget: abteilungDTO.budget,
            krankenstandsQuote: abteilungDTO.krankenstandsQuote,
            verfuegbar: abteilungDTO.verfuegbar,
            gruendungsDatum: abteilungDTO.gruendungsDatum,
            homepage: abteilungDTO.homepage,
            schlagwoerter: abteilungDTO.schlagwoerter,
            abteilungsleiter: undefined,
            vieleMitarbeiter: undefined,
            erzeugt: undefined,
            aktualisiert: new Date(),
        };
    }
}
