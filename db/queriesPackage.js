const { pool } = require('../dbConfig');

async function findPackage (code) {
    const searchPackage =`SELECT package.*, courier_company.name AS delivery_firm_name FROM package
    JOIN courier_company ON package.delivery_firm_id = courier_company.id WHERE package.code =$1`;
    const res = await pool.query(searchPackage, [code]);
    return res;
}

module.exports = {
    findPackage,
}