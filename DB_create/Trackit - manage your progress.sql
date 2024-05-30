--
-- Database: `Trackit - TV progress tracker`
--
DROP DATABASE if exists `Trackit`;
CREATE DATABASE IF NOT EXISTS `Trackit`;
USE `Trackit`;

-- Creazione tabelle

CREATE TABLE if not exists `user` (
  `id` integer PRIMARY KEY,
  `username` varchar(255),
  `password` varchar(255),
  `role` varchar(255)
);

CREATE TABLE if not exists `director` (
  `id` integer PRIMARY KEY,
  `name` varchar(255)
);

CREATE TABLE if not exists `genre` (
  `genre` varchar(255) PRIMARY KEY
);

CREATE TABLE if not exists `tvshow` (
  `id` integer PRIMARY KEY,
  `image` varchar(255),
  `title` varchar(255),
  `description` text,
  `year` integer,
  `country` varchar(255),
  `director` integer,
  `seasons` integer,
  `episodes` integer,
  FOREIGN KEY (director) REFERENCES director(id)
);

CREATE TABLE if not exists `show_has_genre` (
  `show_id` integer,
  `genre` varchar(255),
  PRIMARY KEY (show_id, genre),
  FOREIGN KEY (show_id) REFERENCES tvshow(id),
  FOREIGN KEY (genre) REFERENCES genre(genre)
);

CREATE TABLE if not exists `season` (
  `id` integer PRIMARY KEY,
  `show_id` integer,
  `season_num` integer,
  `episodes` integer,
  FOREIGN KEY (show_id) REFERENCES tvshow(id)
);

CREATE TABLE if not exists `episode` (
  `id` integer PRIMARY KEY,
  `season_id` integer,
  `ep_num` integer,
  `ep_title` varchar(255),
  FOREIGN KEY (season_id) REFERENCES season(id)
);

CREATE TABLE if not exists `usersaved` (
  `user_id` integer,
  `show_id` integer,
  `season_id` integer,
  `episode_id` integer,
  `seen` boolean COMMENT '1 (true) -> ep seen',
  `wishlist` boolean,
  PRIMARY KEY (`user_id`, `show_id`, `season_id`, `episode_id`),
  FOREIGN KEY (user_id) REFERENCES user(id),
  FOREIGN KEY (show_id) REFERENCES tvshow(id),
  FOREIGN KEY (season_id) REFERENCES season(id),
  FOREIGN KEY (episode_id) REFERENCES episode(id)
);