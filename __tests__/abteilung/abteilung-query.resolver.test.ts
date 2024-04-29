// @eslint-community/eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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

import {
    type Abteilung,
    type AbteilungsArt,
} from '../../src/abteilung/entity/abteilung.entity.js';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import {
    host,
    httpsAgent,
    port,
    shutdownServer,
    startServer,
} from '../testserver.js';
import { type GraphQLFormattedError } from 'graphql';
import { type GraphQLRequest } from '@apollo/server';
import { HttpStatus } from '@nestjs/common';

// eslint-disable-next-line jest/no-export
export interface GraphQLResponseBody {
    data?: Record<string, any> | null;
    errors?: readonly [GraphQLFormattedError];
}

type AbteilungDTO = Omit<
    Abteilung,
    'vieleMitarbeiter' | 'aktualisiert' | 'erzeugt' | 'krankenstandsQuote'
> & {
    krankenstandsQuote: string;
};

// -----------------------------------------------------------------------------
// T e s t d a t e n
// -----------------------------------------------------------------------------
const idVorhanden = '1';

const abteilungsleiterVorhanden = 'Alpha';
const teilAbteilungsleiterVorhanden = 'a';
const teilAbteilungsleiterNichtVorhanden = 'abc';

const bueroNummerVorhanden = '4-205';

const zufriedenheitVorhanden = 2;
const zufriedenheitNichtVorhanden = 99;

