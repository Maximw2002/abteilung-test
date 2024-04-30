/* eslint-disable @typescript-eslint/no-magic-numbers */
/*
 * Copyright (C) 2023 - present Juergen Zimmermann, Florian Goebel, Hochschule Karlsruhe
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

import { IsOptional, Matches, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Entity-Klasse für Abteilungsleiter ohne TypeORM.
 */
export class AbteilungsleiterDTO {
    @Matches('^\\w.*')
    @MaxLength(40)
<<<<<<< HEAD
    @ApiProperty({ example: 'Der Abteilungsleiter', type: String })
    readonly abteilungsleiter!: string;
=======
    @ApiProperty({ example: 'Der Abteilungsleiternachname', type: String })
    readonly nachname!: string;
>>>>>>> 94aed7b04e007475570dae24751e9ebf52e9d507

    @IsOptional()
    @MaxLength(40)
    @ApiProperty({ example: 'Der Vorname', type: String })
    readonly vorname: string | undefined;
}
/* eslint-enable @typescript-eslint/no-magic-numbers */
