<?php

/*
 *	       Copyright (c) Mar 22 13:13:55  MTCC
 *	Author: Michael Thomas
 *	Module: dbif.php
 *	Created: Fri Mar 22 13:13:55 2013
 *	Abstract:
 *	License: http://www.gnu.org/licenses/gpl-2.0.html   
 */

/* Edit History: 
 */

class dbif {
    var $db;
    var $curq;
    var $dbtype;

    function dbif () {
        global $dbname;
        $this->dbname = $dbname;
        try {
            $this->db = new SQlite3 ("../dbs/$dbname");
            $this->dbtype = 'sqlite';
        } catch (Exception $e) {
            die("400 db connect failed: " .  $e->getMessage () . "\n");	
        }
    }

    function prepare ($str) {
        $q = $this->db->prepare ($str);
        return $q;
    }

    function exec ($q) {
        if ($q == NULL) {
            $rv = $this->db->exec ($this->curq);
        } else
            $rv = $q->execute ();
        return $rv;
    }

    function fetch ($res) {
        $rv = $res->fetchArray (SQLITE3_ASSOC);	
    	return $rv ? (object) $rv : NULL;
    }

    function fetchAll ($res) {
    	$rv = [];
        $r;
        while ($r = $this->fetch ($res))
            $rv [] = $r;
        return $rv;
    }

    function fetchUser ($uname) {
        $this->curq = "select * from users where uname=?";
        $q = $this->prepare ($this->curq);	
        $q->bindParam (1, $uname);
        $res = $this->exec ($q);
        $rv = $this->fetch ($res);
        return $rv;
    }

    function fetchUid ($uid) {
        $this->curq = "select * from users where uid=?";
        $q = $this->prepare ($this->curq);
        $q->bindParam (1, $uid);
        $res = $this->exec ($q);
        $rv = $this->fetch ($res);		
        return $rv;
    }

    function updUser ($user) {
        $rv = 0;
        $this->curq = "select uname,uid from users where uname=?";
        $q = $this->prepare ($this->curq);
        $q->bindParam (1, $user->uname);
        $res = $this->exec ($q);
        $update = $this->fetch ($res);
        if ($update) {
            $this->curq = "UPDATE users set uname=?, fullname=?, email=?, joindate=? where uname=?";
        } else {
            $this->curq = "INSERT into users (uname, fullname, email, joindate) VALUES (?, ?, ?, ?)";
        }
        $q = NULL;
        $q = $this->prepare ($this->curq);
        $q->bindParam (1, $user->uname);
        $q->bindParam (2, $user->fullname);
        $q->bindParam (3, $user->email);
        $q->bindParam (4, $user->joindate);
        if ($update)
            $q->bindParam (5, $user->uname);
        if ($this->exec ($q) == false) {
            return 0;
        }
        return 1;
    }

    function updAccess ($uid, $ipaddr) {
        $this->curq = "UPDATE users set lastaccess=?,lastaccessip=? where uid=?";
        $q = $this->prepare ($this->curq);	
        $t = time ();
        $q->bindParam (1, $t);
        $q->bindParam (2, $ipaddr);
        $q->bindParam (3, $uid);
        $this->exec ($q);
        return 1;
    }

    function fetchUserPubkey ($uid, $pubkey) {
        $this->curq = 'select * from userpubkeys where uid=? and pubkey=?';
        $q = $this->prepare ($this->curq);
        $q->bindParam (1, $uid);
        $q->bindParam (2, $pubkey);        
        $res = $this->exec ($q);
        $rv = $this->fetchAll ($res);
        return $rv;
    }
    
    function appendUserPubkey ($uid, $pubkey) {
        $this->curq = "insert into userpubkeys (uid, pubkey, credate) values (?, ?, ?)";
        $q = $this->prepare ($this->curq);
        $q->bindParam (1, $uid);
        $q->bindParam (2, $pubkey);
        $credate = time ();
        $q->bindParam (3, $credate);
        if ($this->exec ($q) == false)
            return false;	
        return true;
    }

    function deleteUserPubkey ($uid, $pubkey) {
        $this->curq = 'delete from userpubkeys where uid=? and pubkey=?';
        $q = $this->prepare ($this->curq);
        $q->bindParam (1, $uid);
        $q->bindParam (2, $pubkey);
        if ($this->exec ($q) == false)
            return false;	
        return true;
    }

    function deleteUserPubkeys ($uid) {
        $this->curq = 'delete from userpubkeys where uid=?';
        $q = $this->prepare ($this->curq);
        $q->bindParam (1, $uid);
        if ($this->exec ($q) == false)
            return false;	
    }

    function setUserOTP ($uid, $OTP, $OTPtmo) {
        $this->curq = 'update users set OTP=?, OTPtmo=? where uid=?';
        $q = $this->prepare ($this->curq);
        $q->bindParam (1, $OTP);
        $q->bindParam (2, $OTPtmo);
        $q->bindParam (3, $uid);
        if ($this->exec ($q) == false)
            return false;	
        return true;
    }

    function fetchUserNonce ($uname, $nonce) {
        $this->curq = 'select * from usernonces where uname=? and nonce=?';
        $q = $this->prepare ($this->curq);
	$q->bindParam (1, $uname);
        $q->bindParam (2, $nonce);
        $res = $this->exec ($q);
	$rv = $this->fetch ($res);
        return $rv;
    }

    function appendUserNonce ($uname, $nonce, $noncetmo) {
        $this->curq = 'insert into usernonces (uname, nonce, noncetmo) values (?, ?, ?)';
        $q = $this->prepare ($this->curq);
	$q->bindParam (1, $uname);
        $q->bindParam (2, $nonce);
        $q->bindParam (3, $noncetmo);
        if ($this->exec ($q) == false)
            return false;	
        return true;
    }

    function deleteUserNonce ($uname, $nonce) {
        $this->curq = 'delete from usernonces where uname=? and nonce=?';
        $q = $this->prepare ($this->curq);
	$q->bindParam (1, $uname);
        $q->bindParam (2, $nonce);
        if ($this->exec ($q) == false)
            return false;
	return true;
    }

    function purgeUserNonce ($expires) {
        $this->curq = 'delete from usernonces where noncetmo < ?';
        $q = $this->prepare ($this->curq);
        $q->bindParam (1, $expires);
        $this->exec ($q);
	return true;
    }


    function appendUserPubkeyReplayCache ($signature, $time, $expires) {
        $this->curq = "insert into userpubkeyreplaycache (signature, timestamp, expires) values (?, ?, ?)";
        $q = $this->prepare ($this->curq);
        $q->bindParam (1, $signature);
        $q->bindParam (2, $time);
        $q->bindParam (3, $expires);
        if ($this->exec ($q) == false)
            return false;	
        return true;
    }

    function fetchUserPubkeyReplayCache ($signature) {
        $this->curq = 'select * from userpubkeyreplaycache where signature=?';
        $q = $this->prepare ($this->curq);
        $q->bindParam (1, $signature);
        $res = $this->exec ($q);
        $rv = $this->fetch ($res);
        return $rv;
    }

    function purgeUserPubkeyReplayCache ($expires) {
        $this->curq = 'delete from userpubkeyreplaycache where expires < ?';
        $q = $this->prepare ($this->curq);
        $q->bindParam (1, $expires);
        $this->exec ($q);
    }

}



?>
