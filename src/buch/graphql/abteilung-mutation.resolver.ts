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
// eslint-disable-next-line max-classes-per-file
import { type Abteilung } from '../entity/abteilung.entity.js';
import { type Abteilungsleiter } from '../entity/abteilungsleiter.entity.js';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthGuard, Roles } from 'nest-keycloak-connect';
import { IsInt, IsNumberString, Min } from 'class-validator';
import { type Mitarbeiter } from '../entity/mitarbeiter.entity.js';
import { AbteilungDTO } from '../rest/abteilungDTO.entity.js';
import { AbteilungWriteService } from '../service/abteilung-write.service.js';
import { HttpExceptionFilter } from './http-exception.filter.js';
import { type IdInput } from './abteilung-query.resolver.js';
import { ResponseTimeInterceptor } from '../../logger/response-time.interceptor.js';
import { getLogger } from '../../logger/logger.js';

// Authentifizierung und Autorisierung durch
//  GraphQL Shield
//      https://www.graphql-shield.com
//      https://github.com/maticzav/graphql-shield
//      https://github.com/nestjs/graphql/issues/92
//      https://github.com/maticzav/graphql-shield/issues/213
//  GraphQL AuthZ
//      https://github.com/AstrumU/graphql-authz
//      https://www.the-guild.dev/blog/graphql-authz

export interface CreatePayload {
    readonly id: number;
}

export interface UpdatePayload {
    readonly version: number;
}

export class AbteilungUpdateDTO extends AbteilungDTO {
    @IsNumberString()
    readonly id!: string;

    @IsInt()
    @Min(0)
    readonly version!: number;
}
@Resolver()
// alternativ: globale Aktivierung der Guards https://docs.nestjs.com/security/authorization#basic-rbac-implementation
@UseGuards(AuthGuard)
@UseFilters(HttpExceptionFilter)
@UseInterceptors(ResponseTimeInterceptor)
export class AbteilungMutationResolver {
    readonly #service: AbteilungWriteService;

    readonly #logger = getLogger(AbteilungMutationResolver.name);

    constructor(service: AbteilungWriteService) {
        this.#service = service;
    }

    @Mutation()
    @Roles({ roles: ['admin', 'user'] })
    async create(@Args('input') abteilungDTO: AbteilungDTO) {
        this.#logger.debug('create: abteilungDTO=%o', abteilungDTO);

        const abteilung = this.#abteilungDtoToAbteilung(abteilungDTO);
        const id = await this.#service.create(abteilung);
        // TODO BadUserInputError
        this.#logger.debug('createAbteilung: id=%d', id);
        const payload: CreatePayload = { id };
        return payload;
    }

    @Mutation()
    @Roles({ roles: ['admin', 'user'] })
    async update(@Args('input') abteilungDTO: AbteilungUpdateDTO) {
        this.#logger.debug('update: abteilung=%o', abteilungDTO);

        const abteilung = this.#abteilungUpdateDtoToAbteilung(abteilungDTO);
        const versionStr = `"${abteilungDTO.version.toString()}"`;

        const versionResult = await this.#service.update({
            id: Number.parseInt(abteilungDTO.id, 10),
            abteilung,
            version: versionStr,
        });
        // TODO BadUserInputError
        this.#logger.debug('updateAbteilung: versionResult=%d', versionResult);
        const payload: UpdatePayload = { version: versionResult };
        return payload;
    }

    @Mutation()
    @Roles({ roles: ['admin'] })
    async delete(@Args() id: IdInput) {
        const idStr = id.id;
        this.#logger.debug('delete: id=%s', idStr);
        const deletePerformed = await this.#service.delete(idStr);
        this.#logger.debug('deleteAbteilung: deletePerformed=%s', deletePerformed);
        return deletePerformed;
    }

    #buchDtoToBuch(buchDTO: BuchDTO): Buch {
        const titelDTO = buchDTO.titel;
        const titel: Titel = {
            id: undefined,
            titel: titelDTO.titel,
            untertitel: titelDTO.untertitel,
            buch: undefined,
        };
        const abbildungen = buchDTO.abbildungen?.map((abbildungDTO) => {
            const abbildung: Abbildung = {
                id: undefined,
                beschriftung: abbildungDTO.beschriftung,
                contentType: abbildungDTO.contentType,
                buch: undefined,
            };
            return abbildung;
        });
        const buch: Buch = {
            id: undefined,
            version: undefined,
            isbn: buchDTO.isbn,
            rating: buchDTO.rating,
            art: buchDTO.art,
            preis: buchDTO.preis,
            rabatt: buchDTO.rabatt,
            lieferbar: buchDTO.lieferbar,
            datum: buchDTO.datum,
            homepage: buchDTO.homepage,
            schlagwoerter: buchDTO.schlagwoerter,
            titel,
            abbildungen,
            erzeugt: new Date(),
            aktualisiert: new Date(),
        };

        // Rueckwaertsverweis
        buch.titel!.buch = buch;
        return buch;
    }

    #buchUpdateDtoToBuch(buchDTO: BuchUpdateDTO): Buch {
        return {
            id: undefined,
            version: undefined,
            isbn: buchDTO.isbn,
            rating: buchDTO.rating,
            art: buchDTO.art,
            preis: buchDTO.preis,
            rabatt: buchDTO.rabatt,
            lieferbar: buchDTO.lieferbar,
            datum: buchDTO.datum,
            homepage: buchDTO.homepage,
            schlagwoerter: buchDTO.schlagwoerter,
            titel: undefined,
            abbildungen: undefined,
            erzeugt: undefined,
            aktualisiert: new Date(),
        };
    }

    // #errorMsgCreateBuch(err: CreateError) {
    //     switch (err.type) {
    //         case 'IsbnExists': {
    //             return `Die ISBN ${err.isbn} existiert bereits`;
    //         }
    //         default: {
    //             return 'Unbekannter Fehler';
    //         }
    //     }
    // }

    // #errorMsgUpdateBuch(err: UpdateError) {
    //     switch (err.type) {
    //         case 'BuchNotExists': {
    //             return `Es gibt kein Buch mit der ID ${err.id}`;
    //         }
    //         case 'VersionInvalid': {
    //             return `"${err.version}" ist keine gueltige Versionsnummer`;
    //         }
    //         case 'VersionOutdated': {
    //             return `Die Versionsnummer "${err.version}" ist nicht mehr aktuell`;
    //         }
    //         default: {
    //             return 'Unbekannter Fehler';
    //         }
    //     }
    // }
}
