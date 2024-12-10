const catchAsync = require('../utils/catchAsync');
const { institutionsService } = require('../services');

const getInstitutionsByPlaidIdController = catchAsync(async (req, res) => {
    const { plaidInstitutionIds } = req.params;
console.log('plaidInstitutionIds', plaidInstitutionIds)
    if (!plaidInstitutionIds) {
        return res.status(400).send({
            status: 400,
            message: 'Missing plaidInstitutionIds parameter',
        });
    }

    // Split the comma-separated string into an array
    const plaidIdsArray = plaidInstitutionIds.split(',');

    console.log('plaidIdsArray', plaidIdsArray);

    // Fetch the institutions based on the array of Plaid Institution IDs
    const institutions = await institutionsService.getInstitutionsByPlaidIds(plaidIdsArray);
    
    res.status(institutions.status).send(institutions);
});

const getAllInstitutionsController = catchAsync(async (req, res) => {
    const institutions = await institutionsService.getAllInstitutions();
    res.status(institutions.status).send(institutions);
});

module.exports = {
    getInstitutionsByPlaidIdController,
    getAllInstitutionsController,
};
