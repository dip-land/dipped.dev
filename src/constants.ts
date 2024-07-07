import { FastifyReply } from 'fastify';
import { createReadStream, readFileSync } from 'fs';
import { DOMWindow, JSDOM } from 'jsdom';
import path from 'path';
import { Document } from 'mongodb';

export async function sendHtml(reply: FastifyReply, file: string) {
    reply.type('text/html').send(createReadStream(path.join(process.cwd(), file)));
    return reply;
}

// THIS IS UNUSED CODE!!
// /** The \<script\> HTML element is used to embed executable code or data {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script | MDN Docs } */
// interface script {
//     /** Specifies that the script is downloaded in parallel to parsing the page, and executed as soon as it is available (before parsing completes) (only for external scripts) {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#async | MDN Docs } */
//     async?: boolean;
//     /** Sets the mode of the request to an HTTP CORS Request {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#crossorigin | MDN Docs } */
//     crossorigin?: 'anonymous' | 'use-credentials';
//     /** Specifies that the script is downloaded in parallel to parsing the page, and executed after the page has finished parsing (only for external scripts) {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#defer | MDN Docs } */
//     defer?: boolean;
//     /** Provides a hint of the relative priority to use when fetching an external script {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#fetchpriority | MDN Docs } */
//     fetchpriority?: 'high' | 'low' | 'auto';
//     /** Allows a browser to check the fetched script to ensure that the code is never loaded if the source has been manipulated {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#integrity | MDN Docs } */
//     integrity?: string;
//     /** Specifies that the script should not be executed in browsers supporting ES2015 modules {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#nomodule | MDN Docs } */
//     nomodule?: boolean;
//     /** Specifies which referrer information to send when fetching a script {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#refererpolicy | MDN Docs } */
//     refererpolicy?:
//         | 'no-referrer'
//         | 'no-referer-when-downgrade'
//         | 'origin'
//         | 'origin-when-cross-origin'
//         | 'same-origin'
//         | 'strict-origin'
//         | 'strict-origin-when-cross-origin'
//         | 'unsafe-url';
//     /** Specifies the URL of an external script file {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#src | MDN Docs } */
//     src: string;
//     /** Specifies the media type of the script {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#type | MDN Docs } */
//     type?: string;
// }

export async function constructPage(
    reply: FastifyReply,
    options: {
        language: string;
        head: {
            url?: string;
            title?: string;
            description?: string;
            keywords?: string;
            image?: string;
            video?: string;
            largeMedia?: boolean;
            files?: Array<string>;
            // links?: Array<string>;
            // scripts?: Array<script>;
        };
        body: { files?: Array<string> };
    },
    document?: (window: DOMWindow, document: Document) => Promise<unknown | void>
) {
    const headBuffers: Array<Buffer> = [];
    const bodyBuffers: Array<Buffer> = [];
    for (const file of options?.head?.files ?? []) {
        try {
            headBuffers.push(readFileSync(path.join(process.cwd(), file)));
        } catch (error) {
            headBuffers.push(Buffer.from(''));
        }
    }
    for (const file of options?.body?.files ?? []) {
        try {
            bodyBuffers.push(readFileSync(path.join(process.cwd(), file)));
        } catch (error) {
            bodyBuffers.push(Buffer.from(''));
        }
    }
    headBuffers.push(
        Buffer.from(`${options.head.title ? `<title>${options.head.title}</title>` : ''}${options.head.title ? `<meta name="title" content="${options.head.title}" />` : ''}${
            options.head.description ? `<meta name="description" content="${options.head.description}" />` : ''
        }<meta property="og:type" content="website" />${options.head.url ? `<meta property="og:url" content="${options.head.url}" />` : ''}${
            options.head.title ? `<meta property="og:title" content="${options.head.title}" />` : ''
        }${options.head.description ? `<meta property="og:description" content="${options.head.description}" />` : ''}${
            options.head.image ? `<meta property="og:image" content="${options.head.image}" />` : ''
        }${options.head.video ? `<meta property="og:video" content="${options.head.video}" />` : ''}${
            options.head.largeMedia ? `<meta property="twitter:card" content="summary_large_image" />` : ''
        }${options.head.url ? `<meta property="twitter:url" content="${options.head.url}" />` : ''}${
            options.head.title ? `<meta property="twitter:title" content="${options.head.title}" />` : ''
        }${options.head.description ? `<meta property="twitter:description" content="${options.head.description}" />` : ''}${
            options.head.image ? `<meta property="twitter:image" content="${options.head.image}" />` : ''
        }${options.head.video ? `<meta property="twitter:video" content="${options.head.video}" />` : ''}
    `)
    );

    try {
        let dom = new JSDOM(`<!DOCTYPE html><html lang="${options.language}"><head></head><body></body></html>`);
        dom.window.document.head.innerHTML = Buffer.concat([...headBuffers]).toString();
        dom.window.document.body.innerHTML = Buffer.concat([...bodyBuffers]).toString();
        if (document) await document(dom.window, dom.window.document);
        reply.type('text/html').send(dom.serialize());
    } catch (error) {
        console.log(error);
        reply
            .type('text/html')
            .send(
                `<!DOCTYPE html><html lang="${options.language}"><head>${Buffer.concat([...headBuffers]).toString()}</head><body>${Buffer.concat([
                    ...bodyBuffers,
                ]).toString()}</body></html>`
            );
    }

    return reply;
}

// OLD CODE
// export function statusPage(reply: FastifyReply, options: { code: number; title: string }) {
//     return constructPage(reply, {
//         language: 'en-US',
//         head: {
//             title: options.title,
//             description: `Error ${options.code}`,
//             image: '/static/icons/favicon.png',
//             files: ['public/html/head.html'],
//             //scripts: [{ src: '', async: true }],
//         },
//         body: { files: ['public/html/nav.html', `public/html/statusCodes/${options.code}.html`] },
//     });
// }

export function paramToArray(param: any) {
    if (!param) return [];
    return [...new Set(param.split(/\s|,|\+/g))];
}
