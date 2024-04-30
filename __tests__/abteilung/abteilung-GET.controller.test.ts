/* eslint-disable no-underscore-dangle */
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
import { type AbteilungenModel } from '../../src/abteilung/rest/abteilung-get.controller.js';
import { type ErrorResponse } from './error-response.js';
import { HttpStatus } from '@nestjs/common';

// -----------------------------------------------------------------------------
// T e s t d a t e n
// -----------------------------------------------------------------------------
const abteilungsleiterVorhanden = 'a';
const abteilungsleiterNichtVorhanden = 'xx';
const schlagwortVorhanden = 'javascript';
const schlagwortNichtVorhanden = 'csharp';

// -----------------------------------------------------------------------------
// T e s t s
// -----------------------------------------------------------------------------
// Test-Suite
// eslint-disable-next-line max-lines-per-function
describe('GET /rest', () => {
    let baseURL: string;
    let client: AxiosInstance;

    beforeAll(async () => {
        await startServer();
        baseURL = `https://${host}:${port}/rest`;
        client = axios.create({
            baseURL,
            httpsAgent,
            validateStatus: () => true,
        });
    });

    afterAll(async () => {
        await shutdownServer();
    });

    test('Alle Abteilungen', async () => {
        // given

        // when
        const { status, headers, data }: AxiosResponse<AbteilungenModel> =
            await client.get('/');

        // then
        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu); // eslint-disable-line sonarjs/no-duplicate-string
        expect(data).toBeDefined();

        const { abteilungen } = data._embedded;

        abteilungen
            .map((abteilung) => abteilung._links.self.href)
            .forEach((selfLink) => {
                // eslint-disable-next-line security/detect-non-literal-regexp, security-node/non-literal-reg-expr
                expect(selfLink).toMatch(new RegExp(`^${baseURL}`, 'iu'));
            });
    });

<<<<<<< HEAD:__tests__/buch/abteilung-GET.controller.test.ts
    test('Abteilungen mit einem Teil-Abteilungsleiter suchen', async () => {
=======
    test('Abteilungen mit einem Teil-Abteilungsleitername suchen', async () => {
>>>>>>> 94aed7b04e007475570dae24751e9ebf52e9d507:__tests__/abteilung/abteilung-GET.controller.test.ts
        // given
        const params = { abteilungsleiter: abteilungsleiterVorhanden };

        // when
        const { status, headers, data }: AxiosResponse<AbteilungenModel> =
            await client.get('/', { params });

        // then
        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data).toBeDefined();

        const { abteilungen } = data._embedded;

        // Jede Abteilung hat einen Abteilungsleiter mit dem Teilstring 'a'
        abteilungen
            .map((abteilung) => abteilung.abteilungsleiter)
            .forEach((abteilungsleiter) =>
<<<<<<< HEAD:__tests__/buch/abteilung-GET.controller.test.ts
                expect(abteilungsleiter.abteilungsleiter.toLowerCase()).toEqual(
=======
                expect(abteilungsleiter.nachname.toLowerCase()).toEqual(
>>>>>>> 94aed7b04e007475570dae24751e9ebf52e9d507:__tests__/abteilung/abteilung-GET.controller.test.ts
                    expect.stringContaining(abteilungsleiterVorhanden),
                ),
            );
    });

<<<<<<< HEAD:__tests__/buch/abteilung-GET.controller.test.ts
    test('Abteilungen zu einem nicht vorhandenen Teil-Abteilungsleiter suchen', async () => {
=======
    test('Abteilungen zu einem nicht vorhandenen Teil-Abteilungsleitersnamen suchen', async () => {
>>>>>>> 94aed7b04e007475570dae24751e9ebf52e9d507:__tests__/abteilung/abteilung-GET.controller.test.ts
        // given
        const params = { abteilungsleiter: abteilungsleiterNichtVorhanden };

        // when
        const { status, data }: AxiosResponse<ErrorResponse> = await client.get(
            '/',
            { params },
        );

        // then
        expect(status).toBe(HttpStatus.NOT_FOUND);

        const { error, statusCode } = data;

        expect(error).toBe('Not Found');
        expect(statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    test('Mind. 1 Abteilung mit vorhandenem Schlagwort', async () => {
        // given
        const params = { [schlagwortVorhanden]: 'true' };

        // when
        const { status, headers, data }: AxiosResponse<AbteilungenModel> =
            await client.get('/', { params });

        // then
        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        // JSON-Array mit mind. 1 JSON-Objekt
        expect(data).toBeDefined();

        const { abteilungen } = data._embedded;

<<<<<<< HEAD:__tests__/buch/abteilung-GET.controller.test.ts
        // Jede Abteilung hat im Array der Schlagwoerter z.B. "javascript"
=======
        // Jedes Abteilung hat im Array der Schlagwoerter z.B. "javascript"
>>>>>>> 94aed7b04e007475570dae24751e9ebf52e9d507:__tests__/abteilung/abteilung-GET.controller.test.ts
        abteilungen
            .map((abteilung) => abteilung.schlagwoerter)
            .forEach((schlagwoerter) =>
                expect(schlagwoerter).toEqual(
                    expect.arrayContaining([schlagwortVorhanden.toUpperCase()]),
                ),
            );
    });

    test('Keine Abteilungen zu einem nicht vorhandenen Schlagwort', async () => {
        // given
        const params = { [schlagwortNichtVorhanden]: 'true' };

        // when
        const { status, data }: AxiosResponse<ErrorResponse> = await client.get(
            '/',
            { params },
        );

        // then
        expect(status).toBe(HttpStatus.NOT_FOUND);

        const { error, statusCode } = data;

        expect(error).toBe('Not Found');
        expect(statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    test('Keine Abteilungen zu einer nicht-vorhandenen Property', async () => {
        // given
        const params = { foo: 'bar' };

        // when
        const { status, data }: AxiosResponse<ErrorResponse> = await client.get(
            '/',
            { params },
        );

        // then
        expect(status).toBe(HttpStatus.NOT_FOUND);

        const { error, statusCode } = data;

        expect(error).toBe('Not Found');
        expect(statusCode).toBe(HttpStatus.NOT_FOUND);
    });
});
/* eslint-enable no-underscore-dangle */
