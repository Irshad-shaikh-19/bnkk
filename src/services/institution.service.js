const { Institution } = require('../models');

/**
 * Get institutions by Plaid Institution IDs
 * @param {Array<string>} plaidInstitutionIds - Array of Plaid Institution IDs
 * @returns {Promise<Object>}
 */
const getInstitutionsByPlaidIds = async (plaidInstitutionIds) => {
    try {
        const institutions = await Institution.find({ plaidInstitutionId: { $in: plaidInstitutionIds } });
        if (!institutions || institutions.length === 0) {
            return {
                status: 404,
                message: 'No institutions found',
            };
        }

        return {
            status: 200,
            message: 'Institutions retrieved successfully',
            institutions,
        };
    } catch (error) {
        return {
            status: 400,
            message: `Error retrieving institutions: ${error.message}`,
        };
    }
};

/**
 * Get all institutions
 * @returns {Promise<Object>}
 */
const getAllInstitutions = async () => {
    try {
        const institutions = await Institution.find({});

        if (!institutions || institutions.length === 0) {
            return {
                status: 200,
                message: 'No institutions found',
                institutions: [],
            };
        }

        return {
            status: 200,
            message: 'Institutions retrieved successfully',
            institutions,
        };
    } catch (error) {
        return {
            status: 400,
            message: `Error retrieving institutions: ${error.message}`,
        };
    }
};

module.exports = {
    getInstitutionsByPlaidIds,
    getAllInstitutions,
};
