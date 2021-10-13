DROP DATABASE `database_server`;

CREATE DATABASE database_server;

USE database_server;

CREATE TABLE users(
    id INT(11) NOT NULL AUTO_INCREMENT,
    username VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(300) NOT NULL,
    role VARCHAR(15) NOT NULL DEFAULT 'Collaborator', #Administrator / Collaborator
    email VARCHAR(100) NOT NULL,
    name VARCHAR(50) NOT NULL DEFAULT 'Unknown',
    image_url VARCHAR(100) NULL,
    description VARCHAR(200) NOT NULL DEFAULT 'Happy collaborator at ACM!',
    PRIMARY KEY (`id`)
);

CREATE TABLE posts(
  id INT(11) NOT NULL AUTO_INCREMENT,
  user_id INT(11) NOT NULL,
  title VARCHAR(100) NOT NULL DEFAULT 'Titulo',
  body VARCHAR(15000) NOT NULL DEFAULT '',
  image_url VARCHAR(100) NULL,
  deleted TINYINT(1) NOT NULL DEFAULT 1, # 1= ACTIVE / 0= DELETED
  published timestamp NOT NULL DEFAULT current_timestamp,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id),
  PRIMARY KEY (`id`)
);

# Users
INSERT INTO users VALUES (0,'vlama', 'Administrator', '$2a$10$myCWhbgjgYYUMM.GGpS5MuTrDuE/gJReFGbClQTFcZgpaNvxZ8UF2', 'vlama@inf.upv.es', 'Vlad');
#INSERT INTO users VALUES (1,'victoria', 'Administrator', 'a$2a$10$myCWhbgjgYYUMM.GGpS5MuTrDuE/gJReFGbClQTFcZgpaNvxZ8UF2', 'victoria@google.com', 'Victoria');


