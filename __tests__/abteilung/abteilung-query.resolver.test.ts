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

<<<<<<< HEAD:__tests__/buch/abteilung-query.resolver.test.ts
import { type Abteilung, type AbteilungsArt } from '../../src/abteilung/entity/abteilung.entity.js';
=======
import {
    type Abteilung,
    type AbteilungsArt,
} from '../../src/abteilung/entity/abteilung.entity.js';
>>>>>>> 94aed7b04e007475570dae24751e9ebf52e9d507:__tests__/abteilung/abteilung-query.resolver.test.ts
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
<<<<<<< HEAD:__tests__/buch/abteilung-query.resolver.test.ts
    'mitarbeiter' | 'aktualisiert' | 'erzeugt' | 'krankenstandsquote'
> & {
    krankenstandsquote: string;
=======
    'vieleMitarbeiter' | 'aktualisiert' | 'erzeugt' | 'krankenstandsQuote'
> & {
    krankenstandsQuote: string;
>>>>>>> 94aed7b04e007475570dae24751e9ebf52e9d507:__tests__/abteilung/abteilung-query.resolver.test.ts
};

// -----------------------------------------------------------------------------
// T e s t d a t e n
// -----------------------------------------------------------------------------
const idVorhanden = '1';

const abteilungsleiterVorhanden = 'Alpha';
const teilAbteilungsleiterVorhanden = 'a';
const teilAbteilungsleiterNichtVorhanden = 'abc';

<<<<<<< HEAD:__tests__/buch/abteilung-query.resolver.test.ts
const bueroNummerVorhanden = '978-3-897-22583-1';
=======
const bueroNummerVorhanden = '4-205';
>>>>>>> 94aed7b04e007475570dae24751e9ebf52e9d507:__tests__/abteilung/abteilung-query.resolver.test.ts

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
<<<<<<< HEAD:__tests__/buch/abteilung-query.resolver.test.ts
                        krankenstandsquote(short: true)
=======
                        krankenstandsQuote(short: true)
>>>>>>> 94aed7b04e007475570dae24751e9ebf52e9d507:__tests__/abteilung/abteilung-query.resolver.test.ts
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

<<<<<<< HEAD:__tests__/buch/abteilung-query.resolver.test.ts
        expect(result.abteilungsleiter?.abteilungsleiter).toMatch(/^\w/u);
=======
        expect(result.abteilungsleiter?.nachname).toMatch(/^\w/u);
>>>>>>> 94aed7b04e007475570dae24751e9ebf52e9d507:__tests__/abteilung/abteilung-query.resolver.test.ts
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

<<<<<<< HEAD:__tests__/buch/abteilung-query.resolver.test.ts
        expect(abteilung!.abteilungsleiter?.abteilungsleiter).toBe(
=======
        expect(abteilung!.abteilungsleiter?.nachname).toBe(
>>>>>>> 94aed7b04e007475570dae24751e9ebf52e9d507:__tests__/abteilung/abteilung-query.resolver.test.ts
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
<<<<<<< HEAD:__tests__/buch/abteilung-query.resolver.test.ts
                expect(
                    abteilungsleiter?.abteilungsleiter.toLowerCase(),
                ).toEqual(
=======
                expect(abteilungsleiter?.nachname.toLowerCase()).toEqual(
>>>>>>> 94aed7b04e007475570dae24751e9ebf52e9d507:__tests__/abteilung/abteilung-query.resolver.test.ts
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

<<<<<<< HEAD:__tests__/buch/abteilung-query.resolver.test.ts
    test('Abteilung zu vorhandener bueroNummer-Nummer', async () => {
=======
    test('Abteilung zu vorhandener BueroNummer-Nummer', async () => {
>>>>>>> 94aed7b04e007475570dae24751e9ebf52e9d507:__tests__/abteilung/abteilung-query.resolver.test.ts
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
<<<<<<< HEAD:__tests__/buch/abteilung-query.resolver.test.ts
        expect(abteilungsleiter?.abteilungsleiter).toBeDefined();
    });

    test('Abteilungen zu vorhandenem "zufriedenheit"', async () => {
=======
        expect(abteilungsleiter?.nachname).toBeDefined();
    });

    test('Abteilungen zu vorhandener "zufriedenheit"', async () => {
>>>>>>> 94aed7b04e007475570dae24751e9ebf52e9d507:__tests__/abteilung/abteilung-query.resolver.test.ts
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
<<<<<<< HEAD:__tests__/buch/abteilung-query.resolver.test.ts
            expect(abteilungsleiter?.abteilungsleiter.toLowerCase()).toEqual(
=======
            expect(abteilungsleiter?.nachname.toLowerCase()).toEqual(
>>>>>>> 94aed7b04e007475570dae24751e9ebf52e9d507:__tests__/abteilung/abteilung-query.resolver.test.ts
                expect.stringContaining(teilAbteilungsleiterVorhanden),
            );
        });
    });

<<<<<<< HEAD:__tests__/buch/abteilung-query.resolver.test.ts
    test('Keine Abteilung zu nicht-vorhandenem "zufriedenheit"', async () => {
=======
    test('Keine Abteilung zu nicht-vorhandener "zufriedenheit"', async () => {
>>>>>>> 94aed7b04e007475570dae24751e9ebf52e9d507:__tests__/abteilung/abteilung-query.resolver.test.ts
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

<<<<<<< HEAD:__tests__/buch/abteilung-query.resolver.test.ts
    test('Abteilungen zur Art "KINDLE"', async () => {
        // given
        const abteilungArt: AbteilungArt = 'KINDLE';
=======
    test('Abteilungen zur Art "VERTRIEB"', async () => {
        // given
        const abteilungsArt: AbteilungsArt = 'VERTRIEB';
>>>>>>> 94aed7b04e007475570dae24751e9ebf52e9d507:__tests__/abteilung/abteilung-query.resolver.test.ts
        const body: GraphQLRequest = {
            query: `
                {
                    abteilungen(suchkriterien: {
<<<<<<< HEAD:__tests__/buch/abteilung-query.resolver.test.ts
                        art: ${abteilungArt}
=======
                        art: ${abteilungsArt}
>>>>>>> 94aed7b04e007475570dae24751e9ebf52e9d507:__tests__/abteilung/abteilung-query.resolver.test.ts
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

<<<<<<< HEAD:__tests__/buch/abteilung-query.resolver.test.ts
            expect(art).toBe(abteilungArt);
            expect(abteilungsleiter?.abteilungsleiter).toBeDefined();
=======
            expect(art).toBe(abteilungsArt);
            expect(abteilungsleiter?.nachname).toBeDefined();
>>>>>>> 94aed7b04e007475570dae24751e9ebf52e9d507:__tests__/abteilung/abteilung-query.resolver.test.ts
        });
    });

    test('Abteilungen zur einer ungueltigen Art', async () => {
        // given
<<<<<<< HEAD:__tests__/buch/abteilung-query.resolver.test.ts
        const abteilungArt = 'UNGUELTIG';
=======
        const abteilungsArt = 'UNGUELTIG';
>>>>>>> 94aed7b04e007475570dae24751e9ebf52e9d507:__tests__/abteilung/abteilung-query.resolver.test.ts
        const body: GraphQLRequest = {
            query: `
                {
                    abteilungen(suchkriterien: {
<<<<<<< HEAD:__tests__/buch/abteilung-query.resolver.test.ts
                        art: ${abteilungArt}
=======
                        art: ${abteilungsArt}
>>>>>>> 94aed7b04e007475570dae24751e9ebf52e9d507:__tests__/abteilung/abteilung-query.resolver.test.ts
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
<<<<<<< HEAD:__tests__/buch/abteilung-query.resolver.test.ts
            expect(abteilungsleiter?.abteilungsleiter).toBeDefined();
=======
            expect(abteilungsleiter?.nachname).toBeDefined();
>>>>>>> 94aed7b04e007475570dae24751e9ebf52e9d507:__tests__/abteilung/abteilung-query.resolver.test.ts
        });
    });
});

/* eslint-enable @typescript-eslint/no-unsafe-assignment */
/* eslint-enable max-lines */
