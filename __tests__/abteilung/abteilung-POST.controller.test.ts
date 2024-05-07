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

import { afterAll, beforeAll, describe, test } from '@jest/globals';
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import {
    host,
    httpsAgent,
    port,
    shutdownServer,
    startServer,
} from '../testserver.js';
import { type AbteilungDTO } from '../../src/abteilung/rest/abteilungDTO.entity.js';
import { AbteilungReadService } from '../../src/abteilung/service/abteilung-read.service.js';
import { type ErrorResponse } from './error-response.js';
import { HttpStatus } from '@nestjs/common';
import { loginRest } from '../login.js';

// -----------------------------------------------------------------------------
// T e s t d a t e n
// -----------------------------------------------------------------------------
const neueAbteilung: AbteilungDTO = {
    bueroNummer: '4-202',
    zufriedenheit: 1,
    art: 'ENTWICKLUNG',
    budget: 99.99,
    verfuegbar: true,
    gruendungsDatum: '2022-02-28',
    homepage: 'https://post.rest',
    schlagwoerter: ['JAVASCRIPT', 'TYPESCRIPT'],
    abteilungsleiter: {
        nachname: 'Nachnamepost',
        vorname: 'vornamepost',
    },
    vieleMitarbeiter: [
        {
            name: 'Daniel Theis',
            jobType: 'Support',
        },
    ],
};
const neueAbteilungInvalid: Record<string, unknown> = {
    bueroNummer: 3,
    zufriedenheit: -1,
    art: 'UNSICHTBAR',
    budget: -1,
    verfuegbar: true,
    gruendungsDatum: '12345-123-123',
    homepage: 'anyHomepage',
    abteilungsleiter: {
        nachname: '?!',
        vorname: 'Vornameinvalid',
    },
};
const neueAbteilungBueroNummerExistiert: AbteilungDTO = {
    bueroNummer: '4-205',
    zufriedenheit: 1,
    art: 'ENTWICKLUNG',
    budget: 99.99,
    verfuegbar: true,
    gruendungsDatum: '2022-02-28',
    homepage: 'https://post.bueroNummer/',
    schlagwoerter: ['JAVASCRIPT', 'TYPESCRIPT'],
    abteilungsleiter: {
        nachname: 'NachnamepostbueroNummer',
        vorname: 'vornamepostbueroNummer',
    },
    vieleMitarbeiter: undefined,
};

// -----------------------------------------------------------------------------
// T e s t s
// -----------------------------------------------------------------------------
// Test-Suite
// eslint-disable-next-line max-lines-per-function
describe('POST /rest', () => {
    let client: AxiosInstance;
    const headers: Record<string, string> = {
        'Content-Type': 'application/json', // eslint-disable-line @typescript-eslint/naming-convention
    };

    // Testserver starten und dabei mit der DB verbinden
    beforeAll(async () => {
        await startServer();
        const baseURL = `https://${host}:${port}`;
        client = axios.create({
            baseURL,
            httpsAgent,
            validateStatus: (status) => status < 500, // eslint-disable-line @typescript-eslint/no-magic-numbers
        });
    });

    afterAll(async () => {
        await shutdownServer();
    });

    test('Neue Abteilung', async () => {
        // given
        const token = await loginRest(client);
        headers.Authorization = `Bearer ${token}`;

        // when
        const response: AxiosResponse<string> = await client.post(
            '/rest',
            neueAbteilung,
            { headers },
        );

        // then
        const { status, data } = response;

        expect(status).toBe(HttpStatus.CREATED);

        const { location } = response.headers as { location: string };

        expect(location).toBeDefined();

        // ID nach dem letzten "/"
        const indexLastSlash: number = location.lastIndexOf('/');

        expect(indexLastSlash).not.toBe(-1);

        const idStr = location.slice(indexLastSlash + 1);

        expect(idStr).toBeDefined();
        expect(AbteilungReadService.ID_PATTERN.test(idStr)).toBe(true);

        expect(data).toBe('');
    });

    test('Neue Abteilung mit ungueltigen Daten', async () => {
        // given
        const token = await loginRest(client);
        headers.Authorization = `Bearer ${token}`;
        const expectedMsg = [
            expect.stringMatching(/^bueroNummer /u),
            expect.stringMatching(/^zufriedenheit /u),
            expect.stringMatching(/^art /u),
            expect.stringMatching(/^budget /u),
            expect.stringMatching(/^gruendungsDatum /u),
            expect.stringMatching(/^homepage /u),
            expect.stringMatching(/^abteilungsleiter.nachname /u),
        ];

        // when
        const response: AxiosResponse<Record<string, any>> = await client.post(
            '/rest',
            neueAbteilungInvalid,
            { headers },
        );

        // then
        const { status, data } = response;

        expect(status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const messages: string[] = data.message;

        expect(messages).toBeDefined();
        expect(messages).toHaveLength(expectedMsg.length);
        expect(messages).toEqual(expect.arrayContaining(expectedMsg));
    });

    test('Neue Abteilung, aber die BueroNummer existiert bereits', async () => {
        // given
        const token = await loginRest(client);
        headers.Authorization = `Bearer ${token}`;

        // when
        const response: AxiosResponse<ErrorResponse> = await client.post(
            '/rest',
            neueAbteilungBueroNummerExistiert,
            { headers },
        );

        // then
        const { data } = response;

        const { message, statusCode } = data;

        expect(message).toEqual(expect.stringContaining('BueroNummer'));
        expect(statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    });

    test('Neue Abteilung, aber ohne Token', async () => {
        // when
        const response: AxiosResponse<Record<string, any>> = await client.post(
            '/rest',
            neueAbteilung,
        );

        // then
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    test('Neue Abteilung, aber mit falschem Token', async () => {
        // given
        const token = 'FALSCH';
        headers.Authorization = `Bearer ${token}`;

        // when
        const response: AxiosResponse<Record<string, any>> = await client.post(
            '/rest',
            neueAbteilung,
            { headers },
        );

        // then
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });
});
