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
import { type AbteilungDtoOhneRef } from '../../src/abteilung/rest/abteilungDTO.entity.js';
import { type ErrorResponse } from './error-response.js';
import { HttpStatus } from '@nestjs/common';
import { loginRest } from '../login.js';

// -----------------------------------------------------------------------------
// T e s t d a t e n
// -----------------------------------------------------------------------------
const geaenderteAbteilung: AbteilungDtoOhneRef = {
<<<<<<< HEAD:__tests__/buch/abteilung-PUT.controller.test.ts
    bueroNummer: '978-0-201-63361-0',
    zufriedenheit: 5,
    art: 'KINDLE',
    budget: 3333,
    krankenstandsquote: 0.33,
=======
    bueroNummer: '3-202',
    zufriedenheit: 5,
    art: 'VERTRIEB',
    budget: 3333,
    krankenstandsQuote: 0.33,
>>>>>>> 94aed7b04e007475570dae24751e9ebf52e9d507:__tests__/abteilung/abteilung-PUT.controller.test.ts
    verfuegbar: true,
    gruendungsDatum: '2022-03-03',
    homepage: 'https://geaendert.put.rest',
    schlagwoerter: ['JAVASCRIPT'],
};
const idVorhanden = '30';

const geaenderteAbteilungIdNichtVorhanden: AbteilungDtoOhneRef = {
<<<<<<< HEAD:__tests__/buch/abteilung-PUT.controller.test.ts
    bueroNummer: '978-0-007-09732-6',
    zufriedenheit: 4,
    art: 'DRUCKAUSGABE',
    budget: 44.4,
    krankenstandsquote: 0.044,
=======
    bueroNummer: '1-301',
    zufriedenheit: 4,
    art: 'ENTWICKLUNG',
    budget: 44.4,
    krankenstandsQuote: 0.044,
>>>>>>> 94aed7b04e007475570dae24751e9ebf52e9d507:__tests__/abteilung/abteilung-PUT.controller.test.ts
    verfuegbar: true,
    gruendungsDatum: '2022-02-04',
    homepage: 'https://acme.de',
    schlagwoerter: ['JAVASCRIPT'],
};
const idNichtVorhanden = '999999';

const geaenderteAbteilungInvalid: Record<string, unknown> = {
<<<<<<< HEAD:__tests__/buch/abteilung-PUT.controller.test.ts
    bueroNummer: 'falsche-bueroNummer',
    zufriedenheit: -1,
    art: 'UNSICHTBAR',
    budget: -1,
    krankenstandsquote: 2,
=======
    bueroNummer: 'falsche-BueroNummer',
    zufriedenheit: -1,
    art: 'UNSICHTBAR',
    budget: -1,
    krankenstandsQuote: 2,
>>>>>>> 94aed7b04e007475570dae24751e9ebf52e9d507:__tests__/abteilung/abteilung-PUT.controller.test.ts
    verfuegbar: true,
    gruendungsDatum: '12345-123-123',
    abteilungsleiter: '?!',
    homepage: 'anyHomepage',
};

