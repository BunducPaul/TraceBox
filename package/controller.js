const { findPackage } = require('../db/queriesPackage');

const viewPackage = async (req, res) => {
    const { code } = req.body;
    try {
    const result = await findPackage(code);
        if (result.rows.length <= 0) {
            req.flash('msg', 'No information for this tracking number at the moment');
            return res.redirect('/TraceBox/HomePage');
        }
        if (req.user) {
            res.render('package/viewPackage', { data: result.rows[0], user: req.user.name, email: req.user.email });
        } else {
            res.render('package/viewPackage', { data: result.rows[0], user: undefined });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while retrieving the package information.');
    }
}

module.exports = {
    viewPackage,
}