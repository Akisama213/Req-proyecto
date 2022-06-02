-- t_documents

CREATE TABLE IF NOT EXISTS t_documents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(256) NOT NULL,
    location VARCHAR(1024) NOT NULL
);

-- t_users

CREATE TABLE IF NOT EXISTS t_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(64) NOT NULL,
    password VARCHAR(100) NOT NULL
);

-- t_indexes

CREATE TABLE IF NOT EXISTS t_indexes (
    id SERIAL PRIMARY KEY,
    word VARCHAR(64) NOT NULL UNIQUE
);

-- t_documents_by_users

CREATE TABLE IF NOT EXISTS t_documents_by_users (
    id SERIAL PRIMARY KEY,
    id_document INT NOT NULL,
    id_user INT NOT NULL
);

ALTER TABLE t_documents_by_users
ADD CONSTRAINT documents_by_users_documents_fk
FOREIGN KEY (id_document) REFERENCES t_documents(id) ON DELETE CASCADE;

ALTER TABLE t_documents_by_users
ADD CONSTRAINT documents_by_users_users_fk
FOREIGN KEY (id_user) REFERENCES t_users(id) ON DELETE CASCADE;

-- t_indexes_by_documents

CREATE TABLE IF NOT EXISTS t_indexes_by_documents (
    id SERIAL PRIMARY KEY,
    id_index INT NOT NULL,
    id_document INT NOT NULL,
    weight INT NOT NULL
);

ALTER TABLE t_indexes_by_documents
ADD CONSTRAINT indexes_by_documents_indexes_fk
FOREIGN KEY (id_index) REFERENCES t_indexes(id) ON DELETE CASCADE;

ALTER TABLE t_indexes_by_documents
ADD CONSTRAINT indexes_by_documents_documents_fk
FOREIGN KEY (id_document) REFERENCES t_documents(id) ON DELETE CASCADE;