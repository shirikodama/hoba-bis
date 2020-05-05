DROP TABLE IF EXISTS `userpubkeyreplaycache`;
CREATE TABLE userpubkeyreplaycache(
`signature` text,
`timestamp` integer,
`expires` integer
);
DROP TABLE IF EXISTS `userpubkeys`;
CREATE TABLE `userpubkeys` (
  `uid` integer,
  `pubkey` text,
  `credate` integer DEFAULT NULL,
);
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `uname` varchar(64) DEFAULT NULL,
  `uid`  integer  PRIMARY KEY AUTOINCREMENT,
  `fullname` varchar(64) DEFAULT NULL,
  `email` varchar(64) DEFAULT NULL,
  `lastaccess` integer DEFAULT NULL,
  `joindate` char(8) DEFAULT NULL,
  `temppass` varchar(16) DEFAULT NULL,
  `temppasstmo` integer DEFAULT NULL
);