// -----------------------------------------------------------------------------
// T e s t s
// -----------------------------------------------------------------------------
// Test-Suite
// eslint-disable-next-line max-lines-per-function
describe('GraphQL Queries', () => {
    let client: AxiosInstance;
    const graphqlPath = 'graphql';

    // Testserver starten und dabei mit der DB verbinden
    beforeAll(async () => {
        await startServer();
        const baseURL = `https://${host}:${port}/`;
        client = axios.create({
            baseURL,
            httpsAgent,
            // auch Statuscode 400 als gueltigen Request akzeptieren, wenn z.B.
            // ein Enum mit einem falschen String getestest wird
            validateStatus: () => true,
        });
    });

    afterAll(async () => {
        await shutdownServer();
    });

    test('Abteilung zu vorhandener ID', async () => {
        // given
        const body: GraphQLRequest = {
            query: `
                {
                    abteilung(id: "${idVorhanden}") {
                        version
                        bueroNummer
                        zufriedenheit
                        art
                        budget
                        verfuegbar
                        gruendungsDatum
                        homepage
                        schlagwoerter
                        abteilungsleiter {
                            nachname
                        }
                        krankenstandsQuote(short: true)
                    }
                }
            `,
        };

        // when
        const { status, headers, data }: AxiosResponse<GraphQLResponseBody> =
            await client.post(graphqlPath, body);

        // then
        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu); // eslint-disable-line sonarjs/no-duplicate-string
        expect(data.errors).toBeUndefined();
        expect(data.data).toBeDefined();

        const { abteilung } = data.data!;
        const result: AbteilungDTO = abteilung;

        expect(result.abteilungsleiter?.nachname).toMatch(/^\w/u);
        expect(result.version).toBeGreaterThan(-1);
        expect(result.id).toBeUndefined();
    });

    test('Abteilung zu nicht-vorhandener ID', async () => {
        // given
        const id = '999999';
        const body: GraphQLRequest = {
            query: `
                {
                    abteilung(id: "${id}") {
                        abteilungsleiter {
                            nachname
                        }
                    }
                }
            `,
        };

        // when
        const { status, headers, data }: AxiosResponse<GraphQLResponseBody> =
            await client.post(graphqlPath, body);

        // then
        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.data!.abteilung).toBeNull();

        const { errors } = data;

        expect(errors).toHaveLength(1);

        const [error] = errors!;
        const { message, path, extensions } = error;

        expect(message).toBe(`Es gibt keine Abteilung mit der ID ${id}.`);
        expect(path).toBeDefined();
        expect(path![0]).toBe('abteilung');
        expect(extensions).toBeDefined();
        expect(extensions!.code).toBe('BAD_USER_INPUT');
    });

    test('Abteilung zu vorhandenem Abteilungsleiter', async () => {
        // given
        const body: GraphQLRequest = {
            query: `
                {
                    abteilungen(suchkriterien: {
                        abteilungsleiter: "${abteilungsleiterVorhanden}"
                    }) {
                        art
                        abteilungsleiter {
                            nachname
                        }
                    }
                }
            `,
        };

        // when
        const { status, headers, data }: AxiosResponse<GraphQLResponseBody> =
            await client.post(graphqlPath, body);

        // then
        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.errors).toBeUndefined();

        expect(data.data).toBeDefined();

        const { abteilungen } = data.data!;

        expect(abteilungen).not.toHaveLength(0);

        const abteilungenArray: AbteilungDTO[] = abteilungen;

        expect(abteilungenArray).toHaveLength(1);

        const [abteilung] = abteilungenArray;

        expect(abteilung!.abteilungsleiter?.nachname).toBe(
            abteilungsleiterVorhanden,
        );
    });

    test('Abteilung zu vorhandenem Teil-Abteilungsleiter', async () => {
        // given
        const body: GraphQLRequest = {
            query: `
                {
                    abteilungen(suchkriterien: {
                        abteilungsleiter: "${teilAbteilungsleiterVorhanden}"
                    }) {
                        abteilungsleiter {
                            nachname
                        }
                    }
                }
            `,
        };

        // when
        const { status, headers, data }: AxiosResponse<GraphQLResponseBody> =
            await client.post(graphqlPath, body);

        // then
        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.errors).toBeUndefined();
        expect(data.data).toBeDefined();

        const { abteilungen } = data.data!;

        expect(abteilungen).not.toHaveLength(0);

        const abteilungenArray: AbteilungDTO[] = abteilungen;
        abteilungenArray
            .map((abteilung) => abteilung.abteilungsleiter)
            .forEach((abteilungsleiter) =>
                expect(abteilungsleiter?.nachname.toLowerCase()).toEqual(
                    expect.stringContaining(teilAbteilungsleiterVorhanden),
                ),
            );
    });

    test('Abteilung zu nicht vorhandenem Abteilungsleiter', async () => {
        // given
        const body: GraphQLRequest = {
            query: `
                {
                    abteilungen(suchkriterien: {
                        abteilungsleiter: "${teilAbteilungsleiterNichtVorhanden}"
                    }) {
                        art
                        abteilungsleiter {
                            nachname
                        }
                    }
                }
            `,
        };

        // when
        const { status, headers, data }: AxiosResponse<GraphQLResponseBody> =
            await client.post(graphqlPath, body);

        // then
        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.data!.abteilungen).toBeNull();

        const { errors } = data;

        expect(errors).toHaveLength(1);

        const [error] = errors!;
        const { message, path, extensions } = error;

        expect(message).toMatch(/^Keine Abteilungen gefunden:/u);
        expect(path).toBeDefined();
        expect(path![0]).toBe('abteilungen');
        expect(extensions).toBeDefined();
        expect(extensions!.code).toBe('BAD_USER_INPUT');
    });

    test('Abteilung zu vorhandener BueroNummer-Nummer', async () => {
        // given
        const body: GraphQLRequest = {
            query: `
                {
                    abteilungen(suchkriterien: {
                        bueroNummer: "${bueroNummerVorhanden}"
                    }) {
                        bueroNummer
                        abteilungsleiter {
                            nachname
                        }
                    }
                }
            `,
        };

        // when
        const { status, headers, data }: AxiosResponse<GraphQLResponseBody> =
            await client.post(graphqlPath, body);

        // then
        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.errors).toBeUndefined();

        expect(data.data).toBeDefined();

        const { abteilungen } = data.data!;

        expect(abteilungen).not.toHaveLength(0);

        const abteilungenArray: AbteilungDTO[] = abteilungen;

        expect(abteilungenArray).toHaveLength(1);

        const [abteilung] = abteilungenArray;
        const { bueroNummer, abteilungsleiter } = abteilung!;

        expect(bueroNummer).toBe(bueroNummerVorhanden);
        expect(abteilungsleiter?.nachname).toBeDefined();
    });

    test('Abteilungen zu vorhandener "zufriedenheit"', async () => {
        // given
        const body: GraphQLRequest = {
            query: `
                {
                    abteilungen(suchkriterien: {
                        zufriedenheit: ${zufriedenheitVorhanden},
                        abteilungsleiter: "${teilAbteilungsleiterVorhanden}"
                    }) {
                        zufriedenheit
                        abteilungsleiter {
                            nachname
                        }
                    }
                }
            `,
        };

        // when
        const { status, headers, data }: AxiosResponse<GraphQLResponseBody> =
            await client.post(graphqlPath, body);

        // then
        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.errors).toBeUndefined();

        expect(data.data).toBeDefined();

        const { abteilungen } = data.data!;

        expect(abteilungen).not.toHaveLength(0);

        const abteilungenArray: AbteilungDTO[] = abteilungen;

        abteilungenArray.forEach((abteilung) => {
            const { zufriedenheit, abteilungsleiter } = abteilung;

            expect(zufriedenheit).toBe(zufriedenheitVorhanden);
            expect(abteilungsleiter?.nachname.toLowerCase()).toEqual(
                expect.stringContaining(teilAbteilungsleiterVorhanden),
            );
        });
    });

    test('Keine Abteilung zu nicht-vorhandener "zufriedenheit"', async () => {
        // given
        const body: GraphQLRequest = {
            query: `
                {
                    abteilungen(suchkriterien: {
                        zufriedenheit: ${zufriedenheitNichtVorhanden}
                    }) {
                        abteilungsleiter {
                            nachname
                        }
                    }
                }
            `,
        };

        // when
        const { status, headers, data }: AxiosResponse<GraphQLResponseBody> =
            await client.post(graphqlPath, body);

        // then
        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.data!.abteilungen).toBeNull();

        const { errors } = data;

        expect(errors).toHaveLength(1);

        const [error] = errors!;
        const { message, path, extensions } = error;

        expect(message).toMatch(/^Keine Abteilungen gefunden:/u);
        expect(path).toBeDefined();
        expect(path![0]).toBe('abteilungen');
        expect(extensions).toBeDefined();
        expect(extensions!.code).toBe('BAD_USER_INPUT');
    });

    test('Abteilungen zur Art "VERTRIEB"', async () => {
        // given
        const abteilungsArt: AbteilungsArt = 'VERTRIEB';
        const body: GraphQLRequest = {
            query: `
                {
                    abteilungen(suchkriterien: {
                        art: ${abteilungsArt}
                    }) {
                        art
                        abteilungsleiter {
                            nachname
                        }
                    }
                }
            `,
        };

        // when
        const { status, headers, data }: AxiosResponse<GraphQLResponseBody> =
            await client.post(graphqlPath, body);

        // then
        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.errors).toBeUndefined();

        expect(data.data).toBeDefined();

        const { abteilungen } = data.data!;

        expect(abteilungen).not.toHaveLength(0);

        const abteilungenArray: AbteilungDTO[] = abteilungen;

        abteilungenArray.forEach((abteilung) => {
            const { art, abteilungsleiter } = abteilung;

            expect(art).toBe(abteilungsArt);
            expect(abteilungsleiter?.nachname).toBeDefined();
        });
    });

    test('Abteilungen zur einer ungueltigen Art', async () => {
        // given
        const abteilungsArt = 'UNGUELTIG';
        const body: GraphQLRequest = {
            query: `
                {
                    abteilungen(suchkriterien: {
                        art: ${abteilungsArt}
                    }) {
                        abteilungsleiter {
                            nachname
                        }
                    }
                }
            `,
        };

        // when
        const { status, headers, data }: AxiosResponse<GraphQLResponseBody> =
            await client.post(graphqlPath, body);

        // then
        expect(status).toBe(HttpStatus.BAD_REQUEST);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.data).toBeUndefined();

        const { errors } = data;

        expect(errors).toHaveLength(1);

        const [error] = errors!;
        const { extensions } = error;

        expect(extensions).toBeDefined();
        expect(extensions!.code).toBe('GRAPHQL_VALIDATION_FAILED');
    });

    test('Abteilungen mit verfuegbar=true', async () => {
        // given
        const body: GraphQLRequest = {
            query: `
                {
                    abteilungen(suchkriterien: {
                        verfuegbar: true
                    }) {
                        verfuegbar
                        abteilungsleiter {
                            nachname
                        }
                    }
                }
            `,
        };

        // when
        const { status, headers, data }: AxiosResponse<GraphQLResponseBody> =
            await client.post(graphqlPath, body);

        // then
        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.errors).toBeUndefined();

        expect(data.data).toBeDefined();

        const { abteilungen } = data.data!;

        expect(abteilungen).not.toHaveLength(0);

        const abteilungenArray: AbteilungDTO[] = abteilungen;

        abteilungenArray.forEach((abteilung) => {
            const { verfuegbar, abteilungsleiter } = abteilung;

            expect(verfuegbar).toBe(true);
            expect(abteilungsleiter?.nachname).toBeDefined();
        });
    });
});

/* eslint-enable @typescript-eslint/no-unsafe-assignment */
/* eslint-enable max-lines */
