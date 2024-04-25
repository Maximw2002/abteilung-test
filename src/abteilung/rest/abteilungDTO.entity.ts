/* eslint-disable max-classes-per-file, @typescript-eslint/no-magic-numbers */
/*
 * Copyright (C) 2016 - present Juergen Zimmermann, Florian Goebel, Hochschule Karlsruhe
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
 * Das Modul besteht aus der Entity-Klasse.
 * @packageDocumentation
 */

import {
    ArrayUnique,
    IsArray,
    IsBoolean,
    IsISBN,
    IsISO8601,
    IsInt,
    IsOptional,
    IsPositive,
    IsUrl,
    Matches,
    Max,
    Min,
    ValidateNested,
} from 'class-validator';
import { type AbteilungsArt } from '../entity/abteilung.entity.js';
import { AbteilungsleiterDTO } from './abteilungsleiterDTO.entity.js';
import { ApiProperty } from '@nestjs/swagger';
import { MitarbeiterDTO } from './mitarbeiterDTO.entity.js';
import { Type } from 'class-transformer';

export const MAX_RATING = 5;

/**
 * Entity-Klasse für Abteilungen ohne TypeORM und ohne Referenzen.
 */
export class AbteilungDtoOhneRef {
    // https://www.oreilly.com/library/view/regular-expressions-cookbook/9781449327453/ch04s13.html
    @IsISBN(13)
    @ApiProperty({ example: '2-201', type: String })
    readonly bueroNummer!: string;

    @IsInt()
    @Min(0)
    @Max(MAX_RATING)
    @ApiProperty({ example: 5, type: Number })
    readonly zufriedenheit: number | undefined;

    @Matches(/^ENTWICKLUNG$|^VERTRIEB$/u)
    @IsOptional()
    @ApiProperty({ example: 'ENTWICKLUNG', type: String })
    readonly art: AbteilungsArt | undefined;

    @IsPositive()
    @ApiProperty({ example: 1, type: Number })
    // statt number ggf. Decimal aus decimal.js analog zu BigDecimal von Java
    readonly budget!: number;

    @Min(0)
    @Max(1)
    @IsOptional()
    @ApiProperty({ example: 0.1, type: Number })
    readonly krankenstandsQuote: number | undefined;

    @IsBoolean()
    @ApiProperty({ example: true, type: Boolean })
    readonly verfuegbar: boolean | undefined;

    @IsISO8601({ strict: true })
    @IsOptional()
    @ApiProperty({ example: '2021-01-31' })
    readonly gruendungsDatum: Date | string | undefined;

    @IsUrl()
    @IsOptional()
    @ApiProperty({ example: 'https://test.de/', type: String })
    readonly homepage: string | undefined;

    @IsOptional()
    @ArrayUnique()
    @ApiProperty({ example: ['JAVASCRIPT', 'TYPESCRIPT'] })
    readonly schlagwoerter: string[] | undefined;
}

/**
 * Entity-Klasse für Abteilungen ohne TypeORM.
 */
export class AbteilungDTO extends AbteilungDtoOhneRef {
    @ValidateNested()
    @Type(() => AbteilungsleiterDTO)
    @ApiProperty({ type: AbteilungsleiterDTO })
    readonly abteilungsleiter!: AbteilungsleiterDTO; // NOSONAR

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MitarbeiterDTO)
    @ApiProperty({ type: [MitarbeiterDTO] })
    readonly vieleMitarbeiter: MitarbeiterDTO[] | undefined;

    // MitarbeiterDTO
}
/* eslint-enable max-classes-per-file, @typescript-eslint/no-magic-numbers */
