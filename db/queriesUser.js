const { pool } = require('../dbConfig');

async function newAccount(name, email, hashedPassword) {
    const insertAccount = 'INSERT INTO account (name, email, password) VALUES ($1, $2, $3) RETURNING id, password';
    await pool.query(insertAccount, [name, email, hashedPassword]);
}

async function findMyEmail(email) {
        const searchEmail = 'SELECT * FROM account WHERE email = $1';
        const res = await pool.query(searchEmail, [email]);
       return res.rows[0];
}

async function createResetToken(token, user, expiresAt) {
    const insertTokenPass = 'INSERT INTO reset_token (token, user_id, expire_at) VALUES ($1, $2, $3)';
    await pool.query(insertTokenPass, [token, user, expiresAt]);
}

async function findResetToken(token) {
    const searchToken = 'SELECT * FROM reset_token WHERE token = $1';
    const res = await pool.query(searchToken, [token]);
    return res.rows[0];
}

async function updateAccountPassword(hashedPassword, id) {
    const passUpdate = 'UPDATE account SET password = $1 WHERE id = $2';
    await pool.query(passUpdate, [hashedPassword, id]);
}


async function findAccountById(id) {
    const searchId = 'SELECT * FROM account WHERE id = $1';
    const res = await pool.query(searchId, [id]);
    return res.rows[0];
}

async function deleteExpiredResetToken(currentDate) {
    const deleteExpiredTokens ='DELETE FROM reset_token WHERE expire_at < $1';
    await pool.query(deleteExpiredTokens, [currentDate]);
}

async function markResetTokenAsUsed(token) {
    const setTokenAsAccessed ="UPDATE reset_token SET used = true WHERE token = $1";
    await pool.query(setTokenAsAccessed, [token]);
}

module.exports = {
    findAccountById,
    newAccount,
    findMyEmail,
    createResetToken,
    findResetToken,
    updateAccountPassword,
    deleteExpiredResetToken,
    markResetTokenAsUsed,
}