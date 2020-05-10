DROP TABLE IF EXISTS `userpubkeyreplaycache`;
CREATE TABLE userpubkeyreplaycache(
`signature` text,
`timestamp` integer,
`expires` integer
);

DROP TABLE IF EXISTS `usernonces`;
CREATE TABLE usernonces(
  `uname` varchar(64) DEFAULT NULL,
  `nonce` varchar(16) DEFAULT NULL,
  `noncetmo` integer DEFAULT NULL
);

DROP TABLE IF EXISTS `userpubkeys`;
CREATE TABLE `userpubkeys` (
  `uid` integer,
  `pubkey` text,
  `credate` integer DEFAULT NULL
);

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `uname` varchar(64) DEFAULT NULL,
  `uid`  integer  PRIMARY KEY AUTOINCREMENT,
  `fullname` varchar(64) DEFAULT NULL,
  `email` varchar(64) DEFAULT NULL,
  `lastaccess` integer DEFAULT NULL,
  `lastaccessip` varchar(40) DEFAULT NULL,  
  `joindate` char(8) DEFAULT NULL,
  `OTP` varchar(16) DEFAULT NULL,
  `OTPtmo` integer DEFAULT NULL
);
