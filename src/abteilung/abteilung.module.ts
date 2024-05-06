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
import { AbteilungGetController } from './rest/abteilung-get.controller.js';
import { AbteilungMutationResolver } from './graphql/abteilung-mutation.resolver.js';
import { AbteilungQueryResolver } from './graphql/abteilung-query.resolver.js';
import { AbteilungReadService } from './service/abteilung-read.service.js';
import { AbteilungWriteController } from './rest/abteilung-write.controller.js';
import { AbteilungWriteService } from './service/abteilung-write.service.js';
import { KeycloakModule } from '../security/keycloak/keycloak.module.js';
import { MailModule } from '../mail/mail.module.js';
import { Module } from '@nestjs/common';
import { QueryBuilder } from './service/query-builder.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entities } from './entity/entities.js';

/**
 * Das Modul besteht aus Controller- und Service-Klassen für die Verwaltung von
 * Abteilungen.
 * @packageDocumentation
 */

/**
 * Die dekorierte Modul-Klasse mit Controller- und Service-Klassen sowie der
 * Funktionalität für TypeORM.
 */
@Module({
    imports: [KeycloakModule, MailModule, TypeOrmModule.forFeature(entities)],
    controllers: [AbteilungGetController, AbteilungWriteController],
    // Provider sind z.B. Service-Klassen fuer DI
    providers: [
        AbteilungReadService,
        AbteilungWriteService,
        AbteilungQueryResolver,
        AbteilungMutationResolver,
        QueryBuilder,
    ],
    // Export der Provider fuer DI in anderen Modulen
    exports: [AbteilungReadService, AbteilungWriteService],
})
export class AbteilungModule {}
