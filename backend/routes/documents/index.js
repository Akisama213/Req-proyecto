'use strict'

var crypto = require('crypto');
const fs = require('fs');
const stem = require('stemr').stem;

module.exports = async function (fastify, opts) {
  fastify.get('/find-by/:searchTerm', async function (request, reply) {
    const words = []
    for(const word of request.params.searchTerm.split('_')) {
        words.push(stem(word.replace(/[^a-zA-Z ]/g, "")).toLowerCase());
    }
    
    return "holi"
  })

  fastify.post('/upload', async (request, reply) => {
    const files = request.raw.files;
    for(const fileIndex in files) {
        const file = files[fileIndex];
        if(file.mimetype == 'text/plain') {
            const data = file.data.toString();
            const words = data.split(' ');
            const totalWords = 0;
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