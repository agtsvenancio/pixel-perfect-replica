<?php
// ============================================================
//  Italian Bites — configuration for the PHP back-end
//  Fill in the MySQL database you created in hPanel
//  (Websites → Dashboard → Databases → Management).
// ============================================================

define('DB_HOST', 'localhost');                 // on Hostinger shared hosting PHP uses 'localhost'
define('DB_NAME', 'u000000000_italianbites');   // full database name, with the u... prefix
define('DB_USER', 'u000000000_italianbites');   // full database user, with the u... prefix
define('DB_PASSWORD', 'PUT-THE-DATABASE-PASSWORD-HERE');

// Admin login for /admin
define('ADMIN_EMAIL', '319030st@gmail.com');
// bcrypt hash of the admin password (never store the plain password here).
// To change the password, generate a new hash with: php -r 'echo password_hash("NEW-PASSWORD", PASSWORD_BCRYPT);'
define('ADMIN_PASSWORD_HASH', '$2y$11$Tw8a2cFAzuYq5mkgHJVo3egUORaIQadG7N219xYQpiLqKZlPCT6jO');