<<<<<<< HEAD:__tests__/buch/abteilung-PUT.controller.test.ts
const veralteAbteilung: AbteilungDtoOhneRef = {
    bueroNummer: '978-0-007-09732-6',
    zufriedenheit: 1,
    art: 'DRUCKAUSGABE',
    budget: 44.4,
    krankenstandsquote: 0.044,
=======
const veralteteAbteilung: AbteilungDtoOhneRef = {
    bueroNummer: '1-205',
    zufriedenheit: 1,
    art: 'ENTWICKLUNG',
    budget: 44.4,
    krankenstandsQuote: 0.044,
>>>>>>> 94aed7b04e007475570dae24751e9ebf52e9d507:__tests__/abteilung/abteilung-PUT.controller.test.ts
    verfuegbar: true,
    gruendungsDatum: '2022-02-04',
    homepage: 'https://acme.de',
    schlagwoerter: ['JAVASCRIPT'],
};

// -----------------------------------------------------------------------------
// T e s t s
// -----------------------------------------------------------------------------
// Test-Suite
// eslint-disable-next-line max-lines-per-function
describe('PUT /rest/:id', () => {
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
            headers,
            httpsAgent,
            validateStatus: (status) => status < 500, // eslint-disable-line @typescript-eslint/no-magic-numbers
        });
    });

    afterAll(async () => {
        await shutdownServer();
    });

    test('Vorhandene Abteilung aendern', async () => {
        // given
        const url = `/rest/${idVorhanden}`;
        const token = await loginRest(client);
        headers.Authorization = `Bearer ${token}`;
        headers['If-Match'] = '"0"';

        // when
        const { status, data }: AxiosResponse<string> = await client.put(
            url,
            geaenderteAbteilung,
            { headers },
        );

        // then
        expect(status).toBe(HttpStatus.NO_CONTENT);
        expect(data).toBe('');
    });

    test('Nicht-vorhandene Abteilung aendern', async () => {
        // given
        const url = `/rest/${idNichtVorhanden}`;
        const token = await loginRest(client);
        headers.Authorization = `Bearer ${token}`;
        headers['If-Match'] = '"0"';

        // when
        const { status }: AxiosResponse<string> = await client.put(
            url,
            geaenderteAbteilungIdNichtVorhanden,
            { headers },
        );

        // then
        expect(status).toBe(HttpStatus.NOT_FOUND);
    });

    test('Vorhandene Abteilung aendern, aber mit ungueltigen Daten', async () => {
        // given
        const url = `/rest/${idVorhanden}`;
        const token = await loginRest(client);
        headers.Authorization = `Bearer ${token}`;
        headers['If-Match'] = '"0"';
        const expectedMsg = [
            expect.stringMatching(/^bueroNummer /u),
            expect.stringMatching(/^zufriedenheit /u),
            expect.stringMatching(/^art /u),
            expect.stringMatching(/^budget /u),
<<<<<<< HEAD:__tests__/buch/abteilung-PUT.controller.test.ts
            expect.stringMatching(/^krankenstandsquote /u),
=======
            expect.stringMatching(/^krankenstandsQuote /u),
>>>>>>> 94aed7b04e007475570dae24751e9ebf52e9d507:__tests__/abteilung/abteilung-PUT.controller.test.ts
            expect.stringMatching(/^gruendungsDatum /u),
            expect.stringMatching(/^homepage /u),
        ];

        // when
        const { status, data }: AxiosResponse<Record<string, any>> =
            await client.put(url, geaenderteAbteilungInvalid, { headers });

        // then
        expect(status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const messages: string[] = data.message;

        expect(messages).toBeDefined();
        expect(messages).toHaveLength(expectedMsg.length);
        expect(messages).toEqual(expect.arrayContaining(expectedMsg));
    });

    test('Vorhandene Abteilung aendern, aber ohne Versionsnummer', async () => {
        // given
        const url = `/rest/${idVorhanden}`;
        const token = await loginRest(client);
        headers.Authorization = `Bearer ${token}`;
        delete headers['If-Match'];

        // when
        const { status, data }: AxiosResponse<string> = await client.put(
            url,
            geaenderteAbteilung,
            { headers },
        );

        // then
        expect(status).toBe(HttpStatus.PRECONDITION_REQUIRED);
        expect(data).toBe('Header "If-Match" fehlt');
    });

    test('Vorhandene Abteilung aendern, aber mit alter Versionsnummer', async () => {
        // given
        const url = `/rest/${idVorhanden}`;
        const token = await loginRest(client);
        headers.Authorization = `Bearer ${token}`;
        headers['If-Match'] = '"-1"';

        // when
        const { status, data }: AxiosResponse<ErrorResponse> = await client.put(
            url,
<<<<<<< HEAD:__tests__/buch/abteilung-PUT.controller.test.ts
            veralteAbteilung,
=======
            veralteteAbteilung,
>>>>>>> 94aed7b04e007475570dae24751e9ebf52e9d507:__tests__/abteilung/abteilung-PUT.controller.test.ts
            { headers },
        );

        // then
        expect(status).toBe(HttpStatus.PRECONDITION_FAILED);

        const { message, statusCode } = data;

        expect(message).toMatch(/Versionsnummer/u);
        expect(statusCode).toBe(HttpStatus.PRECONDITION_FAILED);
    });

    test('Vorhandene Abteilung aendern, aber ohne Token', async () => {
        // given
        const url = `/rest/${idVorhanden}`;
        delete headers.Authorization;
        headers['If-Match'] = '"0"';

        // when
        const response: AxiosResponse<Record<string, any>> = await client.put(
            url,
            geaenderteAbteilung,
            { headers },
        );

        // then
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    test('Vorhandene Abteilung aendern, aber mit falschem Token', async () => {
        // given
        const url = `/rest/${idVorhanden}`;
        const token = 'FALSCH';
        headers.Authorization = `Bearer ${token}`;

        // when
        const response: AxiosResponse<Record<string, any>> = await client.put(
            url,
            geaenderteAbteilung,
            { headers },
        );

        // then
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });
});
