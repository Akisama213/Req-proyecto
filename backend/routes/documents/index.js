'use strict'

var crypto = require('crypto');
const fs = require('fs');
const stem = require('stemr').stem;

module.exports = async function (fastify, opts) {
  fastify.get('/', async (request, reply) => {
    const documentsQuery = `SElECT title, location
                            FROM t_documents;`
    const documentsResult = await fastify.pg.query(documentsQuery);
    reply.code(200).send(documentsResult.rows);
  })

  fastify.get('/find-by/:searchTerm', async function (request, reply) {
    const words = []
    for(const word of request.params.searchTerm.split('_')) {
        words.push(stem(word.replace(/[^a-zA-Z ]/g, "")).toLowerCase());
    }

    let wordsQuery = `i.word = '${words[0]}'`;
    for(let wordIndex=1; wordIndex<words.length; wordIndex++) {
        wordsQuery += ` OR i.word = '${words[wordIndex]}'`
    }
    const searchQuery = `SELECT d.title, d.location, SUM(ibd.weight) as weight
                         FROM t_documents d
                         LEFT JOIN t_indexes_by_documents ibd ON ibd.id_document = d.id
                         LEFT JOIN t_indexes i ON i.id = ibd.id_index
                         WHERE ${wordsQuery}
                         GROUP BY d.title, d.location
                         ORDER BY weight DESC;`;
    const searchResult = await fastify.pg.query(searchQuery);
    for(const row of searchResult.rows) {
        row.data = String(fs.readFileSync(row.location));
    }
    reply.code(200).send(searchResult.rows);
  })

  fastify.post('/upload', async (request, reply) => {
    const files = request.raw.files;
    for(const fileIndex in files) {
        const file = files[fileIndex];
        console.log(file);
        if(file.mimetype == 'text/plain') {
            const data = file.data.toString();
            const words = data.split(' ');
            let totalWords = 0;
            const wordRanking = {};
            for(const word of words) {
                const stemWord = stem(word.replace(/[^a-zA-Z ]/g, "")).toLowerCase();
                if(wordRanking[stemWord] == null) {
                    wordRanking[stemWord] = 1;
                } else {
                    wordRanking[stemWord]++;
                }
                totalWords++;
            }
            const hash = crypto.createHash('md5').update(data).digest('hex');
            const location = `files/${hash}.${file.name.split('.').slice(-1)}`
            fs.writeFileSync(location, data);
            //Save on database
            const insertDocumentSql = `INSERT INTO t_documents
                                       (title, location)
                                       VALUES
                                       ($1, $2)
                                       RETURNING id;`
            const insertDocumentResult = await fastify.pg.query(insertDocumentSql, [file.name, location]);
            for(const word in wordRanking) {
                const insertIndexSql = `INSERT INTO t_indexes
                                        (word)
                                        VALUES
                                        ($1)
                                        ON CONFLICT (word) DO UPDATE SET word=EXCLUDED.word
                                        RETURNING id;`
                const insertIndexResult = await fastify.pg.query(insertIndexSql, [word]);
                const insertIndexByDocumentSql = `INSERT INTO t_indexes_by_documents
                                               (id_index, id_document, weight)
                                               VALUES
                                               ($1, $2, $3)
                                               RETURNING id;`
                const insertIndexByDocumentResult = await fastify.pg.query(
                    insertIndexByDocumentSql,
                    [insertIndexResult.rows[0].id, insertDocumentResult.rows[0].id, parseInt(wordRanking[word]/totalWords*10000)]);
            }
        }
    }
    reply.code(200).send('File sucessfully created....');
  })
}